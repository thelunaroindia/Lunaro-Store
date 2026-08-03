import type { Metadata } from 'next';
import LookbookPageClient from './LookbookPageClient';

export const metadata: Metadata = {
  title: 'Lookbook',
  description: 'The LUNARO lookbook — shop each look directly.',
};

export default function LookbookPage() {
  return <LookbookPageClient />;
}
