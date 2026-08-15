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
import type { Cart } from '@/lib/types';

const CART_COOKIE = 'lunaro_cart_id';
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

    const cart = await addCartLines(cartId, [{ merchandiseId, quantity }]);
    return { ok: true, cart };
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
    return { ok: false, error: GENERIC_CART_ERROR };
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
    return { ok: false, error: GENERIC_CART_ERROR };
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
    return { ok: false, error: GENERIC_CART_ERROR };
  }
}

export async function refreshCatalogue() {
  revalidateTag('products');
  revalidateTag('collections');
}
