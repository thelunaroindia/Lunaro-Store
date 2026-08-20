'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import { assetManifest } from '@/lib/assetManifest';
import { PRELAUNCH_MODE } from '@/lib/config';

const looks = assetManifest.lookbookFull;

// Partial-reveal imagery shown behind the concealed overlay during
// prelaunch — real approved LUNARO editorial photography, alternated per
// look and heavily blurred/darkened so nothing is fully shown yet.
const partialRevealImages = [
  '/images/collections/new-drop.jpg',
  '/images/collections/graphic-tees.jpg',
];

// Looks 03 and 04 point to /shop rather than their themed collections —
// After Dark Edit has no dedicated Shopify collection (it's a general
// oversized-tee editorial concept, not a real collection) and
// Bottoms/trackpants is currently an empty Shopify collection, so
// "Shop This Look" must not dead-end there.
const lookDetails = [
  {
    caption: 'LOOK 01 — NEW DROP EDIT',
    shopHref: '/new-drop',
  },
  {
    caption: 'LOOK 02 — GRAPHIC ART EDIT',
    shopHref: '/collections/graphic-tees',
  },
  {
    caption: 'LOOK 03 — AFTER DARK EDIT',
    shopHref: '/shop',
  },
  {
    caption: 'LOOK 04 — BLACK ESSENTIALS',
    shopHref: '/shop',
  },
];

export default function LookbookPageClient() {
  const [index, setIndex] = useState(0);

  const [failedImages, setFailedImages] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') {
        setIndex((current) =>
          Math.min(current + 1, looks.length - 1)
        );
      }

      if (event.key === 'ArrowLeft') {
        setIndex((current) => Math.max(current - 1, 0));
      }
    }

    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const look = looks[index] ?? looks[0];
  const currentLookDetails = lookDetails[index] ?? lookDetails[0];

  if (!look || !currentLookDetails) {
    return null;
  }

  const imageFailed = failedImages.has(look.desktopPath);

  const isAvailable = !PRELAUNCH_MODE;

  const displayCaption = currentLookDetails.caption;

  const transmissionStatus =
    index < 2 ? 'Transmission Pending' : 'Future Transmission';

  function goToPreviousLook() {
    setIndex((current) => Math.max(current - 1, 0));
  }

  function goToNextLook() {
    setIndex((current) =>
      Math.min(current + 1, looks.length - 1)
    );
  }

  return (
    <main className="relative h-[100svh] w-full overflow-hidden bg-obsidian">
      <div
        className="absolute inset-0"
        onTouchStart={(event) => {
          const firstTouch = event.touches.item(0);

          if (!firstTouch) return;

          event.currentTarget.dataset.startX = String(
            firstTouch.clientX
          );
        }}
        onTouchEnd={(event) => {
          const changedTouch = event.changedTouches.item(0);

          if (!changedTouch) return;

          const startX = Number(
            event.currentTarget.dataset.startX ?? 0
          );

          const endX = changedTouch.clientX;

          if (startX - endX > 50) {
            goToNextLook();
          }

          if (endX - startX > 50) {
            goToPreviousLook();
          }
        }}
      >
        {PRELAUNCH_MODE ? (
          <>
            <CinematicPlaceholder
              variant="lookbook"
              className="h-full w-full"
            />
            <Image
              src={partialRevealImages[index % partialRevealImages.length] ?? partialRevealImages[0]!}
              alt=""
              aria-hidden="true"
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover opacity-45 blur-md scale-110"
            />
          </>
        ) : imageFailed ? (
          <CinematicPlaceholder
            variant="lookbook"
            className="h-full w-full"
          />
        ) : (
          <Image
            src={`/${look.desktopPath}`}
            alt={displayCaption}
            fill
            priority
            sizes="100vw"
            className="object-cover transition duration-700"
            onError={() =>
              setFailedImages((previous) => {
                const next = new Set(previous);
                next.add(look.desktopPath);
                return next;
              })
            }
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/20 to-obsidian/50" />

        {PRELAUNCH_MODE && (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="border border-lunar/20 bg-obsidian/65 px-8 py-6 text-center backdrop-blur-sm md:px-12 md:py-8">
              <p className="text-eyebrow uppercase tracking-[0.35em] text-mist">
                {transmissionStatus}
              </p>

              <p className="mx-auto mt-4 max-w-sm text-xs uppercase leading-6 tracking-wider2 text-silver">
                This look remains concealed until the transmission is complete.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="container-lunaro relative z-10 flex h-full flex-col justify-end pb-16 pt-32">
        <p className="eyebrow text-silver">
          {String(index + 1).padStart(2, '0')} /{' '}
          {String(looks.length).padStart(2, '0')}
        </p>

        <h1 className="mt-3 font-display text-display-md text-lunar">
          {displayCaption}
        </h1>

        {isAvailable ? (
          <Link
            href={currentLookDetails.shopHref}
            className="mt-4 w-fit text-eyebrow uppercase tracking-wider2 text-lunar link-underline"
          >
            Shop This Look
          </Link>
        ) : (
          <p className="mt-4 w-fit text-eyebrow uppercase tracking-wider2 text-mist">
            {transmissionStatus}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={goToPreviousLook}
        disabled={index === 0}
        aria-label="Previous look"
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 text-2xl text-lunar transition-opacity disabled:opacity-20 md:left-8"
      >
        ←
      </button>

      <button
        type="button"
        onClick={goToNextLook}
        disabled={index === looks.length - 1}
        aria-label="Next look"
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 text-2xl text-lunar transition-opacity disabled:opacity-20 md:right-8"
      >
        →
      </button>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {looks.map((item, itemIndex) => (
          <button
            key={item.index}
            type="button"
            onClick={() => setIndex(itemIndex)}
            aria-label={`Open ${
              lookDetails[itemIndex]?.caption ?? item.caption
            }`}
            className={`h-px transition-all duration-300 ${
              itemIndex === index
                ? 'w-10 bg-lunar'
                : 'w-5 bg-lunar/30'
            }`}
          />
        ))}
      </div>
    </main>
  );
}
