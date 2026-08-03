'use client';

import Image from 'next/image';
import { useState, useTransition } from 'react';
import { formatMoney } from '@/lib/utils';
import { cleanProductTitle } from '@/lib/productTitle';
import { updateCartLine, removeFromCart } from '@/actions/cart';
import type { Cart, CartLine } from '@/lib/types';

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

  function changeQty(next: number) {
    setError('');
    startTransition(async () => {
      const result = next <= 0 ? await removeFromCart(line.id) : await updateCartLine(line.id, next);
      if (result.ok) onCartChange(result.cart);
      else setError(result.error);
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
            <p className="mt-1 text-xs text-mist">
              {line.merchandise.selectedOptions.map((o) => o.value).join(' / ')}
            </p>
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
            <span aria-live="polite">{line.quantity}</span>
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
