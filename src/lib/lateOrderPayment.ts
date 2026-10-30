// Timing and configuration for reporting `purchase` on a prepaid GoKwik order.
// Who actually reports is settled by src/lib/purchaseClaim.ts; these only decide
// how long each side gives the other.

// How long a browser keeps rechecking an order whose payment is pending.
export const BROWSER_PURCHASE_WINDOW_MS = 2 * 60 * 1000;

// The browser's report keeps session attribution and reaches Meta, so for a
// recent order the webhook gives an open page time to report first. Longer than
// the browser's 15 second recheck, so a page that's still open wins.
export const WEBHOOK_GRACE_MS = 45 * 1000;

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
      process.env.SHOPIFY_ADMIN_CLIENT_ID &&
      process.env.SHOPIFY_ADMIN_CLIENT_SECRET &&
      gokwikOrderGateways().length > 0
  );
}
