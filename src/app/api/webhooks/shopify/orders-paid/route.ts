import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { waitUntil } from '@vercel/functions';
import { NextResponse, type NextRequest } from 'next/server';
import { GOKWIK_ENABLED } from '@/lib/config';
import {
  WEBHOOK_GRACE_MS,
  gokwikOrderGateways,
  isLatePaymentReportingConfigured,
  isWithinBrowserPurchaseWindow,
} from '@/lib/lateOrderPayment';
import { derivePaymentType } from '@/lib/orderState';
import { claimPurchaseReport, orderGid, releasePurchaseClaim } from '@/lib/purchaseClaim';

type PaidOrder = {
  id: number;
  name: string;
  created_at: string;
  total_price: string;
  currency: string;
  payment_gateway_names?: string[];
  cancelled_at?: string | null;
};

function isAuthentic(rawBody: string, signature: string | null): boolean {
  const secret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest();
  const received = Buffer.from(signature, 'base64');
  return received.length === expected.length && timingSafeEqual(received, expected);
}

// Reports a paid GoKwik order the customer's browser didn't (see
// src/lib/purchaseClaim.ts). Only the order name and amount leave this
// function, never customer data. GA4 only: Meta's Conversions
// API requires customer information this integration deliberately doesn't read.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!isAuthentic(rawBody, req.headers.get('x-shopify-hmac-sha256'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Shopify retries anything but a 2xx, so an order that's simply not ours to
  // report is still a success.
  if (!GOKWIK_ENABLED || !isLatePaymentReportingConfigured()) {
    return NextResponse.json({ reported: false });
  }

  const order = JSON.parse(rawBody) as PaidOrder;
  const gateways = order.payment_gateway_names ?? [];
  const allowed = gokwikOrderGateways();

  if (
    order.cancelled_at ||
    !gateways.some((gateway) => allowed.includes(gateway.toLowerCase())) ||
    // COD was reported when it was placed; collecting the cash isn't a new sale.
    derivePaymentType(gateways) === 'cod'
  ) {
    return NextResponse.json({ reported: false });
  }

  // Shopify gives up on a slow response, so a recent order is answered now and
  // reported after the customer's open page, if any, has had its chance.
  if (isWithinBrowserPurchaseWindow(order.created_at)) {
    waitUntil(
      new Promise((resolve) => setTimeout(resolve, WEBHOOK_GRACE_MS))
        .then(() => reportPurchase(order))
        .then((result) => {
          if (result === 'failed') console.error('[orders-paid webhook] Report failed after grace period');
        })
    );
    return NextResponse.json({ reported: false, deferred: true });
  }

  const result = await reportPurchase(order);
  if (result === 'failed') {
    return NextResponse.json({ error: 'Reporting failed' }, { status: 502 });
  }
  return NextResponse.json({ reported: result === 'reported' });
}

async function reportPurchase(order: PaidOrder): Promise<'reported' | 'already_reported' | 'failed'> {
  const orderId = orderGid(order.id);
  const claim = await claimPurchaseReport(orderId, 'webhook');
  if (claim === 'lost') return 'already_reported';
  if (claim === 'error') return 'failed';

  const params = new URLSearchParams({
    measurement_id: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID as string,
    api_secret: process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET as string,
  });

  // Stable per order. It can't be the customer's own browser ID, so this revenue
  // arrives without their session's attribution.
  const clientId = createHash('sha256').update(String(order.id)).digest('hex').slice(0, 32);

  const res = await fetch(`https://www.google-analytics.com/mp/collect?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      events: [
        {
          name: 'purchase',
          params: {
            transaction_id: order.name,
            currency: order.currency,
            value: Number(order.total_price),
            payment_type: 'prepaid',
            late_payment: true,
          },
        },
      ],
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error(`[orders-paid webhook] GA4 returned ${res.status}`);
    await releasePurchaseClaim(orderId);
    return 'failed';
  }

  return 'reported';
}
