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
import FeaturedProducts from '@/components/home/FeaturedProducts';
import MostWanted from '@/components/home/MostWanted';
import FirstTransmission from '@/components/home/FirstTransmission';
import CollectionCarousel from '@/components/home/CollectionCarousel';
import TrustStrip from '@/components/home/TrustStrip';
import GarmentDetails from '@/components/home/GarmentDetails';
import LookbookPreview from '@/components/home/LookbookPreview';
import JoinOrbit from '@/components/home/JoinOrbit';

// Placeholder catalogue shaped like real Shopify data so every component
// downstream renders identically whether the store is connected or not.
// Every placeholder image is intentionally left absent so ProductCard shows
// its on-brand CinematicPlaceholder composition rather than a fake photo.
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
        <LookbookPreview />
        <JoinOrbit />
      </>
    );
  }

  // Launch-mode homepage order: Hero → Latest Drop → Most Wanted → First
  // Transmission → Collections → Trust Strip → Garment Details → Lookbook
  // → Newsletter. AnnouncementBar renders sitewide from layout.tsx, above
  // Header, so it isn't listed here.
  let realProducts: ProductCardData[] = [];

  if (isShopifyConfigured()) {
    realProducts = await getProducts({ first: 8, query: 'tag:drop-001' }).catch(() => []);

    if (realProducts.length === 0) {
      realProducts = await getProducts({ first: 8 }).catch(() => []);
    }
  }

  const products = realProducts.length > 0 ? realProducts : fallbackProducts();

  const featured = products.slice(0, 4);
  const shownHandles = new Set(featured.map((p) => p.handle));

  let bestSellers: ProductCardData[] = [];
  if (isShopifyConfigured()) {
    bestSellers = await getProducts({ first: 8, sortKey: 'BEST_SELLING' }).catch(() => []);
  }
  // Deduped against Latest Drop so a small catalogue never shows the same
  // products in both sections — "fail gracefully" means hiding the section
  // (MostWanted returns null on empty) rather than forcing duplicates.
  bestSellers = bestSellers.filter((p) => !shownHandles.has(p.handle)).slice(0, 4);

  // FirstTransmission's featured-spotlight product: first available real
  // product from Latest Drop, else first available real product from Most
  // Wanted, else none. `realProducts` (never the synthetic fallback catalogue)
  // and `bestSellers` (always real — MostWanted never gets fallback data) are
  // the only candidates, so the spotlight either shows a genuine Shopify
  // product or the section hides itself — it never fabricates one.
  const spotlightProduct =
    [...realProducts, ...bestSellers].find((p) => p.availableForSale) ?? null;

  return (
    <>
      <PageIntro />
      <Hero />
      <FeaturedProducts products={featured} />
      <MostWanted products={bestSellers} />
      <FirstTransmission featured={spotlightProduct} />
      <CollectionCarousel />
      <TrustStrip />
      <GarmentDetails />
      <JoinOrbit />
    </>
  );
}
