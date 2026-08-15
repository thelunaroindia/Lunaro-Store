'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { PRELAUNCH_MODE } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';

type State = 'idle' | 'loading' | 'success' | 'error';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function NewsletterForm({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    trackEvent('launch_notification_view');
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (state === 'loading') return;

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      setState('error');
      return;
    }

    setState('loading');
    setError('');
    trackEvent('launch_notification_submit');

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
            : "We couldn't add you to the list just yet. Please try again.";

        setError(message);
        setState('error');
        return;
      }

      setEmail('');
      setState('success');
      // Only fires after the server has genuinely confirmed the Shopify
      // signup succeeded (a non-ok response above never reaches this line)
      // — this event must never claim storefront access, because none is
      // granted. It means exactly one thing: added to the launch list.
      trackEvent('launch_notification_success');
    } catch {
      setError("We couldn't add you to the list just yet. Please try again.");
      setState('error');
    }
  }

  if (state === 'success') {
    const content = (
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
          <p className="eyebrow text-silver">Drop Notification</p>
        )}

        <p
          className={
            compact
              ? 'text-sm leading-6 text-lunar'
              : 'mt-3 font-display text-2xl leading-tight text-lunar md:text-3xl'
          }
        >
          You&rsquo;re on the list.
        </p>

        {!compact && (
          <p className="mt-3 max-w-sm text-sm leading-6 text-mist">
            {PRELAUNCH_MODE
              ? "We'll let you know when Drop 001 goes live."
              : "We'll let you know about new drops and releases."}
          </p>
        )}
      </div>
    );

    if (prefersReducedMotion) return content;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {!compact && (
        <>
          <p className="eyebrow text-silver">
            Drop Notification
          </p>

          <h2 className="mt-4 max-w-sm font-display text-[2rem] leading-[0.98] text-lunar md:text-4xl">
            {PRELAUNCH_MODE
              ? 'BE THERE WHEN DROP 001 ARRIVES.'
              : 'STAY CONNECTED.'}
          </h2>

          <p className="mt-4 max-w-sm text-sm leading-7 text-mist">
            {PRELAUNCH_MODE
              ? 'Join the list to be notified when the first drop goes live.'
              : 'Receive updates on new releases and limited drops.'}
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
          {state === 'loading' ? 'Sending…' : PRELAUNCH_MODE ? 'Notify Me' : 'Join'}
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
        {PRELAUNCH_MODE ? 'Drop notices. No noise.' : 'No spam. Unsubscribe anytime.'}
      </p>
    </form>
  );
}
