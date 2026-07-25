'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';

type State = 'idle' | 'loading' | 'success' | 'error';

const ENQUIRY_TYPES = [
  'Order Support',
  'Product & Size Enquiries',
  'Returns & Exchanges',
  'General Enquiries',
  'Collaborations & Creators',
  'Wholesale & Business Enquiries',
];

export default function ContactForm() {
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot — real users never see or fill this field.
    if (String(data.get('company')) !== '') {
      setState('success'); // fail silently to the bot, do nothing server-side
      return;
    }

    if (!data.get('name') || !data.get('email') || !data.get('message') || !data.get('enquiryType')) {
      setError('Please fill in every required field.');
      setState('error');
      return;
    }

    setState('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      if (res.status === 429) {
        setError('Too many messages sent recently. Please try again shortly.');
        setState('error');
        return;
      }
      if (!res.ok) throw new Error();
      setState('success');
      form.reset();
    } catch {
      setError('Your message could not be sent. Please email us directly instead.');
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="max-w-lg">
        <h2 className="font-display text-display-md text-lunar">TRANSMISSION RECEIVED.</h2>
        <p className="mt-4 text-mist">Our team will respond as soon as possible.</p>
      </div>
    );
  }

  const inputClass =
    'w-full border-b border-graphite bg-transparent py-3 text-sm text-lunar placeholder:text-mist focus:border-lunar focus:outline-none';

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-lg space-y-6">
      {/* Honeypot field — hidden from sighted users and screen readers */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div>
        <label htmlFor="name" className="eyebrow text-mist">
          Full Name
        </label>
        <input id="name" name="name" required className={`${inputClass} mt-2`} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="eyebrow text-mist">
            Email Address
          </label>
          <input id="email" name="email" type="email" required className={`${inputClass} mt-2`} />
        </div>
        <div>
          <label htmlFor="phone" className="eyebrow text-mist">
            Phone Number
          </label>
          <input id="phone" name="phone" type="tel" className={`${inputClass} mt-2`} />
        </div>
      </div>

      <div>
        <label htmlFor="orderNumber" className="eyebrow text-mist">
          Order Number (optional)
        </label>
        <input id="orderNumber" name="orderNumber" className={`${inputClass} mt-2`} />
      </div>

      <div>
        <label htmlFor="enquiryType" className="eyebrow text-mist">
          Enquiry Type
        </label>
        <select id="enquiryType" name="enquiryType" required defaultValue="" className={`${inputClass} mt-2`}>
          <option value="" disabled>
            Select an option
          </option>
          {ENQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="subject" className="eyebrow text-mist">
          Subject
        </label>
        <input id="subject" name="subject" required className={`${inputClass} mt-2`} />
      </div>

      <div>
        <label htmlFor="message" className="eyebrow text-mist">
          Message
        </label>
        <textarea id="message" name="message" required rows={5} className={`${inputClass} mt-2 resize-none`} />
      </div>

      {state === 'error' && <p className="text-sm text-silver">{error}</p>}

      <Button type="submit" disabled={state === 'loading'}>
        {state === 'loading' ? 'Sending…' : 'Send Transmission'}
      </Button>
    </form>
  );
}
