import { NextRequest, NextResponse } from 'next/server';

// LUNARO does not yet have an email marketing provider wired in.
// Recommended: Klaviyo (deep Shopify integration, popular for DTC fashion)
// or Shopify Email. Once chosen, replace the body of this handler with a
// call to that provider's subscribe API — see docs/DEPLOYMENT.md.

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email as string | undefined;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const provider = process.env.NEWSLETTER_PROVIDER;
  if (!provider) {
    console.warn('[newsletter] No provider configured — signup was logged only, not delivered.', email);
    return NextResponse.json(
      { error: "Sign-up isn't available right now — please check back soon." },
      { status: 503 }
    );
  }

  // Provider-specific call goes here once NEWSLETTER_PROVIDER is set.
  return NextResponse.json({ ok: true });
}
