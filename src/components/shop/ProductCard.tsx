'use client';

import { useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatMoney } from '@/lib/utils';
import { cleanProductTitle } from '@/lib/productTitle';
import { useWishlist } from '@/context/WishlistContext';
import { useCartUI } from '@/context/CartUIContext';
import { addToCart } from '@/actions/cart';
import { trackEvent, isInternalTestProduct } from '@/lib/analytics';
import {
  findMatchingVariant,
  getInitialQuickAddSelection,
  isRealOption,
  isValueAvailable,
  singlePurchasableVariant,
} from '@/lib/variantMatch';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import type { ProductCardData } from '@/lib/types';

export default function ProductCard({
  product,
  priority = false,
  size = 'default',
  showQuickAdd = false,
  quickAddStyle = 'button',
}: {
  product: ProductCardData;
  priority?: boolean;
  size?: 'default' | 'large';
  // Launch-mode-only conversion feature — see src/lib/variantMatch.ts.
  // Defaults to false so every existing call site (RelatedProducts,
  // /shop, /collections, /new-drop grids) renders exactly as before.
  showQuickAdd?: boolean;
  // 'button' (default) is the existing full-width pill — untouched, still
  // used by MostWanted/cart/etc. 'icon' is a minimal "+" trigger aligned
  // next to the price, used only by the homepage Latest Drop showcase.
  // Same handleQuickAddClick/runAdd flow either way — only the trigger's
  // appearance differs, never the add-to-cart/size-selection/sold-out logic.
  quickAddStyle?: 'button' | 'icon';
}) {
  const { has, toggle } = useWishlist();
  const { setCart, open: openCart } = useCartUI();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const filterVariants = useMemo(
    () => product.filterVariants ?? [],
    [product.filterVariants]
  );
  const visibleOptions = (product.filterOptions ?? []).filter(isRealOption);
  const anyPurchasable = filterVariants.some((v) => v.availableForSale);
  const singleVariant = singlePurchasableVariant(filterVariants);

  const activeVariant = useMemo(
    () => findMatchingVariant(filterVariants, selected),
    [filterVariants, selected]
  );

  function runAdd(variantId: string) {
    if (isPending) return;
    setFeedback('idle');

    startTransition(async () => {
      const result = await addToCart(variantId, 1);

      if (result.ok) {
        trackEvent('add_to_cart', {
          product_id: product.id,
          product_handle: product.handle,
          variant_id: variantId,
          currency: sellingPrice.currencyCode,
          value: Number(sellingPrice.amount),
          quantity: 1,
          internal_test: isInternalTestProduct(product.handle),
        });
        setCart(result.cart);
        openCart();
        setFeedback('success');
        setQuickAddOpen(false);
      } else {
        setFeedbackMessage(result.error);
        setFeedback('error');
      }
    });
  }

  function handleQuickAddClick() {
    if (isPending) return;

    if (singleVariant) {
      runAdd(singleVariant.id);
      return;
    }

    if (!quickAddOpen) {
      setSelected(getInitialQuickAddSelection(visibleOptions, filterVariants));
      setFeedback('idle');
      setQuickAddOpen(true);
    } else {
      setQuickAddOpen(false);
    }
  }

  function handleConfirmAdd() {
    if (isPending || !activeVariant || !activeVariant.availableForSale) return;
    runAdd(activeVariant.id);
  }

  const wishlisted = has(product.handle);
  const [front, back] = product.images;

  const isLimited = product.tags.includes('limited');
  const isSoldOut = !product.availableForSale;

  const sellingPrice = product.priceRange.minVariantPrice;
  const compareAtPrice =
    product.compareAtPriceRange?.minVariantPrice;

  const isOnSale =
    compareAtPrice &&
    Number(compareAtPrice.amount) >
      Number(sellingPrice.amount);

  const displayTitle = cleanProductTitle(product.title);

  // Identical size-selection panel for both quickAddStyle variants — only
  // ever rendered once quickAddOpen is true, i.e. after the trigger
  // (pill button or "+" icon) has already been clicked. Never changes the
  // add-to-cart/availability logic above, only avoids duplicating this
  // markup between the two trigger styles.
  function renderVariantPanel() {
    return (
      <div className="border border-graphite p-3">
        {visibleOptions.map((option) => (
          <fieldset key={option.name} className="mb-2 last:mb-0">
            <legend className="text-[9px] uppercase tracking-wider2 text-mist">
              {option.name}
            </legend>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {option.values.map((value) => {
                const isSelected = selected[option.name] === value;
                const unavailable = !isValueAvailable(
                  filterVariants,
                  selected,
                  option.name,
                  value
                );

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isSelected}
                    disabled={unavailable}
                    onClick={() =>
                      setSelected((current) => ({
                        ...current,
                        [option.name]: value,
                      }))
                    }
                    className={`border px-2.5 py-1 text-[10px] transition-all duration-200 ${
                      isSelected
                        ? 'border-lunar text-lunar'
                        : 'border-graphite text-mist hover:border-mist'
                    } ${
                      unavailable
                        ? 'cursor-not-allowed opacity-30 line-through'
                        : ''
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        <button
          type="button"
          onClick={handleConfirmAdd}
          disabled={
            isPending ||
            !activeVariant ||
            !activeVariant.availableForSale
          }
          className="mt-1 w-full bg-lunar py-2 text-[10px] uppercase tracking-wider2 text-obsidian transition-opacity disabled:opacity-40"
        >
          {isPending ? 'Adding…' : 'Add to Bag'}
        </button>

        <button
          type="button"
          onClick={() => setQuickAddOpen(false)}
          aria-label="Close quick add"
          className="mt-2 w-full text-center text-[9px] uppercase tracking-wider2 text-mist link-underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  function onToggleWishlist() {
    toggle({
      handle: product.handle,
      title: product.title,
      price: formatMoney(sellingPrice),
      imageUrl: front?.url ?? null,
    });
  }

  return (
    <div className="group relative">
      <Link
        href={`/products/${product.handle}`}
        className="block"
      >
        <div
          className={`relative media-rounded bg-charcoal ${
            size === 'large'
              ? 'aspect-[3/4]'
              : 'aspect-[4/5]'
          }`}
        >
          <div className="h-full w-full transition-transform duration-[1100ms] ease-lunar group-hover:scale-[1.045]">
            {front ? (
              <>
                <Image
                  src={front.url}
                  alt={front.altText ?? product.title}
                  fill
                  priority={priority}
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className={`object-cover transition-opacity duration-700 ${
                    back
                      ? 'group-hover:opacity-0'
                      : ''
                  }`}
                />

                {back && (
                  <Image
                    src={back.url}
                    alt={
                      back.altText ??
                      `${product.title} — back`
                    }
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="absolute inset-0 object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  />
                )}
              </>
            ) : (
              <CinematicPlaceholder
                variant="product"
                className="h-full w-full"
              />
            )}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/0 via-obsidian/0 to-obsidian/0 opacity-0 transition-opacity duration-500 group-hover:from-obsidian/25 group-hover:opacity-100" />

          {isLimited && (
            <span className="absolute left-3 top-3 bg-obsidian/80 px-2 py-1 text-[10px] uppercase tracking-wider2 text-silver">
              Limited Drop
            </span>
          )}

          {isSoldOut && (
            <span className="absolute right-3 top-3 bg-obsidian/80 px-2 py-1 text-[10px] uppercase tracking-wider2 text-mist">
              Sold Out
            </span>
          )}
        </div>
      </Link>

      <button
        type="button"
        onClick={onToggleWishlist}
        aria-pressed={wishlisted}
        aria-label={
          wishlisted
            ? 'Remove from wishlist'
            : 'Add to wishlist'
        }
        className="absolute bottom-[4.5rem] right-3 flex h-11 w-11 items-center justify-center rounded-full bg-obsidian/60 text-lunar opacity-100 backdrop-blur-sm transition-all duration-300 hover:scale-110 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill={wishlisted ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={1.75}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 20.25c-.318 0-.633-.09-.909-.27C7.29 17.51 3 14.24 3 9.75 3 6.99 5.239 4.75 8 4.75c1.54 0 2.97.73 3.999 1.99C13.03 5.48 14.46 4.75 16 4.75c2.761 0 5 2.24 5 5 0 4.49-4.29 7.76-8.091 10.23-.276.18-.591.27-.909.27Z"
          />
        </svg>
      </button>

      {quickAddStyle === 'icon' ? (
        <>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/products/${product.handle}`}
                className="line-clamp-2 text-[12px] font-normal leading-[1.25] tracking-normal text-lunar link-underline sm:text-[13px] lg:text-sm"
              >
                {displayTitle}
              </Link>

              <div className="mt-1 flex items-center gap-2">
                <span className="whitespace-nowrap text-[12px] font-normal leading-none text-lunar sm:text-[13px] lg:text-sm">
                  {formatMoney(sellingPrice)}
                </span>

                {isOnSale && compareAtPrice && (
                  <span className="whitespace-nowrap text-[10px] font-normal text-mist/60 line-through sm:text-xs">
                    {formatMoney(compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

            {showQuickAdd && !isSoldOut && anyPurchasable && !quickAddOpen && (
              <button
                type="button"
                onClick={handleQuickAddClick}
                disabled={isPending}
                aria-label={
                  singleVariant
                    ? `Add ${displayTitle} to cart`
                    : `Select size for ${displayTitle}`
                }
                className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center text-lunar transition-opacity duration-200 hover:opacity-60 disabled:opacity-30"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.25}
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M8 2v12M2 8h12" />
                </svg>
              </button>
            )}
          </div>

          {showQuickAdd && !isSoldOut && anyPurchasable && quickAddOpen && (
            <div className="mt-3">{renderVariantPanel()}</div>
          )}

          {showQuickAdd && feedback === 'error' && (
            <p className="mt-1.5 text-[10px] text-silver" role="alert">
              {feedbackMessage}
            </p>
          )}
        </>
      ) : (
        <>
          <div className="mt-3">
            <Link
              href={`/products/${product.handle}`}
              className="line-clamp-2 text-[12px] font-normal leading-[1.25] tracking-normal text-lunar link-underline sm:text-[13px] lg:text-sm"
            >
              {displayTitle}
            </Link>

            <div className="mt-1 flex items-center gap-2">
              <span className="whitespace-nowrap text-[12px] font-normal leading-none text-lunar sm:text-[13px] lg:text-sm">
                {formatMoney(sellingPrice)}
              </span>

              {isOnSale && compareAtPrice && (
                <span className="whitespace-nowrap text-[10px] font-normal text-mist/60 line-through sm:text-xs">
                  {formatMoney(compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          {showQuickAdd && !isSoldOut && anyPurchasable && (
            <div className="mt-2">
              {!quickAddOpen && (
                <button
                  type="button"
                  onClick={handleQuickAddClick}
                  disabled={isPending}
                  aria-label={
                    singleVariant
                      ? `Add ${displayTitle} to cart`
                      : `Select size for ${displayTitle}`
                  }
                  className="w-full bg-lunar py-2 text-[10px] uppercase tracking-wider2 text-obsidian transition-opacity duration-300 hover:opacity-90 disabled:opacity-40"
                >
                  {isPending
                    ? 'Adding…'
                    : feedback === 'success'
                      ? 'Added ✓'
                      : singleVariant
                        ? 'Add to Cart'
                        : 'Select Size'}
                </button>
              )}

              {quickAddOpen && renderVariantPanel()}

              {feedback === 'error' && (
                <p className="mt-1.5 text-[10px] text-silver" role="alert">
                  {feedbackMessage}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}