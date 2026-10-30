// TypeScript may not have type declarations for 'server-only' (side-effect import).
// @ts-ignore: Module has no type declarations
import 'server-only';

import { cookies } from 'next/headers';
import { cartTokenOf } from '@/lib/orderState';

export const CART_COOKIE = 'lunaro_cart_id';

// Tokens of the carts this browser recently sent to GoKwik. An order belongs
// to this browser only if Shopify's Order.cartToken is one of these (or the
// current cart); a matching order number and phone can't show that.
const CHECKOUT_CARTS_COOKIE = 'lunaro_checkout_carts';
const MAX_REMEMBERED_CARTS = 5;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function rememberedTokens(): string[] {
  try {
    const parsed = JSON.parse(cookies().get(CHECKOUT_CARTS_COOKIE)?.value ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === 'string') : [];
  } catch {
    return [];
  }
}

// Server Actions only: Server Components can't set cookies.
export function rememberCheckoutCart(cartId: string): void {
  const token = cartTokenOf(cartId);
  const tokens = [token, ...rememberedTokens().filter((t) => t !== token)];
  cookies().set(CHECKOUT_CARTS_COOKIE, JSON.stringify(tokens.slice(0, MAX_REMEMBERED_CARTS)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: '/',
  });
}

export function currentCartToken(): string | null {
  const cartId = cookies().get(CART_COOKIE)?.value;
  return cartId ? cartTokenOf(cartId) : null;
}

export function checkoutCartTokens(): string[] {
  const current = currentCartToken();
  return current ? [current, ...rememberedTokens()] : rememberedTokens();
}
