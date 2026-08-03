import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductByHandle, isShopifyConfigured } from '@/lib/shopify';
import { placeholderProducts, PRELAUNCH_MODE } from '@/lib/config';
import type { Product } from '@/lib/types';
import ProductDetail from '@/components/product/ProductDetail';
import RelatedProducts from '@/components/product/RelatedProducts';

type ProductPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  if (PRELAUNCH_MODE) {
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

  const { handle } = await params;

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
  if (PRELAUNCH_MODE) {
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

          <p className="mt-8 text-eyebrow uppercase tracking-wider2 text-lunar">
            REVEAL PENDING
          </p>

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

  const { handle } = await params;

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