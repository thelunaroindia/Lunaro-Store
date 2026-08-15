import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts, isShopifyConfigured } from '@/lib/shopify';
import { PRELAUNCH_MODE } from '@/lib/config';
import { isEarlyAccessGranted } from '@/lib/earlyAccess';
import { canonicalUrl } from '@/lib/canonical';
import ProductGrid from '@/components/shop/ProductGrid';
import { UtilityPageBackdrop } from '@/components/ui/UtilityPageBackdrop';

// A static export, not generateMetadata — deliberately query-string-blind,
// so /search?q=black and /search?q=white both canonicalize to exactly
// /search rather than each other or a query-specific URL.
export const metadata: Metadata = {
  title: 'Search',
  description: 'Search the current LUNARO collection.',
  alternates: { canonical: canonicalUrl('/search') },
};

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  // Search reads real Shopify catalogue data by title/tag — the same
  // real-inventory exposure every other shopping surface (/shop, /new-drop,
  // /collections/[handle], /products/[handle]) already gates. This page had
  // no such gate, so a direct /search?q=... URL could bypass Early Access
  // entirely once real products exist — closing that gap here, matching the
  // exact pattern those pages already use.
  if (PRELAUNCH_MODE && !isEarlyAccessGranted()) {
    return (
      <UtilityPageBackdrop>
        <main className="container-lunaro flex min-h-[70svh] items-center justify-center pb-24 pt-32 md:pt-40">
          <div className="w-full max-w-3xl text-center">
            <p className="eyebrow text-silver">DROP 001 — IN TRANSMISSION</p>

            <h1 className="mt-6 font-display text-6xl leading-[0.9] text-lunar md:text-8xl">
              SEARCH
              <br />
              CONCEALED
            </h1>

            <p className="mx-auto mt-8 max-w-lg text-sm leading-7 text-mist md:text-base">
              The collection remains beyond the visible. Search will open
              once the first transmission is ready.
            </p>

            <div className="terminator mx-auto mt-10 max-w-xs" />

            <Link
              href="/new-drop"
              className="mt-10 inline-block border border-lunar/30 px-7 py-4 text-eyebrow uppercase tracking-wider2 text-lunar transition-colors hover:bg-lunar hover:text-obsidian"
            >
              Enter the Transmission
            </Link>
          </div>
        </main>
      </UtilityPageBackdrop>
    );
  }

  const query = searchParams.q?.trim() ?? '';
  const hasQuery = query.length > 0;

  const products =
    hasQuery && isShopifyConfigured()
      ? await getProducts({ first: 24, query: `title:*${query}* OR tag:*${query}*` }).catch(() => [])
      : [];

  return (
    <UtilityPageBackdrop>
      <div className="container-lunaro pt-32 pb-24 md:pt-40">
      <form method="GET" action="/search" className="mb-14 flex max-w-xl items-end gap-4 border-b border-graphite transition-colors focus-within:border-lunar">
        <div className="flex-1">
          <label htmlFor="q" className="sr-only">
            Search products
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search LUNARO"
            autoFocus
            className="w-full bg-transparent py-4 font-display text-display-md text-lunar placeholder:text-mist/50 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          aria-label="Search"
          className="mb-4 flex h-11 w-11 flex-shrink-0 items-center justify-center text-lunar transition-opacity hover:opacity-70"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>

      {!hasQuery ? (
        <p className="text-mist">Start typing to search the current collection.</p>
      ) : (
        <>
          <p className="eyebrow mb-8 text-mist">
            {products.length} result{products.length === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
          </p>
          <ProductGrid products={products} />
        </>
      )}
    </div>
    </UtilityPageBackdrop>
  );
}
