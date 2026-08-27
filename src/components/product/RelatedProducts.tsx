import { getProducts } from '@/lib/shopify';
import ProductCard from '@/components/shop/ProductCard';
import { SectionHeading } from '@/components/ui/Eyebrow';
import type { Product, ProductCardData } from '@/lib/types';

const MAX_RELATED = 4;

// Fallback hierarchy, in order — each tier only runs if the previous ones
// haven't already filled MAX_RELATED. Simple and predictable: no
// personalization service, no scoring, just "closest real relationship
// first." Sold-out products are excluded at every tier so a customer is
// never routed toward something they can't actually buy.
async function fetchTier(query: string | undefined, first: number): Promise<ProductCardData[]> {
  return getProducts({ first, query }).catch(() => []);
}

export default async function RelatedProducts({ product }: { product: Product }) {
  const seen = new Set<string>([product.handle]);
  const related: ProductCardData[] = [];

  function collect(candidates: ProductCardData[]) {
    for (const candidate of candidates) {
      if (related.length >= MAX_RELATED) break;
      if (seen.has(candidate.handle)) continue;
      if (!candidate.availableForSale) continue;

      seen.add(candidate.handle);
      related.push(candidate);
    }
  }

  // 1. Same collection.
  const primaryCollection = product.collections?.[0]?.handle;
  if (primaryCollection && related.length < MAX_RELATED) {
    collect(await fetchTier(`collection:${primaryCollection}`, MAX_RELATED + 4));
  }

  // 2. Matching tag or product type.
  if (related.length < MAX_RELATED) {
    const tag = product.tags[0];
    const typeOrTagQuery = tag
      ? `tag:${tag}`
      : product.productType
        ? `product_type:${product.productType}`
        : undefined;

    if (typeOrTagQuery) {
      collect(await fetchTier(typeOrTagQuery, MAX_RELATED + 4));
    }
  }

  // 3. Current/new-drop collection (same tag the /new-drop page filters by).
  if (related.length < MAX_RELATED) {
    collect(await fetchTier('tag:drop-001', MAX_RELATED + 4));
  }

  // 4. General fallback — whatever's in the catalogue.
  if (related.length < MAX_RELATED) {
    collect(await fetchTier(undefined, MAX_RELATED + 4));
  }

  if (related.length === 0) return null;

  return (
    <section className="border-t border-graphite py-20">
      <div className="container-lunaro">
        <SectionHeading eyebrow="You May Also Like" className="mb-10">
          RELATED GARMENTS
        </SectionHeading>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
