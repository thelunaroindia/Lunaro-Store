// TypeScript may not have type declarations for 'server-only' (side-effect import).
// @ts-ignore: Module has no type declarations
import 'server-only';

import { derivePaymentType, orderCartToken, type PaymentType } from '@/lib/orderState';
import { isShopifyAdminConfigured, shopifyAdminFetch } from '@/lib/shopifyAdmin';
import type { Money } from '@/lib/types';

export type VerifiedOrder = {
  id: string;
  name: string;
  createdAt: string;
  cartToken: string | null;
  cancelled: boolean;
  total: Money;
  received: Money;
  outstanding: Money;
  financialStatus: string;
  fulfillmentStatus: string;
  shippingMethod: string | null;
  paymentType: PaymentType;
  // Product and variant IDs only, for analytics content IDs. Lines whose
  // product was since deleted are left out.
  lines: { productId: string; variantId: string; quantity: number; unitPrice: number }[];
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

// The order's cart token (see orderCartToken) records the cart used to create
// it, so an order is only ever shown, or acted on, for a browser holding that
// cart. Knowing an order number isn't enough, and an order with no token fails
// closed.
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
          id: string;
          name: string;
          createdAt: string;
          cartToken: string | null;
          customAttributes: { key: string; value: string | null }[];
          cancelledAt: string | null;
          displayFinancialStatus: string;
          displayFulfillmentStatus: string;
          totalPriceSet: { shopMoney: Money };
          totalReceivedSet: { shopMoney: Money };
          totalOutstandingSet: { shopMoney: Money };
          shippingLine: { title: string } | null;
          paymentGatewayNames: string[] | null;
          lineItems: {
            nodes: {
              quantity: number;
              product: { id: string } | null;
              variant: { id: string } | null;
              originalUnitPriceSet: { shopMoney: Money };
            }[];
          };
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
              id
              name
              createdAt
              cartToken
              customAttributes { key value }
              cancelledAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet { shopMoney { amount currencyCode } }
              totalReceivedSet { shopMoney { amount currencyCode } }
              totalOutstandingSet { shopMoney { amount currencyCode } }
              shippingLine { title }
              paymentGatewayNames
              lineItems(first: 50) {
                nodes {
                  quantity
                  product { id }
                  variant { id }
                  originalUnitPriceSet { shopMoney { amount currencyCode } }
                }
              }
              shippingAddress { city province country zip }
            }
          }
        }
      `,
      { query: `name:${name}` }
    );

    const order = data.orders.nodes[0];
    if (!order || order.name !== name) return { status: 'unverified' };

    const cartToken = orderCartToken(order.cartToken, order.customAttributes);
    if (!cartToken || !cartTokens.includes(cartToken)) return { status: 'unverified' };

    return {
      status: 'verified',
      order: {
        id: order.id,
        name: order.name,
        createdAt: order.createdAt,
        cartToken,
        cancelled: order.cancelledAt !== null,
        total: order.totalPriceSet.shopMoney,
        received: order.totalReceivedSet.shopMoney,
        outstanding: order.totalOutstandingSet.shopMoney,
        financialStatus: order.displayFinancialStatus,
        fulfillmentStatus: order.displayFulfillmentStatus,
        shippingMethod: order.shippingLine?.title ?? null,
        paymentType: derivePaymentType(order.paymentGatewayNames ?? []),
        lines: (order.lineItems?.nodes ?? []).flatMap((line) =>
          line.product && line.variant && line.quantity > 0
            ? [
                {
                  productId: line.product.id,
                  variantId: line.variant.id,
                  quantity: line.quantity,
                  unitPrice: Number(line.originalUnitPriceSet.shopMoney.amount),
                },
              ]
            : []
        ),
        address: order.shippingAddress,
      },
    };
  } catch (err) {
    console.error('[order-confirmation] Shopify Admin API error', err);
    return { status: 'error' };
  }
}
