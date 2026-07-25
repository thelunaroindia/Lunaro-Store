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
    <section className="border-t border-graphite py-24 md:py-32">
      <div className="container-lunaro grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal
  scale={1.04}
  className="relative aspect-square min-h-[500px] w-full overflow-hidden bg-charcoal lg:order-2"
>
          {ready ? (
            <Image
              src={`/${asset.desktopPath}`}
              alt="LUNARO fabric construction detail"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-center brightness-110"
            />
          ) : (
            <CinematicPlaceholder variant={asset.fallback} className="h-full w-full" />
          )}
        </Reveal>

        <Reveal delay={0.1} className="lg:order-1">
          <SectionHeading eyebrow="Construction">GARMENTS FROM ANOTHER ORBIT</SectionHeading>
          <ul className="mt-8 space-y-4">
            {fabricDetails.map((detail) => (
              <li key={detail} className="border-t border-graphite pt-4 text-sm uppercase tracking-wider2 text-mist">
                {detail}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
