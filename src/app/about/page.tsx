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
          Made for those who were never meant to remain where they began.
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
            <p className="eyebrow text-mist">01 — Philosophy</p>

            <p className="mt-3 max-w-md text-mist">
              LUNARO was built on the belief that what you wear should say
              something before you do. We create pieces with presence —
              considered, distinctive, and made for people who choose their
              own direction.
            </p>
          </section>

          <section>
            <p className="eyebrow text-mist">02 — Design Language</p>

            <p className="mt-3 max-w-md text-mist">
              Restraint over excess. Detail over noise. Every piece begins
              with a strong silhouette and is refined until nothing feels
              accidental. The result is clothing that feels distinct without
              asking for attention.
            </p>
          </section>

          <section>
            <p className="eyebrow text-mist">03 — Built With Intention</p>

            <p className="mt-3 max-w-md text-mist">
              From the weight of the fabric to the fall of the silhouette,
              every decision is deliberate. Construction, proportion, texture
              and finish are considered as one — because the difference is
              often found in what others overlook.
            </p>
          </section>

          <section>
            <p className="eyebrow text-mist">04 — Made To Be Worn</p>

            <p className="mt-3 max-w-md text-mist">
              LUNARO is not designed to exist only in photographs. These are
              pieces made to become part of how you dress, move and live —
              elevated enough to be remembered, effortless enough to return
              to.
            </p>
          </section>

          <section>
            <p className="eyebrow text-mist">05 — What Comes Next</p>

            <p className="mt-3 max-w-md text-mist">
              LUNARO begins with a single collection, not a single idea. New
              silhouettes, materials and expressions will follow, while the
              standard remains the same: make fewer decisions, make better
              ones.
            </p>
          </section>
        </div>
      </div>

      <div className="container-lunaro mt-24 max-w-2xl border-t border-graphite pt-12">
        <p className="font-display text-2xl italic text-editorial">
          &ldquo;We don&rsquo;t make clothes to fill wardrobes.
          <br />
          We make pieces worth choosing.&rdquo;
        </p>
      </div>
    </div>
  );
}