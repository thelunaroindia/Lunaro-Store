'use client';

import { Suspense, useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Renders nothing at all when the env var isn't set — no script tag, no
// runtime error, the rest of the site is completely unaffected. Never a
// fabricated/placeholder measurement ID.
export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
      {/* useSearchParams() requires a Suspense boundary in the App Router —
          isolated here so it doesn't deopt unrelated statically-generated
          routes (e.g. /robots.txt, /sitemap.xml) into dynamic rendering. */}
      <Suspense fallback={null}>
        <GA4PageViewTracker />
      </Suspense>
    </>
  );
}

// GA4's own auto page_view is disabled above (send_page_view: false) so
// this is the single, explicit source of page_view events — fires once on
// initial mount and once per client-side (SPA) navigation, never twice for
// the same view.
function GA4PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;

    const query = searchParams.toString();
    window.gtag('event', 'page_view', {
      page_path: query ? `${pathname}?${query}` : pathname,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return null;
}
