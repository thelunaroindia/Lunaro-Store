// Checks the Shopify Admin app this storefront authenticates as. Reads
// .env.local and the environment; prints scopes and yes/no answers only, never
// a credential, token or customer value. Read-only.
//
//   npm run check:shopify-admin
import fs from 'node:fs';

const fileEnv = fs.existsSync('.env.local')
  ? Object.fromEntries(
      fs
        .readFileSync('.env.local', 'utf8')
        .split(/\r?\n/)
        .filter((line) => line.includes('=') && !line.startsWith('#'))
        .map((line) => {
          const i = line.indexOf('=');
          return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"|"$/g, '')];
        })
    )
  : {};
const env = (name) => process.env[name] || fileEnv[name] || '';

const domain = env('SHOPIFY_STORE_DOMAIN');
const clientId = env('SHOPIFY_ADMIN_CLIENT_ID');
const clientSecret = env('SHOPIFY_ADMIN_CLIENT_SECRET');
const version = env('SHOPIFY_API_VERSION') || '2024-10';

const missing = [
  ['SHOPIFY_STORE_DOMAIN', domain],
  ['SHOPIFY_ADMIN_CLIENT_ID', clientId],
  ['SHOPIFY_ADMIN_CLIENT_SECRET', clientSecret],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  console.log(`Not configured. Missing: ${missing.join(', ')}`);
  process.exit(1);
}

const tokenRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  }),
});

if (!tokenRes.ok) {
  console.log(`Token request failed with HTTP ${tokenRes.status}.`);
  console.log('Client credentials only work for an app in the same Shopify organization as this store, installed on it.');
  process.exit(1);
}

const { access_token: token } = await tokenRes.json();

async function admin(query) {
  const res = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query }),
  });
  return { status: res.status, ...(await res.json()) };
}

const app = await admin('{ currentAppInstallation { accessScopes { handle } } shop { myshopifyDomain } }');
const scopes = app.data?.currentAppInstallation?.accessScopes?.map((s) => s.handle) ?? [];
console.log(`Store: ${app.data?.shop?.myshopifyDomain ?? 'unknown'}`);
console.log(`API version requested: ${version}`);
console.log(`Scopes: ${scopes.join(', ') || 'none'}`);
console.log(`read_orders granted: ${scopes.includes('read_orders') ? 'yes' : 'NO'}`);

const orders = await admin(
  '{ orders(first: 10, reverse: true) { nodes { cartToken displayFinancialStatus paymentGatewayNames phone shippingAddress { phone city } } } }'
);

if (orders.errors?.length) {
  console.log(`Order query errors: ${orders.errors.map((e) => e.message).join('; ')}`);
  process.exit(1);
}

const nodes = orders.data.orders.nodes;
const count = (test) => nodes.filter(test).length;
console.log(`Recent orders checked: ${nodes.length}`);
console.log(`  with cartToken: ${count((o) => o.cartToken)}`);
console.log(`Not needed for order verification (only /track-order uses the phone; the address is display-only):`);
console.log(`  with readable phone: ${count((o) => o.phone || o.shippingAddress?.phone)}`);
console.log(`  with readable shipping city: ${count((o) => o.shippingAddress?.city)}`);
console.log(`Payment gateways seen: ${[...new Set(nodes.flatMap((o) => o.paymentGatewayNames ?? []))].join(', ') || 'none'}`);
