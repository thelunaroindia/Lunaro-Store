import type { Metadata } from 'next';
import { contact } from '@/lib/config';
import ContactForm from '@/components/forms/ContactForm';
import { UtilityPageBackdrop } from '@/components/ui/UtilityPageBackdrop';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <UtilityPageBackdrop>
      <div className="container-lunaro grid gap-16 pt-32 pb-24 md:pt-40 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <h1 className="font-display text-display-md text-lunar">CONTACT</h1>
        <p className="mt-6 max-w-sm text-mist">
          Order support, product questions, collaborations — reach the LUNARO team directly.
        </p>

        <div className="mt-10 space-y-4 text-sm">
          <a href={`mailto:${contact.email}`} className="block text-lunar link-underline">
            {contact.email}
          </a>
          <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} className="block text-lunar link-underline">
            WhatsApp — {contact.whatsapp}
          </a>
          <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="block text-lunar link-underline">
            {contact.phone}
          </a>
          <a href={contact.instagramUrl} className="block text-lunar link-underline">
            {contact.instagram}
          </a>
        </div>

        <div className="mt-10 flex gap-6 border-t border-graphite pt-6 text-xs uppercase tracking-wider2 text-mist">
          <a href="/faq" className="link-underline">
            FAQ
          </a>
          <a href="/track-order" className="link-underline">
            Track Order
          </a>
        </div>

        <p className="mt-10 text-xs text-mist">Business hours: Mon–Sat, 10am–6pm IST.</p>
      </div>

      <ContactForm />
    </div>
    </UtilityPageBackdrop>
  );
}
