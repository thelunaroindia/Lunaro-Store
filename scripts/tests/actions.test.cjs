// Runs src/actions/cart.ts and src/lib/orderState.ts with Shopify/cookies stubbed.
const fs = require('fs'), path = require('path'), assert = require('assert'), Module = require('module');
const ts = require(path.resolve('node_modules/typescript'));
const compile = (file, stubs) => {
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: 'commonjs', target: 'es2020' } }).outputText;
  const m = new Module(file); m.require = (id) => { if (id in stubs) return stubs[id]; throw new Error('unstubbed ' + id); }; m._compile(js, file); return m.exports;
};
const state = compile('src/lib/orderState.ts', {});

// ── orderState
const st = (financialStatus, paymentType = 'prepaid', cancelled = false) => state.orderStateOf({ financialStatus, paymentType, cancelled });
assert.equal(st('PAID'), 'paid');
assert.equal(st('PENDING', 'cod'), 'cod');
assert.equal(st('PENDING'), 'payment_pending');
assert.equal(st('PENDING', 'unknown'), 'payment_pending');
assert.equal(st('PARTIALLY_PAID'), 'payment_pending');
assert.equal(st('SOMETHING_NEW'), 'payment_pending');
assert.equal(st('VOIDED'), 'payment_failed');
assert.equal(st('REFUNDED'), 'refunded');
assert.equal(st('PAID', 'prepaid', true), 'cancelled');
for (const [n, t] of [['Cash on Delivery (COD)', 'cod'], ['gokwik_cod', 'cod'], ['COD', 'cod'], ['Razorpay', 'prepaid'], ['encoded_pay', 'prepaid']]) assert.equal(state.derivePaymentType([n]), t, n);
assert.equal(state.cartTokenOf('gid://shopify/Cart/abc?key=k'), 'abc');
assert.equal(state.cartTokenOf('abc?key=k'), 'abc');
// Real GoKwik order: empty cartToken, cart in an attribute, part-prepaid COD.
assert.equal(state.orderCartToken(null, [{ key: 'gokwik_cid', value: 'x' }, { key: 'cart_token', value: 'gid://shopify/Cart/abc?key=k' }]), 'abc');
assert.equal(state.orderCartToken(null, [{ key: 'cart_token', value: 'abc' }]), 'abc');
assert.equal(state.orderCartToken('own', [{ key: 'cart_token', value: 'abc' }]), 'own');
assert.equal(state.orderCartToken(null, []), null);
assert.equal(state.orderCartToken(null, [{ key: 'cart_token', value: null }]), null);
assert.equal(state.derivePaymentType(['Gokwik PPCOD']), 'cod');
assert.equal(st('PARTIALLY_PAID', 'cod'), 'cod');

// ── cart actions
const LIVE = 'gid://shopify/Cart/live?key=k';
const late = compile('src/lib/lateOrderPayment.ts', {});
function setup({ gone = false, lookupThrows = false, addThrows = true, order = null, cookies = { lunaro_cart_id: LIVE } }) {
  const jar = { ...cookies }; const calls = { add: 0, create: 0 };
  const store = { get: (k) => (k in jar ? { value: jar[k] } : undefined), set: (k, v) => { jar[k] = v; }, delete: (k) => { delete jar[k]; } };
  const headers = { cookies: () => store };
  const carts = compile('src/lib/checkoutCarts.ts', { 'server-only': {}, 'next/headers': headers, '@/lib/orderState': state });
  const act = compile('src/actions/cart.ts', {
    'next/headers': headers, 'next/cache': { revalidateTag() {} },
    '@/lib/shopify': {
      isShopifyConfigured: () => true,
      createCart: async () => { calls.create++; return { id: 'gid://shopify/Cart/new?key=n', discountCodes: [] }; },
      getCart: async () => { if (lookupThrows) throw new Error('network'); return gone ? null : { id: LIVE }; },
      addCartLines: async () => { calls.add++; if (addThrows) throw new Error('add failed'); return { id: LIVE }; },
      updateCartLines: async () => { throw new Error('x'); }, removeCartLines: async () => { throw new Error('x'); }, applyDiscountCode: async (id) => ({ id }),
    },
    '@/lib/checkoutCarts': carts, '@/lib/config': { GOKWIK_ENABLED: true }, '@/lib/orderState': state,
    '@/lib/verifiedOrder': { getOrderForCheckoutCarts: async (_n, tokens) => (order && tokens.includes(order.cartToken) ? { status: 'verified', order } : { status: 'unverified' }) },
    '@/lib/lateOrderPayment': late,
  });
  return { act, jar, calls };
}
const silence = console.error; console.error = () => {};
const order = (cartToken, financialStatus = 'PAID', extra = {}) => ({ name: '#1', createdAt: new Date().toISOString(), cartToken, cancelled: false, financialStatus, paymentType: 'prepaid', total: { amount: '100', currencyCode: 'INR' }, ...extra });

(async () => {
  // Stale: exactly one new cart, cookie repointed.
  let t = setup({ gone: true });
  let r = await t.act.addToCart('v', 1);
  assert(r.ok); assert.equal(t.calls.add, 1); assert.equal(t.calls.create, 1); assert.equal(t.jar.lunaro_cart_id, 'gid://shopify/Cart/new?key=n');
  // Active cart + failed add (may have landed): no retry, no new cart, cookie kept.
  t = setup({});
  r = await t.act.addToCart('v', 1);
  assert(!r.ok); assert.equal(t.calls.add, 1); assert.equal(t.calls.create, 0); assert.equal(t.jar.lunaro_cart_id, LIVE);
  // Shopify unreachable: cart unknown, so it's preserved.
  t = setup({ lookupThrows: true });
  r = await t.act.addToCart('v', 1);
  assert(!r.ok); assert.equal(t.calls.create, 0); assert.equal(t.jar.lunaro_cart_id, LIVE);
  // Malformed cookie recovers.
  t = setup({ cookies: { lunaro_cart_id: 'junk' } });
  r = await t.act.addToCart('v', 1);
  assert(r.ok); assert.equal(t.calls.create, 1);
  // Happy path untouched.
  t = setup({ addThrows: false });
  r = await t.act.addToCart('v', 1);
  assert(r.ok); assert.equal(t.calls.create, 0);
  // Quantity change on stale cart: cookie forgotten; on live cart: kept.
  t = setup({ gone: true });
  r = await t.act.updateCartLine('l', 2);
  assert(!r.ok && /expired/.test(r.error)); assert(!('lunaro_cart_id' in t.jar));
  t = setup({});
  r = await t.act.updateCartLine('l', 2);
  assert(!r.ok && !/expired/.test(r.error)); assert.equal(t.jar.lunaro_cart_id, LIVE);

  // Order from this cart: cleared + purchase, and still bound afterwards.
  t = setup({ order: order('live') });
  await t.act.markCartCheckoutStarted();
  r = await t.act.confirmGokwikOrder('#1');
  assert(r.verified && r.cartCleared && r.purchase); assert(!('lunaro_cart_id' in t.jar));
  r = await t.act.confirmGokwikOrder('#1');
  assert(r.verified && !r.cartCleared, 'refresh stays verified');
  // Someone else's / an old order: nothing happens.
  t = setup({ order: order('other') });
  r = await t.act.confirmGokwikOrder('#1');
  assert(!r.verified); assert.equal(t.jar.lunaro_cart_id, LIVE);
  // No cartToken (the unconfirmed GoKwik case): fails closed.
  t = setup({ order: order(null) });
  r = await t.act.confirmGokwikOrder('#1');
  assert(!r.verified); assert.equal(t.jar.lunaro_cart_id, LIVE);
  // Buy Now order: verified, purchase, shared cart kept.
  t = setup({ order: order('buy') });
  t.jar.lunaro_checkout_carts = JSON.stringify(['buy']);
  r = await t.act.confirmGokwikOrder('#1');
  assert(r.verified && !r.cartCleared && r.purchase); assert.equal(t.jar.lunaro_cart_id, LIVE);
  // Pending payment: cart cleared, but no purchase reported.
  t = setup({ order: order('live', 'PENDING') });
  r = await t.act.confirmGokwikOrder('#1');
  assert(r.verified && r.cartCleared && r.purchase === null);
  // COD counts as a purchase.
  t = setup({ order: order('live', 'PENDING', { paymentType: 'cod' }) });
  r = await t.act.confirmGokwikOrder('#1');
  assert(r.verified && r.purchase);
  // Voided / cancelled keep the cart.
  t = setup({ order: order('live', 'VOIDED') });
  r = await t.act.confirmGokwikOrder('#1');
  assert(r.verified && !r.cartCleared && r.purchase === null); assert.equal(t.jar.lunaro_cart_id, LIVE);
  t = setup({ order: order('live', 'PAID', { cancelled: true }) });
  r = await t.act.confirmGokwikOrder('#1');
  assert(!r.cartCleared && r.purchase === null); assert.equal(t.jar.lunaro_cart_id, LIVE);
  // Pending within the window asks the browser to keep checking.
  t = setup({ order: order('live', 'PENDING') });
  r = await t.act.confirmGokwikOrder('#1');
  assert(r.paymentPending);
  // Late paid order: webhook owns it when configured, browser reports when not.
  const old = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  t = setup({ order: order('live', 'PAID', { createdAt: old }) });
  r = await t.act.confirmGokwikOrder('#1');
  assert(r.purchase, 'browser reports late order when webhook unconfigured');
  Object.assign(process.env, { GA_MEASUREMENT_PROTOCOL_API_SECRET: 'x', NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-X', SHOPIFY_ADMIN_CLIENT_SECRET: 'x', GOKWIK_ORDER_GATEWAYS: 'gk' });
  t = setup({ order: order('live', 'PAID', { createdAt: old }) });
  r = await t.act.confirmGokwikOrder('#1');
  assert(r.verified && r.purchase === null, 'webhook owns late order');
  t = setup({ order: order('live', 'PAID') });
  r = await t.act.confirmGokwikOrder('#1');
  assert(r.purchase, 'browser owns fresh order');
  t = setup({ order: order('live', 'PENDING', { createdAt: old, paymentType: 'cod' }) });
  r = await t.act.confirmGokwikOrder('#1');
  assert(r.purchase, 'old COD stays with browser');
  for (const k of ['GA_MEASUREMENT_PROTOCOL_API_SECRET','NEXT_PUBLIC_GA_MEASUREMENT_ID','SHOPIFY_ADMIN_CLIENT_SECRET','GOKWIK_ORDER_GATEWAYS']) delete process.env[k];
  console.error = silence;
  console.log('all action and order-state checks passed');
})().catch((e) => { console.error = silence; console.error(e); process.exit(1); });
