import type { Metadata } from 'next';
import { policies } from '@/lib/config';
import { PolicyLayout } from '@/components/ui/PolicyLayout';

export const metadata: Metadata = { title: 'Refund Policy' };

export default function RefundPolicyPage() {
  return <PolicyLayout heading={policies.refund.heading} intro={policies.refund.intro} points={policies.refund.points} />;
}
