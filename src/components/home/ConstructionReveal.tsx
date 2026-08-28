'use client';

import { useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  type MotionValue,
} from 'framer-motion';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import type { AssetEntry } from '@/lib/assetManifest';

type Props = {
  ready: boolean;
  garmentReady: boolean;
  desktopPath: string;
  fallbackVariant: AssetEntry['fallback'];
};

const FRONT_SRC = '/images/lunaro-front-transparent.png';
const BACK_SRC = '/images/lunaro-back-transparent.png';

// The real rib-seam crop of fabric-macro.jpg, empirically chosen (visually
// confirmed to land on the bright seam highlight, not a plain weave patch).
const RIB_MACRO_POSITION = '45% 12%';

// Real, confirmed facts only — lib/config.ts → fabricDetails (260 GSM, 100%
// Cotton, 2×1 Lycra Rib, Oversized Fit) plus the pre-existing "Built to
// Last" / "Fewer pieces. Greater intention." brand statements.
const STATIC_FACTS = [
  { value: '260 GSM', detail: 'Heavyweight structure' },
  { value: '100% Cotton', detail: 'Dense, breathable hand-feel' },
  { value: '2×1 Lycra Rib', detail: 'Built for shape retention' },
  { value: 'Oversized Fit', detail: 'Relaxed drop-shoulder proportion' },
] as const;

const EYEBROW_CLASS = 'text-[11px] uppercase tracking-[0.4em] text-mist';
const DETAIL_CLASS = 'mt-2 text-xs uppercase tracking-[0.3em] text-mist sm:text-sm';

// One custom hook, called a fixed number of times at the top level (never
// inside a loop/callback) — rules-of-hooks safe. `direct` skips the
// "recede to a dim, still-present state" step (used for the last active
// callout, which should clear straight to nothing as the section resolves
// rather than lingering dim with nothing after it).
function useCalloutMotion(
  scrollYProgress: MotionValue<number>,
  start: number,
  end: number,
  direct = false
) {
  // Both variants are always computed (fixed hook-call order/count,
  // rules-of-hooks safe) — only the returned reference is picked by
  // `direct`, never which hook runs.
  const opacityRecede = useTransform(
    scrollYProgress,
    [start - 0.03, start, end, end + 0.03, 0.85, 0.9],
    [0, 1, 1, 0.28, 0.28, 0]
  );
  const opacityDirect = useTransform(
    scrollYProgress,
    [start - 0.03, start, end, 0.9],
    [0, 1, 1, 0]
  );
  const scaleRecede = useTransform(
    scrollYProgress,
    [start - 0.03, start, end + 0.03],
    [0.94, 1, 0.94]
  );
  const scaleDirect = useTransform(scrollYProgress, [start - 0.03, start, end], [0.94, 1, 1]);

  return {
    opacity: direct ? opacityDirect : opacityRecede,
    scale: direct ? scaleDirect : scaleRecede,
  };
}

// Mobile-only phase text: unlike the desktop callouts, each phase fully
// clears (opacity 0) before the next begins — no lingering dim state, no
// overlapping windows — and moves only vertically (a small settle, never
// sideways or scaled), per the mobile redesign brief.
function useMobilePhaseText(scrollYProgress: MotionValue<number>, start: number, end: number) {
  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.02, end - 0.02, end],
    [0, 1, 1, 0]
  );
  const y = useTransform(scrollYProgress, [start, start + 0.02, end - 0.02, end], [14, 0, 0, -14]);
  return { opacity, y };
}

function ConnectorLine({
  side,
  progress,
}: {
  side: 'left' | 'right';
  progress: MotionValue<number>;
}) {
  return (
    <motion.div
      style={{ scaleX: progress, transformOrigin: side === 'left' ? 'left' : 'right' }}
      className="h-px w-10 bg-mist/50 lg:w-14"
    />
  );
}

function ConstructionSequence({ ready, garmentReady, fallbackVariant }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Spring-smoothed progress — feeds ONLY the garment rotation/scale/
  // crossfade/sweep below, never phase logic, pin state, or any text
  // timing (those all stay on raw `scrollYProgress` so copy sync and the
  // pin transition are unaffected). Raw scroll delta on a touch device is
  // noisy frame-to-frame; driving `rotateY` straight from it is what read
  // as micro-jitter/stutter on real devices. Restrained, no-bounce spring
  // (damping high relative to stiffness — critically/over-damped, so it
  // never overshoots or feels floaty) that still tracks scroll closely
  // enough not to read as delayed.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    mass: 0.4,
    restDelta: 0.0005,
  });

  // Manual "sticky" instead of CSS `position: sticky` — this site sets
  // `overflow-x: hidden` on both <html> and <body> (globals.css, sitewide
  // horizontal-scroll guard, not something this section can change), which
  // per the CSS overflow spec forces `overflow-y` to compute as `auto` on
  // both, breaking native sticky for a container this tall (confirmed by
  // direct measurement in an earlier build of this section). Deriving an
  // explicit before/during/after state from the same scrollYProgress and
  // switching position: fixed only while "during" reproduces sticky's
  // exact visual result without touching any global CSS.
  const [pin, setPin] = useState<'before' | 'during' | 'after'>('before');
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = v <= 0 ? 'before' : v >= 1 ? 'after' : 'during';
    setPin((prev) => (prev === next ? prev : next));
  });

  // Scroll-range map (fraction of total section scroll):
  // 0.00–0.12 entry · 0.12–0.30 260 GSM · 0.30–0.48 100% Cotton (front→back
  // turn) · 0.48–0.66 2×1 Lycra Rib · 0.66–0.85 Oversized Fit ·
  // 0.85–1.00 Built to Last.

  // Entry reveal: masked/scaled arrival out of darkness, plus a slight
  // settling tilt (rotateX only during this window).
  const entryOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const entryClip = useTransform(
    scrollYProgress,
    [0, 0.12],
    ['inset(18% 18% 18% 18%)', 'inset(0% 0% 0% 0%)']
  );
  const entryTiltX = useTransform(scrollYProgress, [0, 0.12], [8, 0]);

  // The turntable: one continuous rotateY across the whole sequence.
  // 0→20° idle drift through GSM, 20°→180° is the front→back turn during
  // Cotton (crossing 90° = edge-on, where the backface-hidden faces swap
  // which one is visible), holds ~180-200° through Rib/Fit, then
  // 200°→360° returns to a front-equivalent orientation for the calm
  // final frame — one direction throughout, like a real turntable, never
  // reversing.
  const rotateY = useTransform(
    smoothProgress,
    [0, 0.12, 0.3, 0.48, 0.66, 0.85, 0.95, 1],
    [0, 0, 20, 180, 190, 200, 360, 360]
  );
  const garmentScale = useTransform(
    smoothProgress,
    [0, 0.12, 0.3, 0.39, 0.48, 0.66, 0.85, 0.95, 1],
    [0.85, 1, 1, 1.12, 1.05, 1.05, 0.92, 1, 1]
  );
  const pedestalScale = useTransform(garmentScale, [0.85, 1.12], [0.85, 1.1]);

  // Which face is actually showing: computed explicitly from the same
  // scrollYProgress driving rotateY, rather than relied on CSS
  // backface-visibility alone (which proved unreliable in testing for a
  // flat, transparent-PNG "face" with no real depth) — this crossfade is
  // the true source of truth for which image is visible; the static
  // backface-visibility/rotateY(180deg) styling below is kept only as a
  // harmless defensive fallback. Timed to the exact scroll fraction where
  // rotateY crosses 90°/270° (edge-on) given the keyframes above.
  const frontFaceOpacity = useTransform(
    smoothProgress,
    [0, 0.36, 0.39, 0.89, 0.895, 1],
    [1, 1, 0, 0, 1, 1]
  );
  const backFaceOpacity = useTransform(
    smoothProgress,
    [0, 0.36, 0.39, 0.89, 0.895, 1],
    [0, 0, 1, 1, 0, 0]
  );

  // A single soft highlight sweep, appearing only at the two moments the
  // garment is edge-on to the viewer (the front→back turn, then the
  // return turn near the end) — sells "light catching the fabric as it
  // turns" rather than a flat card-flip.
  const sweepOpacity = useTransform(
    smoothProgress,
    [0.34, 0.39, 0.44, 0.86, 0.9, 0.94],
    [0, 1, 0, 0, 1, 0]
  );

  const eyebrowMotion = useCalloutMotion(scrollYProgress, 0, 0.12);
  const gsm = useCalloutMotion(scrollYProgress, 0.12, 0.3);
  const cotton = useCalloutMotion(scrollYProgress, 0.3, 0.48);
  const rib = useCalloutMotion(scrollYProgress, 0.48, 0.66);
  const fit = useCalloutMotion(scrollYProgress, 0.66, 0.85, true);

  const macroScale = useTransform(scrollYProgress, [0.45, 0.48, 0.66, 0.69], [0.1, 1, 1, 0.1]);
  const macroOpacity = useTransform(scrollYProgress, [0.45, 0.48, 0.66, 0.69], [0, 1, 1, 0]);

  const measureScale = useTransform(scrollYProgress, [0.66, 0.71, 0.85, 0.88], [0, 1, 1, 0]);
  const measureOpacity = useTransform(scrollYProgress, [0.66, 0.71, 0.85, 0.88], [0, 1, 1, 0]);

  const finalOpacity = useTransform(scrollYProgress, [0.88, 0.95, 1], [0, 1, 1]);

  // ── Mobile-only choreography ──────────────────────────────────────────
  // A dedicated, simpler sequence (not a shrunk copy of desktop) — real-
  // device testing showed the desktop left/right callout composition
  // overlapping and feeling unstable on phones. Same phase order and same
  // shared scrollYProgress/pin, but: non-overlapping phase windows, one
  // fixed text zone below the garment, a smaller rotateY/scale range, and
  // no measurement-line clutter. Mobile phase ranges (fractions of the
  // mobile-height section, which is itself shorter than desktop's):
  // 0–0.14 entry · 0.14–0.32 GSM · 0.32–0.50 Cotton · 0.50–0.68 Rib ·
  // 0.68–0.86 Fit · 0.86–1.00 Built to Last.
  const mRotateY = useTransform(
    smoothProgress,
    [0, 0.14, 0.32, 0.5, 0.68, 0.86, 0.95, 1],
    [0, 0, 15, 165, 170, 175, 355, 360]
  );
  const mScale = useTransform(
    smoothProgress,
    [0, 0.14, 0.39, 0.41, 0.43, 1],
    [0.92, 1, 1, 1.05, 1, 1]
  );
  const mFrontFaceOpacity = useTransform(
    smoothProgress,
    [0, 0.39, 0.41, 0.895, 0.915, 1],
    [1, 1, 0, 0, 1, 1]
  );
  const mBackFaceOpacity = useTransform(
    smoothProgress,
    [0, 0.39, 0.41, 0.895, 0.915, 1],
    [0, 0, 1, 1, 0, 0]
  );
  // Tighter crossfade windows than desktop (0.02 vs desktop's ~0.03/0.005)
  // so the edge-on/thin silhouette moment reads as quick, not lingering.
  const mSweepOpacity = useTransform(
    smoothProgress,
    [0.37, 0.4, 0.43, 0.885, 0.905, 0.925],
    [0, 1, 0, 0, 1, 0]
  );
  const mMacroOpacity = useTransform(scrollYProgress, [0.47, 0.5, 0.68, 0.71], [0, 1, 1, 0]);
  const mMacroScale = useTransform(scrollYProgress, [0.47, 0.5, 0.68, 0.71], [0.1, 1, 1, 0.1]);

  const mEntry = useMobilePhaseText(scrollYProgress, 0, 0.14);
  const mGsm = useMobilePhaseText(scrollYProgress, 0.14, 0.32);
  const mCotton = useMobilePhaseText(scrollYProgress, 0.32, 0.5);
  const mRib = useMobilePhaseText(scrollYProgress, 0.5, 0.68);
  const mFit = useMobilePhaseText(scrollYProgress, 0.68, 0.86);
  const mFinalOpacity = useTransform(scrollYProgress, [0.86, 0.89, 1], [0, 1, 1]);
  const mFinalY = useTransform(scrollYProgress, [0.86, 0.89], [14, 0]);

  // No `backface-visibility` here on purpose: which face shows is fully
  // decided by frontFaceOpacity/backFaceOpacity above. In testing,
  // `backface-visibility: hidden` on these images — nested one level
  // inside the opacity wrapper — unpredictably suppressed paint of the
  // face that opacity said should be visible (a real Chrome 3D-context
  // quirk with intermediate untransformed elements, not spec behavior).
  // The static rotateY(180deg) below is still required so the back
  // image's content reads right-side-up rather than mirrored once shown.
  const frontFaceStyle: CSSProperties = {};
  const backFaceStyle: CSSProperties = {
    transform: 'rotateY(180deg)',
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-[185vh] border-t border-graphite lg:h-[330vh]"
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
        {!garmentReady && (
          <CinematicPlaceholder variant={fallbackVariant} className="absolute inset-0" />
        )}

      <div className="hidden lg:block">
        {/* Top copy */}
        <motion.div
          style={{ opacity: eyebrowMotion.opacity }}
          className="absolute inset-x-0 top-14 flex flex-col items-center text-center lg:top-20"
        >
          <p className={EYEBROW_CLASS}>Construction / 001</p>
          <h2 className="mt-3 font-display text-3xl text-lunar sm:text-4xl">
            The Turntable
          </h2>
        </motion.div>

        {/* Pedestal — a soft ambient glow, never a literal disc */}
        <motion.div
          style={{ scale: pedestalScale }}
          className="absolute left-1/2 top-[68%] h-16 w-56 -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse,rgba(255,255,255,0.10),transparent_70%)] blur-md sm:top-[70%] sm:h-20 sm:w-72"
        />

        {/* Garment stage */}
        {garmentReady && (
          <div
            style={{ perspective: '1600px' }}
            className="absolute left-1/2 top-1/2 aspect-[1122/1402] h-[52vh] -translate-x-1/2 -translate-y-1/2 sm:h-[58vh] lg:h-[66vh]"
          >
            {/* Contact shadow — deliberately NOT on the rotating layer.
                An animated `filter: drop-shadow()` on an element that's
                also doing rotateY/scale every frame forces the browser to
                re-rasterize the blur on every frame instead of just
                re-compositing a transform, which is what read as stutter
                on real devices (especially iOS Safari). This is a static
                blurred shape rasterized once; only its opacity/scale
                (tied to the same entry/garment motion values, so it still
                breathes with the tee) are animated, both cheap
                compositor-only properties. */}
            <motion.div
              aria-hidden="true"
              style={{ opacity: entryOpacity, scale: garmentScale }}
              className="pointer-events-none absolute inset-x-[12%] top-[56%] h-[28%] rounded-[100%] bg-black/55 blur-2xl"
            />
            <motion.div
              style={{
                opacity: entryOpacity,
                clipPath: entryClip,
                rotateX: entryTiltX,
                rotateY,
                scale: garmentScale,
                z: 0,
                transformStyle: 'preserve-3d',
                willChange: 'transform',
              }}
              className="relative h-full w-full"
            >
              <motion.div style={{ opacity: frontFaceOpacity }} className="absolute inset-0">
                <Image
                  src={FRONT_SRC}
                  alt="LUNARO oversized tee — front"
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 70vw"
                  style={frontFaceStyle}
                  className="object-contain"
                />
              </motion.div>
              <motion.div style={{ opacity: backFaceOpacity }} className="absolute inset-0">
                <Image
                  src={BACK_SRC}
                  alt="LUNARO oversized tee — back"
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 70vw"
                  style={backFaceStyle}
                  className="object-contain"
                />
              </motion.div>
            </motion.div>

            {/* Light sweep — only visible at the two edge-on turn moments */}
            <motion.div
              style={{
                opacity: sweepOpacity,
                background:
                  'linear-gradient(100deg, transparent 42%, rgba(255,255,255,0.30) 50%, transparent 58%)',
              }}
              className="pointer-events-none absolute inset-0"
            />

            {/* Collar macro inspection window — real fabric-macro.jpg, never
                a digital zoom of the low-res garment PNG. */}
            {ready && (
              <motion.div
                style={{ opacity: macroOpacity, scale: macroScale }}
                className="pointer-events-none absolute left-[54%] top-[10%] h-28 w-28 -translate-x-1/2 overflow-hidden rounded-full border border-lunar/25 shadow-[0_0_0_6px_rgba(5,5,5,0.6)] lg:h-40 lg:w-40"
              >
                <div
                  style={{
                    backgroundImage: "url('/images/fabric-macro.jpg')",
                    backgroundSize: '250% 250%',
                    backgroundPosition: RIB_MACRO_POSITION,
                    filter: 'brightness(1.7) contrast(1.25)',
                  }}
                  className="h-full w-full"
                />
              </motion.div>
            )}

            {/* Measurement guides — Oversized Fit only, three hairlines max */}
            <motion.div
              style={{ opacity: measureOpacity }}
              className="pointer-events-none absolute inset-0"
            >
              <motion.div
                style={{ scaleX: measureScale }}
                className="absolute inset-x-[8%] top-[16%] h-px bg-mist/40"
              />
              <motion.div
                style={{ scaleX: measureScale }}
                className="absolute inset-x-[-2%] top-[34%] h-px bg-mist/30"
              />
              <motion.div
                style={{ scaleX: measureScale }}
                className="absolute inset-x-[4%] bottom-[6%] h-px bg-mist/40"
              />
            </motion.div>
          </div>
        )}

        {/* 260 GSM — left */}
        <motion.div
          style={{ opacity: gsm.opacity, scale: gsm.scale }}
          className="absolute inset-x-6 bottom-[26%] flex flex-col items-center text-center lg:inset-x-auto lg:left-10 lg:top-[38%] lg:items-start lg:text-left xl:left-20"
        >
          <p className="font-display text-2xl text-lunar sm:text-3xl">260 GSM</p>
          <p className={DETAIL_CLASS}>Heavyweight structure</p>
          <div className="mt-3 hidden lg:block">
            <ConnectorLine side="left" progress={gsm.opacity} />
          </div>
        </motion.div>

        {/* 100% Cotton — right */}
        <motion.div
          style={{ opacity: cotton.opacity, scale: cotton.scale }}
          className="absolute inset-x-6 bottom-[21%] flex flex-col items-center text-center lg:inset-x-auto lg:right-10 lg:top-[52%] lg:items-end lg:text-right xl:right-20"
        >
          <p className="font-display text-2xl text-lunar sm:text-3xl">100% Cotton</p>
          <p className={DETAIL_CLASS}>Dense, breathable hand-feel</p>
          <div className="mt-3 hidden lg:block">
            <ConnectorLine side="right" progress={cotton.opacity} />
          </div>
        </motion.div>

        {/* 2×1 Lycra Rib — left, near the macro window */}
        <motion.div
          style={{ opacity: rib.opacity, scale: rib.scale }}
          className="absolute inset-x-6 bottom-[16%] flex flex-col items-center text-center lg:inset-x-auto lg:left-10 lg:top-[16%] lg:items-start lg:text-left xl:left-20"
        >
          <p className="font-display text-2xl text-lunar sm:text-3xl">2×1 Lycra Rib</p>
          <p className={DETAIL_CLASS}>Built for shape retention</p>
        </motion.div>

        {/* Oversized Fit — right */}
        <motion.div
          style={{ opacity: fit.opacity, scale: fit.scale }}
          className="absolute inset-x-6 bottom-[11%] flex flex-col items-center text-center lg:inset-x-auto lg:right-10 lg:top-[24%] lg:items-end lg:text-right xl:right-20"
        >
          <p className="font-display text-2xl text-lunar sm:text-3xl">Oversized Fit</p>
          <p className={DETAIL_CLASS}>Relaxed drop-shoulder proportion</p>
        </motion.div>

        {/* Built to Last — calm resolution */}
        <motion.div
          style={{ opacity: finalOpacity }}
          className="absolute inset-x-0 bottom-10 flex flex-col items-center text-center lg:bottom-14"
        >
          <h3 className="font-display text-3xl text-lunar sm:text-4xl">Built to Last.</h3>
          <p className="mt-3 text-sm text-lunar">Fewer pieces. Greater intention.</p>
        </motion.div>
      </div>

        {/* ── Mobile-only tree — dedicated layout, not a shrunk desktop
            copy. The tee stays large and centered throughout; exactly one
            spec lives in a single fixed text zone below it. */}
        <div className="lg:hidden">
          {/* Entry heading — its own beat, fully clears before GSM begins */}
          <motion.div
            style={{ opacity: mEntry.opacity, y: mEntry.y }}
            className="absolute inset-x-5 top-12 flex flex-col items-center text-center"
          >
            <p className={EYEBROW_CLASS}>Construction / 001</p>
            <h2 className="mt-3 font-display text-2xl text-lunar">The Turntable</h2>
          </motion.div>

          {garmentReady && (
            <div
              style={{ perspective: '1200px' }}
              className="absolute left-1/2 top-[42%] aspect-[1122/1402] h-[36vh] -translate-x-1/2 -translate-y-1/2"
            >
              {/* Contact shadow — same reasoning as desktop: kept off the
                  rotating layer so the blur is rasterized once, not
                  recomputed every rotation frame (the costliest part on
                  mobile Safari in particular). */}
              <motion.div
                aria-hidden="true"
                style={{ opacity: entryOpacity, scale: mScale }}
                className="pointer-events-none absolute inset-x-[14%] top-[54%] h-[26%] rounded-[100%] bg-black/55 blur-xl"
              />
              <motion.div
                style={{
                  opacity: entryOpacity,
                  clipPath: entryClip,
                  rotateX: entryTiltX,
                  rotateY: mRotateY,
                  scale: mScale,
                  z: 0,
                  transformStyle: 'preserve-3d',
                  willChange: 'transform',
                }}
                className="relative h-full w-full"
              >
                <motion.div style={{ opacity: mFrontFaceOpacity }} className="absolute inset-0">
                  <Image
                    src={FRONT_SRC}
                    alt="LUNARO oversized tee — front"
                    fill
                    priority
                    sizes="70vw"
                    style={frontFaceStyle}
                    className="object-contain"
                  />
                </motion.div>
                <motion.div style={{ opacity: mBackFaceOpacity }} className="absolute inset-0">
                  <Image
                    src={BACK_SRC}
                    alt="LUNARO oversized tee — back"
                    fill
                    priority
                    sizes="70vw"
                    style={backFaceStyle}
                    className="object-contain"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                style={{
                  opacity: mSweepOpacity,
                  background:
                    'linear-gradient(100deg, transparent 42%, rgba(255,255,255,0.30) 50%, transparent 58%)',
                }}
                className="pointer-events-none absolute inset-0"
              />

              {/* Collar macro — capped size, sits above the collar with a
                  clear gap so it never collides with the fabric or the
                  fixed text zone below. */}
              {ready && (
                <motion.div
                  style={{ opacity: mMacroOpacity, scale: mMacroScale }}
                  className="pointer-events-none absolute left-1/2 top-[-14%] h-20 w-20 -translate-x-1/2 overflow-hidden rounded-full border border-lunar/25 shadow-[0_0_0_5px_rgba(5,5,5,0.6)]"
                >
                  <div
                    style={{
                      backgroundImage: "url('/images/fabric-macro.jpg')",
                      backgroundSize: '250% 250%',
                      backgroundPosition: RIB_MACRO_POSITION,
                      filter: 'brightness(1.7) contrast(1.25)',
                    }}
                    className="h-full w-full"
                  />
                </motion.div>
              )}
            </div>
          )}

          {/* Fixed safe text zone — every phase (GSM/Cotton/Rib/Fit/Last)
              renders in this exact spot via CSS Grid stacking (all children
              share one grid cell), so there is never any drift or overlap
              between phases, and the zone's height is set by whichever
              phase's content is tallest. Measurement-line guides are
              intentionally omitted on mobile — the silhouette and copy
              communicate the fit without added clutter. */}
          <div className="absolute inset-x-5 bottom-[9%] mx-auto grid max-w-[280px] justify-items-center text-center">
            <motion.div
              style={{ opacity: mGsm.opacity, y: mGsm.y }}
              className="col-start-1 row-start-1"
            >
              <p className="font-display text-2xl text-lunar">260 GSM</p>
              <p className={DETAIL_CLASS}>Heavyweight structure</p>
            </motion.div>
            <motion.div
              style={{ opacity: mCotton.opacity, y: mCotton.y }}
              className="col-start-1 row-start-1"
            >
              <p className="font-display text-2xl text-lunar">100% Cotton</p>
              <p className={DETAIL_CLASS}>Dense, breathable hand-feel</p>
            </motion.div>
            <motion.div
              style={{ opacity: mRib.opacity, y: mRib.y }}
              className="col-start-1 row-start-1"
            >
              <p className="font-display text-2xl text-lunar">2×1 Lycra Rib</p>
              <p className={DETAIL_CLASS}>Built for shape retention</p>
            </motion.div>
            <motion.div
              style={{ opacity: mFit.opacity, y: mFit.y }}
              className="col-start-1 row-start-1"
            >
              <p className="font-display text-2xl text-lunar">Oversized Fit</p>
              <p className={DETAIL_CLASS}>Relaxed drop-shoulder proportion</p>
            </motion.div>
            <motion.div
              style={{ opacity: mFinalOpacity, y: mFinalY }}
              className="col-start-1 row-start-1"
            >
              <h3 className="font-display text-2xl text-lunar">Built to Last.</h3>
              <p className="mt-2 text-sm text-lunar">Fewer pieces. Greater intention.</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Screen-reader / no-JS content parity — the choreographed stage
          above is decorative motion, aria-hidden; this carries the same
          real copy in plain reading order. */}
      <div className="sr-only">
        <h2>Construction / 001. The Turntable.</h2>
        {STATIC_FACTS.map((fact) => (
          <p key={fact.value}>
            {fact.value} — {fact.detail}
          </p>
        ))}
        <p>Built to Last. Fewer pieces. Greater intention.</p>
      </div>
    </section>
  );
}

function ConstructionStatic({ ready, garmentReady, fallbackVariant }: Props) {
  return (
    <section className="border-t border-graphite py-16 md:py-24">
      <div className="container-lunaro">
        <p className={EYEBROW_CLASS}>Construction / 001</p>
        <h2 className="mt-3 font-display text-4xl text-lunar sm:text-5xl">The Turntable</h2>

        {garmentReady ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:max-w-md">
            <div className="relative aspect-[1122/1402] w-full">
              <Image
                src={FRONT_SRC}
                alt="LUNARO oversized tee — front"
                fill
                sizes="(min-width: 640px) 224px, 45vw"
                className="object-contain"
              />
            </div>
            <div className="relative aspect-[1122/1402] w-full">
              <Image
                src={BACK_SRC}
                alt="LUNARO oversized tee — back"
                fill
                sizes="(min-width: 640px) 224px, 45vw"
                className="object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="relative mt-10 aspect-[4/3] w-full max-w-sm overflow-hidden media-rounded bg-charcoal">
            <CinematicPlaceholder variant={fallbackVariant} className="h-full w-full" />
          </div>
        )}

        {ready && (
          <div className="mt-8 flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-graphite">
              <div
                style={{
                  backgroundImage: "url('/images/fabric-macro.jpg')",
                  backgroundSize: '250% 250%',
                  backgroundPosition: RIB_MACRO_POSITION,
                  filter: 'brightness(1.7) contrast(1.25)',
                }}
                className="h-full w-full"
              />
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-mist">
              2×1 Lycra Rib — construction detail
            </p>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-6">
          {STATIC_FACTS.map((fact) => (
            <div key={fact.value} className="border-t border-graphite pt-4">
              <p className="font-display text-2xl text-lunar sm:text-3xl">{fact.value}</p>
              <p className={DETAIL_CLASS}>{fact.detail}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 font-display text-2xl text-lunar">Built to Last.</p>
        <p className="mt-2 text-sm text-lunar">Fewer pieces. Greater intention.</p>
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
