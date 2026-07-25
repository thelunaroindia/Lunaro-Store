import type { Metadata } from 'next';
import { policies, contact } from '@/lib/config';
import { PolicyLayout } from '@/components/ui/PolicyLayout';

export const metadata: Metadata = { title: 'Shipping & Returns' };

export default function ShippingReturnsPage() {
  return (
    <PolicyLayout heading={policies.shipping.heading} intro={policies.shipping.intro} points={policies.shipping.points}>
      <p className="mt-10 text-sm text-mist">
        Questions about a specific order? Contact us at{' '}
        <a href={`mailto:${contact.email}`} className="link-underline text-lunar">
          {contact.email}
        </a>
        .
      </p>
    </PolicyLayout>
  );
}
