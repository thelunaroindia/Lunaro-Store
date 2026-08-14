# Shopify Setup Guide

Shopify is the commerce backend for LUNARO. This guide gets a store from empty to feeding real data into the frontend in this repo.

## 1. Create the store

1. Go to shopify.com → start a free trial → choose a plan once ready to sell (Basic is enough to start).
2. Store name: LUNARO. You'll get a `*.myshopify.com` domain — this is your `SHOPIFY_STORE_DOMAIN`, **not** `lunaro.in` (the custom domain is connected later, see `docs/DEPLOYMENT.md`).
3. Settings → General: set the store address to your business location, currency to INR.

## 2. Create the Storefront API access token

The frontend reads products/collections and manages carts through the **Storefront API**, which uses a public-safe token (read + cart-write only, no admin access).

1. Shopify Admin → **Settings → Apps and sales channels → Develop apps**.
2. Click **Allow custom app development** if this is the first custom app on the store.
3. **Create an app** → name it `LUNARO Storefront`.
4. Under **Configuration → Storefront API**, select scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_collection_listings`
   - `unauthenticated_write_checkouts` / `unauthenticated_read_checkouts` (cart)
   - `unauthenticated_read_content` (needed for the Transmissions blog)
5. **Install app**, then copy the **Storefront API access token**.
6. Put it in `.env.local`:
   ```
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_xxxxxxxx
   SHOPIFY_API_VERSION=2024-10
   ```

Check the current supported version at any time: Admin → Settings → Apps and sales channels → Develop apps → your app → API version, or the [Shopify API version changelog](https://shopify.dev/docs/api/usage/versioning). Storefront API versions are released quarterly (e.g. `2024-10`, `2025-01`) — update this env var when you upgrade, don't leave an expired version in production.

## 3. Create a read-only Dev Dashboard app for order lookups

`/track-order` and `/order-confirmation` need the **Admin API** (Storefront can't look up orders by number/email or verify a phone against an order) — handled by `src/lib/shopifyAdmin.ts`. Keep this app as narrowly scoped as possible.

Dev Dashboard apps for a store you own don't issue a permanent static Admin API token — they authenticate via the **OAuth client credentials grant**, so this app hands you a Client ID/Secret instead of a token, and `src/lib/shopifyAdmin.ts` exchanges them for a short-lived access token itself at request time (cached in memory, refreshed automatically before it expires).

1. [Shopify Dev Dashboard](https://dev.shopify.com/dashboard) → create an app (e.g. `LUNARO Order Verification`) → install it on `lunaro-9855.myshopify.com` (or your store's domain).
2. Admin API scopes: `read_orders` **only**. Do not add `write_orders`, `read_customers`, or any other scope unless a specific feature genuinely needs it.
3. From the app's API credentials, copy the **Client ID** and **Client secret** into:
   ```
   SHOPIFY_ADMIN_CLIENT_ID=
   SHOPIFY_ADMIN_CLIENT_SECRET=
   ```
4. Both variables must never be prefixed `NEXT_PUBLIC_` — they're read only inside `src/lib/shopifyAdmin.ts` (server-side), which is the sole place either credential, or any access token derived from them, ever exists.

## 4. Add products

Admin → **Products → Add product**. For each of the four launch tees:

- Title, description (can start from the placeholder story text in `src/lib/config.ts` → `placeholderProducts`)
- Images: front, back, artwork close-up, fabric close-up, on-body shot (the product page gallery shows all images you upload, in order)
- Variants: enable **Size** (S/M/L/XL/XXL) and **Colour** options
- Price: ₹1,199 (or your final price)
- Inventory: track quantity, set stock per size
- Tag the four launch products `drop:001` — this tag powers the `/new-drop` page (`src/app/new-drop/page.tsx`)
- Tag any deliberately limited product `limited` — this shows the "Limited Drop" badge on product cards

## 5. Create collections

Admin → **Products → Collections → Create collection**. Use automated collections with a tag condition (e.g. `product_type = T-Shirt`) so new products slot in without manual re-curation. The collection `handle` Shopify generates is what appears in the URL — `/collections/<handle>` — so keep handles clean (Shopify does this automatically from the title).

## 6. Set up the Transmissions blog

Transmissions is a **real Shopify blog**, not a custom CMS — this keeps the "owner never edits frontend code" promise.

1. Admin → **Online Store → Blog posts → Manage blogs → Add blog**.
2. Title it so the **handle** is exactly `transmissions` (Shopify auto-generates the handle from the title — check it under the blog's settings and adjust if needed, since the frontend queries this handle directly in `src/lib/shopify.ts`).
3. Add posts as normal blog posts — title, image, content. They appear on `/transmissions` automatically.

## 7. Customer Accounts (optional, for `/account`)

LUNARO uses Shopify's **hosted Customer Account API** rather than a custom login form (Shopify handles passwords, sessions and MFA). To enable:

1. Admin → **Settings → Customer accounts** → switch to "New customer accounts."
2. Admin → **Settings → Apps and sales channels → Develop apps** → your app → **Customer Account API** → note the Client ID and the account URL.
3. Add to `.env.local`:
   ```
   SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=
   SHOPIFY_CUSTOMER_ACCOUNT_URL=
   ```
4. Until this is set, `/account` shows an honest "not configured yet" state rather than a fake login form.

## 8. Discount codes

Admin → **Discounts → Create discount**. Any code you create here works immediately with the cart's "Apply" field (`src/actions/cart.ts` → `applyDiscount`) — no frontend change needed.

## 10. Payment experience — Pay Online

Launch keeps a single, honest payment route: **Pay Online** via Shopify's own hosted checkout (Add to Cart / Buy Now → `cart.checkoutUrl`). Whatever methods you enable in **Shopify Admin → Settings → Payments** — UPI, credit/debit cards, net banking, wallets via your payment gateway (Razorpay and PayU are the two most common India-first Shopify gateways) — appear there automatically. Nothing in this repo needs to change as you add or remove methods; the product page and cart both list the method names from `src/lib/config.ts` → `payments.methods` purely as reassurance copy, not as a claim about what's live — update that array if your gateway's actual method set differs.

Cash on delivery and any partial/deposit payment flow were deliberately left out of this launch build — Shopify's standard checkout doesn't support splitting one purchase into a deposit + balance without Shopify Plus or a dedicated deposit app, and rather than fake that experience, it's simply not offered yet. If you want a "reserve with a deposit" flow in the future, install a deposit app (or upgrade to Shopify Plus) first, then add the corresponding UI — don't build the frontend for it before the backend can actually charge that way.

## 11. Verify the connection

```bash
npm run dev
```

Visit `/shop` — if products appear (instead of the four placeholder tees), the connection works. If you see a console error, double-check the token scopes in step 2.
