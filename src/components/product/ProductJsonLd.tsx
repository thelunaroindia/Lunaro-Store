import { canonicalUrl } from '@/lib/canonical';
import type { Product } from '@/lib/types';

// Real Shopify data only — no fabricated reviews/ratings, no invented SKU.
// Renders unconditionally whenever ProductDetail renders a real product;
// under today's PRELAUNCH_MODE=true + PURCHASE_TEST_MODE=false, the PDP
// route returns its "concealed" screen before ProductDetail ever mounts,
// so this never reaches a customer in the current live state.
export default function ProductJsonLd({ product }: { product: Product }) {
  const firstSku = product.variants.find((v) => v.sku)?.sku ?? undefined;
  const currency = product.priceRange.minVariantPrice.currencyCode;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || undefined,
    image: product.images.map((image) => image.url),
    sku: firstSku,
    url: canonicalUrl(`/products/${product.handle}`),
    brand: {
      '@type': 'Brand',
      name: 'LUNARO',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: currency,
      lowPrice: product.priceRange.minVariantPrice.amount,
      highPrice: product.priceRange.maxVariantPrice.amount,
      offerCount: product.variants.length || 1,
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: canonicalUrl(`/products/${product.handle}`),
    },
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify of our own typed, server-fetched product data —
      // nothing here originates from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
