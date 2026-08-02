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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <Link
            key={card.handle}
            href={`/collections/${card.collection.handle}`}
            className="group relative block aspect-[4/5] media-rounded bg-charcoal"
          >
            <Image
              src={card.image}
              alt={`${card.collection.title} collection`}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 33vw, 50vw"
              className="object-cover transition-transform duration-[1100ms] ease-lunar group-hover:scale-[1.045]"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/75 via-transparent to-transparent" />

            <span className="absolute bottom-4 left-4 font-display text-lg uppercase tracking-wider2 text-lunar sm:bottom-5 sm:left-5 sm:text-xl lg:bottom-6 lg:left-6">
              {card.collection.title}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
