import Image from 'next/image';
import { SectionHeading } from '@/components/ui/Eyebrow';
import { LinkButton } from '@/components/ui/Button';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import { Reveal } from '@/components/motion/Reveal';
import { hasPublicAsset } from '@/lib/assets';
import { assetManifest } from '@/lib/assetManifest';
import { PRELAUNCH_MODE } from '@/lib/config';

const liveCaptions = [
  'LOOK 01 — ARRIVAL',
  'LOOK 02 — PRESENCE',
  'LOOK 03 — QUIET WEIGHT',
];

export default function LookbookPreview() {
  return (
    <section className="border-t border-graphite py-16 md:py-28">
      <div className="container-lunaro">
        <Reveal className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between md:gap-6">
          <SectionHeading eyebrow="Editorial">
            THE LOOKBOOK
          </SectionHeading>

          <LinkButton
  href="/lookbook"
  variant="underline"
  className="self-start"
>
            {PRELAUNCH_MODE ? 'Enter Lookbook' : 'View Lookbook'}
          </LinkButton>
        </Reveal>

        {PRELAUNCH_MODE ? (
          <Reveal
            scale={1.03}
            className="relative mt-10 aspect-[4/5] max-h-[560px] media-rounded bg-charcoal md:mt-14 md:aspect-[16/9] md:max-h-none"
          >
            <CinematicPlaceholder
              variant="lookbook"
              className="h-full w-full"
            />

            {/* Partial reveal — real approved LUNARO editorial photography,
                a cropped garment/moody-detail frame distinct from the Look
                01/02 cards (new-drop.jpg / graphic-tees.jpg) and the New
                Drop/Graphic Tees tiles below, so no source image repeats
                across homepage sections. Sits a level clearer than the Look
                01/02 cards (this is the "partial editorial reveal" step of
                the homepage's reveal hierarchy, between the Look cards'
                silhouette-only treatment and the fully clear New Drop
                image), but still short of a full, sharp reveal. */}
            <Image
              src="/images/lookbook/quiet-weight.png"
              alt=""
              aria-hidden="true"
              fill
              sizes="100vw"
              style={{
                objectPosition: '50% 30%',
                filter: 'blur(2px) brightness(1.3)',
                opacity: 0.85,
              }}
              className="object-cover scale-105"
            />

            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
              <p className="text-[10px] uppercase tracking-[0.35em] text-mist">
                Drop 001 / Editorial 001
              </p>

              <LinkButton
                href="/lookbook"
                variant="ghost"
                className="mt-5 w-fit"
              >
                Enter Lookbook →
              </LinkButton>
            </div>
          </Reveal>
        ) : (
          <>
            <div className="relative mt-10 h-[55vh] min-h-[420px] overflow-hidden bg-black md:h-[70vh]">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source
                  src="/videos/collections-loop.mp4"
                  type="video/mp4"
                />
              </video>

              <div className="absolute inset-0 bg-black/35" />

              <div className="absolute inset-0 flex items-end p-6 md:p-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Current Edition
                  </p>

                  <h3 className="mt-3 font-display text-4xl text-white md:text-6xl">
                    DROP 001
                  </h3>

                  <LinkButton
                    href="/collections"
                    variant="ghost"
                    className="mt-6"
                  >
                    Explore Collections
                  </LinkButton>
                </div>
              </div>
            </div>

            <div className="mt-14 flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {assetManifest.lookbookPreview.map((asset, index) => {
                const ready = hasPublicAsset(asset.desktopPath);

                return (
                  <div
                    key={asset.desktopPath}
                    className="group relative aspect-[3/4] w-[82vw] shrink-0 snap-start media-rounded bg-charcoal sm:w-[46vw] lg:w-[28vw] lg:max-w-[420px]"
                  >
                    <div className="h-full w-full transition-transform duration-[1200ms] ease-lunar group-hover:scale-[1.04]">
                      {ready ? (
                        <Image
                          src={`/${asset.desktopPath}`}
                          alt={
                            liveCaptions[index] ??
                            'LUNARO lookbook'
                          }
                          fill
                          sizes="(min-width: 1024px) 28vw, (min-width: 640px) 46vw, 82vw"
                          className="object-cover"
                        />
                      ) : (
                        <CinematicPlaceholder
                          variant="lookbook"
                          className="h-full w-full"
                        />
                      )}
                    </div>

                    <p className="absolute bottom-3 left-3 text-xs uppercase tracking-wider2 text-lunar">
                      {liveCaptions[index]}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}