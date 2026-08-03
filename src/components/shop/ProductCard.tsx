'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatMoney } from '@/lib/utils';
import { cleanProductTitle } from '@/lib/productTitle';
import { useWishlist } from '@/context/WishlistContext';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import type { ProductCardData } from '@/lib/types';

export default function ProductCard({
  product,
  priority = false,
  size = 'default',
}: {
  product: ProductCardData;
  priority?: boolean;
  size?: 'default' | 'large';
}) {
  const { has, toggle } = useWishlist();

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
    </div>
  );
}