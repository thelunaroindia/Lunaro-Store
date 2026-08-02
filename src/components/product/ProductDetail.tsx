'use client';

import { useMemo, useState } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import ProductGallery from './ProductGallery';
import ProductOptions, {
  findVariant,
  getInitialSelectedOptions,
} from './ProductOptions';
import ProductAccordion from './ProductAccordion';
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

        <h1 className="mt-3 font-display text-display-md text-lunar">
          {product.title}
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
