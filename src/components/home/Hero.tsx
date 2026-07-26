'use client';

import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LinkButton } from '@/components/ui/Button';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import { ParallaxLayer } from '@/components/motion/ParallaxLayer';
import { brandLines, PRELAUNCH_MODE } from '@/lib/config';
import { assetManifest } from '@/lib/assetManifest';

const asset = assetManifest.heroFilm;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** One masked line of the headline — clips to its own height so the text rises into view rather than fading in place. */
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
  if (reduced) return <div className={className}>{children}</div>;
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
  const prefersReducedMotion = useReducedMotion();
  const [desktopVideoReady, setDesktopVideoReady] = useState(false);
  const [mobileVideoReady, setMobileVideoReady] = useState(false);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[100svh] min-h-[640px] w-full items-end overflow-hidden bg-obsidian"
    >
      {/* Atmospheric backdrop — sits beneath the <video> elements at all
          times; once a real file exists at the manifest path it fades in
          on top automatically (see assetManifest.heroFilm) and this
          backdrop is simply never seen. Its own slow parallax layer keeps
          the depth cue even before real footage lands. */}
      <ParallaxLayer targetRef={sectionRef} range={50} className="absolute inset-0">
        <CinematicPlaceholder variant={asset.fallback} className="h-full w-full" />
      </ParallaxLayer>

     <video
  className="absolute inset-0 block h-full w-full object-cover"
  poster={`/${asset.posterPath}`}
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
>
  <source src={`/${asset.desktopPath}`} type="video/mp4" />
</video>
      <video
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 md:hidden ${
          mobileVideoReady ? 'opacity-100' : 'opacity-0'
        }`}
        poster="/images/hero-poster-mobile.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        onLoadedData={() => setMobileVideoReady(true)}
      >
        <source src={`/${asset.mobilePath}`} type="video/mp4" />
      </video>

      <ParallaxLayer targetRef={sectionRef} range={-25} className="absolute inset-0">
        <div className="h-full w-full bg-gradient-to-t from-obsidian via-obsidian/25 to-transparent" />
      </ParallaxLayer>

      <div className="container-lunaro relative z-10 pb-20 pt-40 md:pb-28">
        <RevealLine delay={0.1} reduced={!!prefersReducedMotion} className="eyebrow text-silver">
        {PRELAUNCH_MODE ? 'DROP 001 — IN TRANSMISSION' : 'DROP 001 — NOW LIVE'}
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
        <RevealLine
          delay={0.52}
          reduced={!!prefersReducedMotion}
          className="mt-6 max-w-md text-sm text-mist md:text-base"
        >
          {PRELAUNCH_MODE
  ? 'The first transmission is taking shape in darkness.'
  : 'A new uniform for those drawn to the unknown.'}
        </RevealLine>

        <motion.div
          className="mt-10 flex flex-wrap gap-4"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
        >
  <LinkButton
    href={PRELAUNCH_MODE ? '/about' : '/collections/drop-001'}
    variant="ghost"
  >
    {PRELAUNCH_MODE ? 'Enter the World' : 'Explore the Drop'}
  </LinkButton>
        </motion.div>
      </div>
    </section>
  );
}
