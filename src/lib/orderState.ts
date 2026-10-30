// What the customer may be told about an order. Placing an order and paying
// for it are separate facts: anything Shopify doesn't report as paid must
// never be described as paid.

export type PaymentType = 'prepaid' | 'cod' | 'unknown';

export type OrderState =
  | 'paid'
  | 'cod'
  | 'authorized'
  | 'payment_pending'
  | 'payment_failed'
  | 'refunded'
  | 'cancelled';

// COD orders are placed against a manual payment method literally named
// "Cash on Delivery" in Shopify Admin → Settings → Payments, but GoKwik's
// gateway name isn't documented, so "cod" is also matched as a separate token
// (e.g. "gokwik_cod"), never inside another word.
export function derivePaymentType(gatewayNames: string[]): PaymentType {
  if (gatewayNames.length === 0) return 'unknown';

  const isCod = gatewayNames.some((gateway) =>
    /cash on delivery|(^|[^a-z])cod([^a-z]|$)/i.test(gateway)
  );

  return isCod ? 'cod' : 'prepaid';
}

export function orderStateOf(order: {
  cancelled: boolean;
  financialStatus: string;
  paymentType: PaymentType;
}): OrderState {
  if (order.cancelled) return 'cancelled';

  switch (order.financialStatus) {
    case 'PAID':
    case 'PARTIALLY_REFUNDED':
      return 'paid';
    case 'AUTHORIZED':
      return 'authorized';
    case 'REFUNDED':
      return 'refunded';
    case 'VOIDED':
    case 'EXPIRED':
      return 'payment_failed';
    case 'PENDING':
      return order.paymentType === 'cod' ? 'cod' : 'payment_pending';
    default:
      // PARTIALLY_PAID and anything Shopify adds later.
      return 'payment_pending';
  }
}

// The sale is real, so it's reported to analytics.
export function countsAsPurchase(state: OrderState): boolean {
  return state === 'paid' || state === 'cod' || state === 'authorized';
}

// The customer may still want these items.
export function keepsCart(state: OrderState): boolean {
  return state === 'cancelled' || state === 'payment_failed';
}

// "gid://shopify/Cart/<token>?key=<key>" → "<token>".
export function cartTokenOf(cartIdOrToken: string): string {
  return cartIdOrToken.replace('gid://shopify/Cart/', '').replace(/\?.*$/, '');
}
