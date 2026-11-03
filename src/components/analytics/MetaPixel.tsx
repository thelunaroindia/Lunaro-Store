'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackMetaPageView } from '@/lib/metaPixel';

// Reports PageView on the first load and on every App Router navigation. The
// SDK itself is loaded on demand by src/lib/metaPixel.ts, which also stops
// Meta's own pushState PageViews so each view is counted exactly once.
export default function MetaPixel() {
  // useSearchParams() requires a Suspense boundary in the App Router —
  // isolated here for the same reason as GoogleAnalytics.tsx.
  return (
    <Suspense fallback={null}>
      <MetaPageViewTracker />
    </Suspense>
  );
}

function MetaPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    trackMetaPageView(query ? `${pathname}?${query}` : pathname);
  }, [pathname, query]);

  return null;
}
