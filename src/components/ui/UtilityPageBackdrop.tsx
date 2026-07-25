import { ReactNode } from 'react';
import { CinematicPlaceholder } from './CinematicPlaceholder';

/**
 * Wraps a utility page (contact, policies, track order, search, wishlist,
 * cart) with the quiet 'utility' atmospheric backdrop, so no page on the
 * site is ever plain flat black — while keeping the backdrop faint enough
 * that it never competes with reading or commerce actions.
 */
export function UtilityPageBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <CinematicPlaceholder variant="utility" className="fixed inset-0 -z-10" />
      {children}
    </div>
  );
}
