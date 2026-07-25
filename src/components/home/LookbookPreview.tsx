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

const prelaunchLooks = [
  {
    number: '01',
    title: 'ORBIT',
    status: 'Transmission Pending',
  },
  {
    number: '02',
    title: 'ECLIPSE',
    status: 'Transmission Pending',
  },
  {
    number: '03',
    title: 'VOID',
    status: 'Future Transmission',
  },
];

export default function LookbookPreview() {
  return (
    <section className="border-t border-graphite py-24 md:py-32">
      <div className="container-lunaro">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Editorial">
            THE LOOKBOOK
          </SectionHeading>

          <LinkButton href="/lookbook" variant="underline">
            {PRELAUNCH_MODE ? 'Enter Lookbook' : 'View Lookbook'}
          </LinkButton>
        </Reveal>

        {PRELAUNCH_MODE ? (
          <>
            <Reveal
              scale={1.03}
              className="relative mt-10 h-[55vh] min-h-[420px] overflow-hidden bg-charcoal md:h-[70vh]"
            >
              <CinematicPlaceholder
                variant="lookbook"
                className="h-full w-full"
              />

              <div className="absolute inset-0 bg-obsidian/45" />

              <div className="absolute inset-0 flex items-center justify-center px-6">
                <div className="border border-lunar/20 bg-obsidian/65 px-8 py-6 text-center backdrop-blur-sm md:px-12 md:py-8">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-mist">
                    Editorial Transmission
                  </p>

                  <h3 className="mt-3 font-display text-4xl text-lunar md:text-6xl">
                    THE LOOKS REMAIN CONCEALED
                  </h3>

                  <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-mist">
                    The first visual chapter will be revealed when the signal
                    is complete.
                  </p>

                  <LinkButton
                    href="/lookbook"
                    variant="ghost"
                    className="mt-7"
                  >
                    Enter Lookbook
                  </LinkButton>
                </div>
              </div>
            </Reveal>

            <div className="mt-14 grid gap-px border border-graphite bg-graphite sm:grid-cols-3">
              {prelaunchLooks.map((look, index) => (
                <Reveal
                  key={look.number}
                  delay={index * 0.1}
                  className="h-full"
                >
                  <article
                    className={`relative flex aspect-[3/4] h-full flex-col justify-between overflow-hidden bg-obsidian p-6 ${
                      index === 1 ? 'sm:translate-y-10' : ''
                    }`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045),transparent_60%)]" />

                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-charcoal/80 to-transparent" />

                    <div className="relative z-10">
                      <p className="eyebrow text-silver">
                        {look.number}
                      </p>

                      <p className="mt-3 text-[10px] uppercase tracking-[0.35em] text-mist">
                        {look.status}
                      </p>
                    </div>

                    <div className="relative z-10">
                      <p className="text-xs uppercase tracking-wider2 text-silver">
                        LOOK {look.number}
                      </p>

                      <h3 className="mt-3 font-display text-4xl text-lunar">
                        {look.title}
                      </h3>

                      <p className="mt-4 text-xs uppercase tracking-wider2 text-mist">
                        Reveal Pending
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </>
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
                    Current Orbit
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

            <div className="mt-14 grid gap-6 sm:grid-cols-3">
              {assetManifest.lookbookPreview.map((asset, index) => {
                const ready = hasPublicAsset(asset.desktopPath);

                return (
                  <Reveal
                    key={asset.desktopPath}
                    delay={index * 0.1}
                    scale={1.05}
                    className={`group relative aspect-[3/4] overflow-hidden bg-charcoal ${
                      index === 1 ? 'sm:mt-10' : ''
                    }`}
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
                          sizes="(min-width: 640px) 33vw, 100vw"
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
                  </Reveal>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}