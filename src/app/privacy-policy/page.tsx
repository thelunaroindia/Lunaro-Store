import type { Metadata } from 'next';
import { policies } from '@/lib/config';
import { canonicalUrl } from '@/lib/canonical';
import { PolicyLayout } from '@/components/ui/PolicyLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How LUNARO collects, uses and protects your information.',
  alternates: { canonical: canonicalUrl('/privacy-policy') },
};

export default function PrivacyPolicyPage() {
  return <PolicyLayout heading={policies.privacy.heading} intro={policies.privacy.intro} points={policies.privacy.points} />;
}
