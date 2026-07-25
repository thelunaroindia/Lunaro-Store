import { SectionHeading } from '@/components/ui/Eyebrow';
import { LinkButton } from '@/components/ui/Button';
import ProductCard from '@/components/shop/ProductCard';
import { Reveal } from '@/components/motion/Reveal';
import { PRELAUNCH_MODE } from '@/lib/config';
import type { ProductCardData } from '@/lib/types';

const concealedGarments = [
  {
    number: '01',
    title: 'CONCEALED',
    line: 'The first silhouette remains beyond the visible.',
  },
  {
    number: '02',
    title: 'CONCEALED',
    line: 'A second form is taking shape in darkness.',
  },
  {
    number: '03',
    title: 'CONCEALED',
    line: 'The signal will reveal only what is ready.',
  },
];

export default function FeaturedProducts({
  products,
}: {
  products: ProductCardData[];
}) {
  if (PRELAUNCH_MODE) {
    return (
      <section className="border-t border-graphite py-24 md:py-32">
        <div className="container-lunaro">
          <Reveal>
            <SectionHeading eyebrow="The Collection">
              GARMENTS IN ORBIT
            </SectionHeading>
          </Reveal>

          <div className="mt-14 grid gap-px border border-graphite bg-graphite md:grid-cols-3">
            {concealedGarments.map((garment, index) => (
              <Reveal
                key={garment.number}
                delay={0.05 + index * 0.08}
                className="h-full"
              >
                <article className="group relative flex min-h-[460px] h-full flex-col justify-between overflow-hidden bg-obsidian p-8 md:min-h-[560px] md:p-10">
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
                    <h3 className="font-display text-4xl text-lunar md:text-5xl">
                      {garment.title}
                    </h3>

                    <p className="mt-5 max-w-xs text-sm leading-7 text-mist">
                      {garment.line}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.32} className="mt-12 text-center">
            <p className="eyebrow text-silver">
              THE FIRST GARMENTS REMAIN OUT OF SIGHT
            </p>

            <p className="mt-4 font-display text-3xl text-lunar md:text-5xl">
              REVEAL PENDING
            </p>
          </Reveal>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  const [first, second, third, fourth] = products;

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

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {first && (
            <Reveal delay={0.05} className="lg:row-span-2">
              <ProductCard product={first} size="large" priority />
            </Reveal>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {[second, third].filter(Boolean).map((product, index) => (
              <Reveal
                key={product!.id}
                delay={0.1 + index * 0.08}
              >
                <ProductCard product={product!} />
              </Reveal>
            ))}
          </div>

          {fourth && (
            <Reveal
              delay={0.26}
              className="sm:col-start-1 lg:col-start-2"
            >
              <ProductCard product={fourth} />
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}