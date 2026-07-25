import type { Metadata } from 'next';
import { policies } from '@/lib/config';
import { PolicyLayout } from '@/components/ui/PolicyLayout';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPolicyPage() {
  return <PolicyLayout heading={policies.privacy.heading} intro={policies.privacy.intro} points={policies.privacy.points} />;
}
