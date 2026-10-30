'use server';

import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';
import {
  createCart as shopifyCreateCart,
  getCart as shopifyGetCart,
  addCartLines,
  updateCartLines,
  removeCartLines,
  applyDiscountCode,
  isShopifyConfigured,
} from '@/lib/shopify';
import {
  CART_COOKIE,
  checkoutCartTokens,
  currentCartToken,
  rememberCheckoutCart,
} from '@/lib/checkoutCarts';
import { GOKWIK_ENABLED } from '@/lib/config';
import { countsAsPurchase, keepsCart, orderStateOf, type PaymentType } from '@/lib/orderState';
import { isWithinBrowserPurchaseWindow } from '@/lib/lateOrderPayment';
import { claimPurchaseReport } from '@/lib/purchaseClaim';
import { getOrderForCheckoutCarts } from '@/lib/verifiedOrder';
import type { Cart } from '@/lib/types';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
};

export async function getOrCreateCart(): Promise<Cart | null> {
  if (!isShopifyConfigured()) return null;

  const store = cookies();
  const existingId = store.get(CART_COOKIE)?.value;

  if (existingId) {
    const cart = await shopifyGetCart(existingId).catch(() => null);
    if (cart) return cart;
    // Cart expired/invalid on Shopify's side — fall through and create a new one.
  }

 return null;
}

// Never forward a raw Shopify/API error string to the customer — it's
// unreadable technical detail on a page meant to feel like a private
// showroom. Log the real error server-side for diagnosis; the client only
// ever sees calm, fixed copy.
const GENERIC_CART_ERROR = "We couldn't update your bag. Please try again.";
const EXPIRED_CART_ERROR = 'Your bag has expired. Please add your items again.';

// Shopify deletes a cart when an order is created from it, and carts also
// expire, but the 30-day cookie outlives both. Only a successful lookup that
// finds nothing counts: a failed request says nothing about the cart, and
// treating it as gone would throw away a customer's active cart.
async function isCartGone(cartId: string): Promise<boolean> {
  if (!cartId.startsWith('gid://shopify/Cart/')) return true;
  try {
    return (await shopifyGetCart(cartId)) === null;
  } catch {
    return false;
  }
}

// Stale cookie: forget it so the next add starts a new cart.
async function expiredCartResult(cartId: string): Promise<{ ok: false; error: string } | null> {
  if (!(await isCartGone(cartId))) return null;
  cookies().delete(CART_COOKIE);
  return { ok: false, error: EXPIRED_CART_ERROR };
}

export async function addToCart(
  merchandiseId: string,
  quantity: number = 1
): Promise<{ ok: true; cart: Cart } | { ok: false; error: string }> {
  try {
    if (!isShopifyConfigured()) {
      return { ok: false, error: 'Store is not connected yet. Configure Shopify to enable checkout.' };
    }
    const store = cookies();
    let cartId = store.get(CART_COOKIE)?.value;

    if (!cartId) {
      const cart = await shopifyCreateCart([{ merchandiseId, quantity }]);
      store.set(CART_COOKIE, cart.id, COOKIE_OPTS);
      return { ok: true, cart };
    }

    try {
      const cart = await addCartLines(cartId, [{ merchandiseId, quantity }]);
      return { ok: true, cart };
    } catch (err) {
      // Nothing can have been added to a cart that doesn't exist, so a new
      // cart can't duplicate this line. If the cart does exist the add may
      // have landed despite the error, so it is never retried.
      if (!(await isCartGone(cartId))) throw err;
      const cart = await shopifyCreateCart([{ merchandiseId, quantity }]);
      store.set(CART_COOKIE, cart.id, COOKIE_OPTS);
      return { ok: true, cart };
    }
  } catch (err) {
    console.error('[cart] addToCart failed', err);
    return { ok: false, error: GENERIC_CART_ERROR };
  }
}

export async function updateCartLine(
  lineId: string,
  quantity: number
): Promise<{ ok: true; cart: Cart } | { ok: false; error: string }> {
  try {
    const store = cookies();
    const cartId = store.get(CART_COOKIE)?.value;
    if (!cartId) return { ok: false, error: 'Your cart could not be found.' };

    const cart =
      quantity <= 0
        ? await removeCartLines(cartId, [lineId])
        : await updateCartLines(cartId, [{ id: lineId, quantity }]);
    return { ok: true, cart };
  } catch (err) {
    console.error('[cart] updateCartLine failed', err);
    const cartId = cookies().get(CART_COOKIE)?.value;
    return (cartId && (await expiredCartResult(cartId))) || { ok: false, error: GENERIC_CART_ERROR };
  }
}

export async function removeFromCart(
  lineId: string
): Promise<{ ok: true; cart: Cart } | { ok: false; error: string }> {
  try {
    const store = cookies();
    const cartId = store.get(CART_COOKIE)?.value;
    if (!cartId) return { ok: false, error: 'Your cart could not be found.' };
    const cart = await removeCartLines(cartId, [lineId]);
    return { ok: true, cart };
  } catch (err) {
    console.error('[cart] removeFromCart failed', err);
    const cartId = cookies().get(CART_COOKIE)?.value;
    return (cartId && (await expiredCartResult(cartId))) || { ok: false, error: GENERIC_CART_ERROR };
  }
}

export async function applyDiscount(
  code: string
): Promise<{ ok: true; cart: Cart } | { ok: false; error: string }> {
  try {
    const store = cookies();
    const cartId = store.get(CART_COOKIE)?.value;
    if (!cartId) return { ok: false, error: 'Your cart could not be found.' };
    const cart = await applyDiscountCode(cartId, code);
    const appliedOk = cart.discountCodes.some((d) => d.code.toLowerCase() === code.toLowerCase() && d.applicable);
    if (!appliedOk) {
      return { ok: false, error: 'That code is not valid or has expired.' };
    }
    return { ok: true, cart };
  } catch (err) {
    console.error('[cart] applyDiscount failed', err);
    const cartId = cookies().get(CART_COOKIE)?.value;
    return (cartId && (await expiredCartResult(cartId))) || { ok: false, error: GENERIC_CART_ERROR };
  }
}

// "Buy Now" checks out exactly one item, so it gets its own throwaway
// Shopify cart — never the shared cart in CART_COOKIE (that cart persists
// 30 days, and reusing it would silently carry earlier items into a
// checkout the customer expects to contain only this product). The cookie
// is deliberately left untouched.
export async function createBuyNowCheckout(
  merchandiseId: string,
  quantity: number = 1,
  couponCode?: string
): Promise<{ ok: true; cartId: string; checkoutUrl: string } | { ok: false; error: string }> {
  try {
    if (!isShopifyConfigured()) {
      return { ok: false, error: 'Store is not connected yet. Configure Shopify to enable checkout.' };
    }
    let cart = await shopifyCreateCart([{ merchandiseId, quantity }]);
    if (couponCode) {
      // A code that doesn't apply to this item shouldn't block the
      // purchase — fall back to the undiscounted cart.
      cart = await applyDiscountCode(cart.id, couponCode).catch(() => cart);
    }
    if (GOKWIK_ENABLED) rememberCheckoutCart(cart.id);
    return { ok: true, cartId: cart.id, checkoutUrl: cart.checkoutUrl };
  } catch (err) {
    console.error('[cart] createBuyNowCheckout failed', err);
    return { ok: false, error: GENERIC_CART_ERROR };
  }
}

export async function markCartCheckoutStarted(): Promise<void> {
  if (!GOKWIK_ENABLED) return;
  const cartId = cookies().get(CART_COOKIE)?.value;
  if (cartId) rememberCheckoutCart(cartId);
}

// Called from the browser after GoKwik reports an order, so the order number
// proves nothing: the order only counts if Shopify says it was created from a
// cart this browser holds (see getOrderForCheckoutCarts). A Buy Now order
// matches its own cart, so it never clears the shared one.
export async function confirmGokwikOrder(orderNumber: string): Promise<
  | { verified: false }
  | {
      verified: true;
      cartCleared: boolean;
      paymentPending: boolean;
      purchase: { orderName: string; currency: string; value: number; paymentType: PaymentType } | null;
    }
> {
  if (!GOKWIK_ENABLED || typeof orderNumber !== 'string') return { verified: false };

  const lookup = await getOrderForCheckoutCarts(orderNumber, checkoutCartTokens());
  if (lookup.status !== 'verified') return { verified: false };
  const { order } = lookup;

  const state = orderStateOf(order);
  const cartCleared = order.cartToken === currentCartToken() && !keepsCart(state);
  if (cartCleared) {
    // Keeps this order viewable here once the cart cookie is gone.
    rememberCheckoutCart(order.cartToken as string);
    cookies().delete(CART_COOKIE);
  }

  // Only the first reporter of an order, this or the orders/paid webhook, gets
  // to count it. This also covers another browser or device holding the cart.
  const reportsPurchase =
    countsAsPurchase(state) && (await claimPurchaseReport(order.id, 'browser')) === 'won';

  return {
    verified: true,
    cartCleared,
    paymentPending: state === 'payment_pending' && isWithinBrowserPurchaseWindow(order.createdAt),
    purchase:
      reportsPurchase
        ? {
            orderName: order.name,
            currency: order.total.currencyCode,
            value: Number(order.total.amount),
            paymentType: order.paymentType,
          }
        : null,
  };
}

export async function refreshCatalogue() {
  revalidateTag('products');
  revalidateTag('collections');
}
