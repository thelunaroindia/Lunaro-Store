import { NextRequest, NextResponse } from 'next/server';
import { isShopifyAdminConfigured, shopifyAdminFetch, lastTenDigits } from '@/lib/shopifyAdmin';

// Uses the Shopify Admin API (NOT the Storefront API), via the shared
// src/lib/shopifyAdmin.ts helper — credentials never reach the client.
//
// Verifies by order number + phone (not email): Fastr checkout collects
// the customer's phone, not a manually entered email, so email was never
// a reliable second factor for real orders placed through it. The order
// is fetched by number only; the phone match happens here in code against
// the real Shopify order/customer phone, normalized to the last 10 digits
// so +91XXXXXXXXXX / 91XXXXXXXXXX / XXXXXXXXXX all compare equal — the
// same normalization src/app/order-confirmation/page.tsx already uses.

export async function POST(req: NextRequest) {
  const { orderNumber, phone } = (await req.json().catch(() => ({}))) as {
    orderNumber?: string;
    phone?: string;
  };

  if (!orderNumber || !phone) {
    return NextResponse.json({ error: 'Enter your order number and phone number.' }, { status: 400 });
  }

  const phoneDigits = lastTenDigits(phone);

  if (!phoneDigits) {
    return NextResponse.json({ error: 'Enter a valid phone number.' }, { status: 400 });
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
          phone: string | null;
          customer: { phone: string | null } | null;
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
              phone
              customer { phone }
              fulfillments(first: 5) {
                trackingInfo { number url company }
              }
            }
          }
        }
      `,
      { query: `name:${normalisedName}` }
    );

    const order = data.orders.nodes[0];
    const orderPhoneDigits = lastTenDigits(order?.phone ?? order?.customer?.phone ?? '');

    if (!order || !orderPhoneDigits || orderPhoneDigits !== phoneDigits) {
      return NextResponse.json({ error: 'No order found with that number and phone.' }, { status: 404 });
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
