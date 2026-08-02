import { AccordionItem } from '@/components/ui/Accordion';
import {
  fabricDetails,
  trackpantFabricDetails,
  trackpantFitAndCare,
  policies,
} from '@/lib/config';
import type { Product } from '@/lib/types';

const TRACKPANT_PRODUCT_TYPES = [
  'trackpant',
  'trackpants',
  'sweatpant',
  'sweatpants',
];

function isTrackpant(productType: string): boolean {
  return TRACKPANT_PRODUCT_TYPES.includes(
    productType.trim().toLowerCase()
  );
}

export default function ProductAccordion({ product }: { product: Product }) {
  const trackpant = isTrackpant(product.productType);

  return (
    <div className="mt-10">
      <AccordionItem title="Description" defaultOpen>
        <p>{product.description}</p>
      </AccordionItem>
      <AccordionItem title="Fabric & Construction">
        <ul className="space-y-2">
          {(trackpant ? trackpantFabricDetails : fabricDetails).map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </AccordionItem>
      <AccordionItem title="Fit & Care">
        {trackpant ? (
          <ul className="space-y-2">
            {trackpantFitAndCare.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        ) : (
          <p>Oversized fit. True to size in the shoulder, roomy through the body. Machine wash cold, inside out. Do not iron over print.</p>
        )}
      </AccordionItem>
      <AccordionItem title="Shipping & Returns">
        <p>{policies.shipping.points[0]}</p>
      </AccordionItem>
    </div>
  );
}
