import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCollectionByHandle } from '@/lib/shopify';
import {
  applyCatalogueFilters,
  type CatalogueSearchParams,
} from '@/lib/catalogue';
import { PRELAUNCH_MODE } from '@/lib/config';
import { SectionHeading } from '@/components/ui/Eyebrow';
import FilterSort from '@/components/shop/FilterSort';
import ProductGrid from '@/components/shop/ProductGrid';

type CollectionPageProps = {
  params: Promise<{
    handle: string;
  }>;
  searchParams: CatalogueSearchParams;
};

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  if (PRELAUNCH_MODE) {
    return {
      title: 'Collection Concealed',
      description:
        'The first LUNARO collection remains concealed while Drop 001 is in transmission.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { handle } = await params;

  const collection = await getCollectionByHandle(handle).catch(
    () => null
  );

  return {
    title: collection?.title ?? 'Collection',
    description:
      collection?.description || `Shop the ${collection?.title ?? 'LUNARO'} collection.`,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  if (PRELAUNCH_MODE) {
    return (
      <main className="container-lunaro flex min-h-[85svh] items-center justify-center pb-24 pt-32 md:pt-40">
        <div className="w-full max-w-3xl text-center">
          <p className="eyebrow text-silver">
            DROP 001 — IN TRANSMISSION
          </p>

          <h1 className="mt-6 font-display text-6xl leading-[0.9] text-lunar md:text-8xl">
            COLLECTION
            <br />
            CONCEALED
          </h1>

          <p className="mx-auto mt-8 max-w-lg text-sm leading-7 text-mist md:text-base">
            The first garments remain beyond the visible. The complete
            collection will be revealed when the transmission is ready.
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

  const collection = await getCollectionByHandle(handle).catch(
    () => null
  );

  if (!collection) {
    notFound();
  }

  const filtered = applyCatalogueFilters(
    collection.products,
    searchParams
  );

  return (
    <main className="container-lunaro pb-24 pt-32 md:pt-40">
      <SectionHeading eyebrow="Collection" className="mb-6">
        {collection.title.toUpperCase()}
      </SectionHeading>

      {collection.description && (
        <p className="mb-8 max-w-xl text-mist md:mb-10">
          {collection.description}
        </p>
      )}

      <FilterSort products={collection.products} />
      <ProductGrid products={filtered} />
    </main>
  );
}