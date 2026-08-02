import Image from 'next/image';
import { LinkButton } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import { Reveal } from '@/components/motion/Reveal';
import { hasPublicAsset } from '@/lib/assets';
import { assetManifest } from '@/lib/assetManifest';
import { PRELAUNCH_MODE } from '@/lib/config';
import type { ProductCardData } from '@/lib/types';

// This section is pure editorial now — `featured` is kept only as an image
// fallback source (see productImage below) and so callers don't break ahead
// of the page.tsx composition pass; no commerce data is rendered from it.
export default function FirstTransmission({
  featured,
}: {
  featured: ProductCardData | null;
}) {
  const asset = assetManifest.firstTransmissionStill;
  const productImage = featured?.images[0];
  const campaignStillReady = hasPublicAsset(asset.desktopPath);

  return (
    <section className="border-t border-graphite py-16 md:py-28">
      <div className="container-lunaro grid gap-8 md:gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal
          scale={1.04}
          className="relative aspect-[4/5] w-full media-rounded bg-charcoal"
        >
          {PRELAUNCH_MODE ? (
            <>
              <CinematicPlaceholder
                variant={asset.fallback}
                className="h-full w-full"
              />

              <div className="absolute inset-0 bg-obsidian/35" />

              <div className="absolute inset-0 flex items-center justify-center px-5 md:px-6">
                <div className="border border-lunar/20 bg-obsidian/65 px-6 py-5 text-center backdrop-blur-sm md:px-7 md:py-6">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-mist">
                    Transmission Pending
                  </p>

                  <p className="mt-3 font-display text-3xl text-lunar md:text-5xl">
                    Reveal Pending
                  </p>
                </div>
              </div>
            </>
          ) : campaignStillReady ? (
            <Image
              src={`/${asset.desktopPath}`}
              alt="LUNARO Drop 001 campaign still"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover transition-transform duration-[1400ms] ease-lunar hover:scale-[1.03]"
            />
          ) : productImage ? (
            <Image
              src={productImage.url}
              alt={
                productImage.altText ??
                featured?.title ??
                'LUNARO Drop 001 campaign still'
              }
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover transition-transform duration-[1400ms] ease-lunar hover:scale-[1.03]"
            />
          ) : (
            <CinematicPlaceholder
              variant={asset.fallback}
              className="h-full w-full"
            />
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <Eyebrow>Drop 001</Eyebrow>

          <h2 className="mt-4 max-w-[360px] font-display text-[2.35rem] leading-[0.95] text-lunar sm:text-display-md">
            THE FIRST TRANSMISSION
          </h2>

          <p className="mt-5 max-w-md leading-7 text-mist">
            {PRELAUNCH_MODE
              ? 'Born from silence. Built in darkness. The signal is nearing completion.'
              : 'Born from silence. Built for movement.'}
          </p>

          {PRELAUNCH_MODE ? (
            <LinkButton
              href="/new-drop"
              variant="ghost"
              className="mt-6"
            >
              View the Transmission
            </LinkButton>
          ) : (
            <LinkButton
              href="/new-drop"
              variant="ghost"
              className="mt-8"
            >
              Discover Collection
            </LinkButton>
          )}
        </Reveal>
      </div>
    </section>
  );
}