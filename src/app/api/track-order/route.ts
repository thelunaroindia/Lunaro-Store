import { NextRequest, NextResponse } from 'next/server';

// Uses the Shopify Admin API (NOT the Storefront API) with a token scoped
// to `read_orders` only. This token must never be exposed to the client —
// it is read here, server-side, exclusively. See docs/SHOPIFY_SETUP.md for
// how to create a scoped custom app token for this purpose.

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';

export async function POST(req: NextRequest) {
  const { orderNumber, email } = (await req.json().catch(() => ({}))) as {
    orderNumber?: string;
    email?: string;
  };

  if (!orderNumber || !email) {
    return NextResponse.json({ error: 'Enter your order number and email.' }, { status: 400 });
  }

  if (!DOMAIN || !ADMIN_TOKEN) {
    return NextResponse.json(
      { error: "We couldn't look that up right now — please contact us directly." },
      { status: 503 }
    );
  }

  const normalisedName = orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;

  try {
    const res = await fetch(`https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_TOKEN,
      },
      body: JSON.stringify({
        query: `#graphql
          query TrackOrder($query: String!) {
            orders(first: 1, query: $query) {
              nodes {
                name
                displayFulfillmentStatus
                email
                fulfillments(first: 5) {
                  trackingInfo { number url company }
                }
              }
            }
          }
        `,
        variables: { query: `name:${normalisedName} email:${email}` },
      }),
      cache: 'no-store',
    });

    const json = await res.json();
    const order = json?.data?.orders?.nodes?.[0];

    if (!order || order.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'No order found with that number and email.' }, { status: 404 });
    }

    return NextResponse.json({
      orderName: order.name,
      status: order.displayFulfillmentStatus,
      tracking: order.fulfillments?.flatMap((f: any) => f.trackingInfo) ?? [],
    });
  } catch (err) {
    console.error('[track-order] Shopify Admin API error', err);
    return NextResponse.json({ error: 'Could not look up this order right now.' }, { status: 500 });
  }
}
