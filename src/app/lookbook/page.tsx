import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/canonical';
import LookbookPageClient from './LookbookPageClient';

export const metadata: Metadata = {
  title: 'Lookbook',
  description: 'The LUNARO lookbook — shop each look directly.',
  alternates: { canonical: canonicalUrl('/lookbook') },
  // Hidden from customer-facing nav and search-engine discovery for now —
  // the route itself is untouched and still fully reachable by direct URL.
  robots: { index: false, follow: false },
};

export default function LookbookPage() {
  return <LookbookPageClient />;
}
