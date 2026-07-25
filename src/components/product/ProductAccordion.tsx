import { AccordionItem } from '@/components/ui/Accordion';
import { fabricDetails, policies } from '@/lib/config';
import type { Product } from '@/lib/types';

export default function ProductAccordion({ product }: { product: Product }) {
  return (
    <div className="mt-10">
      <AccordionItem title="Description" defaultOpen>
        <p>{product.description}</p>
      </AccordionItem>
      <AccordionItem title="Fabric & Construction">
        <ul className="space-y-2">
          {fabricDetails.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </AccordionItem>
      <AccordionItem title="Fit & Care">
        <p>Oversized fit. True to size in the shoulder, roomy through the body. Machine wash cold, inside out. Do not iron over print.</p>
      </AccordionItem>
      <AccordionItem title="Shipping & Returns">
        <p>{policies.shipping.points[0]}</p>
      </AccordionItem>
    </div>
  );
}
