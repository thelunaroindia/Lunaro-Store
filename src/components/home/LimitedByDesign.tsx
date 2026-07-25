import { SectionHeading } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/motion/Reveal';

export default function LimitedByDesign() {
  return (
    <section className="border-t border-graphite py-24 md:py-32">
      <Reveal className="container-lunaro grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading eyebrow="Philosophy">LIMITED BY DESIGN</SectionHeading>
        <div className="max-w-xl text-mist">
          <p>
            Every LUNARO drop is produced in a fixed run and never restocked — not a marketing device, but a
            slower way to make clothing: fewer garments, worn by fewer people, made with more intention.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
