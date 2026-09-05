import Image from 'next/image';
import { SectionHeading } from '@/components/ui/Eyebrow';
import { LinkButton } from '@/components/ui/Button';
import ProductCard from '@/components/shop/ProductCard';
import { Reveal } from '@/components/motion/Reveal';
import { PRELAUNCH_MODE } from '@/lib/config';
import type { ProductCardData } from '@/lib/types';

// Partial-reveal imagery for the concealed cards — real LUNARO editorial
// photography, silhouette clearly visible but blurred just enough that the
// print/artwork itself stays concealed. Reuses the same two approved
// homepage collection images rather than inventing new artwork for a still-
// concealed drop.
//
// objectPosition is tuned per image so the garment/model stays framed
// in-shot on mobile's short, near-square card rather than being cropped by
// a default center position. filter/opacity are tuned per image too — the
// two source photos have very different native exposure (ORBIT is a much
// darker, lower-key shot; ECLIPSE has a bright near-white garment that
// blows out at matching settings). Values below were measured (composited
// pixel brightness, including the 95th-percentile highlight, not just the
// mean) so both land at comparable peak brightness — same editorial
// campaign, no blown-out area — rather than guessed by eye.
const concealedGarments = [
  {
    number: '01',
    title: 'ORBIT',
    line: 'Engineered forms shaped by motion, distance and human ambition.',
    image: '/images/collections/new-drop.jpg',
    objectPosition: '50% 18%',
    filter: 'blur(3px) brightness(3)',
    opacity: 0.85,
  },
  {
    number: '02',
    title: 'ECLIPSE',
    line: 'A study in shadow, restraint and considered form.',
    image: '/images/collections/graphic-tees.jpg',
    objectPosition: '50% 30%',
    filter: 'blur(3px) brightness(1.4)',
    opacity: 0.65,
  },
];

export default function FeaturedProducts({
  products,
}: {
  products: ProductCardData[];
}) {
  if (PRELAUNCH_MODE) {
    return (
      <section className="border-t border-graphite py-16 md:py-28">
        <div className="container-lunaro">
          <Reveal>
            <div className="max-w-[320px] md:max-w-none">
  <SectionHeading eyebrow="The Collection">
    FORM IN FOCUS
  </SectionHeading>
</div>
          </Reveal>

          <div className="mt-10 grid gap-px border border-graphite bg-graphite md:mt-14 md:grid-cols-2">
            {concealedGarments.map((garment, index) => (
              <Reveal
                key={garment.number}
                delay={0.05 + index * 0.08}
                className="h-full"
              >
                <article className="group relative flex h-full min-h-[320px] flex-col justify-end overflow-hidden bg-obsidian p-6 sm:min-h-[360px] sm:p-8 md:min-h-[520px] md:p-10">
                  <Image
                    src={garment.image}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    style={{
                      objectPosition: garment.objectPosition,
                      filter: garment.filter,
                      opacity: garment.opacity,
                    }}
                    className="object-cover scale-110"
                  />

                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045),transparent_58%)]" />

                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />

                  <div className="relative z-10">
                    <p className="eyebrow text-silver">
                      {garment.number}
                    </p>

                    <p className="mb-3 mt-3 text-[10px] uppercase tracking-[0.28em] text-mist">
                      Look {garment.number}
                    </p>

                    <h3 className="font-display text-4xl text-lunar md:text-5xl">
                      {garment.title}
                    </h3>

                    <p className="mt-4 max-w-sm text-sm leading-6 text-mist md:mt-5 md:leading-7">
                      {garment.line}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    // Top padding intentionally much tighter than the prelaunch treatment
    // above — this section (and Category Chips right above it) needs to put
    // real products within roughly one screen of the Hero, not roughly two.
    // Bottom padding is deliberately tighter too (vs. the old pb-24/pb-32)
    // so the section reads as compact and merchandise-heavy, not padded
    // out with empty black space beneath the grid.
    <section className="border-t border-graphite pt-8 pb-16 md:pt-10 md:pb-20">
      {/* Deliberately wider than the shared .container-lunaro (max-w-1440,
          used sitewide) — this section alone gets a near-edge-to-edge
          retail showcase width. Every other section keeps container-lunaro
          untouched. */}
      <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading>LATEST DROP</SectionHeading>

          <LinkButton href="/shop" variant="underline">
            View All
          </LinkButton>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:mt-10 lg:grid-cols-4 lg:gap-x-6">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={0.05 + index * 0.06}>
              <ProductCard
                product={product}
                priority={index === 0}
                size="large"
                showQuickAdd
                quickAddStyle="icon"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}