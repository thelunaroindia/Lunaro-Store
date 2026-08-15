'use client';

import {
  useMemo,
  useRef,
  useState,
  useTransition,
  type Dispatch,
  type SetStateAction,
} from 'react';
import Link from 'next/link';
import { formatMoney } from '@/lib/utils';
import { addToCart } from '@/actions/cart';
import { useCartUI } from '@/context/CartUIContext';
import { Button } from '@/components/ui/Button';
import { cartToFastrProducts, openFastrCheckout } from '@/lib/fastr';
import { trackEvent, isInternalTestProduct } from '@/lib/analytics';
import StickyAddToCart from './StickyAddToCart';
import SizeGuideDrawer from './SizeGuideDrawer';
import { payments, prepaidIncentive } from '@/lib/config';
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

// Shopify gives every product at least one option. Products with no real
// customer choice (no colour/size set up in Admin) still carry a single
// "Title" option with the single value "Default Title" — Shopify's own
// placeholder, not a real selection. Showing it as a selectable pill reads
// as an unfinished, technical UI, so it's hidden entirely rather than
// rendered as if it were a real choice.
function isRealOption(option: { name: string; values: string[] }): boolean {
  return !(option.name === 'Title' && option.values.length === 1 && option.values[0] === 'Default Title');
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

// Used only to decide whether a specific value-button should render as
// unavailable. Unlike findVariant (which needs an exact match across every
// option to compute the single active variant), this treats any
// not-yet-chosen option as a wildcard — otherwise, while Size is still
// unselected (see getInitialSelectedOptions), every Colour button would
// wrongly appear sold out simply because no variant can match an empty
// Size value.
function hasAvailableVariantFor(
  variants: ProductVariant[],
  selected: Record<string, string>,
  optionName: string,
  value: string
): boolean {
  const candidate = { ...selected, [optionName]: value };

  return variants.some(
    (variant) =>
      variant.availableForSale &&
      variant.selectedOptions.every((option) => {
        const chosen = candidate[option.name];
        return !chosen || chosen === option.value;
      })
  );
}

// Every option auto-selects its first available value — EXCEPT Size when
// there's a genuine choice to make (2+ sizes). Auto-selecting a size would
// let Buy Now silently ship whatever size happened to be first, which is
// exactly how wrong-size orders (and the returns/RTO they cause) happen.
// Colour and single-value options carry no such risk, so they still default
// for a faster, less fussy flow.
export function getInitialSelectedOptions(
  product: Product
): Record<string, string> {
  const initial: Record<string, string> = {};

  for (const option of product.options) {
    const isSize = option.name.toLowerCase() === 'size';

    if (isSize && option.values.length > 1) {
      initial[option.name] = '';
      continue;
    }

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
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [showSizePrompt, setShowSizePrompt] = useState(false);
  const sizeFieldsetRef = useRef<HTMLFieldSetElement | null>(null);

  const trackpant = isTrackpant(product.productType);
  const visibleOptions = product.options.filter(isRealOption);
  const sizeOption = visibleOptions.find(
    (option) => option.name.toLowerCase() === 'size'
  );
  const needsSizeSelection = Boolean(sizeOption) && !selected[sizeOption!.name];

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
    !needsSizeSelection &&
    (productSoldOut ||
      !activeVariant ||
      !activeVariant.availableForSale);

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

  function focusSizeSelector() {
    setShowSizePrompt(true);
    sizeFieldsetRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  function handleAddToCart() {
    if (isPending) return;

    if (needsSizeSelection) {
      focusSizeSelector();
      return;
    }

    if (!activeVariant || isSoldOut) return;

    setError('');

    startTransition(async () => {
      const result = await addToCart(activeVariant.id, 1);

      if (result.ok) {
        trackEvent('add_to_cart', {
          product_id: product.id,
          product_handle: product.handle,
          variant_id: activeVariant.id,
          currency: activeVariant.price.currencyCode,
          value: Number(activeVariant.price.amount),
          quantity: 1,
          internal_test: isInternalTestProduct(product.handle),
        });
        setCart(result.cart);
        open();
      } else {
        setError(result.error);
      }
    });
  }

  function handleBuyNow() {
    if (isPending) return;

    if (needsSizeSelection) {
      focusSizeSelector();
      return;
    }

    if (!activeVariant || isSoldOut) return;

    setError('');

    startTransition(async () => {
      const result = await addToCart(activeVariant.id, 1);

      if (result.ok) {
        const eventParams = {
          product_id: product.id,
          product_handle: product.handle,
          variant_id: activeVariant.id,
          currency: activeVariant.price.currencyCode,
          value: Number(activeVariant.price.amount),
          quantity: 1,
          internal_test: isInternalTestProduct(product.handle),
        };
        trackEvent('buy_now', eventParams);
        setCart(result.cart);
        openFastrCheckout(cartToFastrProducts(result.cart));
        // Buy Now opens the identical Fastr checkout overlay the cart's
        // Checkout button does — counted as a genuine checkout attempt so
        // abandonment can be measured across both entry points, not just one.
        trackEvent('begin_checkout', eventParams);
      } else {
        setError(result.error);
      }
    });
  }

  const buyNowLabel = needsSizeSelection
    ? 'Select a Size'
    : 'Buy Now';

  const addToCartLabel = needsSizeSelection
    ? 'Select a Size'
    : isPending
      ? 'Adding…'
      : 'Add to Cart';

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

      {visibleOptions.map((option) => {
        const isSize = option.name.toLowerCase() === 'size';

        return (
          <fieldset
            key={option.name}
            ref={isSize ? sizeFieldsetRef : undefined}
            className="mt-8"
          >
            <div className="flex items-baseline justify-between">
              <legend className="eyebrow text-mist">
                {option.name}
              </legend>

              {isSize && (
                <button
                  type="button"
                  onClick={() => {
                    trackEvent('open_size_guide', {
                      product_id: product.id,
                      product_handle: product.handle,
                      internal_test: isInternalTestProduct(product.handle),
                    });
                    setSizeGuideOpen(true);
                  }}
                  className="link-underline text-xs text-lunar"
                >
                  Size Guide
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected =
                  selected[option.name] === value;

                const unavailable =
                  productSoldOut ||
                  !hasAvailableVariantFor(
                    product.variants,
                    selected,
                    option.name,
                    value
                  );

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      if (isSize) setShowSizePrompt(false);

                      // Only a genuine change is a variant "selection" — a
                      // re-click of the value already active isn't a new
                      // signal and would just inflate event volume.
                      if (!isSelected) {
                        trackEvent('select_item_variant', {
                          product_id: product.id,
                          product_handle: product.handle,
                          option: option.name,
                          value,
                          internal_test: isInternalTestProduct(product.handle),
                        });
                      }

                      setSelected((current) => ({
                        ...current,
                        [option.name]: value,
                      }));
                    }}
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

            {isSize && showSizePrompt && needsSizeSelection && (
              <p className="mt-3 text-xs text-silver" role="alert">
                Select a size to continue.
              </p>
            )}
          </fieldset>
        );
      })}

      <p className="mt-4 text-xs leading-relaxed text-mist">
        <span className="text-lunar">FIT</span> —{' '}
        {trackpant
          ? 'Loose fit, designed for a relaxed silhouette.'
          : 'Oversized silhouette, true to size in the shoulder.'}
      </p>

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
              {buyNowLabel}
            </Button>

            <Button
              onClick={handleAddToCart}
              variant="ghost"
              disabled={isPending}
              className="w-full"
            >
              {addToCartLabel}
            </Button>
          </>
        )}
      </div>

      {!isSoldOut && (
        <p className="mt-3 text-xs text-mist">
          {prepaidIncentive}
        </p>
      )}

      {error && (
        <p className="mt-3 text-xs text-silver" role="alert">
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
        needsSizeSelection={needsSizeSelection}
        isPending={isPending}
        onAdd={handleBuyNow}
      />

      <SizeGuideDrawer
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={trackpant ? 'bottoms' : 'tops'}
      />
    </div>
  );
}
