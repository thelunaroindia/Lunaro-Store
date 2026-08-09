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

/**
 * Opens Fastr/Shiprocket Checkout for the given cart contents via
 * shiprocketCheckoutEvents.buyDirect(). Intentionally no native-checkout
 * fallback — a missing/broken SDK must surface as a console error during
 * testing, not be silently masked by a redirect to Shopify checkout.
 */
export function openFastrCheckout(products: FastrProduct[]): void {
  if (products.length === 0) return;

  const sdk = window.shiprocketCheckoutEvents;

  if (!sdk?.buyDirect) {
    console.error('Fastr checkout SDK is not available.');
    return;
  }

  sdk.buyDirect({ type: 'cart', products });
}
