// Runs the orders-paid route with fetch stubbed. Run from the repo root.
const fs = require('fs'), path = require('path'), assert = require('assert'), Module = require('module'), crypto = require('crypto');
const ts = require(path.resolve('node_modules/typescript'));
const compile = (file, stubs) => {
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: 'commonjs', target: 'es2020' } }).outputText;
  const m = new Module(file); m.require = (id) => (id in stubs ? stubs[id] : require(id)); m._compile(js, file); return m.exports;
};
const state = compile('src/lib/orderState.ts', {});
const late = compile('src/lib/lateOrderPayment.ts', {});
const load = (enabled) => compile('src/app/api/webhooks/shopify/orders-paid/route.ts', {
  'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } },
  '@/lib/config': { GOKWIK_ENABLED: enabled }, '@/lib/lateOrderPayment': late, '@/lib/orderState': state,
});
const SECRET = 'test-secret';
const sign = (b, s = SECRET) => crypto.createHmac('sha256', s).update(b, 'utf8').digest('base64');
const req = (o, sig) => { const b = JSON.stringify(o); return { text: async () => b, headers: { get: () => (sig === undefined ? sign(b) : sig) } }; };
const old = new Date(Date.now() - 10 * 60 * 1000).toISOString();
const base = { id: 7, name: '#7', created_at: old, total_price: '2799.00', currency: 'INR', payment_gateway_names: ['gk'], email: 'a@b.c', phone: '+91999', shipping_address: { city: 'x' } };
let sent = [], gaStatus = 204;
global.fetch = async (url, init) => { sent.push({ url, body: JSON.parse(init.body) }); return { ok: gaStatus < 300, status: gaStatus }; };
Object.assign(process.env, { SHOPIFY_ADMIN_CLIENT_SECRET: SECRET, GA_MEASUREMENT_PROTOCOL_API_SECRET: 'ga', NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-X', GOKWIK_ORDER_GATEWAYS: 'GK' });
console.error = () => {};
(async () => {
  const r = load(true);
  assert.equal((await r.POST(req(base, 'bad'))).status, 401);
  assert.equal((await r.POST(req(base, null))).status, 401);
  assert.equal((await r.POST(req(base, sign(JSON.stringify(base), 'other')))).status, 401);
  assert.equal(sent.length, 0);
  let res = await r.POST(req(base));
  assert.equal(res.body.reported, true);
  const p = sent[0];
  assert.deepEqual(p.body.events[0].params, { transaction_id: '#7', currency: 'INR', value: 2799, payment_type: 'prepaid', late_payment: true });
  assert(!/a@b\.c|\+91999/.test(JSON.stringify(p)), 'no customer data');
  await r.POST(req(base));
  assert.equal(sent[1].body.client_id, p.body.client_id, 'retries use same client id');
  sent = [];
  for (const o of [{ ...base, created_at: new Date().toISOString() }, { ...base, payment_gateway_names: ['shopify_payments'] }, { ...base, payment_gateway_names: ['gk', 'cash on delivery'] }, { ...base, cancelled_at: old }]) {
    res = await r.POST(req(o)); assert.equal(res.status, 200); assert.equal(res.body.reported, false);
  }
  assert.equal(sent.length, 0);
  res = await load(false).POST(req(base)); assert.equal(res.body.reported, false);
  delete process.env.GOKWIK_ORDER_GATEWAYS;
  res = await r.POST(req(base)); assert.equal(res.body.reported, false);
  process.env.GOKWIK_ORDER_GATEWAYS = 'GK'; gaStatus = 500;
  res = await r.POST(req(base)); assert.equal(res.status, 502, 'Shopify retries when GA fails');
  console.log('all webhook checks passed');
})().catch((e) => { console.log(e); process.exit(1); });
