'use client';

import { Suspense, useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Renders nothing at all when the env var isn't set — no script tag, no
// runtime error, the rest of the site is completely unaffected. Never a
// fabricated/placeholder pixel ID.
export default function MetaPixel() {
  if (!META_PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel-init" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          window.fbq('init', '${META_PIXEL_ID}');
        `}
      </Script>
      {/* useSearchParams() requires a Suspense boundary in the App Router —
          isolated here for the same reason as GoogleAnalytics.tsx. */}
      <Suspense fallback={null}>
        <MetaPageViewTracker />
      </Suspense>
    </>
  );
}

// fbq('init', ...) above already fires one PageView automatically on load —
// this only fires on subsequent SPA navigations, so the initial view is
// never double-counted.
function MetaPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (typeof window.fbq !== 'function') return;
    window.fbq('track', 'PageView');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return null;
}
