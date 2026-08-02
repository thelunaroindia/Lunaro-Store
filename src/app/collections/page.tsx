import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getCollections, isShopifyConfigured } from '@/lib/shopify';
import { PRELAUNCH_MODE } from '@/lib/config';
import { SectionHeading } from '@/components/ui/Eyebrow';

export const metadata: Metadata = {
  title: 'Collections',
};

// Deterministic display order and local artwork for each live Shopify
// collection. Title/description/handle always come from Shopify itself —
// a handle configured here that Shopify doesn't return is simply omitted
// (see `cards` below), never rendered as a fake or dead link.
const FEATURED_COLLECTIONS = [
  { handle: 'oversized-tees', image: '/images/collections/oversized-tees.jpg' },
  { handle: 'graphic-tees', image: '/images/collections/graphic-tees.jpg' },
  { handle: 'trackpants', image: '/images/collections/bottoms.jpg' },
  { handle: 'football-edit', image: '/images/collections/football-edit.jpg' },
  { handle: 'archive', image: '/images/collections/archive.jpg' },
] as const;

export default async function CollectionsPage() {
  const collections = isShopifyConfigured()
    ? await getCollections().catch(() => [])
    : [];

  const cards = FEATURED_COLLECTIONS.map((featured) => {
    const collection = collections.find(
      (c) => c.handle === featured.handle
    );

    return collection ? { ...featured, collection } : null;
  }).filter((card): card is NonNullable<typeof card> => card !== null);

  return (
    <main className="container-lunaro pb-24 pt-32 md:pt-40">
      <SectionHeading
        eyebrow={PRELAUNCH_MODE ? 'Transmission Index' : 'Explore'}
        className="mb-14"
      >
        COLLECTIONS
      </SectionHeading>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <Link
            key={card.handle}
            href={`/collections/${card.collection.handle}`}
            className="group block"
          >
            <div className="relative aspect-[4/5] media-rounded bg-charcoal">
              <Image
                src={card.image}
                alt={`LUNARO ${card.collection.title} Collection`}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover transition duration-700 group-hover:scale-[1.03]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/75 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5">
                <p className="eyebrow text-silver">
                  {String(index + 1).padStart(2, '0')}
                </p>

                <p className="mt-2 font-display text-3xl text-lunar">
                  {card.collection.title}
                </p>

                <p className="mt-2 line-clamp-1 text-xs uppercase tracking-wider2 text-mist">
                  {card.collection.description?.trim() || 'Available'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
