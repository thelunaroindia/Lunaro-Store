import { SectionHeading } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/motion/Reveal';

export default function LimitedByDesign() {
  return (
    <section className="border-t border-graphite py-16 md:py-28">
      <Reveal className="container-lunaro grid gap-6 md:gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <div className="max-w-[360px] md:max-w-none">
          <SectionHeading eyebrow="Philosophy">
            LIMITED BY DESIGN
          </SectionHeading>
        </div>

        <div className="max-w-xl text-[15px] leading-7 text-mist md:text-base md:leading-8">
          <p>
            Each LUNARO release is created with restraint: focused artwork,
            deliberate production and garments designed to hold meaning beyond
            a single season.
          </p>

          <p className="mt-5 text-lunar">
            Fewer pieces. Greater intention.
          </p>
        </div>
      </Reveal>
    </section>
  );
}