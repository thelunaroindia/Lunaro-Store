import { redirect } from 'next/navigation';

// Login is handled entirely by Shopify's hosted Customer Account flow —
// there is no custom password form to keep secure here. This route exists
// only so /account/login is a stable link from emails and the header.
export default function LoginRedirectPage() {
  redirect('/account');
}
