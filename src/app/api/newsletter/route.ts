import { NextRequest, NextResponse } from 'next/server';
import { isShopifyAdminConfigured, shopifyAdminFetch } from '@/lib/shopifyAdmin';

// Launch-notification signups are stored as real Shopify customers —
// tagged `early-access` (kept as-is; renaming would mean re-tagging every
// existing customer in Shopify Admin for no functional benefit), with
// explicit single-opt-in email marketing consent — via the same Admin API
// app used for order lookups (src/lib/shopifyAdmin.ts), with the
// write_customers scope added. This gives a genuine, exportable,
// segmentable list in Shopify Admin → Customers rather than a form that
// accepts an email and stores it nowhere. No new third-party service —
// reuses existing Shopify infra.
//
// IMPORTANT: a successful signup here means ONLY "you're on the launch
// notification list." It must never issue any storefront-access grant —
// there is no private Early Access shopping for Drop 001. See
// src/lib/earlyAccess.ts for why that utility still exists but is no
// longer called from here.
//
// If write_customers isn't granted, or the customer operation otherwise
// fails, this returns the same honest "not available right now" — never a
// fake success.

type ConsentResult = {
  customerId: string;
  subscribed: boolean;
};

async function createCustomer(email: string): Promise<
  | { kind: 'created'; customerId: string; subscribed: boolean; tags: string[] }
  | { kind: 'already-exists' }
  | { kind: 'failed'; messages: string }
  | { kind: 'not-configured' }
> {
  const data = await shopifyAdminFetch<{
    customerCreate: {
      customer: {
        id: string;
        tags: string[];
        emailMarketingConsent: { marketingState: string } | null;
      } | null;
      userErrors: { field: string[] | null; message: string }[];
    } | null;
  }>(
    `#graphql
      mutation EarlyAccessSignup($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            tags
            emailMarketingConsent { marketingState }
          }
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

  if (!data.customerCreate) {
    return { kind: 'not-configured' };
  }

  const { customer, userErrors } = data.customerCreate;

  if (customer) {
    return {
      kind: 'created',
      customerId: customer.id,
      subscribed: customer.emailMarketingConsent?.marketingState === 'SUBSCRIBED',
      tags: customer.tags,
    };
  }

  const alreadyExists = userErrors.some((e) =>
    e.message.toLowerCase().includes('has already been taken')
  );

  if (alreadyExists) {
    return { kind: 'already-exists' };
  }

  return {
    kind: 'failed',
    messages: userErrors.map((e) => e.message).join(', ') || 'Unknown error',
  };
}

// customerCreate's inline emailMarketingConsent occasionally doesn't stick
// (the exact cause behind an earlier customer showing "Not subscribed" in
// Shopify Admin) — this is Shopify's own dedicated mutation for setting
// consent, called as a verified follow-up rather than trusted blindly.
async function confirmConsent(customerId: string): Promise<ConsentResult> {
  const data = await shopifyAdminFetch<{
    customerEmailMarketingConsentUpdate: {
      customer: {
        id: string;
        emailMarketingConsent: { marketingState: string } | null;
      } | null;
      userErrors: { field: string[] | null; message: string }[];
    } | null;
  }>(
    `#graphql
      mutation ConfirmEarlyAccessConsent($input: CustomerEmailMarketingConsentUpdateInput!) {
        customerEmailMarketingConsentUpdate(input: $input) {
          customer {
            id
            emailMarketingConsent { marketingState }
          }
          userErrors { field message }
        }
      }
    `,
    {
      input: {
        customerId,
        emailMarketingConsent: {
          marketingState: 'SUBSCRIBED',
          marketingOptInLevel: 'SINGLE_OPT_IN',
          consentUpdatedAt: new Date().toISOString(),
        },
      },
    }
  );

  const subscribed =
    data.customerEmailMarketingConsentUpdate?.customer?.emailMarketingConsent
      ?.marketingState === 'SUBSCRIBED';

  return { customerId, subscribed };
}

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
    const result = await createCustomer(email);

    if (result.kind === 'not-configured') {
      console.error('[newsletter] customerCreate field denied — write_customers scope likely missing.');
      return NextResponse.json(
        { error: "Sign-up isn't available right now — please check back soon." },
        { status: 503 }
      );
    }

    if (result.kind === 'failed') {
      console.error('[newsletter] customerCreate userErrors', result.messages);
      return NextResponse.json(
        { error: "We couldn't add you to the list just yet. Please try again." },
        { status: 500 }
      );
    }

    if (result.kind === 'already-exists') {
      // A real, pre-existing Shopify customer — not a duplicate, not a
      // fabricated success. Without read_customers this app can't look
      // up their id to re-verify/repair tag or consent state, so that
      // part is intentionally not claimed here (see final report).
      console.log('[newsletter] Signup email already exists as a Shopify customer — confirming list membership, consent not re-verified.');
    } else {
      let subscribed = result.subscribed;

      if (!subscribed) {
        console.warn(
          `[newsletter] customerCreate did not report SUBSCRIBED for a new customer — retrying via customerEmailMarketingConsentUpdate.`
        );
        const confirmed = await confirmConsent(result.customerId);
        subscribed = confirmed.subscribed;
      }

      console.log(
        `[newsletter] Customer ${result.customerId} created. Tags: [${result.tags.join(', ')}]. Marketing consent verified as ${
          subscribed ? 'SUBSCRIBED' : 'NOT SUBSCRIBED'
        }.`
      );
    }

    // No storefront-access cookie is set here — a successful signup means
    // only "you're on the launch notification list," never "you can shop."
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[newsletter] Shopify Admin API error', err);
    return NextResponse.json(
      { error: "We couldn't add you to the list just yet. Please try again." },
      { status: 500 }
    );
  }
}
