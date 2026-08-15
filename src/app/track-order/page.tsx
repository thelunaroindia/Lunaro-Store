import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/canonical';
import TrackOrderPageClient from './TrackOrderPageClient';

export const metadata: Metadata = {
  title: 'Track Order',
  description: 'Check the status of your LUNARO order.',
  alternates: { canonical: canonicalUrl('/track-order') },
};

export default function TrackOrderPage() {
  return <TrackOrderPageClient />;
}
