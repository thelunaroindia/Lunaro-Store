import Image from 'next/image';
import Link from 'next/link';

type CollectionCard = {
  name: string;
  href: string;
  image: string;
};

const COLLECTIONS: CollectionCard[] = [
  { name: 'NEW DROP', href: '/new-drop', image: '/images/collections/new-drop.jpg' },
  { name: 'GRAPHIC TEES', href: '/collections/graphic-tees', image: '/images/collections/graphic-tees.jpg' },
  { name: 'BOTTOMS', href: '/collections/trackpants', image: '/images/collections/bottoms.jpg' },
  { name: 'FOOTBALL EDIT', href: '/collections/football-edit', image: '/images/collections/football-edit.jpg' },
  { name: 'ARCHIVE', href: '/collections/archive', image: '/images/collections/archive.jpg' },
];

export default function CollectionCarousel() {
  return (
    <section
      aria-label="Shop by collection"
      className="border-t border-graphite py-16 md:py-28"
    >
      <div
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pl-5 pr-0 scroll-pl-5 sm:pl-8 sm:scroll-pl-8 lg:pl-12 lg:scroll-pl-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {COLLECTIONS.map((collection, index) => (
          <Link
            key={collection.href}
            href={collection.href}
            className="group relative block aspect-[4/5] w-[82vw] shrink-0 snap-start overflow-hidden bg-charcoal sm:w-[46vw] lg:w-[28vw] lg:max-w-[420px]"
          >
            <Image
              src={collection.image}
              alt={`${collection.name} collection`}
              fill
              priority={index < 2}
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 82vw"
              className="object-cover transition-transform duration-[1100ms] ease-lunar group-hover:scale-[1.045]"
            />

            <span className="absolute bottom-4 left-4 font-display text-lg uppercase tracking-wider2 text-lunar [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.85))] sm:bottom-5 sm:left-5 sm:text-xl lg:bottom-6 lg:left-6">
              {collection.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
