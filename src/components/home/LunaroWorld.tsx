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
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-graphite py-20 md:py-36"
    >
      <ParallaxLayer
        targetRef={sectionRef}
        range={30}
        className="absolute inset-0"
      >
        <CinematicPlaceholder
          variant={asset.fallback}
          className="h-full w-full opacity-70"
        />
      </ParallaxLayer>

      <video
        className="absolute inset-0 h-full w-full object-cover opacity-35"
        poster={`/${asset.posterPath}`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={`/${asset.desktopPath}`} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-r from-obsidian/95 via-obsidian/75 to-obsidian/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/65 via-transparent to-obsidian/35" />

      <Reveal className="container-lunaro relative z-10">
        <div className="max-w-[390px] md:max-w-2xl">
          <p className="eyebrow text-silver">
            The LUNARO World
          </p>

          <p className="mt-6 font-display text-[2rem] italic leading-[1.12] text-editorial sm:text-4xl md:text-[2.75rem]">
            Darkness is not emptiness.
          </p>

          <p className="mt-4 font-display text-[2rem] italic leading-[1.12] text-editorial sm:text-4xl md:text-[2.75rem]">
            It is where form, identity and ambition begin.
          </p>

          <LinkButton
            href="/about"
            variant="ghost"
            className="mt-8 md:mt-10"
          >
            Enter the World
          </LinkButton>
        </div>
      </Reveal>
    </section>
  );
}