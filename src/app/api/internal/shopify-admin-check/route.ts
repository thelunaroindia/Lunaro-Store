import { NextResponse } from 'next/server';
import { isShopifyAdminConfigured, shopifyAdminFetchRaw } from '@/lib/shopifyAdmin';

export const dynamic = 'force-dynamic';

// The server-side twin of scripts/check-shopify-admin.mjs, for credentials that
// exist only on Vercel and can't be read back. Preview only, read-only, and it
// returns scopes and counts, never a credential or customer value.
export async function GET() {
  if (process.env.VERCEL_ENV !== 'preview') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!isShopifyAdminConfigured()) {
    return NextResponse.json({ configured: false });
  }

  try {
    const { data, errors } = await shopifyAdminFetchRaw<{
      shop: { myshopifyDomain: string } | null;
      currentAppInstallation: { app: { title: string } | null; accessScopes: { handle: string }[] } | null;
      orders: { nodes: { cartToken: string | null; paymentGatewayNames: string[] | null }[] } | null;
    }>(`#graphql
      query AdminCheck {
        shop { myshopifyDomain }
        currentAppInstallation { app { title } accessScopes { handle } }
        orders(first: 10, reverse: true) { nodes { cartToken paymentGatewayNames } }
      }
    `);

    const scopes = data?.currentAppInstallation?.accessScopes.map((s) => s.handle) ?? [];
    const orders = data?.orders?.nodes ?? [];

    return NextResponse.json({
      configured: true,
      store: data?.shop?.myshopifyDomain ?? null,
      app: data?.currentAppInstallation?.app?.title ?? null,
      apiVersion: process.env.SHOPIFY_API_VERSION || '2024-10 (default)',
      scopes,
      readOrders: scopes.includes('read_orders'),
      writeOrders: scopes.includes('write_orders'),
      recentOrders: orders.length,
      recentOrdersWithCartToken: orders.filter((o) => o.cartToken).length,
      gateways: Array.from(new Set(orders.flatMap((o) => o.paymentGatewayNames ?? []))),
      errors: errors.map((e) => e.message),
    });
  } catch (err) {
    // Shopify's OAuth errors name the problem without containing our secrets,
    // but only the HTTP status is needed here.
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ configured: true, failed: message.replace(/\{.*\}/s, '').slice(0, 200) });
  }
}
