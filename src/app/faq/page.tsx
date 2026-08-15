import type { Metadata } from 'next';
import { faqs } from '@/lib/config';
import { canonicalUrl } from '@/lib/canonical';
import { AccordionItem } from '@/components/ui/Accordion';
import { UtilityPageBackdrop } from '@/components/ui/UtilityPageBackdrop';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers to common questions about sizing, shipping and LUNARO drops.',
  alternates: { canonical: canonicalUrl('/faq') },
};

export default function FaqPage() {
  return (
    <UtilityPageBackdrop>
      <div className="container-lunaro max-w-2xl pt-32 pb-24 md:pt-40">
      <h1 className="font-display text-display-md text-lunar">FAQ</h1>
      <div className="mt-10">
        {faqs.map((item) => (
          <AccordionItem key={item.q} title={item.q}>
            <p>{item.a}</p>
          </AccordionItem>
        ))}
      </div>
    </div>
    </UtilityPageBackdrop>
  );
}
