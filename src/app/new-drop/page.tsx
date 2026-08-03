import type { Metadata } from 'next';
import { getProducts, isShopifyConfigured } from '@/lib/shopify';
import { placeholderProducts, PRELAUNCH_MODE } from '@/lib/config';
import type { ProductCardData } from '@/lib/types';
import { SectionHeading } from '@/components/ui/Eyebrow';
import ProductGrid from '@/components/shop/ProductGrid';

export const metadata: Metadata = {
  title: PRELAUNCH_MODE ? 'Drop 001 — In Transmission' : 'New Drop',
  description: 'The latest LUNARO drop, live now.',
};

function fallbackProducts(): ProductCardData[] {
  return placeholderProducts.map((product, index) => ({
    id: `placeholder-${index}`,
    handle: product.handle,
    title: product.title,
    availableForSale: true,
    tags: [],
    priceRange: {
      minVariantPrice: {
        amount: String(product.price),
        currencyCode: 'INR',
      },
      maxVariantPrice: {
        amount: String(product.price),
        currencyCode: 'INR',
      },
    },
    images: [],
  }));
}

export default async function NewDropPage() {
  if (PRELAUNCH_MODE) {
    return (
      <main className="container-lunaro pb-24 pt-32 md:pt-40">
        <section className="flex min-h-[70svh] items-center justify-center">
          <div className="w-full max-w-5xl text-center">
            <p className="eyebrow text-silver">
              DROP 001 — TRANSMISSION IN PROGRESS
            </p>

            <h1 className="mt-6 font-display text-6xl leading-[0.9] text-lunar md:text-8xl lg:text-9xl">
              THE FIRST
              <br />
              TRANSMISSION
            </h1>

            <p className="mx-auto mt-8 max-w-xl text-sm leading-7 text-mist md:text-base">
              The beginning of the LUNARO world. Designed in darkness,
              constructed for the unknown, and revealed only when the signal is
              complete.
            </p>

            <div className="terminator mx-auto mt-10 max-w-xs" />

            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-eyebrow uppercase tracking-wider2 text-lunar">
                REVEAL PENDING
              </p>

              <p className="max-w-md text-xs uppercase tracking-wider2 text-silver">
                The first garments remain concealed.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-px border border-graphite bg-graphite md:grid-cols-3">
          <div className="bg-obsidian p-8 md:p-10">
            <p className="eyebrow text-silver">01</p>
            <h2 className="mt-4 font-display text-3xl text-lunar">
              ORIGIN
            </h2>
            <p className="mt-4 text-sm leading-7 text-mist">
              The first chapter of LUNARO begins beyond the visible.
            </p>
          </div>

          <div className="bg-obsidian p-8 md:p-10">
            <p className="eyebrow text-silver">02</p>
            <h2 className="mt-4 font-display text-3xl text-lunar">
              FORM
            </h2>
            <p className="mt-4 text-sm leading-7 text-mist">
              Heavyweight silhouettes shaped through restraint and precision.
            </p>
          </div>

          <div className="bg-obsidian p-8 md:p-10">
            <p className="eyebrow text-silver">03</p>
            <h2 className="mt-4 font-display text-3xl text-lunar">
              SIGNAL
            </h2>
            <p className="mt-4 text-sm leading-7 text-mist">
              The complete transmission will arrive when every detail is ready.
            </p>
          </div>
        </section>
      </main>
    );
  }

  let products: ProductCardData[] = [];

  if (isShopifyConfigured()) {
    products = await getProducts({
      first: 24,
      query: 'tag:drop-001',
    }).catch(() => []);
  }

  if (products.length === 0) {
    products = fallbackProducts();
  }

  const soldOut =
    products.length > 0 &&
    products.every((product) => !product.availableForSale);

  return (
    <main className="container-lunaro pb-24 pt-32 md:pt-40">
      <SectionHeading eyebrow="Drop 001" className="mb-12">
        THE FIRST TRANSMISSION
      </SectionHeading>

      {soldOut && (
        <div className="mb-10 border border-graphite p-6">
          <p className="font-display text-xl text-lunar">
            This drop has sold out.
          </p>

          <p className="mt-2 text-sm text-mist">
            Join the orbit to be notified the moment the next transmission
            arrives.
          </p>
        </div>
      )}

      <ProductGrid products={products} />
    </main>
  );
}