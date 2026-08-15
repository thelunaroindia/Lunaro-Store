import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductByHandle, isShopifyConfigured } from '@/lib/shopify';
import {
  placeholderProducts,
  PRELAUNCH_MODE,
  PURCHASE_TEST_MODE,
  PURCHASE_TEST_PRODUCT_HANDLE,
} from '@/lib/config';
import { canonicalUrl } from '@/lib/canonical';
import type { Product } from '@/lib/types';
import ProductDetail from '@/components/product/ProductDetail';
import RelatedProducts from '@/components/product/RelatedProducts';

type ProductPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

// Temporary purchase-test carve-out — see PURCHASE_TEST_MODE in
// src/lib/config.ts. Unlocks exactly this one handle while the flag is on;
// set the flag back to false to remove the carve-out entirely.
function isPurchaseTestUnlock(handle: string): boolean {
  return PURCHASE_TEST_MODE && handle === PURCHASE_TEST_PRODUCT_HANDLE;
}

// There is no Early Access grant for Drop 001 anymore — the ONLY way a
// product page unlocks during prelaunch is the internal purchase-test
// carve-out above (development-only, requires PURCHASE_TEST_MODE to also
// be flipped on, and stays out of search/sitemap discovery). A visitor's
// old signed early-access cookie, if any, is deliberately never consulted
// here.
function isUnlocked(handle: string): boolean {
  return isPurchaseTestUnlock(handle);
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;

  if (PRELAUNCH_MODE && !isUnlocked(handle)) {
    return {
      title: 'Reveal Pending',
      description:
        'The first LUNARO garments remain concealed while Drop 001 is in transmission.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  if (!isShopifyConfigured()) {
    return {
      title: 'Product',
    };
  }

  const product = await getProductByHandle(handle).catch(() => null);

  if (!product) {
    return {
      title: 'Product',
    };
  }

  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    openGraph: {
      images: product.images[0] ? [product.images[0].url] : undefined,
    },
    // The purchase-test unlock is temporary and not meant for discovery —
    // keep it out of search results even though the URL itself resolves.
    // No canonical either — a noindex page shouldn't also assert "this is
    // the canonical version of me," a mixed signal worth avoiding.
    ...(isPurchaseTestUnlock(handle)
      ? { robots: { index: false, follow: false } }
      : { alternates: { canonical: canonicalUrl(`/products/${handle}`) } }),
  };
}

function placeholderAsProduct(handle: string): Product | null {
  const placeholder = placeholderProducts.find(
    (product) => product.handle === handle
  );

  if (!placeholder) return null;

  return {
    id: `placeholder-${handle}`,
    handle: placeholder.handle,
    title: placeholder.title,
    description: placeholder.story,
    descriptionHtml: `<p>${placeholder.story}</p>`,
    availableForSale: true,
    tags: [],
    productType: 'T-Shirt',
    options: [
      {
        name: 'Colour',
        values: [placeholder.colour],
      },
      {
        name: 'Size',
        values: ['S', 'M', 'L', 'XL', 'XXL'],
      },
    ],
    priceRange: {
      minVariantPrice: {
        amount: String(placeholder.price),
        currencyCode: 'INR',
      },
      maxVariantPrice: {
        amount: String(placeholder.price),
        currencyCode: 'INR',
      },
    },
    images: [],
    variants: ['S', 'M', 'L', 'XL', 'XXL'].map((size) => ({
      id: `placeholder-variant-${handle}-${size}`,
      title: `${placeholder.colour} / ${size}`,
      availableForSale: true,
      quantityAvailable: 20,
      price: {
        amount: String(placeholder.price),
        currencyCode: 'INR',
      },
      compareAtPrice: null,
      selectedOptions: [
        {
          name: 'Colour',
          value: placeholder.colour,
        },
        {
          name: 'Size',
          value: size,
        },
      ],
      image: null,
    })),
    seo: {
      title: placeholder.title,
      description: placeholder.story,
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { handle } = await params;

  if (PRELAUNCH_MODE && !isUnlocked(handle)) {
    return (
      <main className="container-lunaro flex min-h-[85svh] items-center justify-center pb-24 pt-32 md:pt-40">
        <div className="w-full max-w-3xl text-center">
          <p className="eyebrow text-silver">
            DROP 001 — IN TRANSMISSION
          </p>

          <h1 className="mt-6 font-display text-6xl leading-[0.9] text-lunar md:text-8xl">
            GARMENT
            <br />
            CONCEALED
          </h1>

          <p className="mx-auto mt-8 max-w-lg text-sm leading-7 text-mist md:text-base">
            This piece remains beyond the visible. The complete garment will
            be revealed when the first transmission is ready.
          </p>

          <div className="terminator mx-auto mt-10 max-w-xs" />

          <Link
            href="/new-drop"
            className="mt-10 inline-block border border-lunar/30 px-7 py-4 text-eyebrow uppercase tracking-wider2 text-lunar transition-colors hover:bg-lunar hover:text-obsidian"
          >
            Enter the Transmission
          </Link>
        </div>
      </main>
    );
  }

  let product: Product | null = null;

  if (isShopifyConfigured()) {
    product = await getProductByHandle(handle).catch(() => null);
  }

  if (!product) {
    product = placeholderAsProduct(handle);
  }

  if (!product) {
    notFound();
  }

  return (
    <main className="pb-24 pt-28 md:pt-32">
      <ProductDetail product={product} />

      <RelatedProducts excludeHandle={product.handle} />
    </main>
  );
}