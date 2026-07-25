# Shiprocket Setup Guide

Shiprocket connects **directly to Shopify** — it is not something this frontend talks to. There is no Shiprocket API key anywhere in this codebase, and there shouldn't be.

## 1. Create a Shiprocket account

Sign up at shiprocket.in with your business details. You'll need a GSTIN if registering as a business in India (or a personal PAN for an individual seller account — check current requirements on Shiprocket's onboarding flow, as these change).

## 2. Connect Shiprocket to Shopify

1. Shiprocket dashboard → **Settings → Channels → Add new channel → Shopify**.
2. Enter your `*.myshopify.com` domain and authorise the connection (this installs the official Shiprocket app on your Shopify store — Admin → Apps will show it afterwards).
3. Once connected, every new Shopify order becomes visible inside Shiprocket automatically. No code in this repo needs to change for this step.

## 3. Map your pickup address

1. Shiprocket dashboard → **Settings → Pickup Addresses → Add new address**.
2. Enter LUNARO's actual dispatch location (warehouse or founder's operating address).
3. **Do not invent a placeholder address** — leave this step until you have a real one, and don't publish an unverified address on the Contact page either (the Contact page in this repo deliberately does not show a physical address yet — see `src/lib/config.ts` → `contact`).

## 4. Set product weight & dimensions

Accurate weight/dimensions are required for correct shipping rate calculation and label generation.

1. In Shopify Admin, open each product → **Shipping** section → enter weight (a folded oversized tee is typically 250–350g; weigh a real sample rather than guessing).
2. Shiprocket pulls this from Shopify automatically once synced — you don't set it twice.
3. For packaging dimensions (the box/mailer, not the garment), set these once in Shiprocket → **Settings → Company → Dimensions defaults**, or per-order if they vary.

## 5. Prepaid vs. COD

- Shiprocket reads the Shopify order's payment status automatically — a paid order is treated as prepaid, an order placed with "Cash on Delivery" as the payment method (enabled in Shopify Admin → Settings → Payments → Manual payment methods → Cash on Delivery) is flagged COD.
- COD orders typically carry a Shiprocket COD handling fee — check current rates in your Shiprocket plan before enabling COD at checkout.
- Enable/disable COD as a checkout option entirely inside **Shopify Admin → Settings → Payments**, not in this codebase.

## 6. Test a shipment before launch

1. Place a real test order on the live (not preview) Vercel deployment, using a test product priced at ₹1 or using Shopify's Bogus Gateway (Admin → Settings → Payments → enable test mode) so no real money moves.
2. Confirm the order appears in Shiprocket within a few minutes.
3. Generate an AWB (Air Waybill) and shipping label for that test order from the Shiprocket dashboard.
4. Schedule a pickup and confirm your courier partner options load correctly for your pickup pincode.
5. Cancel/refund the test order in Shopify once confirmed working.

## 7. Tracking updates back to the customer

Once Shiprocket generates a tracking number, it pushes fulfilment + tracking info back onto the Shopify order. This repo's `/track-order` page reads exactly that data via the Shopify Admin API (`displayFulfillmentStatus` and `fulfillments[].trackingInfo` — see `src/app/api/track-order/route.ts`), so no separate Shiprocket integration is needed on the frontend.

## 8. What remains manual

- Choosing courier partners per shipment (or setting auto-selection rules in Shiprocket).
- Handling returns/RTO (Return to Origin) — Shiprocket has a returns flow; Shopify's own return/refund is separate and should be triggered manually once a return is received (Admin → Orders → order → Return).
- Weight discrepancy disputes with the courier — handled inside Shiprocket, not Shopify.
- International shipping (not covered by this setup — LUNARO ships within India only for now, per `src/lib/config.ts` → `faqs`).
