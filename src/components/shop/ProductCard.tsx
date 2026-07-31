'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatMoney } from '@/lib/utils';
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
          className={`relative overflow-hidden bg-charcoal ${
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
        className="absolute bottom-[4.5rem] right-3 text-lg text-lunar opacity-0 transition-all duration-300 hover:scale-110 group-hover:opacity-100 focus-visible:opacity-100"
      >
        {wishlisted ? '●' : '○'}
      </button>

      <div className="mt-4 flex items-start justify-between gap-3">
        <Link
          href={`/products/${product.handle}`}
          className="text-sm leading-snug text-lunar link-underline"
        >
          {product.title}
        </Link>

        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <span className="text-sm text-lunar">
            {formatMoney(sellingPrice)}
          </span>

          {isOnSale && compareAtPrice && (
            <span className="text-xs text-mist line-through">
              {formatMoney(compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}