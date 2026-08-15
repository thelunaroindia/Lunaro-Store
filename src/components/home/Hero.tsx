'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { LinkButton } from '@/components/ui/Button';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import { ParallaxLayer } from '@/components/motion/ParallaxLayer';
import { brandLines, PRELAUNCH_MODE, DROP_DATE } from '@/lib/config';
import { assetManifest } from '@/lib/assetManifest';

const asset = assetManifest.heroFilm;

// Renders nothing until DROP_DATE (src/lib/config.ts) is actually set —
// no placeholder or invented date ships in the meantime.
const dropDateLabel = DROP_DATE
  ? new Date(DROP_DATE).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  : null;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function RevealLine({
  children,
  delay,
  className,
  reduced,
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
  reduced: boolean;
}) {
  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className="overflow-hidden">
      <motion.div
        className={className}
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 1.1, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [desktopVideoReady, setDesktopVideoReady] = useState(false);

  // If loadeddata/canplay already fired before hydration attached this
  // handler, readyState reflects it — check it directly on mount instead
  // of waiting for an event that already happened.
  useEffect(() => {
    const desktopEl = desktopVideoRef.current;
    if (desktopEl && desktopEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setDesktopVideoReady(true);
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[100svh] min-h-[640px] w-full items-end overflow-hidden bg-obsidian"
    >
      <ParallaxLayer
        targetRef={sectionRef}
        range={50}
        className="pointer-events-none absolute inset-0"
      >
        <CinematicPlaceholder
          variant={asset.fallback}
          className="h-full w-full"
        />
      </ParallaxLayer>

      <video
        ref={desktopVideoRef}
        className={`pointer-events-none absolute inset-0 hidden h-full w-full object-cover transition-opacity duration-1000 md:block ${
          desktopVideoReady ? 'opacity-100' : 'opacity-0'
        }`}
        poster={`/${asset.posterPath}`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => setDesktopVideoReady(true)}
        onCanPlay={() => setDesktopVideoReady(true)}
        onPlaying={() => setDesktopVideoReady(true)}
        onError={() => {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Hero desktop video failed to load; showing placeholder.');
          }
        }}
      >
        <source src={`/${asset.desktopPath}`} type="video/mp4" />
      </video>

      {/* Mobile: a static poster rather than the video. No dedicated
          mobile-compressed cut of the hero film exists yet — the manifest's
          mobilePath currently just points back at the desktop file, so
          playing it here would mean autoplaying the full desktop-quality
          video over mobile data. The poster is real footage from the same
          shoot, just a still frame, and next/image serves it responsively. */}
      <Image
        src={`/${asset.posterPath}`}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="pointer-events-none absolute inset-0 object-cover object-[35%_50%] md:hidden"
      />

      <ParallaxLayer
        targetRef={sectionRef}
        range={-25}
        className="pointer-events-none absolute inset-0"
      >
        <div className="h-full w-full bg-gradient-to-t from-obsidian via-obsidian/25 to-transparent" />
      </ParallaxLayer>

      <div className="container-lunaro relative z-20 pb-24 pt-40 md:pb-28">
        <RevealLine
          delay={0.1}
          reduced={!!prefersReducedMotion}
          className="eyebrow text-silver"
        >
          {PRELAUNCH_MODE
            ? 'DROP 001 — IN TRANSMISSION'
            : 'DROP 001 — NOW LIVE'}
        </RevealLine>

        <RevealLine
          delay={0.22}
          reduced={!!prefersReducedMotion}
          className="mt-5 max-w-3xl font-display text-display-xl text-lunar"
        >
          LUNARO
        </RevealLine>

        <RevealLine
          delay={0.4}
          reduced={!!prefersReducedMotion}
          className="mt-3 font-display text-2xl italic text-editorial md:text-3xl"
        >
          {brandLines.primary}
        </RevealLine>

        {/* Live mode only — in prelaunch, this line just restated the
            eyebrow + "First Drop Incoming" below, so it's dropped entirely
            there rather than saying the same thing a third time. */}
        {!PRELAUNCH_MODE && (
          <RevealLine
            delay={0.52}
            reduced={!!prefersReducedMotion}
            className="mt-6 max-w-md text-sm text-mist md:text-base"
          >
            A new uniform for those drawn to the unknown.
          </RevealLine>
        )}

        {PRELAUNCH_MODE && (
          <RevealLine
            delay={0.52}
            reduced={!!prefersReducedMotion}
            className="mt-6 text-[11px] uppercase tracking-[0.3em] text-silver/80"
          >
            {dropDateLabel ? (
              <>
                First Drop Incoming — arrives{' '}
                <span className="text-lunar">{dropDateLabel}</span>
              </>
            ) : (
              'First Drop Incoming.'
            )}
          </RevealLine>
        )}

        <motion.div
          className="relative z-30 mt-10 flex flex-wrap gap-4"
          initial={
            prefersReducedMotion ? undefined : { opacity: 0, y: 16 }
          }
          animate={
            prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
        >
          <LinkButton
            href={PRELAUNCH_MODE ? '#early-access' : '/shop'}
            variant="ghost"
          >
            {PRELAUNCH_MODE ? 'Get Early Access' : 'Shop the Drop'}
          </LinkButton>
        </motion.div>
      </div>
    </section>
  );
}