'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';

type State = 'idle' | 'loading' | 'success' | 'error';

export default function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.');
      setState('error');
      return;
    }
    setState('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setState('success');
    } catch {
      setError('Something went wrong. Try again in a moment.');
      setState('error');
    }
  }

  if (state === 'success') {
    return <p className="text-sm text-lunar">You're on the list. Welcome to the orbit.</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {!compact && (
        <>
          <p className="eyebrow text-lunar">Join the orbit</p>
          <p className="mt-3 text-sm text-mist">
            Private access to new drops, transmissions and limited releases.
          </p>
        </>
      )}
      <div className="mt-4 flex border-b border-graphite focus-within:border-lunar">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
  id="newsletter-email"
  type="email"
  required
  placeholder="Email address"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    if (state === 'error') setState('idle');
  }}
  aria-invalid={state === 'error'}
  aria-describedby={state === 'error' ? 'newsletter-error' : undefined}
  className="min-w-0 flex-1 bg-transparent py-3 pr-4 text-sm text-lunar placeholder:text-mist focus:outline-none"
/>

<Button
  type="submit"
  variant="underline"
  disabled={state === 'loading'}
  className="shrink-0"
>
  {state === 'loading' ? 'Sending…' : 'Join'}
</Button>
      </div>
      {state === 'error' && (
        <p id="newsletter-error" className="mt-2 text-xs text-silver">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs text-mist">No spam. Unsubscribe anytime.</p>
    </form>
  );
}
