import Link from 'next/link';
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

// Display-only: inserts a missing space when a sentence-ending period is
// immediately followed by a known label (e.g. "slouch.Care:" →
// "slouch. Care:"). Does not touch already-correctly-spaced text, and
// never rewrites anything beyond this exact pattern.
function normalizeDescription(description: string): string {
  return description.replace(/\.(Care:|Fabric:|Fit:)/g, '. $1');
}

const HEADING_CLASSNAME = 'text-[11px] font-normal uppercase tracking-[0.2em]';
const BODY_CLASSNAME = 'text-[15px] leading-[1.75] text-mist';

export default function ProductAccordion({ product }: { product: Product }) {
  const trackpant = isTrackpant(product.productType);
  const hasDescription = product.description.trim().length > 0;

  return (
    <div className="mt-10">
      {hasDescription && (
        <AccordionItem
          title="Description"
          defaultOpen
          headingClassName={HEADING_CLASSNAME}
          bodyClassName={BODY_CLASSNAME}
        >
          <p>{normalizeDescription(product.description)}</p>
        </AccordionItem>
      )}
      <AccordionItem
        title={trackpant ? 'Fabric & Construction' : 'Fabric & Finish'}
        headingClassName={HEADING_CLASSNAME}
        bodyClassName={BODY_CLASSNAME}
      >
        <ul className="space-y-2">
          {(trackpant ? trackpantFabricDetails : fabricDetails).map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </AccordionItem>
      <AccordionItem
        title="Fit & Care"
        headingClassName={HEADING_CLASSNAME}
        bodyClassName={BODY_CLASSNAME}
      >
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
      <AccordionItem
        title="Shipping & Returns"
        headingClassName={HEADING_CLASSNAME}
        bodyClassName={BODY_CLASSNAME}
      >
        <p>{policies.shipping.points[0]}</p>
        <Link href="/shipping-returns" className="link-underline mt-3 inline-block text-lunar">
          Read the full Shipping &amp; Returns policy
        </Link>
      </AccordionItem>
    </div>
  );
}
