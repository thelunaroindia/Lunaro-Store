import ProductCard from './ProductCard';
import type { ProductCardData } from '@/lib/types';

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
        <ProductCard key={product.id} product={product} priority={i < 3} />
      ))}
    </div>
  );
}
