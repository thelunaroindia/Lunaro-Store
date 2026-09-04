import { PRELAUNCH_MODE } from '@/lib/config';

// Sitewide, launch-mode-only announcement bar — rendered once in
// layout.tsx, above Header, so it appears above every page (not just the
// homepage). Static: no marquee/countdown/fake inventory number, matching
// the rest of the launch-mode conversion principles.
//
// The "5% Off Prepaid · Free Shipping" specifics this used to state are
// neutralized pending manual verification against the live Fastr merchant
// dashboard and Shopify Admin → Settings → Payments (see the launch
// checklist) — restore them only once confirmed there, matching
// src/lib/config.ts → prepaidIncentive's same neutralization. "Limited
// Drop" is left as-is — Drop 001's limited quantity is a real, confirmed
// fact, not an unverified payment/shipping claim.
export default function AnnouncementBar() {
  if (PRELAUNCH_MODE) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-40 flex h-9 items-center justify-center bg-lunar px-4 text-center">
      <p className="truncate text-[10px] uppercase tracking-[0.2em] text-obsidian sm:text-[11px] sm:tracking-[0.25em]">
        Shipping and payment options are shown at checkout · Limited Drop
      </p>
    </div>
  );
}
