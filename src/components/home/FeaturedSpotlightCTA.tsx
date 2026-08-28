'use client';

import { useTransition, useState } from 'react';
import { Button, LinkButton } from '@/components/ui/Button';
import { useCartUI } from '@/context/CartUIContext';
import { addToCart } from '@/actions/cart';
import { trackEvent, isInternalTestProduct } from '@/lib/analytics';
import { singlePurchasableVariant } from '@/lib/variantMatch';
import type { ProductCardData } from '@/lib/types';

// FirstTransmission's "Shop Now" primary CTA. Mirrors ProductCard.tsx's Quick
// Add safety rule exactly: only add straight to the bag when the product has
// no real size/variant choice to make (singlePurchasableVariant). Otherwise a
// genuine choice exists, so this never silently guesses a variant — it links
// to the PDP instead, same as the secondary "View Details" CTA.
export default function FeaturedSpotlightCTA({
  product,
}: {
  product: ProductCardData;
}) {
  const { setCart, open: openCart } = useCartUI();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const variant = singlePurchasableVariant(product.filterVariants ?? []);

  if (!variant) {
    return (
      <LinkButton
        href={`/products/${product.handle}`}
        variant="primary"
        className="w-full sm:w-auto"
      >
        Shop Now
      </LinkButton>
    );
  }

  function handleClick() {
    if (isPending) return;
    setError(null);

    startTransition(async () => {
      const result = await addToCart(variant!.id, 1);

      if (result.ok) {
        const sellingPrice = product.priceRange.minVariantPrice;

        trackEvent('add_to_cart', {
          product_id: product.id,
          product_handle: product.handle,
          variant_id: variant!.id,
          currency: sellingPrice.currencyCode,
          value: Number(sellingPrice.amount),
          quantity: 1,
          internal_test: isInternalTestProduct(product.handle),
        });
        setCart(result.cart);
        openCart();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="w-full sm:w-auto">
      <Button
        type="button"
        variant="primary"
        className="w-full sm:w-auto"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? 'Adding…' : 'Shop Now'}
      </Button>

      {error && (
        <p className="mt-2 text-[11px] text-silver" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
