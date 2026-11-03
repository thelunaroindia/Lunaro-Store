'use client';

import { gokwik } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';

// GoKwik browser SDK wrapper (Scenario 2 of docs/gokwik/Custom Storefront
// Integration.pdf: Shopify owns the cart, so the cart ID is passed explicitly).
// Only ever called while GOKWIK_ENABLED is true.

declare global {
  interface Window {
    merchantInfo?: {
      mid: string;
      environment: string;
      type: 'merchantInfo';
      storeId: number | null;
      fbPixel?: string;
      fbpixel: string;
      cart?: { id: string };
    };
    triggerGokwikCustomCheckout?: () => void;
  }
}

const SDK_URL = 'https://pdp.gokwik.co/merchant-integration/build/merchant.integration.js?v4';
const SDK_SCRIPT_ID = 'gokwik-merchant-integration';
// Injected by the SDK itself once it has fetched its second-stage script.
const SDK_SECOND_STAGE_SCRIPT_ID = 'gokwikScript';
const SDK_TIMEOUT_MS = 10_000;

let sdkReady = false;
let watchingForSdkReady = false;
let notifyReady: (() => void) | null = null;
let pendingLoad: Promise<void> | null = null;

// The SDK defines triggerGokwikCustomCheckout as soon as the first script
// runs, but a call before its second-stage script finishes is silently lost.
// That script dispatches `gokwikLoaded` when it is actually listening.
function watchForSdkReady() {
  if (watchingForSdkReady) return;
  watchingForSdkReady = true;
  window.addEventListener('gokwikLoaded', () => {
    sdkReady = true;
    notifyReady?.();
  });
}

function isSdkReady(): boolean {
  return sdkReady && typeof window.triggerGokwikCustomCheckout === 'function';
}

/**
 * Resolves once checkout can actually open; rejects on a network failure or
 * timeout. Safe to call repeatedly — a later call after a rejection is a real
 * retry, not a replay of the failure.
 */
export function loadGokwikSdk(): Promise<void> {
  if (isSdkReady()) return Promise.resolve();
  if (pendingLoad) return pendingLoad;

  pendingLoad = new Promise<void>((resolve, reject) => {
    watchForSdkReady();

    // The SDK dereferences window.merchantInfo while it initialises, so this
    // has to exist before the script tag does.
    window.merchantInfo ??= {
      mid: gokwik.merchantId,
      environment: gokwik.environment,
      type: 'merchantInfo',
      storeId: gokwik.storeId,
      ...(gokwik.fbPixel ? { fbPixel: gokwik.fbPixel } : {}),
      // gokwik.js reads `fbpixel` (lowercase) and, when it's null/undefined,
      // fills it from window.fbq's initialised pixels. With a pixel ID it sends
      // Meta an image request carrying the shopper's unhashed email, name,
      // phone and address. An explicit value stops that discovery; empty
      // unless GoKwik's own pixel is deliberately configured.
      fbpixel: gokwik.fbPixel ?? '',
    };

    const timeout = window.setTimeout(() => fail('timeout'), SDK_TIMEOUT_MS);

    function fail(reason: string) {
      window.clearTimeout(timeout);
      notifyReady = null;
      reject(new Error(`GoKwik SDK failed to load: ${reason}`));
    }

    notifyReady = () => {
      window.clearTimeout(timeout);
      notifyReady = null;
      resolve();
    };

    // A failed earlier attempt may have left tags behind; the SDK skips its
    // own second-stage load if it finds that one already in the document.
    document.getElementById(SDK_SCRIPT_ID)?.remove();
    document.getElementById(SDK_SECOND_STAGE_SCRIPT_ID)?.remove();

    const script = document.createElement('script');
    script.id = SDK_SCRIPT_ID;
    script.src = SDK_URL;
    script.async = true;
    script.onerror = () => fail('network');
    document.head.appendChild(script);
  }).finally(() => {
    pendingLoad = null;
  });

  return pendingLoad;
}

// The checkout currently open in GoKwik, kept for the Shopify redirect below.
let activeCheckoutUrl: string | null = null;

/** Throws if the SDK isn't usable — callers fall back to Shopify. */
export function openGokwikCheckout(cartId: string, checkoutUrl: string): void {
  if (!isSdkReady() || !window.merchantInfo) {
    throw new Error('GoKwik SDK is not ready.');
  }
  activeCheckoutUrl = checkoutUrl;
  window.merchantInfo.cart = { id: cartId };
  window.triggerGokwikCustomCheckout?.();
}

// The events documented in docs/gokwik/Shopify Web Pixels API - GoKwik
// Checkout Events.pdf. Their payloads carry the shopper's phone, email and
// address, so only the name and FORWARDED_FIELDS are ever forwarded — see the
// PII rule at the top of src/lib/analytics.ts.
const FUNNEL_EVENTS = new Set([
  'Started_Checkout_GK',
  'Mobile_Added_GK',
  'Address_Step_Reached_GK',
  'Address_Added_GK',
  'Payment_Step_Reached_GK',
  'Payment_Method_Selected_GK',
  'Order_Placed_GK',
  'Coupon_Applied_Success_GK',
  'Coupon_Applied_Failed_GK',
]);

// The documented fields that say nothing about who the shopper is.
const FORWARDED_FIELDS = [
  'original_cart_amount',
  'coupon_code',
  'total_discount_applied',
  'amount_saved',
  'checkout_step',
  'payment_mode_selected',
  'payment_method',
  'shipping_price',
  'cod_charges',
] as const;

const seenEventIds = new Set<string>();

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value) return value;
    if (typeof value === 'number') return String(value);
  }
  return null;
}

function handleFunnelEvent(
  message: Record<string, unknown>,
  onOrderPlaced: (orderNumber: string) => void
) {
  // The SDK currently sends `eventname` beside the fields; the PDF documents
  // `event` with the fields under `event_data`.
  const name = message.eventname ?? message.event;
  if (typeof name !== 'string' || !FUNNEL_EVENTS.has(name)) return;

  const data =
    message.event_data && typeof message.event_data === 'object'
      ? (message.event_data as Record<string, unknown>)
      : message;

  if (typeof data.event_id === 'string') {
    if (seenEventIds.has(data.event_id)) return;
    seenEventIds.add(data.event_id);
  }

  const value = Number(data.total_price ?? data.total_amount);
  const details = Object.fromEntries(
    FORWARDED_FIELDS.flatMap((field) => {
      const detail = data[field];
      return typeof detail === 'string' || typeof detail === 'number' ? [[field, detail]] : [];
    })
  );
  trackEvent(`gokwik_${name.replace(/_GK$/, '').toLowerCase()}`, {
    ...details,
    ...(typeof data.currency === 'string' ? { currency: data.currency } : {}),
    ...(Number.isFinite(value) ? { value } : {}),
  });

  if (name === 'Order_Placed_GK') {
    // The PDF documents snake_case keys; the SDK currently sends title-case.
    const orderNumber = firstString(data['Order Number'], data.order_number);
    if (orderNumber) onOrderPlaced(orderNumber);
  }
}

/**
 * Listens for the two message types the SDK posts to this window. Both are
 * posted to our own origin, so anything from elsewhere is ignored. Neither is
 * proof of anything: a redirect can only ever go to the checkout URL Shopify
 * gave us, and onOrderPlaced must be re-verified server-side.
 */
export function subscribeToGokwikMessages(
  onOrderPlaced: (orderNumber: string) => void
): () => void {
  function onMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin) return;
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'shopifyRedirect') {
      // Deliberately not data.url: GoKwik builds it as <this site>/cart/checkout,
      // which doesn't exist on a headless storefront (see toShopifyCheckoutUrl
      // in src/lib/shopify.ts for the same problem with Shopify's own URLs).
      if (!activeCheckoutUrl) return;
      trackEvent('gokwik_shopify_fallback', { reason: 'gokwik_unavailable' });
      window.location.assign(activeCheckoutUrl);
    } else if (data.type === 'gokwik_events' && data.data && typeof data.data === 'object') {
      handleFunnelEvent(data.data, onOrderPlaced);
    }
  }

  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}
