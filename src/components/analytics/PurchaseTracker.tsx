'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

const DEDUP_KEY_PREFIX = 'lunaro_purchase_tracked_';

// Fires the `purchase` event exactly once per Shopify order number, ever,
// in this browser — refreshing /order-confirmation (or revisiting the same
// link later) must not create duplicate Purchase events in GA4/Meta.
//
// Dedup is keyed by the real Shopify order number (e.g. "#1002") in
// localStorage — not sensitive customer data, just a boolean marker next to
// a public order identifier. This only guards against *this browser*
// re-firing; a customer opening the same confirmation link on a second
// device would still count once there too. That's a disclosed limitation
// of client-only dedup, not a bug — a fully cross-device-safe guarantee
// would need server-side event tagging, which is out of scope here.
//
// This component only ever mounts with a server-verified order (see
// src/app/order-confirmation/page.tsx — `order` is null unless Shopify's
// own Admin API confirmed it via the order number + phone match), so a
// mount here already represents "genuinely paid," never a client-side guess.
export default function PurchaseTracker({
  orderName,
  currency,
  value,
  paymentType,
}: {
  orderName: string;
  currency: string;
  value: number;
  paymentType: 'prepaid' | 'cod' | 'unknown';
}) {
  useEffect(() => {
    const dedupKey = `${DEDUP_KEY_PREFIX}${orderName}`;

    try {
      if (window.localStorage.getItem(dedupKey)) return;
      window.localStorage.setItem(dedupKey, '1');
    } catch {
      // localStorage unavailable (private browsing, storage disabled) —
      // fall through and track anyway rather than silently dropping a
      // genuine purchase; the worst case is an occasional duplicate, which
      // is far better than never recording a real sale.
    }

    trackEvent('purchase', {
      transaction_id: orderName,
      currency,
      value,
      payment_type: paymentType,
    });
    // Runs once per mount (once per real page view of a verified order) —
    // orderName only changes if a different order is displayed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderName]);

  return null;
}
