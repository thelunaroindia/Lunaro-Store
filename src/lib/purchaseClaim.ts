// TypeScript may not have type declarations for 'server-only' (side-effect import).
// @ts-ignore: Module has no type declarations
import 'server-only';

import { shopifyAdminFetch } from '@/lib/shopifyAdmin';

// The one record of who reports `purchase` for an order. The browser and the
// orders/paid webhook both claim before reporting, and Shopify lets only the
// first write through: a null compareDigest means "only if this doesn't exist
// yet". Stored on the order in this app's own namespace. Needs write_orders.
const NAMESPACE = '$app';
const KEY = 'purchase_reported';

export type PurchaseClaim = 'won' | 'lost' | 'error';

export function orderGid(numericId: number): string {
  return `gid://shopify/Order/${numericId}`;
}

// 'error' reports nothing: a missed event can still be reported later by
// whoever claims next, while a duplicate can't be taken back.
export async function claimPurchaseReport(
  orderId: string,
  reporter: 'browser' | 'webhook'
): Promise<PurchaseClaim> {
  try {
    const data = await shopifyAdminFetch<{
      metafieldsSet: { metafields: { id: string }[] | null; userErrors: { code: string | null }[] } | null;
    }>(
      `#graphql
        mutation ClaimPurchaseReport($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields { id }
            userErrors { code }
          }
        }
      `,
      {
        metafields: [
          {
            ownerId: orderId,
            namespace: NAMESPACE,
            key: KEY,
            type: 'single_line_text_field',
            value: reporter,
            compareDigest: null,
          },
        ],
      }
    );

    const result = data?.metafieldsSet;
    if (!result) return 'error';
    if (result.userErrors.some((e) => e.code === 'STALE_OBJECT')) return 'lost';
    if (result.userErrors.length > 0 || !result.metafields?.length) {
      console.error('[purchase claim] Rejected:', result.userErrors.map((e) => e.code).join(', '));
      return 'error';
    }
    return 'won';
  } catch (err) {
    console.error('[purchase claim] Shopify Admin API error', err);
    return 'error';
  }
}

// Used when the report itself failed, so a Shopify retry can claim again.
export async function releasePurchaseClaim(orderId: string): Promise<void> {
  try {
    await shopifyAdminFetch(
      `#graphql
        mutation ReleasePurchaseClaim($metafields: [MetafieldIdentifierInput!]!) {
          metafieldsDelete(metafields: $metafields) {
            userErrors { message }
          }
        }
      `,
      { metafields: [{ ownerId: orderId, namespace: NAMESPACE, key: KEY }] }
    );
  } catch (err) {
    console.error('[purchase claim] Could not release claim', err);
  }
}
