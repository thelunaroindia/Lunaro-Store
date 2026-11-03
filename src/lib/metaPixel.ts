'use client';

import { metaPixel } from '@/lib/config';

// The single owner of window.fbq. Nothing else may call fbq directly:
// analytics.ts routes Meta events here, and MetaPixel.tsx reports page views.
//
// Loading: the first call installs Meta's standard queueing stub, sets this
// pixel's options and calls init, then fbevents.js loads asynchronously. Every
// call before the SDK arrives is queued by the stub in order, so an event fired
// from a component's first effect (before any <Script> would have run) is kept.
//
// Isolation: events use trackSingle / trackSingleCustom, so they reach only
// this pixel even if another script on the page initialises a different one.

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: unknown;
  loaded?: boolean;
  version?: string;
  disablePushState?: boolean;
};

const SDK_URL = 'https://connect.facebook.net/en_US/fbevents.js';

let initialisedPixel: string | null = null;
let warnedMismatch = false;

function getFbq(): Fbq | null {
  if (typeof window === 'undefined') return null;

  if (metaPixel.mismatch && !warnedMismatch) {
    warnedMismatch = true;
    console.warn(
      `[meta-pixel] NEXT_PUBLIC_META_PIXEL_ID is "${metaPixel.mismatch}", not the expected pixel. ` +
        'Meta tracking is off until the two agree (src/lib/config.ts).'
    );
  }

  const pixelId = metaPixel.id;
  if (!pixelId) return null;

  try {
    const w = window as unknown as { fbq?: Fbq; _fbq?: Fbq };

    if (!w.fbq) {
      // Meta's base code, unminified. Queues calls until fbevents.js replaces
      // callMethod.
      const stub: Fbq = function (...args: unknown[]) {
        if (stub.callMethod) stub.callMethod(...args);
        else stub.queue!.push(args);
      };
      stub.push = stub;
      stub.loaded = true;
      stub.version = '2.0';
      stub.queue = [];
      w.fbq = stub;
      if (!w._fbq) w._fbq = stub;

      const script = document.createElement('script');
      script.async = true;
      script.src = SDK_URL;
      document.head.appendChild(script);
    }

    const fbq = w.fbq;

    if (initialisedPixel !== pixelId) {
      // The SDK otherwise sends its own PageView on every pushState and
      // replaceState, which would double the ones MetaPixel.tsx reports.
      fbq.disablePushState = true;
      // Turns off Meta's inferred button-click and microdata events so the
      // events below are the only commerce signals this site sends.
      fbq('set', 'autoConfig', false, pixelId);
      fbq('init', pixelId);
      initialisedPixel = pixelId;
    }

    return fbq;
  } catch {
    return null;
  }
}

/** Meta's own vocabulary. Anything else goes through trackSingleCustom. */
export type MetaStandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase';

export function sendMetaEvent(
  name: string,
  params: Record<string, unknown>,
  { standard, eventId }: { standard: boolean; eventId?: string }
): void {
  const fbq = getFbq();
  if (!fbq || !metaPixel.id) return;

  try {
    const method = standard ? 'trackSingle' : 'trackSingleCustom';
    if (eventId) fbq(method, metaPixel.id, name, params, { eventID: eventId });
    else fbq(method, metaPixel.id, name, params);
  } catch {
    // Analytics must never throw into application code.
  }
}

let lastPageViewUrl: string | null = null;

/**
 * One PageView per distinct URL shown. React Strict Mode re-running the
 * effect for the same URL, or a re-render, sends nothing new.
 */
export function trackMetaPageView(url: string): void {
  if (url === lastPageViewUrl) return;
  lastPageViewUrl = url;
  sendMetaEvent('PageView', {}, { standard: true });
}

// ── Catalog IDs ──────────────────────────────────────────────────────────

function numericId(gid: string): string {
  return gid.split('/').pop()?.replace(/\?.*$/, '') ?? gid;
}

/**
 * The content_id Meta matches against the catalog. Shopify's Facebook &
 * Instagram channel names catalog items shopify_<COUNTRY>_<product>_<variant>;
 * a catalog fed some other way usually keys on the bare variant ID. Check one
 * item's "Content ID" in Commerce Manager and set
 * NEXT_PUBLIC_META_CONTENT_ID_FORMAT to match (see docs/META_PIXEL.md).
 */
export function metaContentId(productGid: string, variantGid: string): string {
  const product = numericId(productGid);
  const variant = numericId(variantGid);
  switch (metaPixel.contentIdFormat) {
    case 'variant':
      return variant;
    case 'shopify':
    default:
      return `shopify_${metaPixel.catalogCountry}_${product}_${variant}`;
  }
}

export type MetaLine = { productId: string; variantId: string; quantity: number; itemPrice?: number };

/** content_ids / contents / num_items for a set of lines. */
export function metaContents(lines: MetaLine[]): Record<string, unknown> {
  const contents = lines.map((line) => ({
    id: metaContentId(line.productId, line.variantId),
    quantity: line.quantity,
    ...(typeof line.itemPrice === 'number' && Number.isFinite(line.itemPrice)
      ? { item_price: line.itemPrice }
      : {}),
  }));
  return {
    content_ids: contents.map((c) => c.id),
    contents,
    content_type: 'product',
    num_items: lines.reduce((sum, line) => sum + line.quantity, 0),
  };
}
