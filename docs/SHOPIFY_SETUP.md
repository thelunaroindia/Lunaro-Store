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

`/track-order` and `/order-confirmation` need the **Admin API** (Storefront can't look up orders by number/email or verify a phone against an order) — handled by `src/lib/shopifyAdmin.ts`. `/api/newsletter` reuses the same app for Shopify-customer-backed signups (see `docs/DEPLOYMENT.md` §8). Keep this app as narrowly scoped as possible — only what these features genuinely need.

Dev Dashboard apps for a store you own don't issue a permanent static Admin API token — they authenticate via the **OAuth client credentials grant**, so this app hands you a Client ID/Secret instead of a token, and `src/lib/shopifyAdmin.ts` exchanges them for a short-lived access token itself at request time (cached in memory, refreshed automatically before it expires).

1. [Shopify Dev Dashboard](https://dev.shopify.com/dashboard) → create an app (e.g. `LUNARO Order Verification`) → install it on `lunaro-9855.myshopify.com` (or your store's domain).
2. Admin API scopes: `read_orders` (order lookups), `write_customers` and `read_customers` (newsletter signup — creating/updating customers and looking up existing ones to repair tag/consent state on resignup). Do not add `write_orders` or any other scope unless a specific feature genuinely needs it.
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

## 10. Payment experience — Shopify checkout

Every checkout entry point uses **Shopify's own hosted checkout** (Fastr / Shiprocket Checkout was removed):

- **Cart drawer / cart page Checkout** — redirects to the shared cart's `cart.checkoutUrl`, which already carries any applied discount code.
- **Buy Now** — creates a separate single-item cart (`createBuyNowCheckout` in `src/actions/cart.ts`) so the shared cart never leaks into it, re-applies the active discount code, then redirects to that cart's `checkoutUrl`.

`checkoutUrl`'s host is rewritten to `SHOPIFY_STORE_DOMAIN` (`toShopifyCheckoutUrl` in `src/lib/shopify.ts`), because Shopify builds it on the store's primary domain — and when that's `www.lunaro.in`, it would point back at this Vercel app and 404.

Payment methods, COD, shipping rates and the prepaid discount are whatever's configured in **Shopify Admin** (Settings → Payments, Settings → Shipping and delivery, Discounts). The site states UPI / cards / net banking / wallets, 5% off prepaid, COD where eligible, and Standard Free / Express ₹129 / Rush ₹249 (`src/lib/config.ts`) — keep Admin and that file in sync.

Set **Settings → Checkout → shipping address phone number** to *Required*: `/track-order` verifies customers by order number + phone.

## 11. Verify the connection

```bash
npm run dev
```

Visit `/shop` — if products appear (instead of the four placeholder tees), the connection works. If you see a console error, double-check the token scopes in step 2.
