'use client';

import { useState } from 'react';
import { markCartCheckoutStarted } from '@/actions/cart';
import { trackEvent } from '@/lib/analytics';
import { goToCheckout } from '@/lib/checkout';
import { GOKWIK_ENABLED } from '@/lib/config';
import { loadGokwikSdk, openGokwikCheckout } from '@/lib/gokwik';

// Checkout navigates away to Shopify, but a customer who comes Back can get
// the page restored from the browser's back/forward cache with "checkingOut"
// still true. This bounded safety-net re-enable keeps the button from staying
// stuck disabled in that case.
const CHECKOUT_REENABLE_MS = 2500;

export type CheckoutTarget = {
  cartId: string;
  checkoutUrl: string;
  kind: 'cart' | 'buy_now';
};

// The one route every Checkout / Buy Now button takes. With GoKwik off this is
// exactly the Shopify redirect; with it on, a failed SDK load keeps the
// customer's target in `failedTarget` so CheckoutFailureNotice can offer a
// retry or a Shopify checkout for the same cart.
export function useCheckoutHandoff({ beforeOpen }: { beforeOpen?: () => void } = {}) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [failedTarget, setFailedTarget] = useState<CheckoutTarget | null>(null);

  function finish() {
    setTimeout(() => setCheckingOut(false), CHECKOUT_REENABLE_MS);
  }

  function continueToShopify(target: CheckoutTarget) {
    setFailedTarget(null);
    setCheckingOut(true);
    // Nothing to navigate to — restore the button immediately rather than
    // making the customer wait out the full re-enable window.
    if (goToCheckout(target.checkoutUrl)) finish();
    else setCheckingOut(false);
  }

  async function startCheckout(target: CheckoutTarget): Promise<void> {
    if (!GOKWIK_ENABLED) {
      continueToShopify(target);
      return;
    }

    setFailedTarget(null);
    setCheckingOut(true);

    try {
      await loadGokwikSdk();
      if (target.kind === 'cart') {
        // Only affects whether the cart auto-clears later, so a failure here
        // must not stop the customer from checking out.
        await markCartCheckoutStarted().catch((err) => {
          console.error('[checkout] Could not mark cart checkout', err);
        });
      }
      beforeOpen?.();
      openGokwikCheckout(target.cartId, target.checkoutUrl);
      finish();
    } catch (err) {
      console.error('[checkout] GoKwik unavailable', err);
      trackEvent('gokwik_sdk_failed', { checkout_kind: target.kind });
      setFailedTarget(target);
      setCheckingOut(false);
    }
  }

  function fallBackToShopify() {
    if (!failedTarget) return;
    trackEvent('gokwik_shopify_fallback', { reason: 'sdk_failed' });
    continueToShopify(failedTarget);
  }

  function retry() {
    if (failedTarget) void startCheckout(failedTarget);
  }

  return { checkingOut, checkoutFailed: failedTarget !== null, startCheckout, retry, fallBackToShopify };
}
