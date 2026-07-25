# Pre-Launch Testing Checklist

## Catalogue & browsing
- [ ] `/shop` loads real Shopify products once configured (not placeholders)
- [ ] `/new-drop` shows only products tagged `drop:001`
- [ ] `/collections` lists real collections; each links to a working `/collections/[handle]`
- [ ] Filtering by size, colour, and "in stock only" narrows results correctly on `/shop` and collection pages
- [ ] Sorting (Featured / Newest / Price asc / Price desc) works
- [ ] `/search?q=...` returns relevant results; empty query shows the prompt state; no-match query shows the empty state
- [ ] 404 page ("SIGNAL LOST") appears for an invalid product/collection handle

## Product page
- [ ] All uploaded images appear in the gallery, in order; swipe works on mobile, click-to-zoom works on desktop
- [ ] Selecting a size/colour combination that has no matching variant is disabled (struck through), not silently broken
- [ ] Sold-out variant shows "Sold Out" and disables Add to Cart
- [ ] Low-stock variant (≤5 units) shows the "Only N left" message
- [ ] Add to Cart opens the cart drawer with the correct variant, quantity 1
- [ ] Buy Now redirects straight to Shopify checkout with the item in cart
- [ ] Mobile sticky add-to-cart bar appears on scroll and mirrors the same state as the main button
- [ ] Related products exclude the current product

## Cart
- [ ] Quantity +/- updates the line and the subtotal correctly
- [ ] Removing the last unit of a line removes it entirely
- [ ] A valid discount code applies and shows in the summary
- [ ] An invalid/expired discount code shows a clear error, doesn't crash the cart
- [ ] Empty cart shows the empty state with a link to `/shop`
- [ ] Checkout button lands on Shopify's real checkout with the correct cart contents

## Wishlist
- [ ] Adding/removing from a product card persists across a page reload (localStorage)
- [ ] `/wishlist` reflects the same items; removing from the wishlist page updates immediately
- [ ] Empty wishlist shows the empty state

## Contact & newsletter
- [ ] Submitting the contact form with all required fields sends a real email (once `RESEND_API_KEY` is set) and shows "TRANSMISSION RECEIVED."
- [ ] Submitting with a missing required field shows a validation error, doesn't submit
- [ ] Submitting without `RESEND_API_KEY` configured shows the "not fully configured" error rather than a fake success
- [ ] Newsletter signup with an invalid email is rejected client-side
- [ ] Newsletter signup without a provider configured shows an honest error, not a fake "Welcome" message

## Track order
- [ ] A real order number + matching email returns status and tracking (once `SHOPIFY_ADMIN_API_TOKEN` is set)
- [ ] A mismatched email/order number returns "No order found," not a server error
- [ ] Missing Admin API configuration shows the "not configured" message

## Account
- [ ] `/account` shows the sign-in CTA once Customer Accounts is configured, or the honest "not configured" message if not
- [ ] No part of the account flow ever simulates a signed-in session that doesn't exist

## Mobile
- [ ] Full-screen mobile menu opens/closes correctly, traps focus, closes on Escape
- [ ] Full-screen mobile filters behave the same way
- [ ] Hero video (or poster fallback on slow connections) displays correctly on a real iPhone and a real Android device
- [ ] Safe-area spacing looks correct on a notched/Dynamic Island device (sticky add-to-cart bar, mobile menu)

## Accessibility
- [ ] Full site is navigable by keyboard alone (tab order, Enter/Space activate controls, Escape closes drawers/modals)
- [ ] Focus is visible on every interactive element
- [ ] All form inputs have associated labels; errors are announced (`aria-live` / `aria-describedby`)
- [ ] `prefers-reduced-motion` removes/shortens all animation, including the opening sequence
- [ ] Screen reader announces cart item count changes and drawer open/close

## Performance
- [ ] Run Lighthouse (or PageSpeed Insights) against the production URL — target "Good" Core Web Vitals
- [ ] Hero video has a poster image and doesn't block initial page paint
- [ ] Images use Next.js `<Image>` (already the case throughout) so responsive sizes/formats are served automatically

## SEO
- [ ] `/sitemap.xml` includes all static pages plus live products, collections, and transmissions
- [ ] `/robots.txt` disallows `/cart`, `/account`, `/api`
- [ ] Any non-`lunaro.in` deployment (preview/staging) sends `noindex` — check via browser dev tools → Network → response headers
- [ ] Product pages have correct Open Graph title/description/image from Shopify data

## Commerce integrity
- [ ] A full test purchase (Bogus Gateway or ₹1 product) completes and appears correctly in Shopify Admin
- [ ] The same test order appears in Shiprocket within a few minutes
- [ ] Inventory decrements correctly after purchase
- [ ] No page anywhere claims a feature works that isn't actually wired to Shopify/Shiprocket/a real email provider — every placeholder is visibly marked as such
