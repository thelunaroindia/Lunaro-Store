# LUNARO — Storefront

A headless Shopify storefront for **LUNARO** (premium oversized streetwear, India). This repository is the **frontend only** — Shopify is the commerce backend, Shiprocket handles fulfilment, and the whole thing is meant to run on Vercel behind the `lunaro.in` domain (registered at GoDaddy).

```
Next.js (this repo) ──Storefront API──> Shopify ──sync──> Shiprocket ──> Courier
        │
        └── Vercel (hosting) ── GoDaddy (DNS)
```

## What is actually implemented

Everything in this codebase is real, working code — not a mockup:

- **Live Shopify data**: products, collections, and the Transmissions blog are fetched from the Storefront API (`src/lib/shopify.ts`). Nothing is hardcoded permanently — placeholders only appear when Shopify isn't configured yet, and every placeholder is visually marked (`REPLACE WITH SHOPIFY DATA`) rather than disguised as real content.
- **Real cart**: add to cart, update quantity, remove, apply discount code — all call the Shopify Cart API via server actions (`src/actions/cart.ts`) and hand off to Shopify's own checkout (`cart.checkoutUrl`). LUNARO does not run its own checkout.
- **Real contact form**: posts to `/api/contact`, which sends an email via Resend once `RESEND_API_KEY` is set. Until then it fails loudly (503 + a clear message) instead of pretending to succeed.
- **Real order tracking**: `/track-order` calls a server-only route that queries the Shopify Admin API (read-only `read_orders` scope) for order status and tracking numbers.
- **Wishlist**: persisted client-side (localStorage) since it doesn't need to be a Shopify concept.

## What still needs your credentials

None of the following can be turned on without your accounts — see the linked guide for each:

| Needs | Guide |
|---|---|
| Shopify store, Storefront token, products, collections, blog | `docs/SHOPIFY_SETUP.md` |
| Shiprocket ↔ Shopify shipping sync | `docs/SHIPROCKET_SETUP.md` |
| Vercel hosting + GoDaddy domain (`lunaro.in`) | `docs/DEPLOYMENT.md` |
| Resend (contact form email) | `docs/DEPLOYMENT.md` |
| Higgsfield cinematic video/image assets | `docs/HIGGSFIELD_PROMPTS.md` |
| Owner's day-to-day store management | `docs/OWNER_ADMIN_GUIDE.md` |

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in real values — see docs/SHOPIFY_SETUP.md
npm run dev
```

The site runs and looks complete even with an empty `.env.local` — every page falls back to clearly-marked placeholder content so you can review the design before connecting Shopify.

## Design system

All colour, type and spacing values live in one place — `tailwind.config.ts` — so nothing is hardcoded per-component:

- **Colour**: Obsidian `#050505`, Deep Black `#0A0A0A`, Charcoal `#151515`, Graphite `#242424`, Lunar White `#F2F0EB`, Soft Grey `#A7A7A7`, Metallic Silver `#BFC2C7`, Warm Editorial White `#E8E4DC`.
- **Type**: Bodoni Moda (display/headlines, a Didone serif in the fashion-editorial tradition) + Space Grotesk (interface/commerce — prices, labels, forms). Loaded via `next/font/google`, self-hosted at build time (no runtime Google Fonts request, no layout shift).
- **Signature motif**: the "lunar terminator" — a thin silver gradient line (`.terminator` in `globals.css`) used as LUNARO's divider instead of a plain hairline, echoing the light/dark boundary on the moon and tying back to "Crafted in Darkness."
- **Motion**: slow, restrained, mask/opacity based (`tailwind.config.ts` → `keyframes`). Every animation respects `prefers-reduced-motion` (see the media query at the bottom of `globals.css`).

## Central configuration

`src/lib/config.ts` holds every brand fact that could change — nav labels, contact details, policy copy, FAQ, size chart, SEO defaults. Update copy there, not inside components.

## Project structure

```
src/
  lib/          Shopify client, GraphQL queries, config, types, utils
  actions/      Server actions (cart mutations)
  context/      Cart drawer UI state, wishlist
  components/   layout / home / product / shop / cart / forms / ui
  app/          Next.js App Router — one folder per route
docs/           Every setup & deployment guide referenced above
```

## Testing

See `docs/TESTING_CHECKLIST.md` before every launch or major release.

## A note on scope

This is a genuinely production-capable storefront, but three things are true at once:

1. The **code** is complete and functional for every page listed in the original brief.
2. It **cannot go live** until you complete the manual steps that require your own accounts (Shopify, Shiprocket, GoDaddy, Vercel, Resend, Higgsfield) — no one else can do that part, including this codebase.
3. Final visual polish (real product photography, final Higgsfield-generated film, final pricing/copy) should replace the marked placeholders before launch.
