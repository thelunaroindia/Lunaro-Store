import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTransmissionByHandle, getTransmissions, isShopifyConfigured } from '@/lib/shopify';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  if (!isShopifyConfigured()) return { title: 'Transmission' };
  const article = await getTransmissionByHandle(params.slug).catch(() => null);
  return { title: article?.seo.title || article?.title || 'Transmission' };
}

export default async function TransmissionArticlePage({ params }: { params: { slug: string } }) {
  if (!isShopifyConfigured()) notFound();

  const article = await getTransmissionByHandle(params.slug).catch(() => null);
  if (!article) notFound();

  const related = (await getTransmissions(4).catch(() => [])).filter((p) => p.handle !== article.handle);

  return (
    <article className="pb-24 pt-32 md:pt-40">
      <div className="container-lunaro max-w-2xl">
        <p className="eyebrow text-silver">
          {new Date(article.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="mt-4 font-display text-display-lg text-lunar">{article.title}</h1>
      </div>

      {article.image && (
        <div className="container-lunaro relative mt-12 aspect-[16/9] overflow-hidden bg-charcoal">
          <Image src={article.image.url} alt={article.image.altText ?? article.title} fill sizes="100vw" className="object-cover" />
        </div>
      )}

      <div
        className="container-lunaro prose prose-invert mt-12 max-w-2xl prose-headings:font-display prose-p:text-mist prose-a:text-lunar"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      <div className="container-lunaro mt-16 flex gap-6 border-t border-graphite pt-8 text-xs uppercase tracking-wider2 text-mist">
        <span>Share:</span>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`}
          className="link-underline"
        >
          X
        </a>
        <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title)}`} className="link-underline">
          WhatsApp
        </a>
      </div>

      {related.length > 0 && (
        <div className="container-lunaro mt-16 border-t border-graphite pt-12">
          <p className="eyebrow mb-6 text-mist">More Transmissions</p>
          <div className="flex flex-col gap-3">
            {related.map((r) => (
              <Link key={r.id} href={`/transmissions/${r.handle}`} className="text-lunar link-underline">
                {r.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
