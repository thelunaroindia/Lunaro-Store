# Deployment Guide — Vercel + GoDaddy

## 1. Push this repository to a Git provider

Vercel deploys from Git (GitHub, GitLab, or Bitbucket). Push this repo there first if it isn't already.

## 2. Import into Vercel

1. vercel.com → **Add New → Project** → import the repository.
2. Framework preset: Vercel auto-detects **Next.js** — leave build command as `next build` and output as default.
3. Before the first deploy, add environment variables (below) so the build doesn't run against an empty config.

## 3. Environment variables

Vercel → Project → **Settings → Environment Variables**. Add every variable from `.env.example` with real values, split by environment:

| Variable | Production | Preview |
|---|---|---|
| `SHOPIFY_STORE_DOMAIN` | ✅ | ✅ (same store, or a duplicate dev store) |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | ✅ | ✅ |
| `SHOPIFY_API_VERSION` | ✅ | ✅ |
| `SHOPIFY_ADMIN_API_TOKEN` | ✅ | optional |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` / `_URL` | ✅ (once enabled) | optional |
| `NEXT_PUBLIC_SITE_URL` | `https://lunaro.in` | leave as preview URL or unset |
| `NEXT_PUBLIC_INSTAGRAM_URL` | ✅ | ✅ |
| `RESEND_API_KEY`, `CONTACT_FORM_TO_EMAIL` | ✅ | optional |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_META_PIXEL_ID` | ✅ (once created — see below) | leave blank |

Never mark `SHOPIFY_ADMIN_API_TOKEN` or any non-`NEXT_PUBLIC_` variable as available to the client — Vercel only exposes `NEXT_PUBLIC_`-prefixed variables to the browser, but double-check this in Settings before launch.

## 4. Add the GoDaddy domain

1. Vercel → Project → **Settings → Domains → Add** → enter `lunaro.in`.
2. Vercel shows the exact DNS records it needs. As of writing, for an apex/root domain this is typically:
   - **A record**: `@` → `76.76.21.21` (Vercel's anycast IP — always use the exact value Vercel's UI shows you, since this can change)
   - **CNAME**: `www` → `cname.vercel-dns.com`
3. Log into **GoDaddy → My Products → DNS** for `lunaro.in` and add/edit those records to match exactly what Vercel displayed.
4. Add `www.lunaro.in` as a second domain in Vercel and set it to **redirect to** `lunaro.in` (Vercel's domain settings have a "Redirect to" toggle) — this satisfies the "www redirects to root" requirement without any application code.
5. DNS propagation can take a few minutes to a few hours. Vercel's domain screen shows a live "Valid Configuration" check.

## 5. SSL

Vercel automatically provisions and renews a Let's Encrypt SSL certificate for both `lunaro.in` and `www.lunaro.in` once DNS is verified — no action needed. Confirm the padlock shows in-browser for both, and that `http://` requests redirect to `https://` (Vercel does this by default).

## 6. Prevent preview deployments from being indexed

- `next.config.mjs` already sends `X-Robots-Tag: noindex, nofollow` to any host that isn't `lunaro.in` (see the `headers()` function).
- Additionally, enable Vercel's **Deployment Protection** (Project → Settings → Deployment Protection → Vercel Authentication) for Preview deployments, so preview URLs require a Vercel login to view at all — the strongest protection against accidental indexing or leaked pre-launch content.

## 7. Contact form email (Resend)

1. Sign up at resend.com, verify a sending domain (e.g. `lunaro.in` or a subdomain like `mail.lunaro.in`) by adding the DNS records Resend provides — again in GoDaddy → DNS.
2. Create an API key → add as `RESEND_API_KEY` in Vercel.
3. Set `CONTACT_FORM_TO_EMAIL` to where messages should land (defaults to the contact email in `src/lib/config.ts` if unset).
4. If you'd rather use a different provider (SendGrid, Postmark), swap the fetch call in `src/app/api/contact/route.ts` — the rest of the form is provider-agnostic.

## 8. Newsletter provider

`src/app/api/newsletter/route.ts` is a stub until you pick a provider. Klaviyo is the most common choice for Shopify DTC brands and has a native Shopify integration; Shopify Email is a simpler built-in alternative. Once chosen, set `NEWSLETTER_PROVIDER` and fill in the subscribe call in that route.

## 9. Test production checkout end-to-end

1. Deploy to production.
2. Enable Shopify's **Bogus Gateway** test mode (Admin → Settings → Payments) or use a real ₹1 test product.
3. Add to cart on `https://lunaro.in`, proceed through Shopify's checkout, complete payment.
4. Confirm the order lands in Shopify Admin **and** syncs to Shiprocket (see `docs/SHIPROCKET_SETUP.md` step 6).
5. Turn off test mode before real launch.

## 10. Rolling back a failed deployment

Vercel → Project → **Deployments** → find the last known-good deployment → **⋯ menu → Promote to Production**. This is instant and doesn't require a new Git push — useful if a bad deploy needs to be undone immediately while you fix the underlying issue.

## 11. Analytics

- **Google Analytics**: create a GA4 property, add the Measurement ID as `NEXT_PUBLIC_GA_MEASUREMENT_ID`, then wire up the GA script (e.g. via `@next/third-parties/google`'s `GoogleAnalytics` component in `src/app/layout.tsx`) once you're ready — not added by default so no placeholder tracking ID ships to production by accident.
- **Google Search Console**: verify `lunaro.in` via the DNS TXT record method (add in GoDaddy DNS) once the domain is live.
- **Meta Pixel**: same pattern as GA — add `NEXT_PUBLIC_META_PIXEL_ID` and wire in the pixel script when ready.
- Event names to wire up once a provider is chosen: product view, collection view, search, add-to-cart, wishlist add, begin checkout (fires when the user clicks "Checkout" — see `CartDrawer.tsx` and `CartPageClient.tsx`), purchase (requires a Shopify order-confirmation webhook or the `checkout.completed` pixel, since checkout itself happens on Shopify's domain), contact form submit, newsletter signup.
