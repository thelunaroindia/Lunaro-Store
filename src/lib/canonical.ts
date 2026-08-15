import { site } from './config';

// Reuses site.url as the one authoritative production origin — the same
// value metadataBase/OG/Twitter/sitemap/robots all resolve from — rather
// than maintaining a second, separately-hardcoded host constant that could
// drift out of sync with it.
//
// Builds an absolute canonical URL from a bare path, always ignoring query
// strings (a canonical URL must never vary by query parameter — e.g.
// /search?q=black canonicalizes to exactly /search) and always without a
// trailing slash except for the root, matching this app's default Next.js
// routing (no `trailingSlash: true` in next.config.js).
export function canonicalUrl(path: string): string {
  const withoutQuery = path.split('?')[0] ?? path;
  const trimmed =
    withoutQuery === '/' ? '' : withoutQuery.replace(/\/+$/, '');

  return `${site.url}${trimmed || '/'}`;
}
