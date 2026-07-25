/**
 * LUNARO Visual Asset Manifest
 * ─────────────────────────────
 * The single source of truth for every non-decorative visual asset on the
 * site. Components import from here rather than hardcoding paths, so:
 *   - there is exactly one place to update a path once real media lands
 *   - every asset's page placement, format and fallback are documented
 *     next to the path itself, not scattered across component comments
 *   - `docs/HOMEPAGE_ASSET_PROMPTS.md` and `docs/HIGGSFIELD_PROMPTS.md`
 *     stay the source for *how* to produce each asset; this file is the
 *     source for *where it lives and what happens if it's missing*.
 *
 * `replacementStatus`:
 *   - 'campaign'   → intentionally temporary. Non-product atmospheric
 *                    media (silhouettes, landscape, texture, architecture)
 *                    standing in until Drop 001 photography exists. Fine
 *                    to ship at launch.
 *   - 'product'    → must be replaced with real Drop 001 photography/film
 *                    before that specific product is considered final.
 *                    Never customer-facing as "temporary" — just genuinely
 *                    swapped later, same as any brand refreshing imagery.
 *
 * Every entry's `fallback` variant maps to a composition in
 * `src/components/ui/CinematicPlaceholder.tsx` — never a plain black box.
 */

export type AssetEntry = {
  purpose: string;
  desktopPath: string;
  mobilePath?: string;
  posterPath?: string;
  aspectRatio: string;
  fallback: 'hero' | 'campaign' | 'product' | 'lookbook' | 'fabric' | 'manifesto';
  placement: string;
  replacementStatus: 'campaign' | 'product';
};

export const assetManifest = {
 heroFilm: {
  purpose: 'Homepage hero — full-screen atmospheric fashion film',
  desktopPath: 'videos/hero-desktop.mp4',
  mobilePath: 'videos/hero-desktop.mp4',
  posterPath: 'images/hero-poster-desktop.jpg',
  aspectRatio: '16:9 (desktop) / 9:16 (mobile)',
  fallback: 'hero',
  placement: 'Homepage — Hero.tsx, full viewport height',
  replacementStatus: 'campaign',
},
  firstTransmissionStill: {
    purpose: 'Campaign still introducing Drop 001',
    desktopPath: 'images/first-transmission.png',
    aspectRatio: '4:5',
    fallback: 'campaign',
    placement: 'Homepage — FirstTransmission.tsx, left column',
    replacementStatus: 'campaign',
  },
  lunarLoop: {
    purpose: 'Ambient looping lunar/planetary atmosphere, no figure',
    desktopPath: 'videos/lunar-loop.mp4',
    posterPath: 'images/lunar-loop-poster.jpg',
    aspectRatio: '16:9',
    fallback: 'manifesto',
    placement: 'Homepage — LunaroWorld.tsx, manifesto section backdrop',
    replacementStatus: 'campaign',
  },
  fabricMacro: {
    purpose: 'Fabric weave/construction macro texture, no garment graphic',
   desktopPath: 'images/fabric-macro.png',
    aspectRatio: '1:1',
    fallback: 'fabric',
    placement: 'Homepage — GarmentDetails.tsx, right column',
    replacementStatus: 'campaign',
  },
  aboutManifesto: {
    purpose: 'Distant silhouette / scale composition for the About manifesto',
    desktopPath: 'images/about-manifesto.png',
    aspectRatio: '4:5',
    fallback: 'manifesto',
    placement: 'About page — left column',
    replacementStatus: 'campaign',
  },
 lookbookPreview: [
  { index: 1, desktopPath: 'images/lookbook/arrival.png' },
  { index: 2, desktopPath: 'images/lookbook/presence.png' },
  { index: 3, desktopPath: 'images/lookbook/quiet-weight.png' },
],
 lookbookFull: [
  {
    index: 1,
    desktopPath: 'images/lookbook-01.jpg',
    caption: 'Look 01 — Orbit',
    shopHandle: 'first-transmission-oversized-tee',
    status: 'available',
  },
  {
    index: 2,
    desktopPath: 'images/lookbook-02.jpg',
    caption: 'Look 02 — Eclipse',
    shopHandle: '',
    status: 'coming-soon',
  },
  {
    index: 3,
    desktopPath: 'images/lookbook-03.jpg',
    caption: 'Look 03 — Void',
    shopHandle: '',
    status: 'coming-soon',
  },
  {
    index: 4,
    desktopPath: 'images/lookbook-04.jpg',
    caption: 'Look 04 — Archive',
    shopHandle: '',
    status: 'coming-soon',
  },
],
  favicon: {
    purpose: 'Browser tab icon',
    desktopPath: 'favicon.ico',
    aspectRatio: '1:1',
    fallback: 'manifesto',
    placement: 'layout.tsx metadata',
    replacementStatus: 'campaign',
  },
  ogDefault: {
    purpose: 'Default social share preview image',
    desktopPath: 'og/lunaro-default.jpg',
    aspectRatio: '1.91:1',
    fallback: 'campaign',
    placement: 'lib/config.ts → seoDefaults.ogImage',
    replacementStatus: 'campaign',
  },
} as const;

/**
 * Generation log — every asset actually produced via Higgsfield so far,
 * with its source URL for manual download (see README "Asset production
 * status" for why this sandbox can't place the file automatically).
 * Remove an entry once its file has been placed in /public and committed.
 */
export const generationLog = [
  {
    manifestKey: 'heroFilm',
    model: 'seedance_2_0',
    format: '16:9, 8s, 720p, fast, silent',
    generatedAt: '2026-07-24',
    sourceUrl:
      'https://d8j0ntlcm91z4.cloudfront.net/user_3GvIQvWOO1N0C6VJSv8AC9oKdLb/hf_20260724_115452_32e57cdd-db18-4439-bd4d-5d6c8d02d090.mp4',
    savePath: 'public/videos/hero-desktop.mp4',
  },
  {
    manifestKey: 'firstTransmissionStill',
    model: 'soul_2',
    format: '3:4, 2K',
    generatedAt: '2026-07-24',
    sourceUrl:
      'https://d8j0ntlcm91z4.cloudfront.net/user_3GvIQvWOO1N0C6VJSv8AC9oKdLb/hf_20260724_113550_56875168-ee90-4456-b58b-72c5d725feeb.png',
    savePath: 'public/images/first-transmission.png',
  },
  {
    manifestKey: 'lunarLoop',
    model: 'soul_2',
    format: '16:9, 2K (still — for poster; video loop not yet generated)',
    generatedAt: '2026-07-24',
    sourceUrl:
      'https://d8j0ntlcm91z4.cloudfront.net/user_3GvIQvWOO1N0C6VJSv8AC9oKdLb/hf_20260724_150950_8cea76c3-d3f6-45c7-acc0-df3c66312f97.png',
    savePath: 'public/images/lunar-loop-poster.jpg',
  },
  {
    manifestKey: 'fabricMacro',
    model: 'soul_2',
    format: '1:1, 2K',
    generatedAt: '2026-07-24',
    sourceUrl:
      'https://d8j0ntlcm91z4.cloudfront.net/user_3GvIQvWOO1N0C6VJSv8AC9oKdLb/hf_20260724_150955_d7a2647f-82bb-436d-863e-f9f881bef365.png',
    savePath: 'public/images/fabric-macro.jpg',
  },
  {
    manifestKey: 'aboutManifesto',
    model: 'soul_2',
    format: '3:4, 2K',
    generatedAt: '2026-07-24',
    sourceUrl:
      'https://d8j0ntlcm91z4.cloudfront.net/user_3GvIQvWOO1N0C6VJSv8AC9oKdLb/hf_20260724_151003_2031ebfa-d4bb-48cc-9d66-d58cf8bc95cf.png',
    savePath: 'public/images/about-manifesto.jpg',
  },
] as const;
