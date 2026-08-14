// Shared Shopify Admin API access — used exclusively by server-side code
// that needs to look up real order data (/api/track-order,
// /order-confirmation). Never import this from a client component.
//
// Auth model: a static Admin API access token from a Shopify custom app
// (Admin → Settings → Apps and sales channels → Develop apps → Admin API
// integration), scoped to `read_orders` only. This is Shopify's own
// supported pattern for a single-store private integration like this one —
// the OAuth/client-credentials flow exists for apps distributed across many
// merchant stores via the Shopify App Store, which doesn't apply here.
// See docs/SHOPIFY_SETUP.md for how to create the token.

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';

export function isShopifyAdminConfigured(): boolean {
  return Boolean(DOMAIN && ADMIN_TOKEN);
}

export async function shopifyAdminFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  if (!DOMAIN || !ADMIN_TOKEN) {
    throw new Error(
      'Shopify Admin API is not configured. Set SHOPIFY_ADMIN_API_TOKEN — see docs/SHOPIFY_SETUP.md.'
    );
  }

  const res = await fetch(`https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Shopify Admin API request failed: ${res.status}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(
      Array.isArray(json.errors)
        ? json.errors.map((e: { message: string }) => e.message).join(', ')
        : String(json.errors)
    );
  }

  return json.data as T;
}

export function lastTenDigits(value: string): string {
  return value.replace(/\D/g, '').slice(-10);
}
