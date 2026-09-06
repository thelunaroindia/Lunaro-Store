import type { Metadata } from 'next';
import { policies } from '@/lib/config';
import { canonicalUrl } from '@/lib/canonical';
import { PolicyLayout } from '@/components/ui/PolicyLayout';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'When and how LUNARO issues a refund.',
  alternates: { canonical: canonicalUrl('/refund-policy') },
};

export default function RefundPolicyPage() {
  return <PolicyLayout heading={policies.refund.heading} intro={policies.refund.intro} points={policies.refund.points} />;
}
