// Shopify hosted checkout helpers (client-side).
//
// Every checkout entry point (cart drawer, cart page, product "Buy Now")
// hands the customer off to a Shopify cart's checkoutUrl through this one
// function, so the redirect behaviour stays identical everywhere.
import type { Cart } from './types';

// The applicable discount code currently on the cart, if any. Used by
// "Buy Now", which checks out a separate single-item cart and so has to
// carry the shopper's applied code across explicitly. (The main cart's own
// checkoutUrl already includes its discount codes.)
export function activeCouponCode(cart: Cart): string | undefined {
  return cart.discountCodes.find((discount) => discount.applicable)?.code;
}

/**
 * Navigates to Shopify's hosted checkout. Returns false (and navigates
 * nowhere) when there's no usable URL, so callers can restore their
 * "opening checkout" UI state immediately.
 */
export function goToCheckout(checkoutUrl: string | null | undefined): boolean {
  if (!checkoutUrl) {
    console.error('[checkout] No checkout URL available.');
    return false;
  }
  window.location.assign(checkoutUrl);
  return true;
}
