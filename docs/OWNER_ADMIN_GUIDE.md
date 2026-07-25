# Owner Admin Guide

Everything below happens in **Shopify Admin** — none of it requires touching this codebase or redeploying the site.

## Add a product

1. Admin → **Products → Add product**.
2. Fill in title, description, and upload images in the order you want them to appear (front, back, artwork close-up, fabric close-up, on-body shot — the product page shows every image you add, in order).
3. Under **Variants**, add option types **Size** and **Colour** with your values (e.g. S/M/L/XL/XXL, Obsidian Black).
4. Set a price per variant (or one price for all, then adjust individual variants if needed).
5. Under **Inventory**, enable "Track quantity" and set stock per size/colour combination.
6. Save. The product appears on `/shop` automatically — no deploy needed (the site revalidates product data roughly every 60 seconds).

## Feature a product in the current drop

Add the tag `drop:001` (or the current drop's tag) to any product — it will appear on `/new-drop`. Add the tag `limited` to show the "Limited Drop" badge on its product card.

## Create a collection

Admin → **Products → Collections → Create collection**. Automated collections (rule-based, e.g. "Product type is T-Shirt") are easiest to maintain — new matching products join automatically.

## Create a discount code

Admin → **Discounts → Create discount** → Amount off, code, eligibility, usage limits. It works immediately in the cart's discount field — nothing else to configure.

## View and process orders

Admin → **Orders**. Click any order to see customer details, items, payment status. Use **Mark as fulfilled** once Shiprocket has picked up the shipment (or let the Shiprocket ↔ Shopify sync do this automatically, depending on your Shiprocket settings).

## Process a refund

Open the order → **Refund** button → select items/amount → confirm. This refunds to the original payment method automatically through Shopify's payment gateway.

## Check sales reports

Admin → **Analytics** (or **Reports** on higher plans) for revenue, top products, and conversion data out of the box.

## Handle a sold-out product

Once a variant's inventory hits zero, the storefront automatically shows "Sold Out" on that size/colour and disables adding it to cart (`src/components/product/ProductOptions.tsx` reads availability directly from Shopify — there is nothing to toggle manually). If an entire product sells out, its card shows a "Sold Out" badge on `/shop` and `/new-drop`.

## Update product descriptions, prices, or images

Admin → **Products** → open the product → edit → **Save**. Changes go live within about a minute (the site caches product data briefly for performance, then automatically refreshes).

## Publish a new Transmission (blog post)

Admin → **Online Store → Blog posts → Add blog post**. Make sure it's added to the blog with handle `transmissions` (see `docs/SHOPIFY_SETUP.md` step 6). It appears on `/transmissions` immediately.

## Connect Shiprocket

See `docs/SHIPROCKET_SETUP.md` in full — in short: Shiprocket dashboard → Settings → Channels → Add Shopify.

## Test checkout

Enable Shopify's Bogus Gateway (Admin → Settings → Payments → toggle test mode) so you can place complete test orders without moving real money, then walk through the full flow on the live site.

## Track a shipment

Once Shiprocket generates a tracking number for an order, it syncs back to that Shopify order automatically — visible on the order page in Admin, and to the customer via `/track-order` on the site.
