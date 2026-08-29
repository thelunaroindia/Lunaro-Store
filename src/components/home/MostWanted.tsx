import { SectionHeading } from '@/components/ui/Eyebrow';
import ProductCard from '@/components/shop/ProductCard';
import { Reveal } from '@/components/motion/Reveal';
import type { ProductCardData } from '@/lib/types';

// Launch-mode-only "Most Wanted" homepage section, sourced from Shopify's
// BEST_SELLING sort (see getProducts() in src/lib/shopify.ts) — never a
// hardcoded product list. Deliberately given a tighter, denser layout than
// FeaturedProducts (no "View All", smaller max-width) so the two sections
// read as distinct even when the underlying products overlap on a small
// catalogue.
export default function MostWanted({
  products,
}: {
  products: ProductCardData[];
}) {
  if (products.length === 0) return null;

  return (
    // id targeted by the homepage Category Chips' "Best Sellers" chip
    // (/#most-wanted) — a real in-page destination rather than a route that
    // doesn't exist.
    <section id="most-wanted" className="border-t border-graphite py-16 md:py-24">
      <div className="container-lunaro">
        <Reveal>
          <SectionHeading eyebrow="Customer Favourites">
            MOST WANTED
          </SectionHeading>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:mt-12 md:grid-cols-4">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={0.05 + index * 0.06}>
              <ProductCard product={product} showQuickAdd />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
