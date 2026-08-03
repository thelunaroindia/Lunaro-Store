'use client';

import { useMemo, useState } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import ProductGallery from './ProductGallery';
import ProductOptions, {
  findVariant,
  getInitialSelectedOptions,
} from './ProductOptions';
import ProductAccordion from './ProductAccordion';
import { cleanProductTitle } from '@/lib/productTitle';
import type { Product } from '@/lib/types';

export default function ProductDetail({ product }: { product: Product }) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    getInitialSelectedOptions(product)
  );

  const selectedVariant = useMemo(
    () => findVariant(product.variants, selected),
    [product.variants, selected]
  );

  return (
    <div className="container-lunaro grid gap-12 lg:grid-cols-2">
      <ProductGallery
        images={product.images}
        title={product.title}
        selectedImage={selectedVariant?.image ?? null}
      />

      <div className="lg:pl-6">
        <Eyebrow>{product.productType || 'LUNARO'}</Eyebrow>

        <h1 className="mt-3 max-w-[36rem] font-display text-[2.5rem] leading-[0.96] tracking-[-0.035em] text-lunar sm:text-[3rem] lg:text-[3.35rem]">
          {cleanProductTitle(product.title)}
        </h1>

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
