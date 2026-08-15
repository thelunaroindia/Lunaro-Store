'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import ProductGallery from './ProductGallery';
import ProductOptions, {
  findVariant,
  getInitialSelectedOptions,
} from './ProductOptions';
import ProductAccordion from './ProductAccordion';
import { cleanProductTitle } from '@/lib/productTitle';
import { trackEvent } from '@/lib/analytics';
import type { Product } from '@/lib/types';

// "DROP 001" is only ever shown when Shopify's own tag says so — the same
// tag /new-drop filters by (see src/app/new-drop/page.tsx) — never asserted
// just because a product happens to be viewable during prelaunch.
function eyebrowLabel(product: Product): string {
  const isDrop001 = product.tags.some(
    (tag) => tag.toLowerCase() === 'drop-001'
  );

  return isDrop001 ? 'LUNARO — Drop 001' : 'LUNARO';
}

// A short above-the-fold teaser, not a rewrite — only the product's own
// first sentence, and only when real copy exists. Empty/missing
// descriptions (e.g. products still being set up) simply show nothing here
// rather than filler text; the full description still appears below in
// ProductAccordion when present.
function editorialDescriptor(description: string): string | null {
  const trimmed = description.trim();
  if (!trimmed) return null;

  const firstSentence = trimmed.split(/(?<=[.!?])\s/)[0] ?? trimmed;
  return firstSentence.length <= 160 ? firstSentence : null;
}

export default function ProductDetail({ product }: { product: Product }) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    getInitialSelectedOptions(product)
  );

  const selectedVariant = useMemo(
    () => findVariant(product.variants, selected),
    [product.variants, selected]
  );

  const descriptor = editorialDescriptor(product.description);

  useEffect(() => {
    trackEvent('view_item', { product_id: product.id });
    // Fires once per product page view — product identity only, no PII.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  return (
    <div className="container-lunaro grid gap-12 lg:grid-cols-2">
      <ProductGallery
        images={product.images}
        title={product.title}
        selectedImage={selectedVariant?.image ?? null}
      />

      <div className="lg:pl-6">
        <Eyebrow>{eyebrowLabel(product)}</Eyebrow>

        <h1 className="mt-3 max-w-[36rem] font-display text-[2.5rem] leading-[0.96] tracking-[-0.035em] text-lunar sm:text-[3rem] lg:text-[3.35rem]">
          {cleanProductTitle(product.title)}
        </h1>

        {descriptor && (
          <p className="mt-4 max-w-md text-sm leading-7 text-mist">
            {descriptor}
          </p>
        )}

        <ProductOptions
          product={product}
          selected={selected}
          setSelected={setSelected}
        />
        <ProductAccordion product={product} />
      </div>
    </div>
  );
}
