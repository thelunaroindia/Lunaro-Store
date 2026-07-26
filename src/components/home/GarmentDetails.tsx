import Image from 'next/image';
import { fabricDetails } from '@/lib/config';
import { SectionHeading } from '@/components/ui/Eyebrow';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import { Reveal } from '@/components/motion/Reveal';
import { hasPublicAsset } from '@/lib/assets';
import { assetManifest } from '@/lib/assetManifest';

export default function GarmentDetails() {
  const asset = assetManifest.fabricMacro;
  const ready = hasPublicAsset(asset.desktopPath);

  return (
    <section className="border-t border-graphite py-16 md:py-28">
      <div className="container-lunaro grid gap-8 md:gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal
          scale={1.04}
          className="relative aspect-[4/3] w-full overflow-hidden bg-charcoal sm:aspect-square lg:order-2 lg:aspect-square"
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
              GARMENTS FROM ANOTHER ORBIT
            </SectionHeading>
          </div>

          <ul className="mt-7 space-y-0 md:mt-8">
            {fabricDetails.map((detail) => (
              <li
                key={detail}
                className="border-t border-graphite py-4 text-[12px] uppercase tracking-[0.22em] text-mist md:text-sm md:tracking-wider2"
              >
                {detail}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}