// TypeScript may not have type declarations for 'server-only' (side-effect import).
// @ts-ignore: Module has no type declarations
import 'server-only';

import { cartTokenOf, derivePaymentType, type PaymentType } from '@/lib/orderState';
import { isShopifyAdminConfigured, shopifyAdminFetch } from '@/lib/shopifyAdmin';
import type { Money } from '@/lib/types';

export type VerifiedOrder = {
  name: string;
  createdAt: string;
  cartToken: string | null;
  cancelled: boolean;
  total: Money;
  financialStatus: string;
  fulfillmentStatus: string;
  shippingMethod: string | null;
  paymentType: PaymentType;
  // Null when absent, or when Shopify redacts it for this app.
  address: {
    city: string | null;
    province: string | null;
    country: string | null;
    zip: string | null;
  } | null;
};

// 'unverified' means Shopify answered and the order isn't tied to this browser;
// 'error' means we couldn't ask, which says nothing about the order.
export type OrderLookup =
  | { status: 'verified'; order: VerifiedOrder }
  | { status: 'unverified' }
  | { status: 'error' };

// Order.cartToken is Shopify's own record of "the cart that was used to create
// the order", so an order is only ever shown, or acted on, for a browser holding
// that cart. Knowing an order number isn't enough, and an order with no
// cartToken fails closed.
//
// Deliberately requests only order-level fields — never `customer { ... }`, and
// no phone or email, which verification doesn't use.
export async function getOrderForCheckoutCarts(
  orderNumber: string,
  cartTokens: string[]
): Promise<OrderLookup> {
  // Also keeps stray input out of the Admin API search query.
  if (cartTokens.length === 0 || !/^#?[\w-]{1,32}$/.test(orderNumber)) {
    return { status: 'unverified' };
  }
  if (!isShopifyAdminConfigured()) return { status: 'error' };

  const name = orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;

  try {
    const data = await shopifyAdminFetch<{
      orders: {
        nodes: {
          name: string;
          createdAt: string;
          cartToken: string | null;
          cancelledAt: string | null;
          displayFinancialStatus: string;
          displayFulfillmentStatus: string;
          totalPriceSet: { shopMoney: Money };
          shippingLine: { title: string } | null;
          paymentGatewayNames: string[] | null;
          shippingAddress: {
            city: string | null;
            province: string | null;
            country: string | null;
            zip: string | null;
          } | null;
        }[];
      };
    }>(
      `#graphql
        query OrderConfirmation($query: String!) {
          orders(first: 1, query: $query) {
            nodes {
              name
              createdAt
              cartToken
              cancelledAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet { shopMoney { amount currencyCode } }
              shippingLine { title }
              paymentGatewayNames
              shippingAddress { city province country zip }
            }
          }
        }
      `,
      { query: `name:${name}` }
    );

    const order = data.orders.nodes[0];
    if (!order || order.name !== name || !order.cartToken) return { status: 'unverified' };

    const cartToken = cartTokenOf(order.cartToken);
    if (!cartTokens.includes(cartToken)) return { status: 'unverified' };

    return {
      status: 'verified',
      order: {
        name: order.name,
        createdAt: order.createdAt,
        cartToken,
        cancelled: order.cancelledAt !== null,
        total: order.totalPriceSet.shopMoney,
        financialStatus: order.displayFinancialStatus,
        fulfillmentStatus: order.displayFulfillmentStatus,
        shippingMethod: order.shippingLine?.title ?? null,
        paymentType: derivePaymentType(order.paymentGatewayNames ?? []),
        address: order.shippingAddress,
      },
    };
  } catch (err) {
    console.error('[order-confirmation] Shopify Admin API error', err);
    return { status: 'error' };
  }
}
