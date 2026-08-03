'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { UtilityPageBackdrop } from '@/components/ui/UtilityPageBackdrop';

type Result = {
  orderName: string;
  status: string;
  tracking: { number: string; url: string; company: string }[];
};

export default function TrackOrderPageClient() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'found' | 'not-found' | 'error'>('idle');
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState('loading');
    setResult(null);
    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = await res.json();
      if (res.status === 404) {
        setState('not-found');
        return;
      }
      if (!res.ok) {
        setMessage(data.error ?? 'Something went wrong.');
        setState('error');
        return;
      }
      setResult(data);
      setState('found');
    } catch {
      setMessage('Something went wrong. Please try again.');
      setState('error');
    }
  }

  return (
    <UtilityPageBackdrop>
      <div className="container-lunaro max-w-xl pt-32 pb-24 md:pt-40">
      <h1 className="font-display text-display-md text-lunar">TRACK ORDER</h1>
      <p className="mt-6 text-mist">Enter your order number and the email used at checkout.</p>

      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        <div>
          <label htmlFor="orderNumber" className="eyebrow text-mist">
            Order Number
          </label>
          <input
            id="orderNumber"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="#1001"
            className="mt-2 w-full border-b border-graphite bg-transparent py-3 text-sm text-lunar placeholder:text-mist focus:border-lunar focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="email" className="eyebrow text-mist">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border-b border-graphite bg-transparent py-3 text-sm text-lunar placeholder:text-mist focus:border-lunar focus:outline-none"
          />
        </div>
        <Button type="submit" disabled={state === 'loading'}>
          {state === 'loading' ? 'Searching…' : 'Track Order'}
        </Button>
      </form>

      {state === 'not-found' && (
        <p className="mt-8 text-sm text-mist">
          No order found with that number and email. Double-check your confirmation email, or contact support.
        </p>
      )}
      {state === 'error' && <p className="mt-8 text-sm text-silver">{message}</p>}
      {state === 'found' && result && (
        <div className="mt-10 border border-graphite p-6">
          <p className="text-sm text-lunar">Order {result.orderName}</p>
          <p className="mt-2 text-sm text-mist">Status: {result.status.replaceAll('_', ' ').toLowerCase()}</p>
          {result.tracking.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {result.tracking.map((t) => (
                <li key={t.number} className="text-sm">
                  <a href={t.url} className="link-underline text-lunar">
                    {t.company} — {t.number}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-mist">Tracking details will appear here once your order ships.</p>
          )}
        </div>
      )}
    </div>
    </UtilityPageBackdrop>
  );
}
