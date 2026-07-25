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
      // www.lunaro.in -> lunaro.in is handled at the DNS/Vercel domain level
      // (see docs/DEPLOYMENT.md). Keep this file for path-level redirects only,
      // e.g. legacy URLs once real product/collection handles are finalised.
    ];
  },
  async headers() {
    return [
      {
        // Never let a preview/staging deployment get indexed.
        source: '/:path*',
        has: [{ type: 'host', value: '(?!lunaro\\.in).*' }],
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
