# Higgsfield Prompts — LUNARO Cinematic Assets

**For current generation status and download URLs, see `src/lib/assetManifest.ts` → `generationLog`.** This document holds the prompts and creative reasoning; the manifest holds what's actually been produced.

Every prompt below shares one art direction, repeated at the top of each prompt so generations stay consistent across a team or across sessions:

**Shared art direction (prepend or reference in every generation):**
> Luxury fashion editorial cinematography. Realistic premium fabric with natural drape and weight. Realistic human proportions and skin texture, no distortion in hands or faces. Premium oversized black streetwear as the hero garment. Colour palette restricted to obsidian black, charcoal, metallic silver and warm off-white — no neon, no purple-blue cosmic gradients, no saturated colour. Deep controlled shadow with soft single-direction highlight, similar to a single large diffused softbox. Subtle fine dust/particulate drifting in the air, not glowing or magical. Monumental, minimal architectural or landscape environments — scale communicated through emptiness, not clutter. Slow, controlled, weighty camera movement — no whip pans, no shake, no speed-ramping. High-end commercial fashion-campaign colour grading, slightly desaturated, deep blacks that retain shadow detail. The garment is the visual hero at all times.
>
> Avoid: cartoon or video-game rendering, cyberpunk neon, superhero-style suits, cheap sci-fi HUD/interface overlays, overly colourful fantasy planets, distorted hands/faces/garments, unstable or warped logos or graphics, invented text inside the video, inconsistent models between shots, unnatural fabric physics, any third-party logos.

Where a garment's exact printed artwork must be legible, use a **real photographed product**, not an AI-generated approximation of the print — AI video/image models cannot reliably reproduce specific graphic artwork or text. Reserve Higgsfield generation for the model, environment, camera movement and atmosphere; composite or shoot the real garment in where the artwork itself needs to be accurate.

---

### 1. Homepage hero fashion film (desktop) ✅ GENERATED
**Use:** `src/components/home/Hero.tsx` → `/videos/hero-desktop.mp4`
**Format:** 16:9 landscape, 8–12s seamless loop, 1920×1080 minimum
> [Shared art direction.] A single fashion model stands center-frame on an abstract black lunar landscape — fine obsidian dust, distant low-angle planetary light source at the horizon, monumental dark rock formations far in the background suggesting massive scale. The model wears a premium oversized black LUNARO T-shirt with visible fabric weight and drape, oversized fit through the shoulders and body. Camera holds a slow, almost imperceptible push-in over the full duration — no cuts. Fabric moves gently as if in a light, slow wind. The model's stance is confident, still, facing slightly off-camera. Lighting is a single soft directional source from upper camera-left, leaving the opposite side of the model and the landscape in deep, detailed shadow.

### 2. Mobile portrait hero film
**Use:** `Hero.tsx` → `/videos/hero-mobile.mp4`
**Format:** 9:16 portrait, 8–12s loop, 1080×1920 minimum
> Same scene, model and direction as prompt #1, reframed and re-composed for a vertical 9:16 frame — the model fills more of the frame, environment is glimpsed at the top and bottom rather than wide either side. Camera movement is a slow vertical drift upward rather than a push-in, to suit the taller aspect ratio.

### 3. New-drop teaser
**Format:** 16:9 and 9:16 versions, 5–8s, built to end on a freeze-frame
> [Shared art direction.] Extreme close-up on fabric texture and a fragment of garment artwork, camera slowly pulling back to reveal the full LUNARO oversized tee on a model standing motionless in near-total darkness, lit only by a single hard-edged shaft of light crossing the frame diagonally (evoking a lunar terminator line). End on a still, symmetrical composition suitable for freezing as a teaser poster with text overlaid in the website UI (not baked into the video).

### 4. Atmospheric lunar loop ✅ STILL GENERATED (loop video pending)
**Use:** `src/components/home/LunaroWorld.tsx` → `/videos/lunar-loop.mp4`
**Format:** 16:9, 10–15s seamless loop, no model
> [Shared art direction, no human subject.] A wide, static-camera shot of an empty obsidian lunar landscape — fine dust drifting slowly across frame left to right, catching a single distant light source low on the horizon. Monumental dark rock silhouettes at the edges of frame for scale. No music-video energy — the mood is silence and stillness. Must loop seamlessly (first and last frame nearly identical).

### 5. Product macro fabric film ✅ GENERATED
**Use:** `src/components/home/GarmentDetails.tsx` → still frame at `/images/fabric-macro.jpg`
**Format:** 1:1 square, 5–8s, extractable still frame
> [Shared art direction.] Extreme macro shot of 260 GSM French Terry, camera moving in a slow, shallow-depth-of-field drift across the ribbed neckline seam and stitching detail. Lighting raked low across the fabric surface to emphasise texture and weave structure. No model, no colour outside the palette (black/charcoal fabric only, silver highlight from the raking light).

### 6. Product-detail campaign video template
**Use:** optional embed on `src/app/products/[handle]/page.tsx` gallery
**Format:** 4:5 portrait, 6–10s, one template per product/colourway
> [Shared art direction.] A model wearing [PRODUCT NAME] turns slowly a quarter-turn from front to three-quarter view against a plain obsidian studio backdrop with a single soft top-down light, allowing front and back graphic placement, drape and oversized silhouette to read clearly. No environment, no props — this is a studio-clean template, reused per product with only the garment changing.

### 7. Homepage transition video
**Use:** scroll transition between Hero and First Transmission section
**Format:** 16:9, 3–5s
> [Shared art direction.] The hero's lunar landscape composition slowly darkens and the model's silhouette fades to black as if consumed by shadow, cross-dissolving into pure obsidian — designed as a bridge clip so the homepage scroll transition feels authored rather than abrupt.

### 8. Lookbook fashion film
**Use:** `src/app/lookbook/page.tsx` background stills (extract frames) or embedded loop per look
**Format:** 4 x 4:5 portrait stills or short loops, one per look (Orbit, Eclipse, Void, Archive)
> [Shared art direction.] A full-length editorial portrait of a model wearing [LOOK NAME]'s garment, styled simply (dark trousers or matching tonal bottoms, no accessories that compete with the tee), standing in a minimal architectural void — a single dark monolithic wall or plane behind them for scale contrast. Each of the four looks uses the same lighting setup and camera height for visual consistency across the set; only pose and garment differ.

### 9. About-page manifesto visual ✅ GENERATED
**Use:** `src/app/about/page.tsx` → `/images/about-manifesto.jpg`
**Format:** 4:5 portrait, single still (or 5s loop, extract a still)
> [Shared art direction.] A distant, small human figure standing at the edge of a vast dark lunar plain, back to camera, facing a monumental dark horizon — composition emphasises scale and solitude over detail. This image represents ambition and the unknown rather than product; the garment should still be identifiable as LUNARO but is secondary to the sense of scale in this one shot.

### 10. Social launch teaser
**Format:** 9:16, 15s, designed to be watched muted with on-screen text added afterward in the website/social scheduler (not generated into the video)
> [Shared art direction.] A fast-paced but still controlled sequence (3–4 shots, each 3–4s, hard cuts not crossfades) cycling: macro fabric detail → model full-body reveal → close-up of the model's face turning toward camera → final freeze on the LUNARO product against black. Each shot individually follows the shared lighting/camera rules; the only "energy" comes from the cut pacing, not from fast camera movement within a shot.

### 11. Square social-media crop
**Format:** 1:1, derived from prompt #6's template by reframing, not re-generating
> Use the product-detail campaign film (#6), centre-cropped to 1:1 for Instagram grid posts. Regenerate only if the original composition doesn't survive a centre crop (e.g. if the full garment is cut off).

### 12. Vertical Instagram Reel version
**Format:** 9:16, derived from #3 or #10
> Reuse the New-Drop Teaser (#3) or Social Launch Teaser (#10) — both are already specified in formats suited to Reels/Shorts. Avoid generating a third redundant variant.

### 13. Product close-up motion loop
**Use:** subtle loop on hover/focus in the product gallery (optional enhancement to `ProductGallery.tsx`)
**Format:** 1:1 or 4:5, 3–5s seamless loop
> [Shared art direction.] Static camera, extreme close-up on the garment's chest print/artwork area, fabric moving almost imperceptibly as if from the model's breathing — the only motion in frame. No camera movement at all in this one; stillness is the point.

### 14. Packaging reveal film
**Use:** optional section near checkout/order-confirmation, or a future "Packaging" content block
**Format:** 4:5, 8–10s
> [Shared art direction, studio setting.] Overhead static camera on a dark surface. Hands (unbranded, no visible face) fold back matte black branded packaging paper to reveal the folded LUNARO garment inside, a garment-care card visible beside it. Lighting is a single soft overhead source. No upbeat unboxing-video energy — treat it with the same restraint as the rest of the brand.

### 15. First campaign still ✅ GENERATED
**Use:** `src/components/home/FirstTransmission.tsx` (currently a `CinematicPlaceholder`) — "The First Transmission" section
**Format:** 4:5 portrait, single still (or a 4–6s loop with a still exported from it)
> [Shared art direction.] A closer, more product-forward composition than the hero: the model stands three-quarter turned toward camera, garment lit to show the drape and oversized fit clearly, one hand relaxed at the side. Background is a soft-focus abstract dark plane — hinted lunar horizon rather than the hero's full landscape — so the frame reads as "campaign still," distinct from the wider hero shot rather than a crop of it. This is the image introducing Drop 001 specifically, so the garment should be the sharpest, most legible element in the whole set.

### 16. Floating garment sequence
**Use:** intended to eventually replace the CSS/SVG "suspended fabric" composition inside `CinematicPlaceholder` (`variant="hero"`) and/or as a standalone atmospheric interlude on the homepage
**Format:** 16:9, 6–10s seamless loop, no visible model
> [Shared art direction, no human subject.] A single LUNARO garment — folded or loosely draped, not worn — suspended in near-total darkness as if in zero gravity, rotating almost imperceptibly on its own axis. Fine dust drifts past in the foreground and background at different depths for parallax. A single soft directional light source sweeps slowly across the fabric over the duration of the loop, revealing texture and print placement as it passes rather than lighting the whole garment evenly. No visible rig, wire, or support — the garment must read as weightless, not "hung." This is the most restrained, painterly clip in the set: stillness and suspension are the entire point.

---

## Production notes

- **Desktop vs. mobile vs. social**: prompts #1/#2 and #11/#12 show the pattern — generate once for the primary format, then reframe/recrop rather than re-prompting from scratch, to keep the model and environment identical across formats.
- **Consistency across a shoot**: when generating multiple prompts that should feature the "same" model or environment (e.g. all four Lookbook looks, or the hero + New Drop teaser), carry over the same model description, environment description and lighting setup verbatim between prompts, changing only the specific action or framing.
- **Poster frames**: every video referenced above needs a corresponding static poster image (used in the `poster` attribute in `Hero.tsx` and `LunaroWorld.tsx`) — export a representative frame from each generation rather than commissioning it separately.
- **File delivery**: place final exports at the exact paths referenced in the code comments above (e.g. `/public/videos/hero-desktop.mp4`, `/public/images/fabric-macro.jpg`) so no component code needs to change once real assets exist.
