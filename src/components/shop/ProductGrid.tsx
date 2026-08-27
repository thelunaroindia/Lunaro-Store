import ProductCard from './ProductCard';
import { PRELAUNCH_MODE } from '@/lib/config';
import type { ProductCardData } from '@/lib/types';

// Backs /shop, /new-drop, /collections/[handle] and /search — all four
// already return a "concealed" screen before ever reaching this component
// while PRELAUNCH_MODE is true, so this is unreachable in prelaunch
// regardless. showQuickAdd is still explicitly tied to PRELAUNCH_MODE here
// (rather than always true) for the same defensive self-guarding every
// other homepage/commerce component in this codebase already follows.
export default function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="font-display text-2xl text-lunar">No garments match this search.</p>
        <p className="mt-2 text-sm text-mist">Try clearing a filter or exploring the full collection.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={i < 3}
          showQuickAdd={!PRELAUNCH_MODE}
        />
      ))}
    </div>
  );
}
