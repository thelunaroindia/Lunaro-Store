'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { PRELAUNCH_MODE } from '@/lib/config';

type State = 'idle' | 'loading' | 'success' | 'error';

export default function NewsletterForm({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      setState('error');
      return;
    }

    setState('loading');
    setError('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message =
          typeof data?.error === 'string' && data.error.trim().length > 0
            ? data.error
            : 'Something went wrong. Try again in a moment.';

        setError(message);
        setState('error');
        return;
      }

      setEmail('');
      setState('success');
    } catch {
      setError('Something went wrong. Try again in a moment.');
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div
        className={
          compact
            ? ''
            : 'border border-graphite bg-obsidian/50 px-5 py-6 md:px-7 md:py-8'
        }
        role="status"
        aria-live="polite"
      >
        {!compact && (
          <p className="eyebrow text-silver">
            {PRELAUNCH_MODE ? 'Access requested' : 'Transmission received'}
          </p>
        )}

        <p
          className={
            compact
              ? 'text-sm leading-6 text-lunar'
              : 'mt-3 font-display text-2xl leading-tight text-lunar md:text-3xl'
          }
        >
          {PRELAUNCH_MODE
            ? "Access requested. You'll hear from us before the drop."
            : 'You’re inside the orbit.'}
        </p>

        {!compact && !PRELAUNCH_MODE && (
          <p className="mt-3 max-w-sm text-sm leading-6 text-mist">
            Private release details will reach you before the signal goes public.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {!compact && (
        <>
          <p className="eyebrow text-silver">
            Join the orbit
          </p>

          <h2 className="mt-4 max-w-sm font-display text-[2rem] leading-[0.98] text-lunar md:text-4xl">
            {PRELAUNCH_MODE
              ? 'EARLY ACCESS TO DROP 001'
              : 'PRIVATE ACCESS TO FUTURE DROPS'}
          </h2>

          <p className="mt-4 max-w-sm text-sm leading-7 text-mist">
            {PRELAUNCH_MODE
              ? 'Join the list for first access to the debut collection, private drop notifications and launch access before public release.'
              : 'Receive early access to new releases, editorial transmissions and limited drops.'}
          </p>
        </>
      )}

      <div
        className={`flex items-center border-b border-graphite transition-colors focus-within:border-lunar ${
          compact ? 'mt-4' : 'mt-7'
        }`}
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>

        <input
          id="newsletter-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);

            if (state === 'error') {
              setState('idle');
              setError('');
            }
          }}
          aria-invalid={state === 'error'}
          aria-describedby={
            state === 'error' ? 'newsletter-error' : 'newsletter-note'
          }
          className="min-h-12 min-w-0 flex-1 bg-transparent py-3 pr-4 text-sm text-lunar placeholder:text-mist focus:outline-none"
        />

        <Button
          type="submit"
          variant="underline"
          disabled={state === 'loading'}
          className="min-h-12 shrink-0 px-2"
        >
          {state === 'loading' ? 'Sending…' : PRELAUNCH_MODE ? 'Get Early Access' : 'Join'}
        </Button>
      </div>

      {state === 'error' && (
        <p
          id="newsletter-error"
          className="mt-3 text-xs leading-5 text-silver"
          role="alert"
        >
          {error}
        </p>
      )}

      <p
        id="newsletter-note"
        className="mt-3 text-xs leading-5 text-mist"
      >
        No spam. Unsubscribe anytime.
      </p>
    </form>
  );
}