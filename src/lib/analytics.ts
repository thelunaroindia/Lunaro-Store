'use client';

// Smallest safe event abstraction — no analytics library installed. Pushes
// to window.dataLayer, the standard GTM/GA4 ingestion point, so a tag
// manager snippet can be added to the root layout later and start
// receiving these events immediately, with zero changes to call sites.
// A no-op until then (dataLayer just accumulates, unread by anything).
//
// Never pass an email address or other PII in `params` — these events may
// eventually flow into GA4/Meta, neither of which should ever see one.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });
}
