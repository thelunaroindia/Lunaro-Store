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

// True only when the (already-sanitized) description has real visible
// text — Shopify can return a shell like "<p></p>" or "<p> </p>" for a
// technically-non-empty but visually blank field, and that must not
// render an empty accordion. Pure string check, no sanitize-html needed
// here — sanitization already happened server-side (see
// src/lib/sanitizeDescription.ts, called from
// src/app/products/[handle]/page.tsx) before this component ever sees
// the string, specifically so sanitize-html itself never has to be part
// of this Client Component's bundle.
function hasVisibleText(sanitizedHtml: string): boolean {
  return sanitizedHtml.replace(/<[^>]*>/g, '').trim().length > 0;
}

const HEADING_CLASSNAME = 'text-[11px] font-normal uppercase tracking-[0.2em]';
const BODY_CLASSNAME = 'text-[15px] leading-[1.75] text-mist';

export default function ProductAccordion({
  product,
  descriptionHtml,
}: {
  product: Product;
  // Pre-sanitized by the caller — see sanitizeDescriptionHtml() in
  // src/lib/sanitizeDescription.ts. Never sanitize raw HTML here.
  descriptionHtml: string;
}) {
  const trackpant = isTrackpant(product.productType);
  const hasDescription = hasVisibleText(descriptionHtml);
  const modelSizing = product.modelSizing?.trim();

  return (
    <div className="mt-10">
      {hasDescription && (
        <AccordionItem
          title="Description"
          defaultOpen
          headingClassName={HEADING_CLASSNAME}
          bodyClassName={BODY_CLASSNAME}
        >
          {/* Renders Shopify's own paragraph structure natively (real <p>
              tags, sanitized server-side before reaching this component)
              instead of the old plain-text `description` field, which has
              no line breaks to preserve — its HTML is stripped before it
              reaches the Storefront API's plain-text field, collapsing
              every line into one run-on sentence. space-y-1 gives each
              line its own row; the single blank paragraph Shopify emits
              between the title block and the spec list (`<p> </p>`)
              supplies the wider gap between them. */}
          <div className="space-y-1" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
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
        {/* Sourced from a Shopify metafield (namespace "custom", key
            "model_sizing") when configured — see src/lib/shopify.ts. Never
            shown as an invented measurement; simply absent otherwise. */}
        {modelSizing && <p className="mt-3">{modelSizing}</p>}
      </AccordionItem>
      <AccordionItem
        title="Shipping & Exchanges"
        headingClassName={HEADING_CLASSNAME}
        bodyClassName={BODY_CLASSNAME}
      >
        <p>{policies.shipping.points[0]}</p>
        <Link href="/shipping-returns" className="link-underline mt-3 inline-block text-lunar">
          Read the full Shipping &amp; Exchanges policy
        </Link>
      </AccordionItem>
    </div>
  );
}
