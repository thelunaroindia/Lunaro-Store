import Image from 'next/image';
import { LinkButton } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import { Reveal } from '@/components/motion/Reveal';
import { hasPublicAsset } from '@/lib/assets';
import { assetManifest } from '@/lib/assetManifest';
import { placeholderProducts, PRELAUNCH_MODE } from '@/lib/config';
import { formatMoney } from '@/lib/utils';
import type { ProductCardData } from '@/lib/types';

export default function FirstTransmission({
  featured,
}: {
  featured: ProductCardData | null;
}) {
  const asset = assetManifest.firstTransmissionStill;
  const fallback = placeholderProducts[0];
  const productImage = featured?.images[0];

  const title = featured?.title ?? fallback.title;

  const price = featured
    ? formatMoney(featured.priceRange.minVariantPrice)
    : `₹${fallback.price}`;

  const href = featured
    ? `/products/${featured.handle}`
    : `/products/${fallback.handle}`;

  const campaignStillReady = hasPublicAsset(asset.desktopPath);

  return (
    <section className="border-t border-graphite py-24 md:py-32">
      <div className="container-lunaro grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal
          scale={1.04}
          className="relative aspect-[4/5] w-full overflow-hidden bg-charcoal"
        >
          {PRELAUNCH_MODE ? (
            <>
              <CinematicPlaceholder
                variant={asset.fallback}
                className="h-full w-full"
              />

              <div className="absolute inset-0 bg-obsidian/35" />

              <div className="absolute inset-0 flex items-center justify-center px-6">
                <div className="border border-lunar/20 bg-obsidian/65 px-7 py-6 text-center backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-mist">
                    Garments Concealed
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
              alt={productImage.altText ?? title}
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

          <h2 className="mt-4 font-display text-display-md text-lunar">
            THE FIRST TRANSMISSION
          </h2>

          <p className="mt-5 max-w-md text-mist">
            {PRELAUNCH_MODE
              ? 'Born from silence. Built in darkness. Revealed only when the signal is complete.'
              : 'Born from silence. Built for movement.'}
          </p>

          {PRELAUNCH_MODE ? (
            <>
              <div className="mt-10 max-w-sm border-t border-graphite pt-6">
                <p className="text-eyebrow uppercase tracking-wider2 text-silver">
                  GARMENTS CONCEALED
                </p>

                <p className="mt-3 font-display text-3xl text-lunar">
                  REVEAL PENDING
                </p>

                <p className="mt-4 text-sm leading-7 text-mist">
                  The first silhouettes remain out of sight while the
                  transmission is being completed.
                </p>
              </div>

              <LinkButton href="/new-drop" variant="ghost" className="mt-8">
                Enter the Transmission
              </LinkButton>
            </>
          ) : (
            <>
              <div className="mt-10 flex max-w-sm items-center justify-between border-t border-graphite pt-6">
                <div>
                  <p className="text-sm text-lunar">{title}</p>
                  <p className="mt-1 text-sm text-mist">{price}</p>
                </div>

                <LinkButton href={href} variant="underline">
                  View
                </LinkButton>
              </div>

              <LinkButton href="/new-drop" variant="ghost" className="mt-8">
                Discover Collection
              </LinkButton>
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}