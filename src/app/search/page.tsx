import type { Metadata } from 'next';
import { getProducts, isShopifyConfigured } from '@/lib/shopify';
import ProductGrid from '@/components/shop/ProductGrid';
import { UtilityPageBackdrop } from '@/components/ui/UtilityPageBackdrop';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search the current LUNARO collection.',
};

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
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
