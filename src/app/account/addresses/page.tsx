import { redirect } from 'next/navigation';

// Address management lives entirely in Shopify's hosted Customer Account UI.
const customerAccountUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL;

export default function AddressesRedirectPage() {
  redirect(customerAccountUrl || '/');
}
