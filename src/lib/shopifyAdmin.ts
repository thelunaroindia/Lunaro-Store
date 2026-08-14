// Shared Shopify Admin API access — used exclusively by server-side code
// that needs to look up real order data (/api/track-order,
// /order-confirmation). Never import this from a client component.
//
// Auth model: OAuth client credentials grant against a Shopify Dev
// Dashboard app ("LUNARO Order Verification" on lunaro-9855.myshopify.com),
// scoped to `read_orders` only. Dev Dashboard apps for a store you own
// don't issue a permanent static Admin API token — instead this module
// exchanges SHOPIFY_ADMIN_CLIENT_ID/SHOPIFY_ADMIN_CLIENT_SECRET for a
// short-lived access token at request time, caches it in memory for the
// life of the serverless instance, and re-requests it once it's close to
// expiring. See docs/SHOPIFY_SETUP.md for how the app/credentials were
// created.
//
// The client ID/secret and every access token this module obtains stay
// server-side only — never returned in an API response, logged, or
// exposed to the client.

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const CLIENT_ID = process.env.SHOPIFY_ADMIN_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';

export function isShopifyAdminConfigured(): boolean {
  return Boolean(DOMAIN && CLIENT_ID && CLIENT_SECRET);
}

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

// Module-scope, so it's reused across requests handled by the same warm
// serverless instance — reset naturally on cold start. Refresh a minute
// before actual expiry so no in-flight request ever races a dying token.
let cachedToken: CachedToken | null = null;
let pendingTokenRequest: Promise<string> | null = null;
const EXPIRY_SAFETY_MARGIN_MS = 60_000;

async function requestAccessToken(): Promise<string> {
  if (!DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      'Shopify Admin API is not configured. Set SHOPIFY_ADMIN_CLIENT_ID and SHOPIFY_ADMIN_CLIENT_SECRET — see docs/SHOPIFY_SETUP.md.'
    );
  }

  const res = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Shopify Admin OAuth token request failed: ${res.status}`);
  }

  const json = (await res.json()) as { access_token?: string; expires_in?: number };

  if (!json.access_token) {
    throw new Error('Shopify Admin OAuth response did not include an access_token.');
  }

  cachedToken = {
    accessToken: json.access_token,
    // If expires_in is ever missing, treat the token as already expired
    // rather than assuming it's long-lived.
    expiresAt: Date.now() + (typeof json.expires_in === 'number' ? json.expires_in * 1000 : 0),
  };

  return cachedToken.accessToken;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - EXPIRY_SAFETY_MARGIN_MS > Date.now()) {
    return cachedToken.accessToken;
  }

  // Several concurrent requests hitting an expired/missing token at once
  // should trigger exactly one OAuth round trip, not one each.
  if (!pendingTokenRequest) {
    pendingTokenRequest = requestAccessToken().finally(() => {
      pendingTokenRequest = null;
    });
  }

  return pendingTokenRequest;
}

export async function shopifyAdminFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  if (!isShopifyAdminConfigured()) {
    throw new Error(
      'Shopify Admin API is not configured. Set SHOPIFY_ADMIN_CLIENT_ID and SHOPIFY_ADMIN_CLIENT_SECRET — see docs/SHOPIFY_SETUP.md.'
    );
  }

  const accessToken = await getAccessToken();

  const doFetch = (token: string) =>
    fetch(`https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    });

  let res = await doFetch(accessToken);

  // The cached token may have been invalidated on Shopify's side (app
  // reinstall, revoked credentials) even though our local expiry clock
  // says it's still good — one clean retry with a freshly-obtained token
  // covers that without a retry loop.
  if (res.status === 401) {
    cachedToken = null;
    const freshToken = await getAccessToken();
    res = await doFetch(freshToken);
  }

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
