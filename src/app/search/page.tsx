import type { Metadata } from 'next';
import { getProducts, isShopifyConfigured } from '@/lib/shopify';
import ProductGrid from '@/components/shop/ProductGrid';
import { UtilityPageBackdrop } from '@/components/ui/UtilityPageBackdrop';

export const metadata: Metadata = { title: 'Search' };

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
      <form method="GET" action="/search" className="mb-14 max-w-xl">
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
          className="w-full border-b border-graphite bg-transparent py-4 font-display text-display-md text-lunar placeholder:text-mist/50 focus:border-lunar focus:outline-none"
        />
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
