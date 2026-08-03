import type { Metadata } from 'next';
import { getOrCreateCart } from '@/actions/cart';
import { getProducts } from '@/lib/shopify';
import { LinkButton } from '@/components/ui/Button';
import ProductCard from '@/components/shop/ProductCard';
import { UtilityPageBackdrop } from '@/components/ui/UtilityPageBackdrop';
import CartPageClient from './CartPageClient';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review your selected garments before checkout.',
};

export default async function CartPage() {
  const cart = await getOrCreateCart();
  const isEmpty = !cart || cart.lines.length === 0;

  const recommended = isEmpty ? [] : await getProducts({ first: 4 }).catch(() => []);
  const recommendedFiltered = recommended.filter(
    (p) => !cart?.lines.some((l) => l.merchandise.product.handle === p.handle)
  );

  if (isEmpty) {
    return (
      <UtilityPageBackdrop>
        <div className="container-lunaro flex min-h-[60vh] flex-col items-center justify-center pt-32 text-center">
          <h1 className="font-display text-display-md text-lunar">Your cart is empty.</h1>
          <p className="mt-3 text-mist">Explore the current drop to begin.</p>
          <LinkButton href="/shop" variant="ghost" className="mt-8">
            Shop All
          </LinkButton>
        </div>
      </UtilityPageBackdrop>
    );
  }

  return (
    <UtilityPageBackdrop>
      <div className="container-lunaro pt-32 pb-24 md:pt-40">
        <h1 className="mb-12 font-display text-display-md text-lunar">CART</h1>
        <CartPageClient initialCart={cart} />

        {recommendedFiltered.length > 0 && (
          <section className="mt-24 border-t border-graphite pt-16">
            <p className="eyebrow mb-8 text-mist">You May Also Like</p>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {recommendedFiltered.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </UtilityPageBackdrop>
  );
}
