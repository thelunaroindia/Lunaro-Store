import type { Metadata } from 'next';
import { policies } from '@/lib/config';
import { PolicyLayout } from '@/components/ui/PolicyLayout';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'The terms that apply when you shop with LUNARO.',
};

export default function TermsPage() {
  return <PolicyLayout heading={policies.terms.heading} intro={policies.terms.intro} points={policies.terms.points} />;
}
