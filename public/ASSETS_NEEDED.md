# Assets Needed

The authoritative list now lives in code: **`src/lib/assetManifest.ts`** — every
asset's purpose, path, aspect ratio, fallback composition and page placement
in one typed object, plus a `generationLog` of everything already produced
via Higgsfield with its download URL.

## Status at a glance

| Asset | Status |
|---|---|
| Hero film (desktop) | ✅ generated — see `generationLog` in `assetManifest.ts` for the download URL |
| Hero film (mobile) | not yet generated |
| First Transmission campaign still | ✅ generated |
| Lunar loop (poster still) | ✅ generated — the looping *video* itself is still pending |
| Fabric macro | ✅ generated |
| About manifesto | ✅ generated |
| Lookbook (preview + full, 7 images total) | not yet generated |
| Favicon | not yet created |
| Default OG image | not yet created |

## Why generated assets aren't already sitting in this folder

This project was assembled in a sandboxed environment with no outbound
network access, so generated media could be produced via Higgsfield but not
downloaded into the repository automatically. Each `generationLog` entry has
the direct CDN URL — download it and save it at the `savePath` given, and
every component that references it (via `assetManifest.ts`) picks it up
immediately with no code change.

Product photography itself (front/back/detail/on-body per SKU) is uploaded
directly to each product in **Shopify Admin**, not into this folder.
