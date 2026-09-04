// Fastr / Shiprocket Checkout integration helpers.
//
// Fastr's SDK (loaded globally via <script> in src/app/layout.tsx) attaches
// itself to window.shiprocketCheckoutEvents. This module is the only place
// that talks to it, so every checkout entry point (cart drawer, cart page,
// product "Buy Now") goes through the same variant-ID handling.
import type { Cart } from './types';

declare global {
  interface Window {
    shiprocketCheckoutEvents?: {
      buyDirect: (payload: {
        type: 'cart' | 'product';
        products: Array<{
          variantId: string;
          quantity: number;
        }>;
        couponCode?: string;
        utmParams?: string;
        cartAttributes?: Record<string, unknown>;
      }) => void;
    };
  }
}

const VARIANT_GID_PREFIX = 'gid://shopify/ProductVariant/';

// The Storefront API returns variant IDs as GraphQL GIDs
// (gid://shopify/ProductVariant/123456789); Fastr expects the bare numeric
// Shopify variant ID.
export function toFastrVariantId(variantId: string): string {
  return variantId.startsWith(VARIANT_GID_PREFIX)
    ? variantId.slice(VARIANT_GID_PREFIX.length)
    : variantId;
}

export type FastrProduct = { variantId: string; quantity: number };

// Maps every real line currently in the Shopify cart into Fastr's expected
// shape — never a hardcoded/fake line.
export function cartToFastrProducts(cart: Cart): FastrProduct[] {
  return cart.lines.map((line) => ({
    variantId: toFastrVariantId(line.merchandise.id),
    quantity: line.quantity,
  }));
}

// Fastr's buyDirect() accepts at most one couponCode. This app's own
// applyDiscount() (src/actions/cart.ts) always replaces the cart's whole
// discountCodes list with a single-element array, so in practice there's
// never more than one to choose from — but if this cart ever does carry
// more than one applicable code, only the first is forwarded here. Any
// others are a known, deliberate limitation: they still show as "Applied"
// on the cart page but will NOT be reflected in Fastr's checkout total.
// Returns undefined (never an empty string) when nothing applicable exists,
// so callers can omit couponCode entirely rather than sending a blank one.
export function activeFastrCouponCode(cart: Cart): string | undefined {
  return cart.discountCodes.find((discount) => discount.applicable)?.code;
}

/**
 * Opens Fastr/Shiprocket Checkout for the given cart contents via
 * shiprocketCheckoutEvents.buyDirect(). Intentionally no native-checkout
 * fallback — a missing/broken SDK must surface as a console error during
 * testing, not be silently masked by a redirect to Shopify checkout (Fastr
 * is the only active checkout path in this app; Shopify's own hosted
 * checkout is never used).
 *
 * Returns whether the SDK call was actually issued — never whether payment
 * succeeded, since Fastr's SDK exposes no success/cancel/error callback at
 * all (confirmed against the live window.shiprocketCheckoutEvents object —
 * only buyProduct/buyCart/buyDirect exist). Callers use the return value
 * only to restore their own "opening checkout" UI state immediately when
 * the SDK is missing or throws synchronously, rather than waiting out a
 * full re-enable window for a checkout that never actually opened.
 */
export function openFastrCheckout(
  products: FastrProduct[],
  couponCode?: string
): boolean {
  if (products.length === 0) return false;

  const sdk = window.shiprocketCheckoutEvents;

  if (!sdk?.buyDirect) {
    console.error('[fastr] Checkout SDK is not available.');
    return false;
  }

  try {
    sdk.buyDirect({
      type: 'cart',
      products,
      ...(couponCode ? { couponCode } : {}),
    });
    return true;
  } catch {
    // Never log the caught error itself — it could echo back whatever was
    // just handed to Fastr (cart contents, coupon code). A fixed,
    // non-sensitive message is all that's safe to surface here.
    console.error('[fastr] Checkout failed to open.');
    return false;
  }
}
