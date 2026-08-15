import { NextRequest, NextResponse } from 'next/server';
import { isShopifyAdminConfigured, shopifyAdminFetch } from '@/lib/shopifyAdmin';

// Early-access signups are stored as real Shopify customers — tagged
// `early-access`, with explicit single-opt-in email marketing consent —
// via the same Admin API app used for order lookups (src/lib/shopifyAdmin.ts),
// with the write_customers scope added. This gives a genuine, exportable,
// segmentable list in Shopify Admin → Customers (filter by tag
// "early-access") rather than a form that accepts an email and stores it
// nowhere. No new third-party service — reuses existing Shopify infra.
//
// If write_customers isn't granted yet, shopifyAdminFetch throws (Shopify
// denies the customerCreate field outright, same as any other missing-scope
// call), which is caught below and surfaced honestly as "not available
// right now" — never a fake success.

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email as string | undefined;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  if (!isShopifyAdminConfigured()) {
    console.warn('[newsletter] Shopify Admin API not configured — signup was not stored.', email);
    return NextResponse.json(
      { error: "Sign-up isn't available right now — please check back soon." },
      { status: 503 }
    );
  }

  try {
    const data = await shopifyAdminFetch<{
      customerCreate: {
        customer: { id: string } | null;
        userErrors: { field: string[] | null; message: string }[];
      };
    }>(
      `#graphql
        mutation EarlyAccessSignup($input: CustomerInput!) {
          customerCreate(input: $input) {
            customer { id }
            userErrors { field message }
          }
        }
      `,
      {
        input: {
          email,
          tags: ['early-access'],
          emailMarketingConsent: {
            marketingState: 'SUBSCRIBED',
            marketingOptInLevel: 'SINGLE_OPT_IN',
          },
        },
      }
    );

    const { customer, userErrors } = data.customerCreate;

    // A returning signup ("Email has already been taken") should still
    // feel like success to the visitor — they're already on the list.
    const alreadyExists = userErrors.some((e) =>
      e.message.toLowerCase().includes('has already been taken')
    );

    if (!customer && !alreadyExists) {
      console.error('[newsletter] customerCreate userErrors', userErrors);
      return NextResponse.json(
        { error: 'Something went wrong. Try again in a moment.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[newsletter] Shopify Admin API error', err);
    return NextResponse.json(
      { error: "Sign-up isn't available right now — please check back soon." },
      { status: 503 }
    );
  }
}
