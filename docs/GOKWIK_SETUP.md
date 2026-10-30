# GoKwik Checkout Setup

GoKwik runs only while testing is switched on. With `NEXT_PUBLIC_GOKWIK_TEST_MODE` unset, every Checkout and Buy Now button goes to Shopify's hosted checkout and the SDK is never loaded.

Source documents: the GoKwik PDFs (`Custom Storefront Integration`, `Health Service [Custom Storefront]`, `Shopify Web Pixels API - GoKwik Checkout Events`), kept locally in `docs/gokwik/` and not committed.

## Status

Not cleared for production. No real GoKwik order has been tested. Keep the flag off on Production until the test plan below passes and GoKwik's onboarding is complete.

### Questions for GoKwik

The PDFs don't cover these, and the SDK's behaviour isn't a contract:

1. **Sandbox:** does this merchant have a sandbox account? What's the sandbox merchant ID, and is it different from production? What test payment details should be used?
2. **Order association:** does an order created through `merchantInfo.cart = { id }` carry the Shopify cart's token in `Order.cartToken`? If not, which server-readable order field identifies the cart? Are cart attributes copied to `Order.customAttributes`?
3. **Post-order navigation:** where does the customer land after a custom-storefront order, and can it be set to a URL on this site? It must not require the customer's phone number in the URL. Can it include the order number?
4. **Server verification:** is there a webhook or API for confirming an order, and how is it authenticated?
5. **Cart ID format:** the PDF shows `gid://shopify/Cart/<CARTID>`, and Shopify's IDs also end in `?key=...`. Is passing the full ID correct?
6. **Fallback:** which `shopifyRedirect` behaviour applies to a custom storefront? Can it be triggered for testing?
7. **Payment states:** can a prepaid order be created before its payment is captured? What appears in `Order.paymentGatewayNames` for prepaid and COD orders?
8. **Pixels:** which GA and Meta events does GoKwik fire when pixels are configured on its side, and with what personal data? Can they be turned off for this merchant?
9. **Domain:** do `www.lunaro.in` and the Vercel preview domain need allowlisting?

## Configuration

Set these on the environment being tested (Vercel Preview, or `.env.local`), never on Production while testing. `NEXT_PUBLIC_` values are compiled in, so redeploy or restart after changing them.

| Variable | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_GOKWIK_TEST_MODE` | Set to `true` |
| `NEXT_PUBLIC_GOKWIK_ENVIRONMENT` | Set to `sandbox` |
| `NEXT_PUBLIC_GOKWIK_MERCHANT_ID` | GoKwik, for the sandbox account specifically |
| `NEXT_PUBLIC_SHOPIFY_STORE_ID` | `82292637947` for lunaro-9855.myshopify.com |
| `SHOPIFY_ADMIN_CLIENT_ID`, `SHOPIFY_ADMIN_CLIENT_SECRET` | Shopify Dev Dashboard → your own app → Settings |
| `GOKWIK_ORDER_GATEWAYS` | Exact gateway names from a real GoKwik order, shown by `npm run check:shopify-admin` |
| `GA_MEASUREMENT_PROTOCOL_API_SECRET` | GA4 Admin → Data streams → your stream → Measurement Protocol API secrets |

### Shopify Admin credentials

Use the Dev Dashboard app described in `docs/SHOPIFY_SETUP.md` § 3. It must belong to the same Shopify organization as the store and be installed on it: Shopify's client credentials grant works only in that case. GoKwik dashboard logins and anything GoKwik emails are for GoKwik's systems and can't be used here.

Minimum scope for this feature: `read_orders`. `/track-order` also reads the order phone, and `/order-confirmation` shows the shipping city if readable, but order verification uses neither. Don't grant protected customer data access just for this integration.

Then run this. It prints scopes and counts only, never a credential or customer value:

```
npm run check:shopify-admin
```

### Late-payment webhook

Subscribe the same app to the `orders/paid` topic, delivering to `https://<environment host>/api/webhooks/shopify/orders-paid`. Shopify signs app webhooks with the app's client secret, which is what the route verifies. A preview protected by Vercel Authentication will reject Shopify's deliveries, so test this with a protection bypass or on a host without it.

## How it works

- **Checkout:** `useCheckoutHandoff` loads the SDK, sets `merchantInfo.cart = { id: <Shopify cart ID> }` and calls `triggerGokwikCustomCheckout()` (PDF Scenario 2). Buy Now passes its own single-item cart.
- **SDK failure:** a network error or a 10 second timeout shows Try Again and Continue to Secure Checkout. The second option goes to the same cart's Shopify `checkoutUrl`. On mobile the notice appears in the sticky bar.
- **Health fallback:** on a `shopifyRedirect` message from our own origin, the customer goes to the active cart's `checkoutUrl`. The message's own URL is ignored because GoKwik builds it as `<site>/cart/checkout`, which is a 404 on this headless site. GoKwik only runs this health check when the environment is `production`.
- **Order verification:** an order belongs to this browser only if Shopify's `Order.cartToken` matches the current cart or one this browser sent to checkout. Otherwise no details are shown, nothing is cleared and nothing is reported.
- **Cart clearing:** only an order from the current cart clears it, and not if it's cancelled or its payment failed. Buy Now orders never clear the shared cart.
- **Stale carts:** Shopify deletes a cart when an order is created from it. If an add fails and a successful lookup finds no cart, a new cart is created with that one line. If the cart exists or the lookup fails, nothing is retried and the cookie is kept.
- **`/order-confirmation`:** shows paid, COD, authorised, payment pending, payment failed, refunded, cancelled, couldn't verify, or couldn't check (Shopify unreachable or Admin credentials missing). Only `PAID` and `PARTIALLY_REFUNDED` say "Payment confirmed". A `phone` parameter on an old link is stripped by a redirect and never used.

## Purchase tracking

Each GoKwik order has one `purchase` reporter:

| Order | Reporter |
| --- | --- |
| Paid, authorised or COD when the browser confirms it | Storefront browser event (GA4 and Meta). Once per order per browser; `transaction_id` and Meta `eventID` are the order name |
| Prepaid, paid more than 2 minutes after creation | `orders/paid` webhook, GA4 Measurement Protocol, when configured. Otherwise the browser reports it on the customer's next visit |
| Native Shopify checkout (including fallback) | Shopify's own channels on Shopify's pages. The storefront and webhook don't report these, because the webhook only accepts `GOKWIK_ORDER_GATEWAYS` |

Other sources:

| Source | Finding | Setting |
| --- | --- | --- |
| GoKwik Meta pixel | Uses its own `Gokwik_<random>` eventID, so Meta can't deduplicate it against ours. Its script also has code that can send customer details to Meta | Leave off in GoKwik's dashboard |
| GoKwik GA pixel | Its script has several paths, and at least one uses a different `transaction_id` | Leave off in GoKwik's dashboard |
| `fbPixel` in `merchantInfo` | Optional in the PDF; not sent | Keep unset |
| Shopify custom pixel | GoKwik publishes only where `window.Shopify.analytics` exists, so it's quiet on this site. Per the PDF it covers GoKwik's mobile app flow | Log only, as below |
| Shopify's own Google/Meta channels | Whether they also report orders created through GoKwik is unconfirmed | Check in the test plan |

Custom pixel, if wanted (Settings → Customer events). It replaces the PDF's snippet, which logs the shopper's phone, email and address to the console:

```js
analytics.subscribe('gokwik_events', (event) => {
  console.log('GoKwik event', event?.name);
});
```

Known limits: webhook-reported revenue has no session attribution and doesn't reach Meta, because Meta's Conversions API requires customer data this integration doesn't read. An order that's paid within 2 minutes after the customer has left is not reported.

## Test plan (sandbox only)

Use GoKwik's test payment details only.

- [ ] `npm run check:shopify-admin` shows `read_orders` and no query errors
- [ ] Place a sandbox order; the order appears in Shopify Admin with the right items
- [ ] `Order.cartToken` equals the cart token. **If not, stop: cart clearing, order display and purchase tracking stay off until GoKwik names a supported association**
- [ ] The cart clears and `purchase` fires once; refreshing doesn't repeat it
- [ ] A Buy Now order leaves the shared cart intact
- [ ] Opening the order's link in another browser shows no details
- [ ] COD, pending and cancelled orders show the right state
- [ ] A real modal close keeps the cart and the page scrolls
- [ ] No phone, email, name or address in GA4 or Meta `gokwik_*` events
- [ ] One `purchase` per order in GA4 DebugView and Meta Test Events
- [ ] A test order with a delayed payment fires exactly one `purchase` from the webhook

## Rollout

1. Pass the test plan on Preview with `sandbox`.
2. Get GoKwik's sign-off and production merchant ID.
3. On Vercel Production, set the production merchant ID, `NEXT_PUBLIC_GOKWIK_ENVIRONMENT=production`, `NEXT_PUBLIC_SHOPIFY_STORE_ID`, then `NEXT_PUBLIC_GOKWIK_TEST_MODE=true`, and redeploy.
4. Place one low-value real order yourself, then watch orders, cart clearing and `purchase` counts.

## Rollback

Remove `NEXT_PUBLIC_GOKWIK_TEST_MODE` on Vercel Production and redeploy, or promote the previous deployment for an instant rollback. Checkout returns to Shopify's hosted checkout, the SDK stops loading, and the webhook reports nothing. Orders already placed aren't affected.
