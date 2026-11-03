// Runs src/lib/metaPixel.ts and src/lib/analytics.ts against a fake browser and
// checks exactly what reaches Meta's fbq queue.
const fs = require('fs'), path = require('path'), assert = require('assert'), Module = require('module');
const ts = require(path.resolve('node_modules/typescript'));
const compile = (file, stubs) => {
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: 'commonjs', target: 'es2020' } }).outputText;
  const m = new Module(file); m.require = (id) => { if (id in stubs) return stubs[id]; throw new Error('unstubbed ' + id); }; m._compile(js, file); return m.exports;
};

const PIXEL = '4448781662040409';

function storage() {
  const data = {};
  return { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, data };
}

function browser({ env = {}, nodeEnv = 'production' } = {}) {
  const scripts = [];
  global.window = { localStorage: storage(), sessionStorage: storage(), dataLayer: [] };
  global.document = {
    createElement: () => ({}),
    head: { appendChild: (s) => scripts.push(s.src) },
  };
  const savedEnv = { ...process.env };
  Object.assign(process.env, { NODE_ENV: nodeEnv, NEXT_PUBLIC_META_PIXEL_ID: '', NEXT_PUBLIC_META_CONTENT_ID_FORMAT: '' }, env);
  const config = compile('src/lib/config.ts', {});
  process.env = savedEnv;
  const meta = compile('src/lib/metaPixel.ts', { '@/lib/config': config });
  const analytics = compile('src/lib/analytics.ts', { '@/lib/config': config, '@/lib/metaPixel': meta });
  const calls = () => (window.fbq ? window.fbq.queue.map((args) => [...args]) : []);
  return { config, meta, analytics, calls, scripts };
}

const silenceWarn = console.warn; console.warn = () => {};

// ── Config: one pixel, never a different one
{
  assert.equal(browser().config.metaPixel.id, PIXEL, 'default on in production builds');
  assert.equal(browser({ nodeEnv: 'development' }).config.metaPixel.id, null, 'off under next dev by default');
  assert.equal(browser({ nodeEnv: 'development', env: { NEXT_PUBLIC_META_PIXEL_ID: PIXEL } }).config.metaPixel.id, PIXEL);
  assert.equal(browser({ env: { NEXT_PUBLIC_META_PIXEL_ID: 'off' } }).config.metaPixel.id, null);
  const other = browser({ env: { NEXT_PUBLIC_META_PIXEL_ID: '123456789012345' } });
  assert.equal(other.config.metaPixel.id, null, 'a different ID disables rather than sends');
  assert.equal(other.config.metaPixel.mismatch, '123456789012345');
  other.meta.trackMetaPageView('/');
  assert.equal(window.fbq, undefined, 'nothing loads on mismatch');
}

// ── Load once, init before anything, PageView per distinct URL
{
  const b = browser();
  b.meta.trackMetaPageView('/');
  b.meta.trackMetaPageView('/'); // Strict Mode second effect run
  b.meta.trackMetaPageView('/shop');
  b.meta.trackMetaPageView('/shop?sort=price');
  b.meta.trackMetaPageView('/');
  assert.deepEqual(b.scripts, ['https://connect.facebook.net/en_US/fbevents.js'], 'SDK injected once');
  assert.equal(window.fbq.disablePushState, true, "Meta's own pushState PageViews are off");
  const c = b.calls();
  assert.deepEqual(c[0], ['set', 'autoConfig', false, PIXEL]);
  assert.deepEqual(c[1], ['init', PIXEL]);
  assert.equal(c.filter((x) => x[0] === 'init').length, 1);
  const views = c.filter((x) => x[2] === 'PageView');
  assert.equal(views.length, 4, 'one per navigation, none for the repeat');
  assert(views.every((x) => x[0] === 'trackSingle' && x[1] === PIXEL), 'only this pixel');
}

// ── Commerce events: names, payloads, dedup
{
  const b = browser();
  const { analytics } = b;
  const cart = {
    id: 'gid://shopify/Cart/tok?key=k',
    cost: { totalAmount: { amount: '3998.00', currencyCode: 'INR' } },
    totalQuantity: 2,
    lines: [{
      quantity: 2,
      merchandise: { id: 'gid://shopify/ProductVariant/222', price: { amount: '1999.00', currencyCode: 'INR' }, product: { id: 'gid://shopify/Product/111', handle: 'tee' } },
    }],
  };

  // Event fired before any PageView/SDK load is queued, not dropped.
  analytics.trackEvent('view_item', { product_id: 'x' }, {
    meta: analytics.productMetaParams({ productId: 'gid://shopify/Product/111', variantId: 'gid://shopify/ProductVariant/222', quantity: 1, price: 1999, currency: 'INR', handle: 'tee' }),
  });
  let c = b.calls();
  assert.deepEqual(c[1], ['init', PIXEL], 'init precedes the first event');
  const view = c[2];
  assert.deepEqual(view.slice(0, 3), ['trackSingle', PIXEL, 'ViewContent']);
  assert.deepEqual(view[3].content_ids, ['shopify_IN_111_222']);
  assert.equal(view[3].content_type, 'product');
  assert.equal(view[3].value, 1999);
  assert.equal(view[3].currency, 'INR');

  const added = analytics.addToCartFromResult(cart, 'gid://shopify/ProductVariant/222', 1);
  assert.equal(added.meta.value, 1999, 'value from the cart line price');
  assert.deepEqual(added.meta.contents, [{ id: 'shopify_IN_111_222', quantity: 1, item_price: 1999 }]);
  assert.equal(analytics.addToCartFromResult(cart, 'gid://shopify/ProductVariant/999', 1), null);
  analytics.trackEvent('add_to_cart', added.params, { meta: added.meta });

  const meta = analytics.cartMetaParams(cart);
  analytics.trackBeginCheckoutOnce(cart.id, analytics.cartEventParams(cart), meta);
  analytics.trackBeginCheckoutOnce(cart.id, analytics.cartEventParams(cart), meta); // retry / fallback
  analytics.trackBeginCheckoutOnce(cart.id, analytics.cartEventParams(cart), { ...meta, value: 5997, contents: [{ id: 'shopify_IN_111_222', quantity: 3 }] }); // cart changed

  const lines = [{ productId: 'gid://shopify/Product/111', variantId: 'gid://shopify/ProductVariant/222', quantity: 2, itemPrice: 1999 }];
  analytics.trackPurchaseOnce({ orderName: '#1042', currency: 'INR', value: 4047, paymentType: 'cod', lines });
  analytics.trackPurchaseOnce({ orderName: '#1042', currency: 'INR', value: 4047, paymentType: 'cod', lines }); // refresh / repeated callback

  analytics.trackEvent('gokwik_order_placed', { value: 4047 });

  c = b.calls();
  const named = (n) => c.filter((x) => x[2] === n);
  assert.equal(named('AddToCart').length, 1);
  assert.equal(named('AddToCart')[0][0], 'trackSingle');
  const ic = named('InitiateCheckout');
  assert.equal(ic.length, 2, 'once per cart state');
  assert.deepEqual(ic[0][3].content_ids, ['shopify_IN_111_222']);
  assert.equal(ic[0][3].num_items, 2);
  assert.equal(ic[0][3].value, 3998);
  assert(typeof ic[0][4].eventID === 'string');
  const p = named('Purchase');
  assert.equal(p.length, 1, 'one Purchase per order');
  assert.deepEqual(p[0][4], { eventID: '#1042' }, 'stable order-based eventID');
  assert.equal(p[0][3].value, 4047);
  assert.equal(p[0][3].currency, 'INR');
  assert.deepEqual(p[0][3].contents, [{ id: 'shopify_IN_111_222', quantity: 2, item_price: 1999 }]);
  assert.equal(p[0][3].num_items, 2);
  // GoKwik's funnel events stay custom, so they never double a standard event.
  assert.deepEqual(named('gokwik_order_placed')[0][0], 'trackSingleCustom');
  assert.equal(c.filter((x) => x[0] === 'track').length, 0, 'never plain track (would reach other pixels)');

  // No PII keys in anything sent to Meta.
  const banned = /email|phone|name|address|city|zip/i;
  for (const x of c) for (const k of Object.keys(x[3] ?? {})) assert(!banned.test(k) || k === 'content_name', `PII-like key ${k}`);
}

// ── Variant content-ID format
{
  const b = browser({ env: { NEXT_PUBLIC_META_CONTENT_ID_FORMAT: 'variant' } });
  assert.equal(b.meta.metaContentId('gid://shopify/Product/1', 'gid://shopify/ProductVariant/2'), '2');
}

console.warn = silenceWarn;
console.log('all meta pixel checks passed');
