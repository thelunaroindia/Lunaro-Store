import type { MetadataRoute } from 'next';
import { site } from '@/lib/config';
import { getProducts, getCollections, getTransmissions, isShopifyConfigured } from '@/lib/shopify';

const staticRoutes = [
  '',
  '/shop',
  '/new-drop',
  '/collections',
  '/lookbook',
  '/about',
  '/transmissions',
  '/contact',
  '/faq',
  '/size-guide',
  '/shipping-returns',
  '/refund-policy',
  '/privacy-policy',
  '/terms',
  '/track-order',
  '/search',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.6,
  }));

  if (!isShopifyConfigured()) return entries;

  const [products, collections, transmissions] = await Promise.all([
    getProducts({ first: 250 }).catch(() => []),
    getCollections(250).catch(() => []),
    getTransmissions(250).catch(() => []),
  ]);

  for (const p of products) {
    entries.push({ url: `${site.url}/products/${p.handle}`, changeFrequency: 'daily', priority: 0.8 });
  }
  for (const c of collections) {
    entries.push({ url: `${site.url}/collections/${c.handle}`, changeFrequency: 'weekly', priority: 0.7 });
  }
  for (const t of transmissions) {
    entries.push({
      url: `${site.url}/transmissions/${t.handle}`,
      lastModified: new Date(t.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  return entries;
}
