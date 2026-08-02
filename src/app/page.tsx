import { getProducts, isShopifyConfigured } from '@/lib/shopify';
import { placeholderProducts } from '@/lib/config';
import type { ProductCardData } from '@/lib/types';
import PageIntro from '@/components/layout/PageIntro';
import Hero from '@/components/home/Hero';
import FirstTransmission from '@/components/home/FirstTransmission';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CollectionCarousel from '@/components/home/CollectionCarousel';
import GarmentDetails from '@/components/home/GarmentDetails';
import LunaroWorld from '@/components/home/LunaroWorld';
import LookbookPreview from '@/components/home/LookbookPreview';
import LimitedByDesign from '@/components/home/LimitedByDesign';
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
    priceRange: {
      minVariantPrice: { amount: String(p.price), currencyCode: 'INR' },
      maxVariantPrice: { amount: String(p.price), currencyCode: 'INR' },
    },
    images: [],
  }));
}

export default async function HomePage() {
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
      <FirstTransmission featured={products[0] ?? null} />
      <GarmentDetails />
      <LunaroWorld />
      <LookbookPreview />
      <LimitedByDesign />
      <JoinOrbit />
    </>
  );
}
