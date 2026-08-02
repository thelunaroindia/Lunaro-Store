'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';
import type { ShopifyImage } from '@/lib/types';

type ProductGalleryProps = {
  images: ShopifyImage[];
  title: string;
};

export default function ProductGallery({
  images,
  title,
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const imageCount = images.length;

  const showPrevious = useCallback(() => {
    if (imageCount <= 1) return;

    setZoomed(false);
    setActive((current) =>
      current === 0 ? imageCount - 1 : current - 1
    );
  }, [imageCount]);

  const showNext = useCallback(() => {
    if (imageCount <= 1) return;

    setZoomed(false);
    setActive((current) =>
      current === imageCount - 1 ? 0 : current + 1
    );
  }, [imageCount]);

  function selectImage(index: number) {
    setZoomed(false);
    setActive(index);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        showPrevious();
      }

      if (event.key === 'ArrowRight') {
        showNext();
      }

      if (event.key === 'Escape') {
        setZoomed(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNext, showPrevious]);

  useEffect(() => {
    if (active >= imageCount && imageCount > 0) {
      setActive(0);
    }
  }, [active, imageCount]);

  if (imageCount === 0) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-charcoal">
        <CinematicPlaceholder
          variant="product"
          className="h-full w-full"
        />
      </div>
    );
  }

  const current = images[active] ?? images[0];

  if (!current) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-charcoal">
        <CinematicPlaceholder
          variant="product"
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div
        className="relative aspect-[4/5] w-full overflow-hidden bg-charcoal"
        onTouchStart={(event) => {
          const firstTouch = event.touches.item(0);
          touchStartX.current = firstTouch?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;

          const changedTouch = event.changedTouches.item(0);

          const endX =
            changedTouch?.clientX ?? touchStartX.current;

          const difference = touchStartX.current - endX;

          if (difference > 50) {
            showNext();
          } else if (difference < -50) {
            showPrevious();
          }

          touchStartX.current = null;
        }}
      >
        <button
          type="button"
          onClick={() =>
            setZoomed((currentZoom) => !currentZoom)
          }
          aria-label={
            zoomed
              ? 'Zoom out'
              : 'Zoom in on product image'
          }
          className="absolute inset-0 z-10 cursor-zoom-in overflow-hidden"
        >
          <Image
            src={current.url}
            alt={
              current.altText ??
              `${title} — image ${active + 1}`
            }
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={`object-cover transition-transform duration-500 ease-lunar ${
              zoomed
                ? 'scale-150 cursor-zoom-out'
                : 'scale-100'
            }`}
          />
        </button>

        {imageCount > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Show previous product image"
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-lunar/30 bg-obsidian/60 text-xl text-lunar backdrop-blur-sm transition hover:border-lunar hover:bg-obsidian/80"
            >
              ←
            </button>

            <button
              type="button"
              onClick={showNext}
              aria-label="Show next product image"
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-lunar/30 bg-obsidian/60 text-xl text-lunar backdrop-blur-sm transition hover:border-lunar hover:bg-obsidian/80"
            >
              →
            </button>
          </>
        )}

        <div className="absolute bottom-3 right-3 z-20 bg-obsidian/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-lunar backdrop-blur-sm">
          {active + 1} / {imageCount}
        </div>
      </div>

      <div className="mt-4 flex max-w-full gap-3 overflow-x-auto pb-2">
        {images.map((image, index) => {
          const isActive = index === active;

          return (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => selectImage(index)}
              aria-label={`Show product image ${
                index + 1
              } of ${imageCount}`}
              aria-current={
                isActive ? 'true' : undefined
              }
              className={`relative aspect-[4/5] w-20 flex-none overflow-hidden bg-charcoal transition-all duration-300 ${
                isActive
                  ? 'ring-1 ring-lunar opacity-100'
                  : 'opacity-50 hover:opacity-90'
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}