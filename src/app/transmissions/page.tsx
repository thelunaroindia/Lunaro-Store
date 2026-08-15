import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getTransmissions, isShopifyConfigured } from '@/lib/shopify';
import { canonicalUrl } from '@/lib/canonical';
import { SectionHeading } from '@/components/ui/Eyebrow';

export const metadata: Metadata = {
  title: 'Transmissions',
  alternates: { canonical: canonicalUrl('/transmissions') },
};

const placeholderTransmissions = [
  {
    id: 'placeholder-1',
    handle: 'the-first-transmission',
    title: 'The First Transmission',
    excerpt: 'The story behind Drop 001 — how ORBIT 01 was designed from silence outward.',
    publishedAt: new Date().toISOString(),
    image: null,
  },
];

export default async function TransmissionsPage() {
  let posts = isShopifyConfigured() ? await getTransmissions().catch(() => []) : [];
  if (posts.length === 0) posts = placeholderTransmissions;

  return (
    <div className="container-lunaro pt-32 pb-24 md:pt-40">
      <SectionHeading eyebrow="Journal" className="mb-14">
        TRANSMISSIONS
      </SectionHeading>

      <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.id} href={`/transmissions/${post.handle}`} className="group block">
            <div className="relative aspect-[16/10] overflow-hidden bg-charcoal">
              {post.image ? (
                <Image
                  src={post.image.url}
                  alt={post.image.altText ?? post.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-xs uppercase tracking-wider2 text-mist">Campaign image</span>
                </div>
              )}
            </div>
            <p className="mt-4 font-display text-2xl text-lunar">{post.title}</p>
            <p className="mt-2 text-sm text-mist">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
