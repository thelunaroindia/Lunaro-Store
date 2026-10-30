// Runs the orders-paid route and the purchase claim with Shopify, GA4 and timers
// stubbed. Run from the repo root.
const fs = require('fs'), path = require('path'), assert = require('assert'), Module = require('module'), crypto = require('crypto');
const ts = require(path.resolve('node_modules/typescript'));
const compile = (file, stubs) => {
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: 'commonjs', target: 'es2020' } }).outputText;
  const m = new Module(file); m.require = (id) => (id in stubs ? stubs[id] : require(id)); m._compile(js, file); return m.exports;
};
const state = compile('src/lib/orderState.ts', {});
const late = compile('src/lib/lateOrderPayment.ts', {});

// Behaves as Shopify documents a null compareDigest: first write wins, the rest
// get STALE_OBJECT. Whether the live API really does this needs a real test.
let claims = new Map(), adminDown = false, deleted = 0;
const shopifyAdminFetch = async (query, variables) => {
  if (adminDown) throw new Error('down');
  const [m] = variables.metafields;
  if (query.includes('metafieldsDelete')) { deleted++; claims.delete(m.ownerId); return { metafieldsDelete: { userErrors: [] } }; }
  assert.equal(m.compareDigest, null); assert('compareDigest' in m);
  if (claims.has(m.ownerId)) return { metafieldsSet: { metafields: null, userErrors: [{ code: 'STALE_OBJECT' }] } };
  claims.set(m.ownerId, m.value);
  return { metafieldsSet: { metafields: [{ id: 'x' }], userErrors: [] } };
};
const claim = compile('src/lib/purchaseClaim.ts', { 'server-only': {}, '@/lib/shopifyAdmin': { shopifyAdminFetch } });

let background = [];
const load = (enabled) => compile('src/app/api/webhooks/shopify/orders-paid/route.ts', {
  'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } },
  '@vercel/functions': { waitUntil: (p) => background.push(p) },
  '@/lib/config': { GOKWIK_ENABLED: enabled }, '@/lib/lateOrderPayment': late, '@/lib/orderState': state, '@/lib/purchaseClaim': claim,
});
const SECRET = 'test-secret';
const sign = (b, s = SECRET) => crypto.createHmac('sha256', s).update(b, 'utf8').digest('base64');
const req = (o, sig) => { const b = JSON.stringify(o); return { text: async () => b, headers: { get: () => (sig === undefined ? sign(b) : sig) } }; };
const old = new Date(Date.now() - 10 * 60 * 1000).toISOString();
const base = { id: 7, name: '#7', created_at: old, total_price: '2799.00', currency: 'INR', payment_gateway_names: ['gk'], email: 'a@b.c', phone: '+91999', shipping_address: { city: 'x' } };
const fresh = { ...base, created_at: new Date().toISOString() };
const GID = 'gid://shopify/Order/7';
let sent = [], gaStatus = 204;
global.fetch = async (url, init) => { sent.push({ url, body: JSON.parse(init.body) }); return { ok: gaStatus < 300, status: gaStatus }; };
// Grace periods elapse only when a test says so.
let timers = [];
const realSetTimeout = global.setTimeout;
global.setTimeout = (fn, ms) => { if (ms === late.WEBHOOK_GRACE_MS) { timers.push(fn); return 0; } return realSetTimeout(fn, ms); };
const elapse = async () => { timers.splice(0).forEach((fn) => fn()); await Promise.all(background.splice(0)); };
const reset = () => { claims = new Map(); sent = []; gaStatus = 204; adminDown = false; deleted = 0; timers = []; background = []; };
Object.assign(process.env, { SHOPIFY_ADMIN_CLIENT_ID: 'id', SHOPIFY_ADMIN_CLIENT_SECRET: SECRET, GA_MEASUREMENT_PROTOCOL_API_SECRET: 'ga', NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-X', GOKWIK_ORDER_GATEWAYS: 'GK' });
console.error = () => {};
(async () => {
  const r = load(true);
  // Signature.
  assert.equal((await r.POST(req(base, 'bad'))).status, 401);
  assert.equal((await r.POST(req(base, null))).status, 401);
  assert.equal((await r.POST(req(base, sign(JSON.stringify(base), 'other')))).status, 401);
  assert.equal(sent.length, 0);

  // Late payment, customer gone: reported straight away, no customer data.
  let res = await r.POST(req(base));
  assert.equal(res.body.reported, true);
  assert.deepEqual(sent[0].body.events[0].params, { transaction_id: '#7', currency: 'INR', value: 2799, payment_type: 'prepaid', late_payment: true });
  assert(!/a@b\.c|\+91999/.test(JSON.stringify(sent[0])), 'no customer data');
  assert.equal(claims.get(GID), 'webhook');
  // A repeat delivery can't report twice.
  res = await r.POST(req(base));
  assert.equal(res.status, 200); assert.equal(res.body.reported, false); assert.equal(sent.length, 1);

  // THE GAP: paid within 2 minutes and the customer has left. Answered at once,
  // then reported after the grace period.
  reset();
  res = await r.POST(req(fresh));
  assert.equal(res.status, 200); assert.equal(res.body.deferred, true);
  assert.equal(sent.length, 0, 'nothing sent during the grace period');
  await elapse();
  assert.equal(sent.length, 1, 'order paid inside the window is reported');

  // Paid within 2 minutes, page still open: the browser wins, the webhook stands down.
  reset();
  await r.POST(req(fresh));
  assert.equal(await claim.claimPurchaseReport(GID, 'browser'), 'won');
  await elapse();
  assert.equal(sent.length, 0, 'no duplicate after a browser report');

  // Customer returns after the webhook reported: the browser stands down.
  reset();
  await r.POST(req(fresh));
  await elapse();
  assert.equal(await claim.claimPurchaseReport(GID, 'browser'), 'lost');
  assert.equal(sent.length, 1);

  // Both at the same moment: exactly one winner.
  reset();
  const race = await Promise.all([claim.claimPurchaseReport(GID, 'browser'), claim.claimPurchaseReport(GID, 'webhook')]);
  assert.deepEqual(race.sort(), ['lost', 'won']);

  // Not ours to report.
  reset();
  for (const o of [{ ...base, payment_gateway_names: ['shopify_payments'] }, { ...base, payment_gateway_names: ['gk', 'cash on delivery'] }, { ...base, cancelled_at: old }]) {
    res = await r.POST(req(o)); assert.equal(res.status, 200); assert.equal(res.body.reported, false);
  }
  assert.equal(sent.length, 0); assert.equal(claims.size, 0); assert.equal(timers.length, 0);
  res = await load(false).POST(req(base)); assert.equal(res.body.reported, false);
  delete process.env.GOKWIK_ORDER_GATEWAYS;
  res = await r.POST(req(base)); assert.equal(res.body.reported, false);
  process.env.GOKWIK_ORDER_GATEWAYS = 'GK';
  assert.equal(sent.length, 0);

  // GA4 fails: the claim is released, so Shopify's retry can report.
  reset(); gaStatus = 500;
  res = await r.POST(req(base));
  assert.equal(res.status, 502); assert.equal(deleted, 1); assert.equal(claims.size, 0);
  gaStatus = 204;
  res = await r.POST(req(base));
  assert.equal(res.body.reported, true);

  // Shopify unreachable: nothing sent, retry requested.
  reset(); adminDown = true;
  res = await r.POST(req(base));
  assert.equal(res.status, 502); assert.equal(sent.length, 0);
  assert.equal(await claim.claimPurchaseReport(GID, 'browser'), 'error');

  // Any other rejection, such as a missing scope, isn't a win.
  reset();
  const denied = compile('src/lib/purchaseClaim.ts', { 'server-only': {}, '@/lib/shopifyAdmin': { shopifyAdminFetch: async () => ({ metafieldsSet: { metafields: null, userErrors: [{ code: 'INVALID_VALUE' }] } }) } });
  assert.equal(await denied.claimPurchaseReport(GID, 'browser'), 'error');
  const empty = compile('src/lib/purchaseClaim.ts', { 'server-only': {}, '@/lib/shopifyAdmin': { shopifyAdminFetch: async () => ({ metafieldsSet: null }) } });
  assert.equal(await empty.claimPurchaseReport(GID, 'browser'), 'error');

  console.log('all webhook checks passed');
})().catch((e) => { console.log(e); process.exit(1); });
