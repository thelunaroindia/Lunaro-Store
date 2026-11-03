// Exercises src/lib/gokwik.ts against a fake window. Run from the repo root.
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const Module = require('module');
const ts = require(path.resolve('node_modules/typescript'));

const tracked = [];
const stubs = {
  '@/lib/config': { gokwik: { merchantId: 'MID', environment: 'sandbox', storeId: 123 } },
  '@/lib/analytics': { trackEvent: (name, params) => tracked.push({ name, params }) },
};

function load() {
  const src = fs.readFileSync('src/lib/gokwik.ts', 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: 'commonjs', target: 'es2020' } }).outputText;
  const m = new Module('gokwik');
  m.require = (id) => stubs[id];
  m._compile(js, 'gokwik.js');
  return m.exports;
}

function fakeBrowser() {
  const listeners = {};
  const scripts = [];
  const assigned = [];
  const timers = [];
  global.window = {
    location: { origin: 'https://www.lunaro.in', assign: (u) => assigned.push(u) },
    addEventListener: (t, f) => ((listeners[t] ||= []).push(f)),
    removeEventListener: (t, f) => (listeners[t] = (listeners[t] || []).filter((x) => x !== f)),
    setTimeout: (f) => (timers.push(f), timers.length),
    clearTimeout: (i) => (timers[i - 1] = null),
  };
  global.document = {
    getElementById: () => null,
    createElement: () => ({}),
    head: { appendChild: (s) => scripts.push(s) },
  };
  const fire = (t, e = {}) => (listeners[t] || []).forEach((f) => f(e));
  return { scripts, assigned, timers, fire };
}

(async () => {
  // merchantInfo exists before the script tag, and readiness needs gokwikLoaded.
  let b = fakeBrowser();
  let g = load();
  let p = g.loadGokwikSdk();
  assert.strictEqual(b.scripts.length, 1);
  // fbpixel is always a string, so gokwik.js never auto-detects the site's Meta pixel.
  assert.deepStrictEqual(window.merchantInfo, { mid: 'MID', environment: 'sandbox', type: 'merchantInfo', storeId: 123, fbpixel: '' });
  window.triggerGokwikCustomCheckout = () => (window.triggered = window.merchantInfo.cart.id);
  assert.throws(() => g.openGokwikCheckout('c', 'u'), /not ready/);
  b.fire('gokwikLoaded');
  await p;
  g.openGokwikCheckout('gid://shopify/Cart/abc?key=k', 'https://x.myshopify.com/cart/c/abc');
  assert.strictEqual(window.triggered, 'gid://shopify/Cart/abc?key=k');

  // shopifyRedirect: foreign origin ignored, own origin uses Shopify's URL only.
  const placed = [];
  const off = g.subscribeToGokwikMessages((o) => placed.push(o));
  const own = 'https://www.lunaro.in';
  b.fire('message', { origin: 'https://evil.example', data: { type: 'shopifyRedirect', url: 'https://evil.example/' } });
  assert.strictEqual(b.assigned.length, 0);
  b.fire('message', { origin: own, data: { type: 'shopifyRedirect', url: own + '/cart/checkout' } });
  assert.deepStrictEqual(b.assigned, ['https://x.myshopify.com/cart/c/abc']);

  // Funnel events: no PII forwarded, deduped, order details handed to callback.
  tracked.length = 0;
  const data = {
    eventname: 'Order_Placed_GK', event_id: 'e1', total_price: 1199, currency: 'INR',
    'Order Number': '#1001', 'Mobile Number': '+919999999999', Email: 'a@b.c', 'Full Address': 'x', 'First Name': 'y',
  };
  b.fire('message', { origin: own, data: { type: 'gokwik_events', data } });
  b.fire('message', { origin: own, data: { type: 'gokwik_events', data } });
  assert.deepStrictEqual(tracked, [{ name: 'gokwik_order_placed', params: { currency: 'INR', value: 1199 } }]);
  assert.deepStrictEqual(placed, ['#1001']);
  b.fire('message', { origin: own, data: { type: 'gokwik_events', data: { eventname: 'Nope' } } });
  b.fire('message', { origin: 'https://evil.example', data: { type: 'gokwik_events', data: { ...data, event_id: 'e2' } } });
  assert.strictEqual(tracked.length, 1);

  // The format the PDF documents: `event`, with the fields under `event_data`.
  tracked.length = 0; placed.length = 0;
  b.fire('message', { origin: own, data: { type: 'gokwik_events', data: {
    event: 'Order_Placed_GK',
    event_data: {
      original_cart_amount: 1200, total_amount: 1100, currency: 'INR', coupon_code: 'GET100', total_discount_applied: 100,
      payment_method: 'UPI', cod_charges: 50, shipping_price: 0, order_number: '#4901813', order_id: '187251387211',
      mobile_number: '+919999999999', first_name: 'y', last_name: 'z', email: 'a@b.c', full_address: 'x', city: 'c', pincode: '110070',
      abandoned_url: 'https://x?mrid=1', landing_page: '/p', origin_referrer: 'r', product_details: [{ product_id: 1 }],
    },
  } } });
  assert.deepStrictEqual(tracked, [{ name: 'gokwik_order_placed', params: {
    original_cart_amount: 1200, coupon_code: 'GET100', total_discount_applied: 100, payment_method: 'UPI', shipping_price: 0, cod_charges: 50, currency: 'INR', value: 1100,
  } }]);
  assert.deepStrictEqual(placed, ['#4901813']);
  for (const event of ['Started_Checkout_GK', 'Mobile_Added_GK', 'Address_Step_Reached_GK', 'Address_Added_GK', 'Payment_Step_Reached_GK', 'Payment_Method_Selected_GK', 'Coupon_Applied_Success_GK', 'Coupon_Applied_Failed_GK']) {
    tracked.length = 0;
    b.fire('message', { origin: own, data: { type: 'gokwik_events', data: { event, event_data: { checkout_step: 'payment', mobile_number: '+919999999999' } } } });
    assert.deepStrictEqual(tracked, [{ name: `gokwik_${event.replace(/_GK$/, '').toLowerCase()}`, params: { checkout_step: 'payment' } }], event);
  }
  tracked.length = 0;
  b.fire('message', { origin: own, data: 'not an object' });
  off();
  assert.strictEqual(placed.length, 1);

  // A redirect message with no checkout open goes nowhere.
  b = fakeBrowser();
  g = load();
  g.subscribeToGokwikMessages(() => {});
  b.fire('message', { origin: own, data: { type: 'shopifyRedirect', url: own + '/cart/checkout' } });
  assert.strictEqual(b.assigned.length, 0);

  // Network error rejects; a later call is a real retry.
  b = fakeBrowser();
  g = load();
  await assert.rejects(() => { const q = g.loadGokwikSdk(); b.scripts[0].onerror(); return q; }, /network/);
  const retry = g.loadGokwikSdk();
  assert.strictEqual(b.scripts.length, 2);
  window.triggerGokwikCustomCheckout = () => {};
  b.fire('gokwikLoaded');
  await retry;

  // Timeout rejects.
  b = fakeBrowser();
  g = load();
  const q = g.loadGokwikSdk();
  b.timers[0]();
  await assert.rejects(() => q, /timeout/);

  console.log('all gokwik checks passed');
})().catch((e) => { console.error(e); process.exit(1); });
