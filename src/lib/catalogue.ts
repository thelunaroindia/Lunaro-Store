import type { ProductCardData } from './types';

export type CatalogueSearchParams = {
  sort?: string;
  size?: string | string[];
  colour?: string | string[];
  available?: string;
};

function toArray(value?: string | string[]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function applyCatalogueFilters(
  products: ProductCardData[],
  params: CatalogueSearchParams
): ProductCardData[] {
  const sizes = toArray(params.size);
  const colours = toArray(params.colour);
  const availableOnly = params.available === '1';

  let result = products.filter((product) => {
    if (availableOnly && !product.availableForSale) return false;

    if (sizes.length > 0) {
      const hasSize = product.filterVariants?.some(
        (v) => v.availableForSale && v.selectedOptions.some((o) => o.name === 'Size' && sizes.includes(o.value))
      );
      if (!hasSize) return false;
    }

    if (colours.length > 0) {
      const hasColour = product.filterVariants?.some((v) =>
        v.selectedOptions.some((o) => o.name === 'Colour' && colours.includes(o.value))
      );
      if (!hasColour) return false;
    }

    return true;
  });

  switch (params.sort) {
    case 'price-asc':
      result = [...result].sort(
        (a, b) => Number(a.priceRange.minVariantPrice.amount) - Number(b.priceRange.minVariantPrice.amount)
      );
      break;
    case 'price-desc':
      result = [...result].sort(
        (a, b) => Number(b.priceRange.minVariantPrice.amount) - Number(a.priceRange.minVariantPrice.amount)
      );
      break;
    case 'newest':
      // Products already arrive newest-first from getProducts({ sortKey: 'CREATED_AT', reverse: true }).
      break;
    default:
      // 'featured' — preserve the order Shopify returns (manual collection order).
      break;
  }

  return result;
}
