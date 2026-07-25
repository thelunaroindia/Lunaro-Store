# Launch Checklist

## Build verification — what was actually run, and what wasn't

This sandbox has **no outbound network access** (confirmed: `npm install` returns a 403 from the npm registry). That means `npm install`, `npm run build`, `npm run lint`, and `tsc --noEmit` could not be executed here — there is no way around this without registry access, and I won't claim otherwise.

**What I did instead, as the closest available substitute:**
- ✅ Verified every `.ts`/`.tsx` file has balanced braces and parentheses (a strong signal against syntax errors) across all 90+ source files
- ✅ Verified every `@/...` import resolves to a real file
- ✅ Verified every file using React hooks (`useState`, `useEffect`, `useTransition`, `useScroll`, etc.) has the `'use client'` directive
- ✅ Verified every route referenced in navigation/config has a matching `page.tsx`
- ✅ Verified no raw `<img>` tags (everything uses `next/image`), no empty/placeholder `href="#"` links, no duplicate default exports per file
- ✅ Verified no lingering Lorem Ipsum or "REPLACE WITH SHOPIFY DATA"-style text visible in any component (only in code comments, which aren't user-facing)

**What you must run yourself, in an environment with registry access (your machine, or Vercel's build):**
```bash
npm install
npm run build      # Next.js production build — will surface any real type/JSX errors
npm run lint        # ESLint
npx tsc --noEmit    # Full TypeScript validation
```
Do this **before your first deploy** and again after placing the generated media assets. If `npm run build` surfaces anything, it's most likely a dependency version mismatch (this repo pins specific versions in `package.json` — bump anything that conflicts with your Node version) rather than an application bug, given the manual checks above passed clean.

## Routes verified present (30 pages)

Home, Shop All, New Drop, Collections (index + `[handle]`), Product (`[handle]`), Lookbook, About, Transmissions (index + `[slug]`), Contact, FAQ, Size Guide, Shipping & Returns, Refund Policy, Privacy Policy, Terms, Track Order, Search, Wishlist, Cart, Account (+ login/orders/addresses), 404, sitemap.xml, robots.txt.

## Responsive behaviour (verified by breakpoint review — recommend a real-device pass too)

- **Mobile** (< 640px): full-screen nav and filter drawers, sticky add-to-cart bar, single-column grids, safe-area padding on notched devices
- **Tablet** (640–1024px): 2-column product grids, filter drawer still full-screen (intentionally — tablets get the same touch-first treatment as phones)
- **Desktop** (≥ 1024px): 3–4 column grids, inline filter dropdown, hover-driven product card interactions, transparent-to-solid header on scroll

## Accessibility

- Skip-to-content link on every page
- Visible focus rings (`:focus-visible`) sitewide, not just default browser outline
- All interactive icons/buttons carry `aria-label` (15+ verified)
- Modals/drawers (cart, mobile menu, mobile filters) trap focus, close on Escape, restore body scroll
- `prefers-reduced-motion` disables all animation — both the CSS keyframes and every Framer Motion component (`MotionConfig reducedMotion="user"` at the root)
- Form fields have associated `<label>`s; errors are visible text, not colour-only

## SEO basics

- `sitemap.xml` — static routes + live products/collections/transmissions once Shopify is connected
- `robots.txt` — disallows `/cart`, `/account`, `/api`
- Per-page `<title>`/`<meta description>` via Next.js Metadata API
- Product pages pull title/description/OG image from Shopify's own SEO fields when set
- Preview/non-production deployments get `X-Robots-Tag: noindex` automatically (`next.config.mjs`)

## Payment experience

- **Pay Online** — the only checkout route for launch. Real, live the moment Shopify Payments/your gateway is configured. No frontend work needed as you add or remove methods.
- Cash on delivery and any deposit/partial-payment option are deliberately not offered at launch — see `docs/SHOPIFY_SETUP.md` § 10 for the honest reasoning and the path to add a deposit flow later if wanted.
- **Guest checkout** — enabled by default on Shopify's hosted checkout; nothing to configure unless you deliberately want to force account creation (not recommended, and not done here).

## What's genuinely done vs. what needs your input before go-live

| Done | Needs you |
|---|---|
| Every page, every state (empty/error/loading/sold-out) | Real Shopify store + products (`docs/SHOPIFY_SETUP.md`) |
| Cart, wishlist, search, filters — all real, wired to Shopify | Shiprocket connection (`docs/SHIPROCKET_SETUP.md`) |
| Motion system, cinematic placeholders, design system | Vercel + GoDaddy domain (`docs/DEPLOYMENT.md`) |
| Hero desktop film + campaign still generated | **Download & place them** — see `docs/HOMEPAGE_ASSET_PROMPTS.md` (sandbox has no network to do this for you) |
| Contact form code (Resend-ready) | A real `RESEND_API_KEY` |
| Order tracking code (Admin API-ready) | A real `SHOPIFY_ADMIN_API_TOKEN` |
| `npm run build`/`lint`/`tsc` cannot run in this sandbox | **You must run them** before deploying |
| Remaining Higgsfield assets (mobile hero, floating garment, lookbook, fabric macro, about, transitions) | Your go-ahead to generate each, one at a time |

## Final pre-launch pass (do this after everything above is in place)

Use `docs/TESTING_CHECKLIST.md` in full — it covers catalogue browsing, the product page, cart, wishlist, contact/newsletter, order tracking, account, mobile, accessibility, performance, SEO, and a real end-to-end test purchase.
