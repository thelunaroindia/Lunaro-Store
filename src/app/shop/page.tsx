import type { Metadata } from 'next';
import { getProducts, isShopifyConfigured } from '@/lib/shopify';
import {
  applyCatalogueFilters,
  type CatalogueSearchParams,
} from '@/lib/catalogue';
import { placeholderProducts, PRELAUNCH_MODE } from '@/lib/config';
import type { ProductCardData } from '@/lib/types';
import { SectionHeading } from '@/components/ui/Eyebrow';
import FilterSort from '@/components/shop/FilterSort';
import ProductGrid from '@/components/shop/ProductGrid';

export const metadata: Metadata = {
  title: PRELAUNCH_MODE ? 'The First Transmission' : 'Shop All',
  description: 'Shop the full LUNARO catalogue.',
};

function fallbackProducts(): ProductCardData[] {
  return placeholderProducts.map((product, index) => ({
    id: `placeholder-${index}`,
    handle: product.handle,
    title: product.title,
    availableForSale: true,
    tags: [],
    priceRange: {
      minVariantPrice: {
        amount: String(product.price),
        currencyCode: 'INR',
      },
      maxVariantPrice: {
        amount: String(product.price),
        currencyCode: 'INR',
      },
    },
    images: [],
  }));
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: CatalogueSearchParams;
}) {
  if (PRELAUNCH_MODE) {
    return (
      <main className="container-lunaro flex min-h-[80svh] items-center justify-center pb-24 pt-32 md:pt-40">
        <div className="w-full max-w-5xl text-center">
          <p className="eyebrow text-silver">
            DROP 001 — IN TRANSMISSION
          </p>

          <h1 className="mt-6 font-display text-6xl leading-[0.9] text-lunar md:text-8xl lg:text-9xl">
            THE FIRST
            <br />
            TRANSMISSION
          </h1>

          <p className="mx-auto mt-8 max-w-lg text-sm leading-7 text-mist md:text-base">
            A new uniform is taking shape in darkness. The complete collection
            will be revealed when the signal is ready.
          </p>

          <div className="terminator mx-auto mt-10 max-w-xs" />

          <p className="mt-8 text-eyebrow uppercase tracking-wider2 text-lunar">
            REVEAL PENDING
          </p>
        </div>
      </main>
    );
  }

  let products: ProductCardData[] = [];

  if (isShopifyConfigured()) {
    products = await getProducts({ first: 48 }).catch(() => []);
  }

  if (products.length === 0) {
    products = fallbackProducts();
  }

  const filtered = applyCatalogueFilters(products, searchParams);

  return (
    <main className="container-lunaro pb-24 pt-32 md:pt-40">
      <SectionHeading
        eyebrow={`${filtered.length} Garments`}
        className="mb-8 md:mb-10"
      >
        SHOP ALL
      </SectionHeading>

      <FilterSort products={products} />
      <ProductGrid products={filtered} />
    </main>
  );
}