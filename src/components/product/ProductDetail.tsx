'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import ProductGallery from './ProductGallery';
import ProductOptions, {
  findVariant,
  getInitialSelectedOptions,
} from './ProductOptions';
import ProductAccordion from './ProductAccordion';
import ProductJsonLd from './ProductJsonLd';
import { cleanProductTitle } from '@/lib/productTitle';
import { trackEvent, isInternalTestProduct } from '@/lib/analytics';
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

export default function ProductDetail({
  product,
  descriptionHtml,
}: {
  product: Product;
  // Pre-sanitized server-side by the page (src/app/products/[handle]/page.tsx
  // via src/lib/sanitizeDescription.ts) and threaded through here purely as
  // a prop — kept out of this Client Component's own logic so sanitize-html
  // never has to ship to the browser. Passed straight through to
  // ProductAccordion, the only thing that renders it.
  descriptionHtml: string;
}) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    getInitialSelectedOptions(product)
  );

  const selectedVariant = useMemo(
    () => findVariant(product.variants, selected),
    [product.variants, selected]
  );

  useEffect(() => {
    trackEvent('view_item', {
      product_id: product.id,
      product_handle: product.handle,
      currency: product.priceRange.minVariantPrice.currencyCode,
      value: Number(product.priceRange.minVariantPrice.amount),
      internal_test: isInternalTestProduct(product.handle),
    });
    // Fires once per product page view (product identity changing is the
    // only thing that should re-fire it) — real price/currency, no PII.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  return (
    <div className="container-lunaro grid gap-12 lg:grid-cols-2">
      <ProductJsonLd product={product} />

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

        <ProductOptions
          product={product}
          selected={selected}
          setSelected={setSelected}
        />
        <ProductAccordion product={product} descriptionHtml={descriptionHtml} />
      </div>
    </div>
  );
}
