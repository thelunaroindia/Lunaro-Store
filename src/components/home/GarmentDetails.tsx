import Image from 'next/image';
import { SectionHeading } from '@/components/ui/Eyebrow';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import { Reveal } from '@/components/motion/Reveal';
import { hasPublicAsset } from '@/lib/assets';
import { assetManifest } from '@/lib/assetManifest';

type ConstructionFact = {
  value: string;
  detail: string;
};

const constructionFacts: ConstructionFact[] = [
  { value: '260 GSM', detail: 'Heavyweight cotton' },
  { value: '100% COTTON', detail: 'Soft, breathable structure' },
  { value: 'OVERSIZED FIT', detail: 'Relaxed drop-shoulder silhouette' },
  { value: 'BUILT TO LAST', detail: 'Reinforced everyday construction' },
];

export default function GarmentDetails() {
  const asset = assetManifest.fabricMacro;
  const ready = hasPublicAsset(asset.desktopPath);

  return (
    <section className="border-t border-graphite py-16 md:py-28">
      <div className="container-lunaro grid gap-8 md:gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal
          scale={1.04}
          className="relative aspect-[4/3] w-full media-rounded bg-charcoal sm:aspect-square lg:order-2 lg:aspect-square"
        >
          {ready ? (
            <Image
              src={`/${asset.desktopPath}`}
              alt="LUNARO fabric construction detail"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-center brightness-105"
            />
          ) : (
            <CinematicPlaceholder
              variant={asset.fallback}
              className="h-full w-full"
            />
          )}
        </Reveal>

        <Reveal delay={0.1} className="lg:order-1">
          <div className="max-w-[360px] md:max-w-xl">
            <SectionHeading eyebrow="Construction">
              THE CONSTRUCTION
            </SectionHeading>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 md:mt-10 md:gap-x-8 md:gap-y-8">
            {constructionFacts.map((fact) => (
              <div
                key={fact.value}
                className="border-t border-graphite pt-4"
              >
                <p className="font-display text-xl text-lunar sm:text-2xl">
                  {fact.value}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-mist sm:text-sm">
                  {fact.detail}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-lunar md:mt-10">
            Fewer pieces. Greater intention.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
