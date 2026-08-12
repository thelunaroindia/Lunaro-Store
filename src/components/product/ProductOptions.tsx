'use client';

import {
  useMemo,
  useState,
  useTransition,
  type Dispatch,
  type SetStateAction,
} from 'react';
import Link from 'next/link';
import { formatMoney } from '@/lib/utils';
import { addToCart } from '@/actions/cart';
import { useCartUI } from '@/context/CartUIContext';
import { Button, LinkButton } from '@/components/ui/Button';
import { cartToFastrProducts, openFastrCheckout } from '@/lib/fastr';
import StickyAddToCart from './StickyAddToCart';
import { payments } from '@/lib/config';
import type { Product, ProductVariant } from '@/lib/types';

const TRACKPANT_PRODUCT_TYPES = [
  'trackpant',
  'trackpants',
  'sweatpant',
  'sweatpants',
];

function isTrackpant(productType: string): boolean {
  return TRACKPANT_PRODUCT_TYPES.includes(
    productType.trim().toLowerCase()
  );
}

export function findVariant(
  variants: ProductVariant[],
  selected: Record<string, string>
): ProductVariant | undefined {
  return variants.find((variant) =>
    variant.selectedOptions.every(
      (option) => selected[option.name] === option.value
    )
  );
}

export function getInitialSelectedOptions(
  product: Product
): Record<string, string> {
  const initial: Record<string, string> = {};

  for (const option of product.options) {
    const firstAvailableVariant = product.variants.find(
      (variant) =>
        variant.availableForSale &&
        variant.selectedOptions.some(
          (selectedOption) => selectedOption.name === option.name
        )
    );

    initial[option.name] =
      firstAvailableVariant?.selectedOptions.find(
        (selectedOption) => selectedOption.name === option.name
      )?.value ??
      option.values[0] ??
      '';
  }

  return initial;
}

export default function ProductOptions({
  product,
  selected,
  setSelected,
}: {
  product: Product;
  selected: Record<string, string>;
  setSelected: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  const { setCart, open } = useCartUI();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const productSoldOut =
    !product.availableForSale ||
    product.variants.length === 0 ||
    product.variants.every(
      (variant) => !variant.availableForSale
    );

  const activeVariant = useMemo(
    () => findVariant(product.variants, selected),
    [product.variants, selected]
  );

  const isSoldOut =
    productSoldOut ||
    !activeVariant ||
    !activeVariant.availableForSale;

  const isLowStock =
    !productSoldOut &&
    activeVariant?.availableForSale &&
    typeof activeVariant.quantityAvailable === 'number' &&
    activeVariant.quantityAvailable > 0 &&
    activeVariant.quantityAvailable <= 5;

  const sellingPrice =
    activeVariant?.price ??
    product.priceRange.minVariantPrice;

  const compareAtPrice =
    activeVariant?.compareAtPrice ?? null;

  const isOnSale =
    compareAtPrice !== null &&
    Number(compareAtPrice.amount) >
      Number(sellingPrice.amount);

  const priceLabel = formatMoney(sellingPrice);

  function handleAddToCart() {
    if (!activeVariant || isSoldOut || isPending) return;

    setError('');

    startTransition(async () => {
      const result = await addToCart(activeVariant.id, 1);

      if (result.ok) {
        setCart(result.cart);
        open();
      } else {
        setError(result.error);
      }
    });
  }

  function handleBuyNow() {
    if (!activeVariant || isSoldOut || isPending) return;

    setError('');

    startTransition(async () => {
      const result = await addToCart(activeVariant.id, 1);

      if (result.ok) {
        setCart(result.cart);
        openFastrCheckout(cartToFastrProducts(result.cart));
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <p className="text-2xl font-medium text-lunar">
          {formatMoney(sellingPrice)}
        </p>

        {isOnSale && compareAtPrice && (
          <p className="text-sm text-mist line-through">
            {formatMoney(compareAtPrice)}
          </p>
        )}
      </div>

      <p className="mt-1 text-xs text-mist">
        Inclusive of taxes. Shipping calculated at checkout.
      </p>

      {product.options.map((option) => (
        <fieldset key={option.name} className="mt-8">
          <legend className="eyebrow text-mist">
            {option.name}
          </legend>

          <div className="mt-3 flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected =
                selected[option.name] === value;

              const variantForValue = findVariant(
                product.variants,
                {
                  ...selected,
                  [option.name]: value,
                }
              );

              const unavailable =
                productSoldOut ||
                !variantForValue ||
                !variantForValue.availableForSale;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setSelected((current) => ({
                      ...current,
                      [option.name]: value,
                    }))
                  }
                  aria-pressed={isSelected}
                  disabled={unavailable}
                  className={`border px-4 py-2 text-sm transition-all duration-300 ease-lunar ${
                    isSelected
                      ? 'border-lunar text-lunar'
                      : 'border-graphite text-mist hover:border-mist'
                  } ${
                    unavailable
                      ? 'cursor-not-allowed opacity-30 line-through'
                      : 'hover:scale-[1.03]'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>

          {option.name.toLowerCase() === 'size' && (
            <LinkButton
              href={
                isTrackpant(product.productType)
                  ? '/size-guide?category=bottoms'
                  : '/size-guide'
              }
              variant="underline"
              className="mt-3 text-xs"
            >
              Size Guide
            </LinkButton>
          )}
        </fieldset>
      ))}

      <div className="mt-8 space-y-3">
        {isSoldOut ? (
          <Button disabled className="w-full">
            Sold Out
          </Button>
        ) : (
          <>
            <Button
              onClick={handleBuyNow}
              disabled={isPending}
              className="w-full"
            >
              Buy Now
            </Button>

            <Button
              onClick={handleAddToCart}
              variant="ghost"
              disabled={isPending}
              className="w-full"
            >
              {isPending ? 'Adding…' : 'Add to Cart'}
            </Button>
          </>
        )}
      </div>

      {isLowStock && (
        <p className="mt-3 text-xs text-silver">
          Only {activeVariant?.quantityAvailable} left in this
          size.
        </p>
      )}

      {error && (
        <p className="mt-3 text-xs text-silver">
          {error}
        </p>
      )}

      {!isSoldOut && (
        <p className="mt-6 text-[11px] leading-relaxed text-mist">
          Secure Payments —{' '}
          {[...payments.methods, 'Estimated dispatch: 2–4 business days.'].join(
            ' · '
          )}
        </p>
      )}

      <p className="mt-3 text-[11px] text-mist">
        <Link href="/shipping-returns" className="link-underline text-lunar">
          Easy Returns &amp; Exchange
        </Link>
        {' — see policy for details.'}
      </p>

      <StickyAddToCart
        title={product.title}
        priceLabel={priceLabel}
        disabled={isSoldOut}
        isPending={isPending}
        onAdd={handleBuyNow}
      />
    </div>
  );
}