import { redirect } from 'next/navigation';

// Order history lives entirely in Shopify's hosted Customer Account UI —
// there is no local order data to render here. This route is a stable
// link (from emails, the account page) that hands off to the real thing.
const customerAccountUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL;

export default function OrderHistoryRedirectPage() {
  redirect(customerAccountUrl || '/');
}
