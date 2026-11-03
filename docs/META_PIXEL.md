# Meta Pixel

Pixel / dataset ID: `4448781662040409`, fixed in `src/lib/config.ts` (`META_PIXEL_ID`). Every deployment sends to it without an env var. `src/lib/metaPixel.ts` is the only code that touches `window.fbq`; components report through `trackEvent()` in `src/lib/analytics.ts`.

## Configuration

| Variable | Effect |
| --- | --- |
| `NEXT_PUBLIC_META_PIXEL_ID` | Unset or `4448781662040409`: on. `off`: off. Any other value: off, with a console warning. A different ID never receives data; change `META_PIXEL_ID` in code to switch pixels. Under `next dev` the pixel is off unless this is set to the ID |
| `NEXT_PUBLIC_META_CONTENT_ID_FORMAT` | `shopify` (default): `shopify_IN_<productId>_<variantId>`, the format Shopify's Facebook & Instagram channel uses for catalog items. `variant`: bare Shopify variant ID. Pick whichever matches the "Content ID" of an item in Commerce Manager → Catalog → Items |

`NEXT_PUBLIC_` values are compiled in: redeploy after changing them.

## Events and owners

| Event | Fired by | When | Payload |
| --- | --- | --- | --- |
| PageView | `MetaPixel.tsx` | First load and every App Router navigation; once per distinct URL. Meta's own pushState PageViews are disabled | — |
| ViewContent | `ProductDetail.tsx` | Once per product page shown | `content_ids`, `contents`, `content_type`, `value`, `currency`, `content_name` |
| AddToCart | `ProductOptions.tsx`, `ProductCard.tsx` | Only after Shopify returns the updated cart; priced from the returned line | as above, `num_items` |
| InitiateCheckout | `useCheckoutHandoff.ts` | When GoKwik's checkout is triggered or the Shopify redirect starts (cart and Buy Now). Once per cart contents per session, so a retry or the Shopify fallback isn't a second checkout. An SDK failure alone sends nothing | cart lines, `value`, `currency`, `num_items`, `eventID` |
| Purchase | `GokwikBridge.tsx` → `trackPurchaseOnce` | Only for a GoKwik order the server verified as belonging to this browser and in state paid, authorised or COD (incl. Gokwik PPCOD). Never pending, failed, voided, cancelled or refunded | order total, order lines, `currency`, `order_id`, `eventID` = order name (e.g. `#1042`) |

Other site events (`view_cart`, `remove_from_cart`, `gokwik_*` funnel events, newsletter events) go to Meta as custom events and never duplicate a standard one.

All events use `trackSingle`, so they reach only this pixel even if another script initialises a different one. Meta's automatic events (`autoConfig`) are off so button-click inference can't duplicate these.

Purchase duplicates are blocked by a per-order `localStorage` marker, with a per-tab fallback, and by Meta's eventID deduplication.

### Not reported by this site

- **Native Shopify checkout orders** (GoKwik off, or the Shopify fallback): the order completes on Shopify's domain. Purchase there comes only from Shopify's Facebook & Instagram channel, if it is installed and connected to this same pixel. Confirm in Shopify Admin → Sales channels. The storefront doesn't report these, so there is no double count.
- **GoKwik's own Meta pixel:** off. `NEXT_PUBLIC_GOKWIK_FB_PIXEL_IDS` is unset in production, and it must stay unset; its events use GoKwik's own eventIDs, which Meta can't deduplicate against these. Also confirm no Meta pixel or CAPI is configured in GoKwik's dashboard.
- **Late prepaid payments** reported by the `orders/paid` webhook go to GA4 only.

## Conversions API

Not implemented. It needs a Meta CAPI access token (Events Manager → dataset → Settings → Conversions API → Generate access token), stored server-side only (e.g. `META_CAPI_ACCESS_TOKEN`, never `NEXT_PUBLIC_`), and a decision on which customer information to send. Browser events already carry stable eventIDs (Purchase: the order name), so a server Purchase sent later with `event_name: "Purchase"` and the same `event_id` deduplicates against the browser event.

## Consent

The storefront has no cookie-consent mechanism, so there is nothing for the pixel to wait on. If a banner is added, gate `getFbq()` in `src/lib/metaPixel.ts` on it; that's the single entry point.

## Verifying in Meta Events Manager

1. Events Manager → dataset `4448781662040409` → **Test events**.
2. Enter `https://www.lunaro.in` and select **Open website**. That browser session is tagged for Test Events.
3. Browse: home, a product, another page through the menu. Expect one PageView per page and one ViewContent per product.
4. Add to cart; expect one AddToCart with `content_ids` and value.
5. Open checkout; expect one InitiateCheckout. Close and reopen without changing the cart; expect no second one.
6. Purchase only with a real order you intend to place. Expect one Purchase with the order total and the order name as its event ID. Reloading `/order-confirmation` must not add another.
7. In Commerce Manager, check that a ViewContent `content_ids` value matches a catalog item's Content ID.

The Meta Pixel Helper browser extension shows the same events on any page.
