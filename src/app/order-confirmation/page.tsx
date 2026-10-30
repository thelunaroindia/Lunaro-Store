import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { formatMoney } from '@/lib/utils';
import { LinkButton } from '@/components/ui/Button';
import { UtilityPageBackdrop } from '@/components/ui/UtilityPageBackdrop';
import { checkoutCartTokens } from '@/lib/checkoutCarts';
import { GOKWIK_ENABLED } from '@/lib/config';
import { orderStateOf, type OrderState } from '@/lib/orderState';
import { getOrderForCheckoutCarts } from '@/lib/verifiedOrder';
import GokwikBridge from '@/components/cart/GokwikBridge';

export const metadata: Metadata = {
  title: 'Order Status',
  description: 'The status of your LUNARO order.',
  // Every order-confirmation URL is customer-specific and short-lived —
  // never meant for search discovery.
  robots: { index: false, follow: false },
};

function formatStatus(status: string): string {
  return status.replaceAll('_', ' ').toLowerCase();
}

const STATE_COPY: Record<OrderState, { eyebrow: string; heading: string[]; body: string }> = {
  paid: {
    eyebrow: 'Order Confirmed',
    heading: ['THANK YOU FOR', 'ENTERING THE WORLD.'],
    body: 'Payment confirmed. Your piece is now being prepared for dispatch.',
  },
  cod: {
    eyebrow: 'Order Placed',
    heading: ['THANK YOU FOR', 'ENTERING THE WORLD.'],
    body: 'Your order is placed. Payment is due in cash on delivery.',
  },
  authorized: {
    eyebrow: 'Order Placed',
    heading: ['THANK YOU FOR', 'ENTERING THE WORLD.'],
    body: 'Your order is placed and your payment is authorised. It has not been captured yet.',
  },
  payment_pending: {
    eyebrow: 'Order Placed',
    heading: ['YOUR ORDER', 'IS PLACED.'],
    body: 'Your payment has not been confirmed yet. This page shows the latest status whenever you reload it.',
  },
  payment_failed: {
    eyebrow: 'Payment Not Completed',
    heading: ['PAYMENT WAS', 'NOT COMPLETED.'],
    body: 'This order has no completed payment, so it will not be dispatched. Contact us if you were charged.',
  },
  refunded: {
    eyebrow: 'Order Refunded',
    heading: ['THIS ORDER', 'WAS REFUNDED.'],
    body: 'The payment for this order has been refunded. Processing time depends on your bank or payment provider.',
  },
  cancelled: {
    eyebrow: 'Order Cancelled',
    heading: ['THIS ORDER', 'WAS CANCELLED.'],
    body: 'This order will not be dispatched. Contact us if you have any questions.',
  },
};

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { order_number?: string; phone?: string };
}) {
  const { order_number: orderNumber, phone } = searchParams;

  // Older links carried the customer's phone. It proves nothing here, and left
  // in the URL it would reach browser history and analytics page paths.
  if (phone !== undefined) {
    redirect(orderNumber ? `/order-confirmation?order_number=${encodeURIComponent(orderNumber)}` : '/order-confirmation');
  }

  const lookup =
    GOKWIK_ENABLED && orderNumber
      ? await getOrderForCheckoutCarts(orderNumber, checkoutCartTokens())
      : ({ status: 'unverified' } as const);

  const order = lookup.status === 'verified' ? lookup.order : null;
  const copy = order ? STATE_COPY[orderStateOf(order)] : null;
  const addressLine = [
    order?.address?.city,
    order?.address?.province,
    order?.address?.zip,
    order?.address?.country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <UtilityPageBackdrop>
      <div className="container-lunaro max-w-xl pt-32 pb-24 md:pt-40">
        <p className="eyebrow text-silver">{copy?.eyebrow ?? 'Order Status'}</p>

        <h1 className="mt-4 font-display text-display-md leading-[0.95] text-lunar">
          {copy ? (
            <>
              {copy.heading[0]}
              <br />
              {copy.heading[1]}
            </>
          ) : lookup.status === 'error' ? (
            <>
              WE COULDN&apos;T
              <br />
              CHECK THIS ORDER.
            </>
          ) : (
            <>
              WE COULDN&apos;T
              <br />
              VERIFY THIS ORDER.
            </>
          )}
        </h1>

        {order && copy ? (
          <>
            {orderNumber && <GokwikBridge orderNumber={orderNumber} />}

            <p className="mt-6 text-sm text-mist">
              Order {order.name}
              <br />
              {copy.body}
            </p>

            <div className="mt-10 space-y-3 border border-graphite p-6 text-sm">
              <div className="flex justify-between text-mist">
                <span>Order Number</span>
                <span className="text-lunar">{order.name}</span>
              </div>
              <div className="flex justify-between text-mist">
                <span>Total</span>
                <span className="text-lunar">{formatMoney(order.total)}</span>
              </div>
              <div className="flex justify-between text-mist">
                <span>Payment Status</span>
                <span className="text-lunar">
                  {formatStatus(order.financialStatus)}
                </span>
              </div>
              <div className="flex justify-between text-mist">
                <span>Fulfillment</span>
                <span className="text-lunar">
                  {formatStatus(order.fulfillmentStatus)}
                </span>
              </div>
              {order.shippingMethod && (
                <div className="flex justify-between border-t border-graphite pt-3 text-mist">
                  <span>Shipping Method</span>
                  <span className="text-lunar">{order.shippingMethod}</span>
                </div>
              )}
              {addressLine && (
                <div className="flex justify-between gap-6 border-t border-graphite pt-3 text-mist">
                  <span>Delivery Address</span>
                  <span className="text-right text-lunar">{addressLine}</span>
                </div>
              )}
            </div>
          </>
        ) : lookup.status === 'error' ? (
          <p className="mt-6 text-sm text-mist">
            Something went wrong on our side while checking, which says nothing
            about your order. Please reload this page in a moment.
          </p>
        ) : (
          <p className="mt-6 text-sm text-mist">
            This doesn&apos;t mean anything went wrong with your order. Order
            details only show in the browser that placed it. You can look your
            order up with its number and your phone number.
          </p>
        )}

        <div className="mt-10 flex flex-wrap gap-4">
          <LinkButton href="/track-order" variant="ghost">
            Track Order
          </LinkButton>
          <LinkButton href="/" variant="underline">
            Continue Exploring
          </LinkButton>
        </div>
      </div>
    </UtilityPageBackdrop>
  );
}
