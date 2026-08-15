'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { nav, site, PRELAUNCH_MODE } from '@/lib/config';
import { useCartUI } from '@/context/CartUIContext';
import MobileMenu from './MobileMenu';

export default function Header({
  customerAccountsEnabled,
  earlyAccessGranted,
}: {
  customerAccountsEnabled: boolean;
  earlyAccessGranted: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cart, toggle: toggleCart } = useCartUI();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const itemCount = cart?.totalQuantity ?? 0;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-graphite bg-obsidian/95 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl'
            : 'border-b border-transparent bg-obsidian/20 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none'
        }`}
      >
        <div className="container-lunaro flex h-[72px] items-center justify-between md:h-20">
          <Link
            href="/"
            className="flex min-h-11 items-center font-display text-xl tracking-wider2 text-lunar"
            aria-label={`${site.name} home`}
          >
            {site.name}
          </Link>

          <nav
            className="hidden items-center gap-10 md:flex"
            aria-label="Primary navigation"
          >
            {nav.main.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="link-underline text-eyebrow uppercase tracking-wider2 text-lunar"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            {/* Search and Cart are shopping surfaces — an authorized Early
                Access visitor can genuinely use both (their cart isn't
                empty just because the site is still in prelaunch for
                everyone else), so they stay visible once access is
                granted, not only once PRELAUNCH_MODE fully ends. Account
                stays full-launch-only — it's a separate identity feature
                unrelated to the Early Access shopping flow. */}
            {(!PRELAUNCH_MODE || earlyAccessGranted) && (
              <>
                <Link
                  href="/search"
                  className="link-underline hidden text-eyebrow uppercase tracking-wider2 text-lunar md:inline"
                >
                  Search
                </Link>

                {customerAccountsEnabled && !PRELAUNCH_MODE && (
                  <Link
                    href="/account"
                    className="link-underline hidden text-eyebrow uppercase tracking-wider2 text-lunar md:inline"
                  >
                    Account
                  </Link>
                )}

                <button
                  type="button"
                  onClick={toggleCart}
                  className="relative min-h-11 items-center text-eyebrow uppercase tracking-wider2 text-lunar md:flex"
                  aria-label={`Open cart, ${itemCount} item${
                    itemCount === 1 ? '' : 's'
                  }`}
                >
                  Cart

                  {itemCount > 0 && (
                    <span className="ml-1 text-silver" aria-hidden>
                      ({itemCount})
                    </span>
                  )}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex min-h-11 min-w-11 items-center justify-end text-eyebrow uppercase tracking-wider2 text-lunar md:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        customerAccountsEnabled={customerAccountsEnabled}
        earlyAccessGranted={earlyAccessGranted}
      />
    </>
  );
}