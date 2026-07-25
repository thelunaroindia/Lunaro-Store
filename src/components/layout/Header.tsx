'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { nav, site, PRELAUNCH_MODE } from '@/lib/config';
import { useCartUI } from '@/context/CartUIContext';
import MobileMenu from './MobileMenu';

export default function Header({ customerAccountsEnabled }: { customerAccountsEnabled: boolean }) {
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
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled ? 'bg-obsidian/90 backdrop-blur border-b border-graphite' : 'bg-transparent'
        }`}
      >
        <div className="container-lunaro flex h-20 items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-wider2 text-lunar">
            {site.name}
          </Link>

          <nav className="hidden items-center gap-10 md:flex" aria-label="Primary">
            {nav.main.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-eyebrow uppercase tracking-wider2 text-lunar link-underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>

         <div className="flex items-center gap-6">
  {!PRELAUNCH_MODE && (
    <>
      <Link
        href="/search"
        className="hidden text-eyebrow uppercase tracking-wider2 text-lunar link-underline md:inline"
      >
        Search
      </Link>

      {customerAccountsEnabled && (
        <Link
          href="/account"
          className="hidden text-eyebrow uppercase tracking-wider2 text-lunar link-underline md:inline"
        >
          Account
        </Link>
      )}

      <button
        onClick={toggleCart}
        className="relative text-eyebrow uppercase tracking-wider2 text-lunar"
        aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
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
    onClick={() => setMobileOpen(true)}
    className="text-eyebrow uppercase tracking-wider2 text-lunar md:hidden"
    aria-label="Open menu"
    aria-expanded={mobileOpen}
  >
    Menu
  </button>
</div>        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} customerAccountsEnabled={customerAccountsEnabled} />
    </>
  );
}
