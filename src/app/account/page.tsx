import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LinkButton } from '@/components/ui/Button';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';

export const metadata: Metadata = { title: 'Account' };

// LUNARO uses Shopify's hosted Customer Account API rather than a custom
// login form — password storage, MFA and session security stay entirely on
// Shopify's side. Until SHOPIFY_CUSTOMER_ACCOUNT_URL is configured, this
// route (and its nav link — see Header.tsx) simply isn't exposed: guest
// checkout works fully without it, so there's nothing for a customer to be
// missing in the meantime.
const customerAccountUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL;

export default function AccountPage() {
  if (!customerAccountUrl) {
    redirect('/');
  }

  return (
    <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <CinematicPlaceholder variant="manifesto" className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-obsidian/30" />

      <div className="container-lunaro relative z-10 max-w-md text-center">
        <p className="eyebrow text-silver">LUNARO</p>
        <h1 className="mt-5 font-display text-display-lg text-lunar">Enter The Orbit</h1>
        <p className="mt-4 text-mist">Access your orders, saved pieces and private releases.</p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <LinkButton href={customerAccountUrl} variant="primary">
            Sign In
          </LinkButton>
          <LinkButton href={customerAccountUrl} variant="ghost">
            Create Account
          </LinkButton>
        </div>

        <LinkButton href="/shop" variant="underline" className="mt-8">
          Continue Shopping
        </LinkButton>
      </div>
    </div>
  );
}
