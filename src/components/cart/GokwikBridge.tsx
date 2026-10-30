'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { confirmGokwikOrder } from '@/actions/cart';
import { useCartUI } from '@/context/CartUIContext';
import { trackPurchaseOnce } from '@/lib/analytics';
import { GOKWIK_ENABLED } from '@/lib/config';
import { loadGokwikSdk, subscribeToGokwikMessages } from '@/lib/gokwik';

// A just-placed order can take a moment to appear in the Admin API.
const ORDER_LOOKUP_RETRY_MS = 3000;
// While an order's payment is pending, keep checking for as long as this
// browser is responsible for reporting it (see src/lib/lateOrderPayment.ts).
const PENDING_PAYMENT_RECHECK_MS = 15_000;

// Rendered from the root layout so GoKwik's messages are heard on every page.
// Also reused by /order-confirmation (via orderNumber) for the case where
// GoKwik's post-order navigation is what brings the customer back.
export default function GokwikBridge({ orderNumber }: { orderNumber?: string }) {
  const { setCart } = useCartUI();
  const router = useRouter();

  useEffect(() => {
    if (!GOKWIK_ENABLED) return;

    let cancelled = false;

    async function syncVerifiedOrder(order: string, retries: number) {
      const result = await confirmGokwikOrder(order).catch(() => null);
      if (cancelled) return;

      if (!result?.verified) {
        if (retries > 0) {
          setTimeout(() => void syncVerifiedOrder(order, retries - 1), ORDER_LOOKUP_RETRY_MS);
        }
        return;
      }

      if (result.purchase) trackPurchaseOnce(result.purchase);
      if (result.paymentPending) {
        setTimeout(() => void syncVerifiedOrder(order, 0), PENDING_PAYMENT_RECHECK_MS);
      }
      if (result.cartCleared) {
        setCart(null);
        // /cart renders from server data; the drawer uses the state above.
        router.refresh();
      }
    }

    if (orderNumber) {
      void syncVerifiedOrder(orderNumber, 0);
      return () => {
        cancelled = true;
      };
    }

    // Warm the SDK so the first Checkout click isn't left waiting on it. A
    // failure here is silent — the click loads it again and reports properly.
    void loadGokwikSdk().catch(() => undefined);

    const unsubscribe = subscribeToGokwikMessages((order) => {
      void syncVerifiedOrder(order, 1);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
    // setCart/router are stable; a new order is the only thing that should re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  return null;
}
