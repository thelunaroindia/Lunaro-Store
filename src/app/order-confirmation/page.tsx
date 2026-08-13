import type { Metadata } from 'next';
import { formatMoney } from '@/lib/utils';
import { LinkButton } from '@/components/ui/Button';
import { UtilityPageBackdrop } from '@/components/ui/UtilityPageBackdrop';
import type { Money } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Your LUNARO order is confirmed.',
  // Every order-confirmation URL is customer-specific and short-lived —
  // never meant for search discovery.
  robots: { index: false, follow: false },
};

// Same Shopify Admin API pattern as /api/track-order — a token scoped to
// read_orders only, read server-side, never sent to the client.
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';

type VerifiedOrder = {
  name: string;
  total: Money;
  financialStatus: string;
  fulfillmentStatus: string;
  shippingMethod: string | null;
  address: {
    city: string | null;
    province: string | null;
    country: string | null;
    zip: string | null;
  } | null;
};

function lastTenDigits(value: string): string {
  return value.replace(/\D/g, '').slice(-10);
}

function formatStatus(status: string): string {
  return status.replaceAll('_', ' ').toLowerCase();
}

// The redirect that lands here (see docs on PURCHASE_TEST_MODE /
// order-confirmation in the task history) only ever carries order_number
// and phone as plain query params — never proof of payment on their own.
// This looks the order up server-side via the Admin API and only returns
// data once the order's own phone number matches what was passed in, the
// same two-factor pattern /api/track-order already uses with email.
async function getVerifiedOrder(
  orderNumberRaw: string,
  phoneRaw: string
): Promise<VerifiedOrder | null> {
  if (!DOMAIN || !ADMIN_TOKEN) return null;

  const phoneDigits = lastTenDigits(phoneRaw);
  if (!phoneDigits) return null;

  const name = orderNumberRaw.startsWith('#') ? orderNumberRaw : `#${orderNumberRaw}`;

  try {
    const res = await fetch(`https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_TOKEN,
      },
      body: JSON.stringify({
        query: `#graphql
          query OrderConfirmation($query: String!) {
            orders(first: 1, query: $query) {
              nodes {
                name
                displayFinancialStatus
                displayFulfillmentStatus
                phone
                customer { phone }
                totalPriceSet { shopMoney { amount currencyCode } }
                shippingLine { title }
                shippingAddress { city province country zip }
              }
            }
          }
        `,
        variables: { query: `name:${name}` },
      }),
      cache: 'no-store',
    });

    const json = await res.json();
    const order = json?.data?.orders?.nodes?.[0];
    if (!order) return null;

    const orderPhoneDigits = lastTenDigits(order.phone ?? order.customer?.phone ?? '');
    if (!orderPhoneDigits || orderPhoneDigits !== phoneDigits) return null;

    return {
      name: order.name,
      total: order.totalPriceSet.shopMoney,
      financialStatus: order.displayFinancialStatus,
      fulfillmentStatus: order.displayFulfillmentStatus,
      shippingMethod: order.shippingLine?.title ?? null,
      address: order.shippingAddress
        ? {
            city: order.shippingAddress.city,
            province: order.shippingAddress.province,
            country: order.shippingAddress.country,
            zip: order.shippingAddress.zip,
          }
        : null,
    };
  } catch (err) {
    console.error('[order-confirmation] Shopify Admin API error', err);
    return null;
  }
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { order_number?: string; phone?: string };
}) {
  const { order_number: orderNumber, phone } = searchParams;

  const order =
    orderNumber && phone ? await getVerifiedOrder(orderNumber, phone) : null;

  return (
    <UtilityPageBackdrop>
      <div className="container-lunaro max-w-xl pt-32 pb-24 md:pt-40">
        <p className="eyebrow text-silver">Order Confirmed</p>

        <h1 className="mt-4 font-display text-display-md leading-[0.95] text-lunar">
          THANK YOU FOR
          <br />
          ENTERING THE WORLD.
        </h1>

        {order ? (
          <>
            <p className="mt-6 text-sm text-mist">
              Order {order.name}
              <br />
              Payment confirmed. Your piece is now being prepared for
              dispatch.
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
              {order.address && (
                <div className="flex justify-between gap-6 border-t border-graphite pt-3 text-mist">
                  <span>Delivery Address</span>
                  <span className="text-right text-lunar">
                    {[
                      order.address.city,
                      order.address.province,
                      order.address.zip,
                      order.address.country,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="mt-6 text-sm text-mist">
            Payment confirmed. Your piece is now being prepared for dispatch.
            You&apos;ll receive a confirmation by email, and you can look up
            your order anytime with your order number.
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
