'use client';

import Image from 'next/image';
import { useState, useTransition } from 'react';
import { formatMoney } from '@/lib/utils';
import { cleanProductTitle } from '@/lib/productTitle';
import { updateCartLine, removeFromCart } from '@/actions/cart';
import { trackEvent } from '@/lib/analytics';
import type { Cart, CartLine } from '@/lib/types';

// Mirrors the PDP's isRealOption check (src/components/product/ProductOptions.tsx)
// — a single "Title: Default Title" line is Shopify's own placeholder for
// products with no real colour/size set up, not information worth showing.
function realSelectedOptions(
  options: { name: string; value: string }[]
): { name: string; value: string }[] {
  const only = options.length === 1 ? options[0] : undefined;

  if (only && only.name === 'Title' && only.value === 'Default Title') {
    return [];
  }

  return options;
}

export default function CartLineItem({
  line,
  onCartChange,
}: {
  line: CartLine;
  onCartChange: (cart: Cart) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const image = line.merchandise.product.images[0];
  const variantLabel = realSelectedOptions(line.merchandise.selectedOptions)
    .map((o) => o.value)
    .join(' / ');

  function changeQty(next: number) {
    setError('');
    startTransition(async () => {
      const result = next <= 0 ? await removeFromCart(line.id) : await updateCartLine(line.id, next);

      if (result.ok) {
        trackEvent(next <= 0 ? 'remove_from_cart' : 'update_cart_quantity', {
          product_id: line.merchandise.product.handle,
          quantity: next,
        });
        onCartChange(result.cart);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex gap-4 border-b border-graphite py-5">
      <div className="relative h-24 w-20 flex-shrink-0 media-rounded-sm bg-charcoal">
        {image ? (
          <Image src={image.url} alt={image.altText ?? line.merchandise.product.title} fill sizes="80px" className="object-cover" />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between gap-3">
          <div>
            <p className="text-sm text-lunar">{cleanProductTitle(line.merchandise.product.title)}</p>
            {variantLabel && (
              <p className="mt-1 text-xs text-mist">{variantLabel}</p>
            )}
          </div>
          <p className="whitespace-nowrap text-sm text-mist">{formatMoney(line.cost.totalAmount)}</p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-lunar">
            <button
              onClick={() => changeQty(line.quantity - 1)}
              disabled={isPending}
              aria-label="Decrease quantity"
              className="h-6 w-6 border border-graphite disabled:opacity-40"
            >
              −
            </button>
            <span aria-live="polite">
              <span className="sr-only">Quantity: </span>
              {line.quantity}
            </span>
            <button
              onClick={() => changeQty(line.quantity + 1)}
              disabled={isPending}
              aria-label="Increase quantity"
              className="h-6 w-6 border border-graphite disabled:opacity-40"
            >
              +
            </button>
          </div>
          <button onClick={() => changeQty(0)} disabled={isPending} className="text-xs uppercase tracking-wider2 text-mist link-underline">
            Remove
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-silver">{error}</p>}
      </div>
    </div>
  );
}
