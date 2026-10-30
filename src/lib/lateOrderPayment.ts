// Who reports `purchase` for a prepaid GoKwik order whose payment lands late.
//
// The browser reports orders it can see as paid soon after they're placed; the
// orders/paid webhook reports the rest. Both sides apply the same age cutoff
// instead of sharing storage, so each order has exactly one reporter.
export const BROWSER_PURCHASE_WINDOW_MS = 2 * 60 * 1000;

export function isWithinBrowserPurchaseWindow(orderCreatedAt: string, now = Date.now()): boolean {
  return now - new Date(orderCreatedAt).getTime() < BROWSER_PURCHASE_WINDOW_MS;
}

// Exact gateway names as they appear on GoKwik orders. There's no documented
// list, so nothing is assumed: an empty list means the webhook reports nothing.
export function gokwikOrderGateways(): string[] {
  return (process.env.GOKWIK_ORDER_GATEWAYS ?? '')
    .split(',')
    .map((gateway) => gateway.trim().toLowerCase())
    .filter(Boolean);
}

export function isLatePaymentReportingConfigured(): boolean {
  return Boolean(
    process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET &&
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID &&
      process.env.SHOPIFY_ADMIN_CLIENT_SECRET &&
      gokwikOrderGateways().length > 0
  );
}
