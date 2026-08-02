import { SectionHeading } from '@/components/ui/Eyebrow';
import { LinkButton } from '@/components/ui/Button';
import ProductCard from '@/components/shop/ProductCard';
import { Reveal } from '@/components/motion/Reveal';
import { PRELAUNCH_MODE } from '@/lib/config';
import type { ProductCardData } from '@/lib/types';

const concealedGarments = [
  {
    number: '01',
    title: 'ORBIT',
    line: 'Engineered forms shaped by motion, distance and human ambition.',
  },
  {
    number: '02',
    title: 'ECLIPSE',
    line: 'A study in shadow, obscured light and celestial darkness.',
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
    GARMENTS IN ORBIT
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
                <article className="group relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden bg-obsidian p-6 sm:min-h-[360px] sm:p-8 md:min-h-[520px] md:p-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045),transparent_58%)]" />

                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-charcoal/80 to-transparent" />

                  <div className="relative z-10">
                    <p className="eyebrow text-silver">
                      {garment.number}
                    </p>

                    <p className="mt-3 text-[10px] uppercase tracking-[0.35em] text-mist">
                      Transmission Pending
                    </p>
                  </div>

                  <div className="relative z-10">
                    <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-mist">
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
    <section className="border-t border-graphite py-24 md:py-32">
      <div className="container-lunaro">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="The Collection">
            GARMENTS IN ORBIT
          </SectionHeading>

          <LinkButton href="/shop" variant="underline">
            View All
          </LinkButton>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={0.05 + index * 0.06}>
              <ProductCard product={product} priority={index === 0} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}