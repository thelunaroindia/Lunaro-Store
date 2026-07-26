'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { nav, contact, PRELAUNCH_MODE } from '@/lib/config';

const prelaunchNavigation = [
  {
    label: 'Transmissions',
    href: '/transmissions',
  },
  {
    label: 'Lookbook',
    href: '/lookbook',
  },
  {
    label: 'World',
    href: '/about',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];

export default function MobileMenu({
  open,
  onClose,
  customerAccountsEnabled,
}: {
  open: boolean;
  onClose: () => void;
  customerAccountsEnabled: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const primaryNavigation = PRELAUNCH_MODE
    ? prelaunchNavigation
    : nav.main;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      closeRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      id="mobile-navigation"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      className={`fixed inset-0 z-[60] overflow-y-auto bg-obsidian transition-all duration-500 md:hidden ${
        open
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-2 opacity-0'
      }`}
    >
      <div className="flex min-h-[100dvh] flex-col">
        <div className="container-lunaro flex h-[72px] shrink-0 items-center justify-between border-b border-graphite">
          <Link
            href="/"
            onClick={onClose}
            className="flex min-h-11 items-center font-display text-xl tracking-wider2 text-lunar"
            aria-label="LUNARO home"
          >
            LUNARO
          </Link>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-end text-eyebrow uppercase tracking-wider2 text-lunar"
            aria-label="Close menu"
          >
            Close
          </button>
        </div>

        <nav
          className="container-lunaro mt-6 flex flex-col"
          aria-label="Mobile primary navigation"
        >
          {primaryNavigation.map((item, index) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              onClick={onClose}
              className="border-b border-graphite py-5 font-display text-[2.25rem] leading-none text-lunar transition-colors duration-300 hover:text-silver"
              style={{
                transitionDelay: open
                  ? `${index * 45}ms`
                  : '0ms',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {!PRELAUNCH_MODE && (
          <div className="container-lunaro mt-8 flex flex-wrap gap-x-8 gap-y-4">
            {nav.utility
              .filter(
                (item) =>
                  customerAccountsEnabled ||
                  item.href !== '/account',
              )
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="link-underline text-eyebrow uppercase tracking-wider2 text-mist"
                >
                  {item.label}
                </Link>
              ))}
          </div>
        )}

        <div className="container-lunaro mt-auto pb-8 pt-12">
          <div className="terminator mb-7" />

          <a
            href={contact.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="link-underline text-sm text-mist"
          >
            {contact.instagram}
          </a>

          <p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-mist/70">
            {PRELAUNCH_MODE
              ? 'Drop 001 — In Transmission'
              : 'Crafted in Darkness'}
          </p>
        </div>
      </div>
    </div>
  );
}