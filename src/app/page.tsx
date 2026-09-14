import type { Metadata } from 'next';
import { getProducts, isShopifyConfigured } from '@/lib/shopify';
import { placeholderProducts, seoDefaults, PRELAUNCH_MODE } from '@/lib/config';
import { canonicalUrl } from '@/lib/canonical';
import type { ProductCardData } from '@/lib/types';

export const metadata: Metadata = {
  title: { absolute: seoDefaults.defaultTitle },
  description: seoDefaults.description,
  alternates: { canonical: canonicalUrl('/') },
};
import PageIntro from '@/components/layout/PageIntro';
import Hero from '@/components/home/Hero';
import CategoryChips from '@/components/home/CategoryChips';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CollectionCarousel from '@/components/home/CollectionCarousel';
import TrustStrip from '@/components/home/TrustStrip';
import GarmentDetails from '@/components/home/GarmentDetails';
import JoinOrbit from '@/components/home/JoinOrbit';

// Placeholder catalogue shaped like real Shopify data so every component
// downstream renders identically whether the store is connected or not.
// Every placeholder image is intentionally left absent so ProductCard shows
// its on-brand CinematicPlaceholder composition rather than a fake photo.
// Explicit Latest Drop order — deliberately never relies on Shopify's own
// product/collection sort order, which the homepage has no control over
// and which doesn't currently return these four in the desired sequence.
// Black Standard is intentionally excluded from this list; it stays fully
// reachable via /new-drop, /shop, /collections/oversized-tees, and its own
// PDP. Falls back to Shopify's returned order (or the placeholder
// catalogue, whose handles never match this list) if any of the four
// expected handles isn't present, rather than showing fewer than 4 cards.
const HOMEPAGE_FEATURED_ORDER = [
  'aqua-burn-t-shirt',
  'blue-inferno-t-shirt',
  'ghost-hands-t-shirt',
  'acid-frame-t-shirt',
];

function orderHomepageFeatured(products: ProductCardData[]): ProductCardData[] {
  const byHandle = new Map(products.map((p) => [p.handle, p]));
  const ordered = HOMEPAGE_FEATURED_ORDER.map((handle) => byHandle.get(handle)).filter(
    (p): p is ProductCardData => Boolean(p)
  );

  return ordered.length === HOMEPAGE_FEATURED_ORDER.length ? ordered : products.slice(0, 4);
}

function fallbackProducts(): ProductCardData[] {
  return placeholderProducts.map((p, i) => ({
    id: `placeholder-${i}`,
    handle: p.handle,
    title: p.title,
    availableForSale: true,
    tags: i === 0 ? ['limited'] : [],
    productType: '',
    priceRange: {
      minVariantPrice: { amount: String(p.price), currencyCode: 'INR' },
      maxVariantPrice: { amount: String(p.price), currencyCode: 'INR' },
    },
    images: [],
  }));
}

export default async function HomePage() {
  if (PRELAUNCH_MODE) {
    let products: ProductCardData[] = [];

    if (isShopifyConfigured()) {
      products = await getProducts({ first: 8 }).catch(() => []);
    }
    if (products.length === 0) {
      products = fallbackProducts();
    }

    return (
      <>
        <PageIntro />
        <Hero />
        <FeaturedProducts products={products.slice(0, 4)} />
        <CollectionCarousel />
        <GarmentDetails />
        <JoinOrbit />
      </>
    );
  }

  // Launch-mode homepage order: Hero → Category Chips → Latest Drop →
  // Trust Strip → Garment Details → Newsletter. AnnouncementBar renders
  // sitewide from layout.tsx, above Header, so it isn't listed here.
  // Lookbook deliberately excluded — hidden from customer-facing discovery
  // for now (not deleted: /lookbook and LookbookPreview.tsx still exist).
  let realProducts: ProductCardData[] = [];

  if (isShopifyConfigured()) {
    realProducts = await getProducts({ first: 8, query: 'tag:drop-001' }).catch(() => []);

    if (realProducts.length === 0) {
      realProducts = await getProducts({ first: 8 }).catch(() => []);
    }
  }

  const products = realProducts.length > 0 ? realProducts : fallbackProducts();

  const featured = orderHomepageFeatured(products);

  return (
    <>
      <PageIntro />
      <Hero />
      <CategoryChips />
      <FeaturedProducts products={featured} />
      <TrustStrip />
      <GarmentDetails />
      <JoinOrbit />
    </>
  );
}
