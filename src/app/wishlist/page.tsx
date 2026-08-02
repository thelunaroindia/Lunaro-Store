'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { cleanProductTitle } from '@/lib/productTitle';
import { LinkButton } from '@/components/ui/Button';
import { UtilityPageBackdrop } from '@/components/ui/UtilityPageBackdrop';

export default function WishlistPage() {
  const { items, remove } = useWishlist();

  if (items.length === 0) {
    return (
      <UtilityPageBackdrop>
        <div className="container-lunaro flex min-h-[60vh] flex-col items-center justify-center pt-32 text-center">
          <h1 className="font-display text-display-md text-lunar">Your wishlist is empty.</h1>
          <p className="mt-3 text-mist">Save garments you&apos;re drawn to and find them here.</p>
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
        <h1 className="mb-12 font-display text-display-md text-lunar">WISHLIST</h1>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.handle} className="group relative">
              <Link href={`/products/${item.handle}`} className="block">
                <div className="relative aspect-[4/5] media-rounded bg-charcoal">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.title} fill sizes="25vw" className="object-cover" />
                  )}
                </div>
              </Link>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <Link href={`/products/${item.handle}`} className="text-sm text-lunar link-underline">
                    {cleanProductTitle(item.title)}
                  </Link>
                  <p className="mt-1 text-sm text-mist">{item.price}</p>
                </div>
                <button
                  onClick={() => remove(item.handle)}
                  className="text-xs uppercase tracking-wider2 text-mist link-underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </UtilityPageBackdrop>
  );
}
