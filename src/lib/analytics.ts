'use client';

import { PURCHASE_TEST_PRODUCT_HANDLE } from '@/lib/config';
import { metaContents, sendMetaEvent, type MetaLine } from '@/lib/metaPixel';
import type { Cart } from '@/lib/types';

// Central analytics layer — the ONLY place components should call to report
// an event. Components must never call gtag()/fbq() directly; trackEvent()
// fans out to every configured destination so there is one controlled
// source of truth (GoogleAnalytics.tsx loads gtag when its env var is set;
// src/lib/metaPixel.ts owns window.fbq). trackEvent() degrades silently
// when a destination is off.
//
// Never pass an email address, phone number, name, address, order-lookup
// credentials, or any cookie/session contents in `params` — these events
// flow into GA4/Meta, neither of which should ever see PII.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

// Every event this app currently emits maps 1:1 to a GA4 event name already
// (GA4's own ecommerce vocabulary — view_item, add_to_cart, view_cart,
// remove_from_cart, begin_checkout, purchase — matches our names exactly),
// so GA4 receives the raw event name unchanged via gtag('event', name, ...).
// Meta has a different standard-event vocabulary, so only Meta needs an
// explicit name map (see metaStandardEventName below) — anything not in that
// map is sent to Meta as a custom event with its original name, unchanged.

export type TrackOptions = {
  // What Meta receives instead of `params`: its own field names (content_ids,
  // contents, content_type, num_items, value, currency). GA4 and dataLayer
  // still get `params` unchanged.
  meta?: Record<string, unknown>;
  // Meta deduplicates on event name + eventID, including against a future
  // Conversions API event sent with the same ID.
  eventId?: string;
};

export function trackEvent(
  name: string,
  params: Record<string, unknown> = {},
  options: TrackOptions = {}
): void {
  if (typeof window === 'undefined') return;

  // 1. dataLayer — kept for GTM compatibility / future tag-manager use,
  //    unchanged from Phase 1.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });

  // 2. GA4, direct via gtag — only if GoogleAnalytics.tsx actually loaded
  //    the script (NEXT_PUBLIC_GA_MEASUREMENT_ID configured). Wrapped so a
  //    blocked/failed script, or a browser with analytics disabled, can
  //    never break shopping.
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    }
  } catch {
    // Analytics must never throw into application code.
  }

  // 3. Meta Pixel via src/lib/metaPixel.ts, which loads the SDK on first use
  //    and queues events until it arrives.
  const standardName = metaStandardEventName(name);
  const eventId =
    options.eventId ?? (typeof params.transaction_id === 'string' ? params.transaction_id : undefined);
  sendMetaEvent(standardName ?? metaCustomEventName(name), options.meta ?? params, {
    standard: standardName !== null,
    eventId,
  });
}

// Remembers keys for this tab, and across reloads where sessionStorage works,
// so a repeated callback or double click can't report the same thing twice.
const firedThisSession = new Set<string>();

export function onceThisSession(key: string): boolean {
  if (firedThisSession.has(key)) return false;
  firedThisSession.add(key);
  try {
    const storageKey = `lunaro_once_${key}`;
    if (window.sessionStorage.getItem(storageKey)) return false;
    window.sessionStorage.setItem(storageKey, '1');
  } catch {
    // The in-memory set above still covers this page.
  }
  return true;
}

const PURCHASE_DEDUP_KEY_PREFIX = 'lunaro_purchase_tracked_';

// Fires the `purchase` event exactly once per Shopify order number, ever,
// in this browser — refreshing /order-confirmation (or revisiting the same
// link later) must not create duplicate Purchase events in GA4/Meta.
//
// Dedup is keyed by the real Shopify order number (e.g. "#1002") in
// localStorage — not sensitive customer data, just a boolean marker next to
// a public order identifier. This only guards against *this browser*
// re-firing; a customer opening the same confirmation link on a second
// device would still count once there too. That's a disclosed limitation
// of client-only dedup, not a bug — a fully cross-device-safe guarantee
// would need server-side event tagging, which is out of scope here.
//
// Only ever call this with a server-verified order (Shopify's own Admin API
// confirmed it via the order number + phone match), never a client-side guess.
export function trackPurchaseOnce({
  orderName,
  currency,
  value,
  paymentType,
  lines = [],
}: {
  orderName: string;
  currency: string;
  value: number;
  paymentType: 'prepaid' | 'cod' | 'unknown';
  lines?: MetaLine[];
}): void {
  const dedupKey = `${PURCHASE_DEDUP_KEY_PREFIX}${orderName}`;

  try {
    if (window.localStorage.getItem(dedupKey)) return;
    window.localStorage.setItem(dedupKey, '1');
  } catch {
    // localStorage unavailable (private browsing, storage disabled) —
    // fall back to this tab's memory, then track rather than silently
    // dropping a genuine purchase. Meta also deduplicates on the eventID.
    if (!onceThisSession(`purchase_${orderName}`)) return;
  }

  trackEvent(
    'purchase',
    {
      transaction_id: orderName,
      currency,
      value,
      payment_type: paymentType,
    },
    {
      eventId: orderName,
      meta: {
        ...(lines.length > 0 ? metaContents(lines) : { content_type: 'product' }),
        currency,
        value,
        order_id: orderName,
        payment_type: paymentType,
      },
    }
  );
}

// GA4 receives every event under its own original name unchanged (see the
// comment above trackEvent) — only Meta needs renaming, since its standard-
// event vocabulary differs from ours.
function metaStandardEventName(name: string): string | null {
  switch (name) {
    case 'view_item':
      return 'ViewContent';
    case 'add_to_cart':
      return 'AddToCart';
    case 'begin_checkout':
      return 'InitiateCheckout';
    case 'purchase':
      return 'Purchase';
    default:
      return null;
  }
}

function metaCustomEventName(name: string): string {
  if (name === 'launch_notification_success') return 'LaunchNotificationSignup';
  return name;
}

// The only real, purchasable Shopify product right now is the internal
// checkout-verification SKU (src/lib/config.ts → PURCHASE_TEST_PRODUCT_HANDLE).
// Product-level events tag it explicitly so it can be filtered out of real
// launch reporting in GA4 (a custom-dimension filter on internal_test) and
// Meta (a custom-parameter exclusion) once real merchandise exists —
// without needing a separate/fragile "is this dev traffic" heuristic.
export function isInternalTestProduct(handle: string): boolean {
  return handle === PURCHASE_TEST_PRODUCT_HANDLE;
}

// Shared shape for cart-level events (view_cart, begin_checkout) so
// CartDrawer.tsx and CartPageClient.tsx report identical, real params from
// the same cart object rather than two hand-maintained copies.
export function cartEventParams(cart: Cart): Record<string, unknown> {
  return {
    currency: cart.cost.totalAmount.currencyCode,
    value: Number(cart.cost.totalAmount.amount),
    line_count: cart.lines.length,
    quantity: cart.totalQuantity,
    internal_test: cart.lines.every((line) =>
      isInternalTestProduct(line.merchandise.product.handle)
    ),
  };
}

export function cartMetaLines(cart: Cart): MetaLine[] {
  return cart.lines.map((line) => ({
    productId: line.merchandise.product.id,
    variantId: line.merchandise.id,
    quantity: line.quantity,
    itemPrice: Number(line.merchandise.price.amount),
  }));
}

// What Meta receives for a whole cart (InitiateCheckout).
export function cartMetaParams(cart: Cart): Record<string, unknown> {
  return {
    ...metaContents(cartMetaLines(cart)),
    currency: cart.cost.totalAmount.currencyCode,
    value: Number(cart.cost.totalAmount.amount),
    internal_test: cartEventParams(cart).internal_test,
  };
}

// Meta payload for one product line (ViewContent, AddToCart, Buy Now).
export function productMetaParams({
  productId,
  variantId,
  quantity,
  price,
  currency,
  handle,
}: {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  currency: string;
  handle: string;
}): Record<string, unknown> {
  return {
    ...metaContents([{ productId, variantId, quantity, itemPrice: price }]),
    currency,
    value: price * quantity,
    internal_test: isInternalTestProduct(handle),
  };
}

// AddToCart from the cart Shopify returned, so value is the line's real price
// rather than the card's "from" price. Null if the line isn't there.
export function addToCartFromResult(
  cart: Cart,
  variantId: string,
  quantity: number
): { params: Record<string, unknown>; meta: Record<string, unknown> } | null {
  const line = cart.lines.find((l) => l.merchandise.id === variantId);
  if (!line) return null;
  const price = Number(line.merchandise.price.amount);
  const currency = line.merchandise.price.currencyCode;
  const handle = line.merchandise.product.handle;
  return {
    params: {
      product_id: line.merchandise.product.id,
      product_handle: handle,
      variant_id: variantId,
      currency,
      value: price * quantity,
      quantity,
      internal_test: isInternalTestProduct(handle),
    },
    meta: productMetaParams({
      productId: line.merchandise.product.id,
      variantId,
      quantity,
      price,
      currency,
      handle,
    }),
  };
}

// Reports the checkout once per cart and contents per session: a retry, the
// Shopify fallback after a GoKwik failure, or reopening the same cart is the
// same attempt. A changed cart is a new one.
export function trackBeginCheckoutOnce(
  cartId: string,
  params: Record<string, unknown>,
  meta: Record<string, unknown>
): void {
  const fingerprint = `${cartId}|${String(meta.value)}|${JSON.stringify(meta.contents ?? [])}`;
  const key = `begin_checkout_${hash(fingerprint)}`;
  if (!onceThisSession(key)) return;
  trackEvent('begin_checkout', params, { meta, eventId: key });
}

function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
