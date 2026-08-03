'use client';

import { useEffect, useState } from 'react';
import { brandLines } from '@/lib/config';

const SEEN_KEY = 'lunaro_intro_seen';

// Storage failures (private browsing, sandboxed contexts, etc.) must never
// throw here — a broken read should just skip the intro, and a broken write
// should let the intro dismiss normally without persisting the flag.
function hasSeenIntro(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return true;
  }
}

function markIntroSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Ignore — nothing to persist to, dismiss proceeds regardless.
  }
}

export default function PageIntro() {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || hasSeenIntro()) {
      markIntroSeen();
      return;
    }

    setVisible(true);
    const dismissTimer = setTimeout(() => setDismissing(true), 1200);
    const removeTimer = setTimeout(() => {
      setVisible(false);
      markIntroSeen();
    }, 1900);

    return () => {
      clearTimeout(dismissTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-obsidian transition-opacity duration-700 ${
        dismissing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        className="animate-crescent-in text-silver"
        style={{ animationDuration: '900ms' }}
      >
        <path
          d="M60 10a50 50 0 1 0 0 100c-16-9-27-29-27-50s11-41 27-50Z"
          fill="currentColor"
          fillOpacity="0.9"
        />
      </svg>
      <p className="mt-8 animate-fade-up font-display text-2xl tracking-wider2 text-lunar opacity-0 [animation-delay:0.15s]">
        LUNARO
      </p>
      <p className="mt-3 animate-fade-up text-eyebrow uppercase tracking-wider3 text-mist opacity-0 [animation-delay:0.25s]">
        {brandLines.primary}
      </p>
    </div>
  );
}
