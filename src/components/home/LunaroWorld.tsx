'use client';

import { useRef } from 'react';
import { LinkButton } from '@/components/ui/Button';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import { ParallaxLayer } from '@/components/motion/ParallaxLayer';
import { Reveal } from '@/components/motion/Reveal';
import { assetManifest } from '@/lib/assetManifest';

const asset = assetManifest.lunarLoop;

export default function LunaroWorld() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-t border-graphite py-32 md:py-40">
      {/* Atmospheric backdrop — sits behind the <video>; the video fades on
          top once the real file exists at the manifest path. */}
      <ParallaxLayer targetRef={sectionRef} range={30} className="absolute inset-0">
        <CinematicPlaceholder variant={asset.fallback} className="h-full w-full opacity-70" />
      </ParallaxLayer>

      <video
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        poster={`/${asset.posterPath}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => console.log("Lunar video loaded")}
      >
        <source src={`/${asset.desktopPath}`} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-obsidian/60" />

      <Reveal className="container-lunaro relative z-10 max-w-2xl">
        <p className="eyebrow text-silver">The LUNARO World</p>
        <p className="mt-6 font-display text-3xl italic leading-snug text-editorial md:text-4xl">
          Darkness is not emptiness.
        </p>
        <p className="mt-4 font-display text-3xl italic leading-snug text-editorial md:text-4xl">
          It is the space where form, identity and ambition begin.
        </p>
        <LinkButton href="/about" variant="ghost" className="mt-10">
          Enter the World
        </LinkButton>
      </Reveal>
    </section>
  );
}
