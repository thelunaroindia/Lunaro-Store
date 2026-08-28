'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { SectionHeading } from '@/components/ui/Eyebrow';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import { Reveal } from '@/components/motion/Reveal';
import type { AssetEntry } from '@/lib/assetManifest';

type ConstructionFact = {
  value: string;
  detail: string;
};

// Launch-mode "Construction" spec list. Every `value` is a real, confirmed
// fact from lib/config.ts → fabricDetails (260 GSM, 100% Cotton, 2×1 Lycra
// Rib, Oversized Fit) or the pre-existing "Built to Last" brand statement
// already used site-wide — never a fabricated claim. `detail` lines are the
// exact descriptive copy approved for this redesign; they describe the same
// facts in more premium language, not new technical claims (no stitch
// counts, wash-cycle numbers, or invented certifications).
const constructionFacts: ConstructionFact[] = [
  { value: '260 GSM', detail: 'Heavyweight structure' },
  { value: '100% COTTON', detail: 'Dense, breathable hand-feel' },
  { value: '2×1 LYCRA RIB', detail: 'Built for shape retention' },
  { value: 'OVERSIZED FIT', detail: 'Relaxed drop-shoulder proportion' },
  { value: 'BUILT TO LAST', detail: 'Reinforced for repeat wear' },
];

export default function ConstructionReveal({
  ready,
  desktopPath,
  fallbackVariant,
}: {
  ready: boolean;
  desktopPath: string;
  fallbackVariant: AssetEntry['fallback'];
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Continuous, transform-only scroll link (no layout properties touched) —
  // the image gains a subtle scale as the section scrolls through view,
  // while CSS `sticky` (not JS) keeps it pinned beside the taller spec
  // column on desktop. Disabled outright under reduced motion rather than
  // just capped, per the reduced-motion requirement.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section
      ref={sectionRef}
      className="border-t border-graphite py-16 md:py-28"
    >
      <div className="container-lunaro">
        <Reveal className="max-w-[360px] md:max-w-xl">
          <SectionHeading eyebrow="Construction">
            BUILT FROM THE FABRIC UP.
          </SectionHeading>
        </Reveal>

        <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <motion.div
              style={{ scale: prefersReducedMotion ? 1 : scrollScale }}
              className="relative aspect-square w-full overflow-hidden media-rounded bg-charcoal lg:aspect-[4/3.4]"
            >
              {ready ? (
                <Image
                  src={`/${desktopPath}`}
                  alt="LUNARO fabric construction detail"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover object-center brightness-105"
                />
              ) : (
                <CinematicPlaceholder
                  variant={fallbackVariant}
                  className="h-full w-full"
                />
              )}
            </motion.div>
          </div>

          <div className="flex flex-col gap-10 md:gap-12">
            {constructionFacts.map((fact, index) => (
              <Reveal key={fact.value} delay={index * 0.06} y={18}>
                <div className="border-t border-graphite pt-4">
                  <p className="font-display text-2xl text-lunar sm:text-3xl">
                    {fact.value}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-mist sm:text-sm">
                    {fact.detail}
                  </p>
                </div>
              </Reveal>
            ))}

            <Reveal delay={constructionFacts.length * 0.06 + 0.05}>
              <p className="text-sm text-lunar">
                Fewer pieces. Greater intention.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
