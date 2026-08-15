'use client';

import { useEffect, useState, useTransition } from 'react';
import { formatMoney } from '@/lib/utils';
import { payments, prepaidIncentive } from '@/lib/config';
import { applyDiscount } from '@/actions/cart';
import { Button } from '@/components/ui/Button';
import { cartToFastrProducts, openFastrCheckout } from '@/lib/fastr';
import { trackEvent, cartEventParams } from '@/lib/analytics';
import CartLineItem from '@/components/cart/CartLineItem';
import type { Cart } from '@/lib/types';

// See CartDrawer.tsx for why this is a bounded safety-net reset rather than
// a real close/cancel callback — Fastr's SDK doesn't expose one.
const CHECKOUT_REENABLE_MS = 2500;

export default function CartPageClient({ initialCart }: { initialCart: Cart }) {
  const [cart, setCart] = useState(initialCart);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (cart.lines.length > 0) {
      trackEvent('view_cart', cartEventParams(cart));
    }
    // Fires once per full-cart-page load — cart contents only, no PII.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCheckout() {
    if (checkingOut) return;
    setCheckingOut(true);
    trackEvent('begin_checkout', cartEventParams(cart));
    openFastrCheckout(cartToFastrProducts(cart));
    setTimeout(() => setCheckingOut(false), CHECKOUT_REENABLE_MS);
  }

  function onApplyDiscount(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    startTransition(async () => {
      const result = await applyDiscount(code.trim());
      if (result.ok) {
        setCart(result.cart);
        setCode('');
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="grid gap-16 lg:grid-cols-[1.6fr_1fr]">
      <div>
        {cart.lines.map((line) => (
          <CartLineItem key={line.id} line={line} onCartChange={setCart} />
        ))}
      </div>

      <div className="h-fit border border-graphite p-6">
        <form onSubmit={onApplyDiscount} className="flex gap-2 border-b border-graphite pb-6">
          <label htmlFor="discount" className="sr-only">
            Discount code
          </label>
          <input
            id="discount"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Discount code"
            className="w-full bg-transparent text-sm text-lunar placeholder:text-mist focus:outline-none"
          />
          <Button type="submit" variant="underline" disabled={isPending}>
            Apply
          </Button>
        </form>
        {error && <p className="mt-2 text-xs text-silver">{error}</p>}
        {cart.discountCodes.filter((d) => d.applicable).length > 0 && (
          <p className="mt-3 text-xs text-mist">
            Applied: {cart.discountCodes.filter((d) => d.applicable).map((d) => d.code).join(', ')}
          </p>
        )}

        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between text-mist">
            <span>Subtotal</span>
            <span>{formatMoney(cart.cost.subtotalAmount)}</span>
          </div>
          <div className="flex justify-between text-mist">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="flex justify-between border-t border-graphite pt-2 text-lunar">
            <span>Total</span>
            <span>{formatMoney(cart.cost.totalAmount)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={checkingOut}
          className="mt-6 flex w-full items-center justify-center bg-lunar px-7 py-4 text-eyebrow uppercase tracking-wider3 text-obsidian transition-colors hover:bg-silver disabled:opacity-60"
        >
          {checkingOut ? 'Opening Checkout…' : 'Checkout'}
        </button>
        <p className="mt-3 text-center text-xs text-mist">{prepaidIncentive}</p>
        <p className="mt-3 text-center text-[11px] text-mist">
          Secure Payments — {payments.methods.join(' · ')}
        </p>
      </div>
    </div>
  );
}
