import { NextRequest, NextResponse } from 'next/server';
import {
  isShopifyAdminConfigured,
  shopifyAdminFetch,
  shopifyAdminFetchRaw,
} from '@/lib/shopifyAdmin';

// Launch-notification signups are stored as real Shopify customers —
// tagged `early-access` (kept as-is; renaming would mean re-tagging every
// existing customer in Shopify Admin for no functional benefit), with
// explicit single-opt-in email marketing consent — via the same Admin API
// app used for order lookups (src/lib/shopifyAdmin.ts), with the
// write_customers and read_customers scopes added. This gives a genuine,
// exportable, segmentable list in Shopify Admin → Customers rather than a
// form that accepts an email and stores it nowhere. No new third-party
// service — reuses existing Shopify infra.
//
// IMPORTANT: a successful signup here means ONLY "you're on the launch
// notification list." It must never issue any storefront-access grant —
// there is no private Early Access shopping for Drop 001. See
// src/lib/earlyAccess.ts for why that utility still exists but is no
// longer called from here.
//
// Resubmitting with an email that's already a Shopify customer (e.g. someone
// who previously unsubscribed) is looked up via findCustomerByEmail and its
// tag/consent state is repaired if needed — never assumed. See
// findCustomerByEmail and ensureEarlyAccessTag below.
//
// If write_customers/read_customers aren't granted, or the customer
// operation otherwise fails, this returns the same honest "not available
// right now" — never a fake success.

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

// Looks up a customer that customerCreate reported as already existing, so
// the already-exists branch below can verify (and if needed, fix) their
// actual consent/tag state instead of assuming success. Uses
// customerByIdentifier rather than the customers(query:) search field —
// search is index-backed and can lag right after a write (we just attempted
// customerCreate moments earlier), while customerByIdentifier is a direct,
// immediately-consistent lookup. Requires the read_customers scope; see
// docs/SHOPIFY_SETUP.md.
async function findCustomerByEmail(email: string): Promise<
  | { kind: 'found'; customerId: string; tags: string[]; subscribed: boolean }
  | { kind: 'not-found' }
  | { kind: 'not-configured' }
> {
  const { data, errors } = await shopifyAdminFetchRaw<{
    customerByIdentifier: {
      id: string;
      tags: string[];
      emailMarketingConsent: { marketingState: string } | null;
    } | null;
  }>(
    `#graphql
      query FindEarlyAccessCustomer($identifier: CustomerIdentifierInput!) {
        customerByIdentifier(identifier: $identifier) {
          id
          tags
          emailMarketingConsent { marketingState }
        }
      }
    `,
    { identifier: { email } }
  );

  // customerByIdentifier is nullable for two different reasons that must
  // not be treated the same: a genuinely nonexistent customer (data present,
  // no errors) vs. the field being access-denied for a missing read_customers
  // scope (data present but null, plus an error). Only shopifyAdminFetchRaw
  // exposes that distinction — shopifyAdminFetch would silently return null
  // either way.
  if (errors.length > 0) {
    return { kind: 'not-configured' };
  }

  if (data.customerByIdentifier === null) {
    return { kind: 'not-found' };
  }

  return {
    kind: 'found',
    customerId: data.customerByIdentifier.id,
    tags: data.customerByIdentifier.tags,
    subscribed:
      data.customerByIdentifier.emailMarketingConsent?.marketingState === 'SUBSCRIBED',
  };
}

// Additive tag write (Shopify's dedicated tagsAdd mutation) rather than
// customerUpdate's tags field, which replaces a customer's entire tag list —
// this only ever adds early-access, never risks dropping unrelated tags a
// merchant set manually in Admin. Best-effort: a tagging failure is logged
// but never fails the request, since the tag is a segmentation detail, not
// the marketing-consent guarantee this route exists to provide.
async function ensureEarlyAccessTag(customerId: string, currentTags: string[]): Promise<void> {
  if (currentTags.includes('early-access')) return;

  const data = await shopifyAdminFetch<{
    tagsAdd: { userErrors: { message: string }[] } | null;
  }>(
    `#graphql
      mutation AddEarlyAccessTag($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) {
          userErrors { message }
        }
      }
    `,
    { id: customerId, tags: ['early-access'] }
  );

  if (!data.tagsAdd || data.tagsAdd.userErrors.length > 0) {
    console.warn(
      `[newsletter] tagsAdd failed for existing customer ${customerId}`,
      data.tagsAdd?.userErrors
    );
  }
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
      // fabricated success. Look them up and repair their tag/consent state
      // if needed, rather than assuming a prior signup means they're still
      // subscribed (they may have unsubscribed since).
      const existing = await findCustomerByEmail(email);

      if (existing.kind === 'not-configured') {
        console.error('[newsletter] customerByIdentifier field denied — read_customers scope likely missing.');
        return NextResponse.json(
          { error: "Sign-up isn't available right now — please check back soon." },
          { status: 503 }
        );
      }

      if (existing.kind === 'not-found') {
        // customerCreate said this email is already taken but we can't find
        // a matching customer to verify — never claim success for a
        // customer we can't confirm.
        console.error(
          '[newsletter] customerCreate reported the email as already taken, but customerByIdentifier found no match.'
        );
        return NextResponse.json(
          { error: "We couldn't add you to the list just yet. Please try again." },
          { status: 500 }
        );
      }

      await ensureEarlyAccessTag(existing.customerId, existing.tags);

      let subscribed = existing.subscribed;

      if (!subscribed) {
        console.warn(
          `[newsletter] Existing customer ${existing.customerId} was not SUBSCRIBED — updating consent via customerEmailMarketingConsentUpdate.`
        );
        const confirmed = await confirmConsent(existing.customerId);
        subscribed = confirmed.subscribed;
      }

      if (!subscribed) {
        console.error(
          `[newsletter] Could not confirm SUBSCRIBED consent for existing customer ${existing.customerId}.`
        );
        return NextResponse.json(
          { error: "We couldn't add you to the list just yet. Please try again." },
          { status: 500 }
        );
      }

      console.log(
        `[newsletter] Existing customer ${existing.customerId} re-confirmed. Marketing consent: SUBSCRIBED.`
      );
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
