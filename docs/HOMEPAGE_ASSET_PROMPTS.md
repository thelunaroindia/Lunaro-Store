# Homepage Asset Prompt Pack — For Review

This is the curated subset of `docs/HIGGSFIELD_PROMPTS.md` needed to finish the homepage specifically, pulled together for review before anything is generated. **Nothing has been generated yet** — this is the prompt + placement to approve first.

Every item below already has a live, on-brand stand-in built entirely in CSS/SVG (`src/components/ui/CinematicPlaceholder.tsx`), so the homepage looks intentional today and simply upgrades in place — no code changes needed on generation day beyond dropping the file at the given path.

**Live status now lives in `src/lib/assetManifest.ts`** (`generationLog`) — this doc still holds the prompts and reasoning, but check the manifest for the current source-of-truth status and download URLs.

---

## 1 — Homepage hero film ✅ DESKTOP GENERATED — awaiting file placement
**Replaces:** the `variant="hero"` composition behind the hero copy in `src/components/home/Hero.tsx`
**Full prompt:** `docs/HIGGSFIELD_PROMPTS.md` → **#1** (desktop, 16:9) and **#2** (mobile, 9:16 — not yet generated)
**File paths:** `/public/videos/hero-desktop.mp4`, `/public/videos/hero-mobile.mp4` + poster stills at `/public/images/hero-poster-desktop.jpg` / `-mobile.jpg`
**Status:** desktop cut generated via Seedance 2.0 (model `seedance_2_0`, 16:9, 8s, 720p, fast mode, silent). `Hero.tsx` already fades this video in over the CSS placeholder the instant the file exists at the path above (`onLoadedData` → opacity transition) — no code change needed, just place the file. Download it and save as `/public/videos/hero-desktop.mp4`:
`https://d8j0ntlcm91z4.cloudfront.net/user_3GvIQvWOO1N0C6VJSv8AC9oKdLb/hf_20260724_115452_32e57cdd-db18-4439-bd4d-5d6c8d02d090.mp4`
A poster frame (export any still from the clip) should also go to `/public/images/hero-poster-desktop.jpg` so the very first paint isn't blank while the video buffers.

> Model on an abstract black lunar landscape in a premium oversized LUNARO tee, slow push-in, single soft directional light, deep controlled shadow, fine drifting dust, distant low horizon light.

**Why this one first:** it's full-screen and above the fold — the single highest-impact asset on the entire site.

---

## 2 — First campaign still ✅ GENERATED — awaiting file placement
**Replaces:** the `variant="campaign"` composition in `src/components/home/FirstTransmission.tsx` ("The First Transmission" section, right under the hero)
**Full prompt:** `docs/HIGGSFIELD_PROMPTS.md` → **#15** (new this pass)
**File path:** `/public/images/first-transmission.png` — the component already auto-detects this file via `hasPublicAsset()` (`src/lib/assets.ts`) and swaps in the real image the instant it exists; no code edit needed.
**Status:** generated via Higgsfield Soul 2.0 (model `soul_2`, 3:4, 2K). Sandbox has no outbound network access to download it directly into this repo — download it yourself from the generation and save it at the path above:
`https://d8j0ntlcm91z4.cloudfront.net/user_3GvIQvWOO1N0C6VJSv8AC9oKdLb/hf_20260724_113550_56875168-ee90-4456-b58b-72c5d725feeb.png`

> Closer, more product-forward than the hero: three-quarter turn toward camera, garment lit to show drape and oversized fit clearly, soft-focus abstract dark background.

**Why this one:** it's the first product-specific image a visitor sees, directly beside the "Drop 001" copy and price.

---

## 3 — Floating garment sequence
**Replaces:** the suspended-fabric SVG shape currently floating inside the hero composition (`HeroComposition()` in `CinematicPlaceholder.tsx`) — could also run as its own short interlude between sections if it turns out too strong to bury in the hero background
**Full prompt:** `docs/HIGGSFIELD_PROMPTS.md` → **#16** (new this pass)
**File path:** `/public/videos/floating-garment.mp4` (wire into `Hero.tsx` as an additional layered `<video>`, same fade-in-on-load pattern already used for the main hero film)

> A single garment, unworn, suspended and rotating almost imperceptibly in darkness, lit by a slow-moving single light source, fine dust at multiple depths for parallax. No visible rig — must read as weightless.

**Why this one:** this is the shot that turns the hero from "photo with a model" into "cinematic, dimensional, atmospheric" — it's the closest thing to the brief's request for "suspended fabric or garment movement."

---

## 4 — Lookbook visuals (4 looks)
**Replaces:** the four `variant="lookbook"` compositions in `src/app/lookbook/page.tsx` (`looks` array) and the three homepage preview stills in `src/components/home/LookbookPreview.tsx`
**Full prompt:** `docs/HIGGSFIELD_PROMPTS.md` → **#8**
**File paths:** `/public/images/lookbook-01.jpg` … `-04.jpg` (full lookbook) and `/public/images/lookbook-preview-1.jpg` … `-3.jpg` (homepage teaser, can reuse three of the four full looks rather than shooting separately)

> Full-length editorial portrait per look (Orbit / Eclipse / Void / Archive), same lighting rig and camera height across all four for a coherent set, minimal architectural void background.

**Why this one:** completes the homepage's "Editorial" section and the standalone Lookbook page in one shoot.

---

## 5 — Transition shots
**Replaces:** nothing visual directly (there's no placeholder for this today) — this is a short bridge clip for the scroll transition out of the hero, per the original brief's "Scroll transition" spec
**Full prompt:** `docs/HIGGSFIELD_PROMPTS.md` → **#7**
**File path:** would need a small new `<video>` layer added to `Hero.tsx`'s bottom edge, or handled as a CSS cross-dissolve (current approach) until this exists

> The hero's landscape darkens and the model's silhouette fades to black, cross-dissolving into pure obsidian — an authored bridge into "The First Transmission" rather than an abrupt cut.

**Why this one is lowest priority of the five:** the current CSS gradient fade (`bg-gradient-to-t from-obsidian ...` in `Hero.tsx`) already does this reasonably well without video. Worth doing once the other four are live, not before.

---

## 6 — Fabric macro ✅ GENERATED — awaiting file placement
**Replaces:** the `variant="fabric"` composition in `src/components/home/GarmentDetails.tsx`
**Full prompt:** `docs/HIGGSFIELD_PROMPTS.md` → **#5**
**File path:** `/public/images/fabric-macro.jpg` — see `assetManifest.ts` → `generationLog` for the download URL.

## 7 — Lunar loop poster ✅ GENERATED (still only) — awaiting file placement
**Replaces:** the `variant="manifesto"` composition in `src/components/home/LunaroWorld.tsx`
**Full prompt:** `docs/HIGGSFIELD_PROMPTS.md` → **#4** (a still stand-in for the poster; the looping video itself is not yet generated)
**File path:** `/public/images/lunar-loop-poster.jpg` — see `assetManifest.ts` → `generationLog` for the download URL.

## 8 — About manifesto ✅ GENERATED — awaiting file placement
**Replaces:** the `variant="manifesto"` composition on the About page
**Full prompt:** `docs/HIGGSFIELD_PROMPTS.md` → **#9**
**File path:** `/public/images/about-manifesto.jpg` — see `assetManifest.ts` → `generationLog` for the download URL.

---

## Suggested generation order

1. ✅ Hero film desktop (#1) — generated, awaiting file placement. Mobile cut (#2) still pending.
2. Floating garment sequence (#16) — biggest remaining jump in "cinematic" feel
3. Lookbook set (#8) — reused across two pages
4. ✅ First campaign still (#15) — generated, awaiting file placement
5. Transition shot (#7) — polish, not essential
6. ✅ Fabric macro (#5) — generated, awaiting file placement
7. ✅ Lunar loop poster still (#4) — generated, awaiting file placement (looping video still pending)
8. ✅ About manifesto (#9) — generated, awaiting file placement

Say the word on any of the remaining items (one at a time or the whole set) and I'll generate them via Higgsfield and wire each into the exact file/line noted above.
