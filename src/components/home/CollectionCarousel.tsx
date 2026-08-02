import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';

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
      <div className="container-lunaro">
        <Reveal>
          <div className="grid grid-flow-col auto-cols-[80vw] gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-5 lg:gap-3 lg:overflow-visible lg:snap-none lg:pb-0">
            {COLLECTIONS.map((collection) => (
              <Link
                key={collection.href}
                href={collection.href}
                className="group relative block aspect-[4/5] snap-center overflow-hidden bg-charcoal"
              >
                <Image
                  src={collection.image}
                  alt={`${collection.name} collection`}
                  fill
                  sizes="(min-width: 1024px) 20vw, 80vw"
                  className="object-cover transition-transform duration-[1100ms] ease-lunar group-hover:scale-[1.045]"
                />

                <span className="absolute bottom-4 left-4 bg-obsidian/60 px-3 py-1.5 font-display text-lg uppercase tracking-wider2 text-lunar sm:text-xl">
                  {collection.name}
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
