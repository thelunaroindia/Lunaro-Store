'use client';

import { useEffect, useState } from 'react';
import { brandLines } from '@/lib/config';

const SEEN_KEY = 'lunaro_intro_seen';

export default function PageIntro() {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadySeen = sessionStorage.getItem(SEEN_KEY);

    if (prefersReducedMotion || alreadySeen) {
      sessionStorage.setItem(SEEN_KEY, '1');
      return;
    }

    setVisible(true);
    const dismissTimer = setTimeout(() => setDismissing(true), 1900);
    const removeTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(SEEN_KEY, '1');
    }, 2500);

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
      >
        <path
          d="M60 10a50 50 0 1 0 0 100c-16-9-27-29-27-50s11-41 27-50Z"
          fill="currentColor"
          fillOpacity="0.9"
        />
      </svg>
      <p className="mt-8 animate-fade-up font-display text-2xl tracking-wider2 text-lunar opacity-0 [animation-delay:0.6s]">
        LUNARO
      </p>
      <p className="mt-3 animate-fade-up text-eyebrow uppercase tracking-wider3 text-mist opacity-0 [animation-delay:1s]">
        {brandLines.primary}
      </p>
    </div>
  );
}
