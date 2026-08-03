import type { Metadata } from 'next';
import WishlistPageClient from './WishlistPageClient';

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'Garments you have saved from LUNARO.',
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
