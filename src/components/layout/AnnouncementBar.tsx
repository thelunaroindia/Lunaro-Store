import { PRELAUNCH_MODE } from '@/lib/config';

// Sitewide, launch-mode-only announcement bar — rendered once in
// layout.tsx, above Header, so it appears above every page (not just the
// homepage). Static: no marquee/countdown/fake inventory number, matching
// the rest of the launch-mode conversion principles.
export default function AnnouncementBar() {
  if (PRELAUNCH_MODE) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-40 flex h-9 items-center justify-center bg-lunar px-4 text-center">
      <p className="truncate text-[10px] uppercase tracking-[0.2em] text-obsidian sm:text-[11px] sm:tracking-[0.25em]">
        5% Off Prepaid · Free Shipping · Limited Drop
      </p>
    </div>
  );
}
