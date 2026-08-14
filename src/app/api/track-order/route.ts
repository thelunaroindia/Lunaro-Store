import { NextRequest, NextResponse } from 'next/server';
import { isShopifyAdminConfigured, shopifyAdminFetch } from '@/lib/shopifyAdmin';

// Uses the Shopify Admin API (NOT the Storefront API) with a token scoped
// to `read_orders` only. This token must never be exposed to the client —
// it is read here, server-side, exclusively. See docs/SHOPIFY_SETUP.md for
// how to create a scoped custom app token for this purpose.

export async function POST(req: NextRequest) {
  const { orderNumber, email } = (await req.json().catch(() => ({}))) as {
    orderNumber?: string;
    email?: string;
  };

  if (!orderNumber || !email) {
    return NextResponse.json({ error: 'Enter your order number and email.' }, { status: 400 });
  }

  if (!isShopifyAdminConfigured()) {
    return NextResponse.json(
      { error: "We couldn't look that up right now — please contact us directly." },
      { status: 503 }
    );
  }

  const normalisedName = orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;

  try {
    const data = await shopifyAdminFetch<{
      orders: {
        nodes: {
          name: string;
          displayFulfillmentStatus: string;
          email: string;
          fulfillments: { trackingInfo: { number: string; url: string; company: string }[] }[];
        }[];
      };
    }>(
      `#graphql
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
      { query: `name:${normalisedName} email:${email}` }
    );

    const order = data.orders.nodes[0];

    if (!order || order.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'No order found with that number and email.' }, { status: 404 });
    }

    return NextResponse.json({
      orderName: order.name,
      status: order.displayFulfillmentStatus,
      tracking: order.fulfillments?.flatMap((f) => f.trackingInfo) ?? [],
    });
  } catch (err) {
    console.error('[track-order] Shopify Admin API error', err);
    return NextResponse.json({ error: 'Could not look up this order right now.' }, { status: 500 });
  }
}
