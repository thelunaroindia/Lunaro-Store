import type { Metadata } from 'next';
import TrackOrderPageClient from './TrackOrderPageClient';

export const metadata: Metadata = {
  title: 'Track Order',
  description: 'Check the status of your LUNARO order.',
};

export default function TrackOrderPage() {
  return <TrackOrderPageClient />;
}
