'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { nav, contact, PRELAUNCH_MODE } from '@/lib/config';

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
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className={`fixed inset-0 z-[60] bg-obsidian transition-opacity duration-500 md:hidden ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="container-lunaro flex h-20 items-center justify-between">
        <span className="font-display text-xl tracking-wider2 text-lunar">LUNARO</span>
        <button ref={closeRef} onClick={onClose} className="text-eyebrow uppercase tracking-wider2 text-lunar">
          Close
        </button>
      </div>

      <nav className="container-lunaro mt-10 flex flex-col gap-2" aria-label="Mobile primary">
        {nav.main.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="border-b border-graphite py-5 font-display text-display-md leading-none text-lunar"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

     {!PRELAUNCH_MODE && (
  <div className="container-lunaro mt-10 flex flex-wrap gap-x-8 gap-y-3">
    {nav.utility
      .filter((item) => customerAccountsEnabled || item.href !== '/account')
      .map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          className="text-eyebrow uppercase tracking-wider2 text-mist link-underline"
        >
          {item.label}
        </Link>
      ))}
  </div>
)}

      <div className="terminator container-lunaro mt-10 max-w-none" />

      <div className="container-lunaro mt-8 text-sm text-mist">
        <a href={contact.instagramUrl} className="link-underline">
          {contact.instagram}
        </a>
      </div>
    </div>
  );
}
