'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCartUI } from '@/context/CartUIContext';
import { formatMoney } from '@/lib/utils';
import { payments, prepaidIncentive } from '@/lib/config';
import { LinkButton } from '@/components/ui/Button';
import { cartToFastrProducts, openFastrCheckout } from '@/lib/fastr';
import { trackEvent, cartEventParams } from '@/lib/analytics';
import CartLineItem from './CartLineItem';

// Fastr's SDK exposes no close/cancel/error callback (confirmed against the
// live window.shiprocketCheckoutEvents object — only buyProduct/buyCart/
// buyDirect exist), so there's no real event to react to when the customer
// closes the checkout overlay without paying. Without this, "checkingOut"
// would stay true forever and the button would be stuck disabled. This is a
// bounded safety-net re-enable, not a delay on opening checkout itself —
// openFastrCheckout() below still fires immediately, synchronously, on click.
const CHECKOUT_REENABLE_MS = 2500;

export default function CartDrawer() {
  const { cart, setCart, isOpen, close } = useCartUI();
  const panelRef = useRef<HTMLDivElement>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (isOpen && cart && cart.lines.length > 0) {
      trackEvent('view_cart', cartEventParams(cart));
    }
    // Fires each time the drawer opens with items in it — cart contents
    // only, no PII.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function handleCheckout() {
    if (checkingOut || !cart) return;
    setCheckingOut(true);
    trackEvent('begin_checkout', cartEventParams(cart));
    openFastrCheckout(cartToFastrProducts(cart));
    setTimeout(() => setCheckingOut(false), CHECKOUT_REENABLE_MS);
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      panelRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  const isEmpty = !cart || cart.lines.length === 0;

  return (
    <div className={`fixed inset-0 z-[70] ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-obsidian/70 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        tabIndex={-1}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-obsidian shadow-2xl transition-transform duration-500 ease-lunar ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-graphite p-6">
          <p className="eyebrow text-lunar">Cart {cart && cart.totalQuantity > 0 ? `(${cart.totalQuantity})` : ''}</p>
          <button onClick={close} aria-label="Close cart" className="text-eyebrow uppercase tracking-wider2 text-lunar">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-display text-2xl text-lunar">Your cart is empty.</p>
              <p className="mt-2 text-sm text-mist">Explore the current drop to begin.</p>
              <LinkButton href="/shop" variant="ghost" className="mt-8" onClick={close}>
                Shop All
              </LinkButton>
            </div>
          ) : (
            cart!.lines.map((line) => <CartLineItem key={line.id} line={line} onCartChange={setCart} />)
          )}
        </div>

        {!isEmpty && cart && (
          <div className="border-t border-graphite p-6">
            <div className="flex justify-between text-sm text-mist">
              <span>Subtotal</span>
              <span>{formatMoney(cart.cost.subtotalAmount)}</span>
            </div>
            <p className="mt-2 text-xs text-mist">Taxes and shipping calculated at checkout.</p>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkingOut}
              className="mt-5 flex w-full items-center justify-center bg-lunar px-7 py-4 text-eyebrow uppercase tracking-wider3 text-obsidian transition-colors hover:bg-silver disabled:opacity-60"
            >
              {checkingOut ? 'Opening Checkout…' : 'Checkout'}
            </button>
            <p className="mt-3 text-center text-xs text-mist">{prepaidIncentive}</p>
            <p className="mt-3 text-center text-[11px] text-mist">
              Secure Payments — {payments.methods.join(' · ')}
            </p>
            <Link
              href="/cart"
              onClick={close}
              className="mt-4 block text-center text-xs uppercase tracking-wider2 text-mist link-underline"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
