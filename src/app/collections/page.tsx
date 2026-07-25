import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getCollections, isShopifyConfigured } from '@/lib/shopify';
import { PRELAUNCH_MODE } from '@/lib/config';
import { SectionHeading } from '@/components/ui/Eyebrow';

export const metadata: Metadata = {
  title: 'Collections',
};

const futureCollections = [
  {
    id: 'trackpants-coming-soon',
    title: 'Trackpants',
    status: 'Future Transmission',
    image: '/images/collections/trackpants-coming-soon.jpg',
  },
  {
    id: 'hoodies-coming-soon',
    title: 'Hoodies',
    status: 'Future Transmission',
    image: '/images/collections/hoodies-coming-soon.jpg',
  },
];

export default async function CollectionsPage() {
  const collections = isShopifyConfigured()
    ? await getCollections().catch(() => [])
    : [];

  const oversizedCollection = collections.find(
    (collection) =>
      collection.handle === 'oversized-tees' ||
      collection.title.toLowerCase() === 'oversized tees'
  );

  const oversizedCard = (
    <div className="relative aspect-[4/5] overflow-hidden bg-charcoal">
      <Image
        src="/images/collections/oversized-tees.jpg"
        alt="LUNARO Oversized Tees Collection"
        fill
        priority
        sizes="(min-width: 1024px) 33vw, 50vw"
        className={`object-cover transition duration-700 ${
          PRELAUNCH_MODE
            ? 'scale-[1.02] opacity-55 grayscale'
            : 'group-hover:scale-[1.03]'
        }`}
      />

      <div
        className={`absolute inset-0 ${
          PRELAUNCH_MODE
            ? 'bg-obsidian/35'
            : 'bg-gradient-to-t from-obsidian/75 via-transparent to-transparent'
        }`}
      />

      {PRELAUNCH_MODE && (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="border border-lunar/20 bg-obsidian/65 px-6 py-5 text-center backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.35em] text-mist">
              First Transmission
            </p>

            <p className="mt-2 font-display text-3xl text-lunar">
              Arriving First
            </p>
          </div>
        </div>
      )}

      <div className="absolute bottom-5 left-5">
        <p className="eyebrow text-silver">01</p>

        <p className="mt-2 font-display text-3xl text-lunar">
          Oversized Tees
        </p>

        <p className="mt-2 text-xs uppercase tracking-wider2 text-mist">
          {PRELAUNCH_MODE ? 'Arriving First' : 'Available'}
        </p>
      </div>
    </div>
  );

  return (
    <main className="container-lunaro pb-24 pt-32 md:pt-40">
      <SectionHeading
        eyebrow={PRELAUNCH_MODE ? 'Transmission Index' : 'Explore'}
        className="mb-14"
      >
        COLLECTIONS
      </SectionHeading>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRELAUNCH_MODE ? (
          <div className="group block cursor-default">
            {oversizedCard}
          </div>
        ) : oversizedCollection ? (
          <Link
            href={`/collections/${oversizedCollection.handle}`}
            className="group block"
          >
            {oversizedCard}
          </Link>
        ) : (
          <div className="group block cursor-default">
            {oversizedCard}
          </div>
        )}

        {futureCollections.map((collection, index) => (
          <div
            key={collection.id}
            className="group relative block cursor-default"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-charcoal">
              <Image
                src={collection.image}
                alt={`${collection.title} future collection`}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover opacity-35 grayscale"
              />

              <div className="absolute inset-0 bg-obsidian/45" />

              <div className="absolute inset-0 flex items-center justify-center px-6">
                <div className="border border-lunar/20 bg-obsidian/65 px-6 py-5 text-center backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-mist">
                    Transmission Pending
                  </p>

                  <p className="mt-2 font-display text-3xl text-lunar">
                    Coming Soon
                  </p>
                </div>
              </div>

              <div className="absolute bottom-5 left-5">
                <p className="eyebrow text-silver">
                  0{index + 2}
                </p>

                <p className="mt-2 font-display text-3xl text-lunar">
                  {collection.title}
                </p>

                <p className="mt-2 text-xs uppercase tracking-wider2 text-mist">
                  {collection.status}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}