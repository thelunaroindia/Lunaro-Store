'use client';

import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import clsx from 'clsx';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  type MotionValue,
} from 'framer-motion';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import type { AssetEntry } from '@/lib/assetManifest';

type Props = {
  ready: boolean;
  desktopPath: string;
  fallbackVariant: AssetEntry['fallback'];
};

// How far (as a fraction of the whole section's scroll progress) adjacent
// phases overlap so one visibly crosses through the other, instead of a
// hard cut. Kept small and constant for both breakpoints — the "no
// simultaneous cross-depth layers" simplification on mobile comes from the
// layout (centered/stacked vs. off-axis) below, not from this timing value.
const OVERLAP = 0.035;

// Real, confirmed facts only — see lib/config.ts → fabricDetails (260 GSM,
// 100% Cotton, 2×1 Lycra Rib, Oversized Fit) and the pre-existing "Built to
// Last" / "Fewer pieces. Greater intention." brand statements already used
// site-wide. `detail` lines describe those same facts, not new claims.
const STATIC_FACTS = [
  { value: '260 GSM', detail: 'Heavyweight structure', fabricPosition: '30% 20%' },
  { value: '100% Cotton', detail: 'Dense, breathable hand-feel', fabricPosition: '70% 60%' },
  { value: '2×1 Lycra Rib', detail: 'Built for shape retention', fabricPosition: '45% 12%' },
  { value: 'Oversized Fit', detail: 'Relaxed drop-shoulder proportion', fabricPosition: '15% 80%' },
  { value: 'Built to Last', detail: null, fabricPosition: '' },
] as const;

// Fabric-clipped typography: the real macro image (or, if it's ever missing,
// a plain solid fill — never a fabricated texture) becomes the glyph fill
// itself via `background-clip: text`. The only thing animated per frame is
// `scale` (a transform, GPU-compositable); `backgroundPosition` is a fixed
// per-phase crop chosen once, never animated, per the performance direction
// to avoid animating background-position on scroll.
function fabricFillStyle(ready: boolean, fabricPosition: string): CSSProperties {
  if (!ready) return {};
  return {
    backgroundImage: "url('/images/fabric-macro.jpg')",
    backgroundSize: '220% 220%',
    backgroundPosition: fabricPosition,
    WebkitTextFillColor: 'transparent',
    // The source photo is a genuinely dark charcoal/black fabric — a static
    // (not animated, so still compositor-cheap) brightness/contrast lift so
    // the weave reads clearly as texture at glyph size instead of near-black
    // on near-black. Never alters which pixels are shown, just their levels.
    filter: 'brightness(1.85) contrast(1.3)',
  };
}

function FabricGlyph({
  children,
  scale,
  fabricPosition,
  ready,
  className,
}: {
  children: ReactNode;
  scale: MotionValue<number>;
  fabricPosition: string;
  ready: boolean;
  className?: string;
}) {
  return (
    <motion.span
      style={{ scale, ...fabricFillStyle(ready, fabricPosition) }}
      className={clsx(
        'inline-block font-display leading-[0.86]',
        ready ? 'bg-clip-text text-transparent' : 'text-lunar',
        className
      )}
    >
      {children}
    </motion.span>
  );
}

// One custom hook, called a fixed number of times at the top level (never
// inside a loop/callback) — six explicit call sites below keep this fully
// rules-of-hooks safe while avoiding six copies of this boilerplate.
function usePhaseMotion(scrollYProgress: MotionValue<number>, start: number, end: number) {
  const opacity = useTransform(
    scrollYProgress,
    [start - OVERLAP, start, end, end + OVERLAP],
    [0, 1, 1, 0]
  );
  const clipPath = useTransform(
    scrollYProgress,
    [start - OVERLAP, start, end, end + OVERLAP],
    [
      'inset(0% 0% 0% 100%)',
      'inset(0% 0% 0% 0%)',
      'inset(0% 0% 0% 0%)',
      'inset(0% 100% 0% 0%)',
    ]
  );
  const x = useTransform(
    scrollYProgress,
    [start - OVERLAP, start, end, end + OVERLAP],
    [48, 0, 0, -48]
  );
  const scale = useTransform(scrollYProgress, [start, end], [1, 1.05]);
  return { opacity, clipPath, x, scale };
}

const EYEBROW_CLASS = 'text-[11px] uppercase tracking-[0.4em] text-mist';
const DETAIL_CLASS = 'mt-6 text-xs uppercase tracking-[0.3em] text-mist sm:text-sm';

function ConstructionSequence({ ready, fallbackVariant }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Manual "sticky" instead of CSS `position: sticky`: this site sets
  // `overflow-x: hidden` on both <html> and <body> (globals.css, sitewide
  // horizontal-scroll guard, not something this section can change) — per
  // the CSS overflow spec that forces `overflow-y` to compute as `auto` on
  // both, which breaks native sticky for a container this tall (confirmed
  // by direct measurement: the sticky child never actually pins, it just
  // scrolls normally). Deriving an explicit before/during/after state from
  // the same scrollYProgress and switching position: fixed only while
  // "during" reproduces sticky's exact visual result without touching any
  // global CSS.
  const [pin, setPin] = useState<'before' | 'during' | 'after'>('before');
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = v <= 0 ? 'before' : v >= 1 ? 'after' : 'during';
    // Functional form so the setState call itself is a no-op (same
    // reference in, same reference out) on every scroll frame except the
    // two that actually cross a boundary — not just relying on React's
    // own bail-out, an explicit guarantee against per-frame re-renders.
    setPin((prev) => (prev === next ? prev : next));
  });

  // Scroll-range map (fraction of total section scroll):
  // 0.00–0.14 intro · 0.14–0.32 260 GSM · 0.32–0.50 100% Cotton ·
  // 0.50–0.68 2×1 Lycra Rib · 0.68–0.85 Oversized Fit · 0.85–1.00 Built to Last.
  const intro = usePhaseMotion(scrollYProgress, 0, 0.14);
  const gsm = usePhaseMotion(scrollYProgress, 0.14, 0.32);
  const cotton = usePhaseMotion(scrollYProgress, 0.32, 0.5);
  const rib = usePhaseMotion(scrollYProgress, 0.5, 0.68);
  const fit = usePhaseMotion(scrollYProgress, 0.68, 0.85);
  const last = usePhaseMotion(scrollYProgress, 0.85, 1);

  // Restrained single scan-line, active only through the rib/seam phase.
  const scanTop = useTransform(scrollYProgress, [0.5, 0.68], ['0%', '100%']);
  const scanOpacity = useTransform(
    scrollYProgress,
    [0.5 - OVERLAP, 0.5, 0.68, 0.68 + OVERLAP],
    [0, 1, 1, 0]
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-[380vh] border-t border-graphite lg:h-[560vh]"
    >
      <div
        aria-hidden="true"
        className={clsx(
          'left-0 right-0 h-screen w-full overflow-hidden bg-obsidian',
          pin === 'during' && 'fixed top-0',
          pin === 'before' && 'absolute top-0',
          pin === 'after' && 'absolute bottom-0'
        )}
      >
        {!ready && (
          <CinematicPlaceholder variant={fallbackVariant} className="absolute inset-0" />
        )}

        {/* Intro */}
        <motion.div
          style={{ opacity: intro.opacity, clipPath: intro.clipPath, x: intro.x }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center lg:items-start lg:px-20 lg:text-left"
        >
          <p className={EYEBROW_CLASS}>Construction / 001</p>
          <h2 className="mt-5 max-w-3xl font-display text-4xl leading-[0.95] text-lunar sm:text-6xl lg:text-7xl">
            Built from the fabric up.
          </h2>
        </motion.div>

        {/* Phase 01 — 260 GSM */}
        <motion.div
          style={{ opacity: gsm.opacity, clipPath: gsm.clipPath, x: gsm.x }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center lg:items-start lg:px-20 lg:text-left"
        >
          <span className={EYEBROW_CLASS}>01</span>
          <FabricGlyph
            scale={gsm.scale}
            fabricPosition="30% 20%"
            ready={ready}
            className="mt-2 text-[4.5rem] sm:text-[7rem] lg:text-[11rem]"
          >
            260
          </FabricGlyph>
          <FabricGlyph
            scale={gsm.scale}
            fabricPosition="30% 20%"
            ready={ready}
            className="text-[2.75rem] sm:text-[4.5rem] lg:text-[7rem]"
          >
            GSM
          </FabricGlyph>
          <p className={DETAIL_CLASS}>Heavyweight structure</p>
        </motion.div>

        {/* Phase 02 — 100% Cotton */}
        <motion.div
          style={{ opacity: cotton.opacity, clipPath: cotton.clipPath, x: cotton.x }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center lg:items-end lg:px-20 lg:text-right"
        >
          <span className={EYEBROW_CLASS}>02</span>
          <FabricGlyph
            scale={cotton.scale}
            fabricPosition="70% 60%"
            ready={ready}
            className="mt-2 text-[3.75rem] sm:text-[6rem] lg:text-[9rem]"
          >
            100%
          </FabricGlyph>
          <FabricGlyph
            scale={cotton.scale}
            fabricPosition="70% 60%"
            ready={ready}
            className="text-[3.25rem] sm:text-[5rem] lg:text-[7.5rem]"
          >
            COTTON
          </FabricGlyph>
          <p className={DETAIL_CLASS}>Dense, breathable hand-feel</p>
        </motion.div>

        {/* Phase 03 — 2×1 Lycra Rib (technical / scan) */}
        <motion.div
          style={{ opacity: rib.opacity, clipPath: rib.clipPath, x: rib.x }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center lg:items-start lg:px-20 lg:text-left"
        >
          <span className={EYEBROW_CLASS}>03</span>
          <FabricGlyph
            scale={rib.scale}
            fabricPosition="45% 12%"
            ready={ready}
            className="mt-2 text-[3.75rem] sm:text-[5.5rem] lg:text-[8.5rem]"
          >
            2×1
          </FabricGlyph>
          <FabricGlyph
            scale={rib.scale}
            fabricPosition="45% 12%"
            ready={ready}
            className="text-[2.5rem] sm:text-[4rem] lg:text-[6.5rem]"
          >
            LYCRA RIB
          </FabricGlyph>
          <p className={DETAIL_CLASS}>Built for shape retention</p>
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={{ top: scanTop, opacity: scanOpacity }}
          className="pointer-events-none absolute inset-x-10 h-px bg-lunar/30 lg:inset-x-20 lg:bg-lunar/50"
        />

        {/* Phase 04 — Oversized Fit (architectural / spatial) */}
        <motion.div
          style={{ opacity: fit.opacity, clipPath: fit.clipPath, x: fit.x }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center lg:block lg:px-20"
        >
          <div className="lg:absolute lg:right-20 lg:top-20 lg:text-right">
            <span className={EYEBROW_CLASS}>04</span>
            <FabricGlyph
              scale={fit.scale}
              fabricPosition="15% 80%"
              ready={ready}
              className="mt-2 block text-[2.75rem] sm:text-[4rem] lg:text-[5.5rem]"
            >
              OVERSIZED
            </FabricGlyph>
          </div>
          <div className="lg:absolute lg:bottom-20 lg:left-20">
            <FabricGlyph
              scale={fit.scale}
              fabricPosition="15% 80%"
              ready={ready}
              className="text-[4.5rem] sm:text-[6.5rem] lg:text-[12rem]"
            >
              FIT
            </FabricGlyph>
            <p className={clsx(DETAIL_CLASS, 'lg:mt-4')}>
              Relaxed drop-shoulder proportion
            </p>
          </div>
        </motion.div>

        {/* Phase 05 — Built to Last (calm resolution, no fabric fill) */}
        <motion.div
          style={{ opacity: last.opacity, clipPath: last.clipPath, x: last.x }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <span className={EYEBROW_CLASS}>05</span>
          <h3 className="mt-5 font-display text-[3rem] leading-[0.92] text-lunar sm:text-[4.5rem] lg:text-[6.5rem]">
            Built
            <br />
            to
            <br />
            Last.
          </h3>
          <p className="mt-8 text-sm text-lunar">Fewer pieces. Greater intention.</p>
        </motion.div>
      </div>

      {/* Screen-reader / no-JS content parity — the choreographed stage above
          is decorative motion, aria-hidden; this carries the same real
          copy in plain reading order so nothing is lost outside the visual
          experience. */}
      <div className="sr-only">
        <h2>Construction / 001. Built from the fabric up.</h2>
        {STATIC_FACTS.map((fact) => (
          <p key={fact.value}>
            {fact.value}
            {fact.detail ? ` — ${fact.detail}` : '.'}
          </p>
        ))}
        <p>Fewer pieces. Greater intention.</p>
      </div>
    </section>
  );
}

function ConstructionStatic({ ready, fallbackVariant }: Props) {
  return (
    <section className="border-t border-graphite py-16 md:py-24">
      <div className="container-lunaro">
        <p className={EYEBROW_CLASS}>Construction / 001</p>
        <h2 className="mt-5 max-w-2xl font-display text-4xl leading-[0.95] text-lunar sm:text-5xl">
          Built from the fabric up.
        </h2>

        {!ready && (
          <div className="relative mt-10 aspect-[4/3] w-full max-w-sm overflow-hidden media-rounded bg-charcoal">
            <CinematicPlaceholder variant={fallbackVariant} className="h-full w-full" />
          </div>
        )}

        <div className="mt-10 flex flex-col gap-8">
          {STATIC_FACTS.map((fact) => (
            <div key={fact.value} className="border-t border-graphite pt-4">
              <p
                style={fabricFillStyle(ready, fact.fabricPosition)}
                className={clsx(
                  'font-display text-3xl leading-[0.92] sm:text-4xl',
                  ready ? 'bg-clip-text text-transparent' : 'text-lunar'
                )}
              >
                {fact.value}
              </p>
              {fact.detail && (
                <p className="mt-1.5 text-xs uppercase tracking-[0.3em] text-mist sm:text-sm">
                  {fact.detail}
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-lunar">Fewer pieces. Greater intention.</p>
      </div>
    </section>
  );
}

export default function ConstructionReveal(props: Props) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <ConstructionStatic {...props} />;
  }

  return <ConstructionSequence {...props} />;
}
