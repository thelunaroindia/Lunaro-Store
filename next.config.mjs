/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: '*.myshopify.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      // lunaro.in -> www.lunaro.in (and http -> https for both) is handled
      // at the DNS/Vercel domain level — verified directly against
      // production: every non-www/http variant 308-redirects to
      // https://www.lunaro.in. Keep this file for path-level redirects
      // only, e.g. legacy URLs once real product/collection handles are
      // finalised.

      // The Transmissions editorial section was removed entirely. Anyone
      // hitting an old /transmissions link (bookmark, external link, old
      // sitemap entry still cached by a crawler) lands on the homepage
      // instead of a 404.
      {
        source: '/transmissions',
        destination: '/',
        permanent: false,
      },
      {
        source: '/transmissions/:slug',
        destination: '/',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        // Never let a preview/staging deployment get indexed. Matches
        // anything whose Host is NOT the real production domain — both
        // apex and www, since www.lunaro.in is what production actually
        // serves (see the redirects() comment above). The previous version
        // of this regex only excluded bare "lunaro.in", which meant it
        // still matched "www.lunaro.in" and sent X-Robots-Tag:
        // noindex,nofollow on every production response.
        source: '/:path*',
        has: [{ type: 'host', value: '^(?!(www\\.)?lunaro\\.in$).*' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
