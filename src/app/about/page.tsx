import type { Metadata } from 'next';
import Image from 'next/image';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import { hasPublicAsset } from '@/lib/assets';
import { assetManifest } from '@/lib/assetManifest';
import { canonicalUrl } from '@/lib/canonical';

export const metadata: Metadata = {
  title: 'About',
  description: 'The LUNARO story, philosophy and design language.',
  alternates: { canonical: canonicalUrl('/about') },
};

export default function AboutPage() {
  const asset = assetManifest.aboutManifesto;
  const manifestoImageReady = hasPublicAsset(asset.desktopPath);

  return (
    <div className="pb-24 pt-32 md:pt-40">
      <div className="container-lunaro max-w-4xl">
        <p className="eyebrow text-silver">Origin</p>

        <h1 className="mt-5 font-display text-display-lg text-lunar">
          LUNARO is for those who were never meant to remain where they began.
        </h1>
      </div>

      <div className="container-lunaro mt-16 grid gap-16 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden bg-charcoal">
          {manifestoImageReady ? (
            <Image
              src={`/${asset.desktopPath}`}
              alt="LUNARO manifesto campaign still"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          ) : (
            <CinematicPlaceholder
              variant={asset.fallback}
              className="h-full w-full"
            />
          )}
        </div>

        <div className="space-y-10">
          <section>
            <p className="eyebrow text-mist">Philosophy</p>

            <p className="mt-3 text-mist">
              LUNARO exists in the space between the familiar and the unknown.
              We create for those drawn to silence, distance and the possibility
              of becoming something more.
            </p>
          </section>

          <section>
            <p className="eyebrow text-mist">Design Language</p>

            <p className="mt-3 text-mist">
              Strong silhouettes. Restrained detail. A world shaped by shadow,
              space and lunar light. Nothing excessive. Nothing without purpose.
            </p>
          </section>

          <section>
            <p className="eyebrow text-mist">Built With Intention</p>

            <p className="mt-3 text-mist">
              Cut from heavyweight 260 GSM premium cotton and built for lasting
              structure, comfort and presence. Every garment is considered from
              fabric to final finish.
            </p>
          </section>

          <section>
            <p className="eyebrow text-mist">Limited By Design</p>

            <p className="mt-3 text-mist">
              Each release is produced in a fixed run and never repeated in the
              same form. Fewer pieces. Greater intention. Clothing made to be
              remembered, not replaced.
            </p>
          </section>

          <section>
            <p className="eyebrow text-mist">
              Beyond The First Transmission
            </p>

            <p className="mt-3 text-mist">
              LUNARO will continue to evolve through new forms, materials and
              worlds. The universe expands, but the vision remains unchanged.
            </p>
          </section>
        </div>
      </div>

      <div className="container-lunaro mt-24 max-w-2xl border-t border-graphite pt-12">
        <p className="font-display text-2xl italic text-editorial">
          &ldquo;We are not here to follow the world as it is. We are here to
          enter the one that comes next.&rdquo;
        </p>
      </div>
    </div>
  );
}