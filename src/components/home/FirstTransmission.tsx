import Image from 'next/image';
import { LinkButton } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import { Reveal } from '@/components/motion/Reveal';
import { assetManifest } from '@/lib/assetManifest';
import { PRELAUNCH_MODE, fabricDetails, trackpantFabricDetails, trackpantFitAndCare } from '@/lib/config';
import { formatMoney } from '@/lib/utils';
import { cleanProductTitle } from '@/lib/productTitle';
import FeaturedSpotlightCTA from './FeaturedSpotlightCTA';
import type { ProductCardData } from '@/lib/types';

// Mirrors ProductAccordion.tsx / ProductOptions.tsx's own isTrackpant check
// (same product-type list) — kept local rather than imported since those two
// files are real PDP/checkout logic this task must not touch.
const TRACKPANT_PRODUCT_TYPES = ['trackpant', 'trackpants', 'sweatpant', 'sweatpants'];

function isTrackpant(productType: string): boolean {
  return TRACKPANT_PRODUCT_TYPES.includes(productType.trim().toLowerCase());
}

export default function FirstTransmission({
  featured,
}: {
  featured: ProductCardData | null;
}) {
  const asset = assetManifest.firstTransmissionStill;

  // Unreachable today — page.tsx never renders FirstTransmission while
  // PRELAUNCH_MODE is true — but every other homepage section defensively
  // self-guards on this flag too, so this stays byte-for-byte identical to
  // the prelaunch treatment that shipped before this redesign.
  if (PRELAUNCH_MODE) {
    return (
      <section className="border-t border-graphite py-16 md:py-28">
        <div className="container-lunaro grid gap-8 md:gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal
            scale={1.04}
            className="relative aspect-[4/5] w-full overflow-hidden bg-charcoal"
          >
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
          </Reveal>

          <Reveal delay={0.1}>
            <Eyebrow>Drop 001</Eyebrow>

            <h2 className="mt-4 max-w-[360px] font-display text-[2.35rem] leading-[0.95] text-lunar sm:text-display-md">
              THE FIRST TRANSMISSION
            </h2>

            <p className="mt-5 max-w-md leading-7 text-mist">
              Born from silence. Built in darkness. The signal is nearing completion.
            </p>

            <LinkButton
              href="/new-drop"
              variant="ghost"
              className="mt-6"
            >
              View the Transmission
            </LinkButton>
          </Reveal>
        </div>
      </section>
    );
  }

  // Launch mode: a compact featured-product spotlight, not a fake product —
  // page.tsx only ever passes a real, available Shopify product here (first
  // from Latest Drop, else first from Most Wanted). No real candidate means
  // no section, rather than fabricating one.
  if (!featured) return null;

  const displayTitle = cleanProductTitle(featured.title);
  const productImage = featured.images[0];

  const sellingPrice = featured.priceRange.minVariantPrice;
  const compareAtPrice = featured.compareAtPriceRange?.minVariantPrice;
  const isOnSale =
    compareAtPrice && Number(compareAtPrice.amount) > Number(sellingPrice.amount);

  const trackpant = isTrackpant(featured.productType);
  const isLimited = featured.tags.includes('limited');

  // One factual line — built from real product data (tags, product type),
  // never invented marketing copy or a per-product fabricated claim.
  const statement = trackpant
    ? isLimited
      ? 'Part of the limited Drop 001 run — a relaxed, oversized silhouette.'
      : 'A relaxed, oversized silhouette in heavyweight terry.'
    : isLimited
      ? 'Part of the limited Drop 001 run — oversized by design.'
      : 'Oversized by design, cut in premium cotton terry.';

  // Quick specs sourced from the confirmed fabric spec in lib/config.ts —
  // never shown unless true for this product's actual type. Tees get the
  // exact confirmed spec line; trackpants get the equivalent real facts
  // rather than the tee-only spec (different fabric blend and fit).
  const specs = trackpant
    ? `${trackpantFabricDetails[0].toUpperCase()} · ${trackpantFitAndCare[0].toUpperCase()}`
    : `${fabricDetails[0].toUpperCase()} · ${fabricDetails[2].toUpperCase()} · ${fabricDetails[4].toUpperCase()}`;

  return (
    <section className="border-t border-graphite py-10 md:py-16">
      <div className="container-lunaro grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-10">
        <Reveal
          scale={1.02}
          className="relative aspect-[5/4] w-full overflow-hidden bg-charcoal lg:aspect-[4/3.1]"
        >
          {productImage ? (
            <Image
              src={productImage.url}
              alt={productImage.altText ?? displayTitle}
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover transition-transform duration-[1400ms] ease-lunar hover:scale-[1.03]"
            />
          ) : (
            <CinematicPlaceholder
              variant="product"
              className="h-full w-full"
            />
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <Eyebrow>Drop 001</Eyebrow>

          <h2 className="mt-3 max-w-md font-display text-[2rem] leading-[0.95] text-lunar sm:text-4xl lg:text-[2.75rem]">
            {displayTitle}
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-6 text-mist">
            {statement}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-lg text-lunar">
              {formatMoney(sellingPrice)}
            </span>

            {isOnSale && compareAtPrice && (
              <span className="text-sm text-mist line-through">
                {formatMoney(compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-mist">
            {specs}
          </p>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <FeaturedSpotlightCTA product={featured} />

            <LinkButton
              href={`/products/${featured.handle}`}
              variant="underline"
            >
              View Details
            </LinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
