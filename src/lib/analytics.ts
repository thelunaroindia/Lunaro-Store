'use client';

import { PURCHASE_TEST_PRODUCT_HANDLE } from '@/lib/config';
import type { Cart } from '@/lib/types';

// Central analytics layer — the ONLY place components should call to report
// an event. Components must never call gtag()/fbq() directly; trackEvent()
// fans out to every configured destination so there is one controlled
// source of truth (see GoogleAnalytics.tsx / MetaPixel.tsx for the loaders
// that make window.gtag/window.fbq available, or leave them undefined when
// their env var isn't set — trackEvent() degrades silently either way).
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
// explicit name map (see metaEventName below) — anything not in that map is
// sent to Meta as a custom event via fbq('trackCustom', name, params) with
// its original name, unchanged.

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
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

  // 3. Meta Pixel, direct via fbq — only if MetaPixel.tsx actually loaded
  //    (NEXT_PUBLIC_META_PIXEL_ID configured).
  try {
    if (typeof window.fbq === 'function') {
      const standardName = metaStandardEventName(name);

      if (standardName) {
        window.fbq('track', standardName, params);
      } else {
        // Custom events (including launch_notification_success, renamed
        // below to Meta's own vocabulary) go through trackCustom — Meta's
        // documented mechanism for non-standard event names.
        window.fbq('trackCustom', metaCustomEventName(name), params);
      }
    }
  } catch {
    // Analytics must never throw into application code.
  }
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
