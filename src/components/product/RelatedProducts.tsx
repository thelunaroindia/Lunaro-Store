import { getProducts } from '@/lib/shopify';
import ProductCard from '@/components/shop/ProductCard';
import { SectionHeading } from '@/components/ui/Eyebrow';

export default async function RelatedProducts({ excludeHandle }: { excludeHandle: string }) {
  const products = await getProducts({ first: 5 }).catch(() => []);
  const related = products.filter((p) => p.handle !== excludeHandle).slice(0, 4);
  if (related.length === 0) return null;

  return (
    <section className="border-t border-graphite py-20">
      <div className="container-lunaro">
        <SectionHeading eyebrow="You May Also Like" className="mb-10">
          RELATED GARMENTS
        </SectionHeading>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
