import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/canonical';
import LookbookPageClient from './LookbookPageClient';

export const metadata: Metadata = {
  title: 'Lookbook',
  description: 'The LUNARO lookbook — shop each look directly.',
  alternates: { canonical: canonicalUrl('/lookbook') },
};

export default function LookbookPage() {
  return <LookbookPageClient />;
}
