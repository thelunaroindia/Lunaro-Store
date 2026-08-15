// Canonical URL host is deliberately its own constant, independent from
// site.url/metadataBase (src/lib/config.ts, still resolves to
// https://lunaro.in via NEXT_PUBLIC_SITE_URL) — so adding canonical tags
// never touches OG/Twitter metadata resolution, which reads metadataBase.
// www.lunaro.in is the verified single production host: every non-www and
// http variant 308-redirects here at the Vercel domain level (checked
// directly against production before this file was written).
const CANONICAL_HOST = 'https://www.lunaro.in';

// Builds an absolute canonical URL from a bare path, always ignoring query
// strings (a canonical URL must never vary by query parameter — e.g.
// /search?q=black canonicalizes to exactly /search) and always without a
// trailing slash except for the root, matching this app's default Next.js
// routing (no `trailingSlash: true` in next.config.js).
export function canonicalUrl(path: string): string {
  const withoutQuery = path.split('?')[0] ?? path;
  const trimmed =
    withoutQuery === '/' ? '' : withoutQuery.replace(/\/+$/, '');

  return `${CANONICAL_HOST}${trimmed || '/'}`;
}
