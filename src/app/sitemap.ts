import type { MetadataRoute } from 'next';
import { site, PRELAUNCH_MODE } from '@/lib/config';
import { getProducts, getCollections, isShopifyConfigured } from '@/lib/shopify';

const staticRoutes = [
  '',
  '/shop',
  '/new-drop',
  '/collections',
  '/lookbook',
  '/about',
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

  // Individual product/collection PDPs are concealed behind the Early
  // Access gate while PRELAUNCH_MODE is true (see products/[handle] and
  // collections/[handle]) — listing their URLs in the sitemap would invite
  // crawlers to real product pages before they're actually visible to an
  // unauthenticated visitor. Currently a no-op (the only connected product
  // is the internal, non-customer-facing `test` handle, already filtered
  // out by getProducts()), but this stops it from silently leaking once
  // real inventory is added in a later phase while still in prelaunch.
  const [products, collections] = await Promise.all([
    PRELAUNCH_MODE ? Promise.resolve([]) : getProducts({ first: 250 }).catch(() => []),
    PRELAUNCH_MODE ? Promise.resolve([]) : getCollections(250).catch(() => []),
  ]);

  for (const p of products) {
    entries.push({ url: `${site.url}/products/${p.handle}`, changeFrequency: 'daily', priority: 0.8 });
  }
  for (const c of collections) {
    entries.push({ url: `${site.url}/collections/${c.handle}`, changeFrequency: 'weekly', priority: 0.7 });
  }

  return entries;
}
