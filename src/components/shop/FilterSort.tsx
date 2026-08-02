'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const COLOURS = ['Obsidian Black', 'Deep Black', 'Charcoal'];

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function FilterSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  // Move focus into the drawer when it opens; restore it to the trigger
  // when it closes. wasOpenRef guards against restoring focus on mount,
  // since the drawer starts closed and has never actually been open yet.
  useEffect(() => {
    if (mobileOpen) {
      wasOpenRef.current = true;
      closeButtonRef.current?.focus();
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
    }
  }, [mobileOpen]);

  // Escape closes the drawer; Tab/Shift+Tab stay trapped inside it while open.
  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileOpen(false);
        return;
      }

      if (e.key !== 'Tab') return;

      const drawer = drawerRef.current;
      if (!drawer) return;

      const focusable = Array.from(
        drawer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (focusable.length === 1) {
        e.preventDefault();
        first.focus();
        return;
      }

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  // Lock body scroll while the drawer is open; restore whatever value was
  // already set (rather than assuming it was always empty).
  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const activeSort = searchParams.get('sort') ?? 'featured';
  const activeSizes = searchParams.getAll('size');
  const activeColours = searchParams.getAll('colour');
  const availableOnly = searchParams.get('available') === '1';

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleListParam(key: string, value: string) {
    updateParams((params) => {
      const current = params.getAll(key);
      params.delete(key);
      if (current.includes(value)) {
        current.filter((v) => v !== value).forEach((v) => params.append(key, v));
      } else {
        [...current, value].forEach((v) => params.append(key, v));
      }
    });
  }

  function setSort(value: string) {
    updateParams((params) => params.set('sort', value));
  }

  function toggleAvailable() {
    updateParams((params) => {
      if (availableOnly) params.delete('available');
      else params.set('available', '1');
    });
  }

  function clearAll() {
    router.push(pathname);
    setMobileOpen(false);
  }

  const filterBody = (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-mist">Size</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleListParam('size', size)}
              aria-pressed={activeSizes.includes(size)}
              className={`border px-3 py-1.5 text-sm ${
                activeSizes.includes(size) ? 'border-lunar text-lunar' : 'border-graphite text-mist'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow text-mist">Colour</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {COLOURS.map((colour) => (
            <button
              key={colour}
              onClick={() => toggleListParam('colour', colour)}
              aria-pressed={activeColours.includes(colour)}
              className={`border px-3 py-1.5 text-sm ${
                activeColours.includes(colour) ? 'border-lunar text-lunar' : 'border-graphite text-mist'
              }`}
            >
              {colour}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-mist">
        <input type="checkbox" checked={availableOnly} onChange={toggleAvailable} className="accent-lunar" />
        In stock only
      </label>

      <button onClick={clearAll} className="text-xs uppercase tracking-wider2 text-mist link-underline">
        Clear all filters
      </button>
    </div>
  );

  return (
    <div className="mb-10 flex items-center justify-between border-b border-graphite pb-6">
      <button
        ref={triggerRef}
        onClick={() => setMobileOpen(true)}
        className="text-eyebrow uppercase tracking-wider2 text-lunar lg:hidden"
      >
        Filter
      </button>

      {/* Desktop filter panel, inline */}
      <details className="group hidden lg:block">
        <summary className="cursor-pointer list-none text-eyebrow uppercase tracking-wider2 text-lunar">
          Filter
        </summary>
        <div className="absolute z-20 mt-4 w-72 border border-graphite bg-obsidian p-6">{filterBody}</div>
      </details>

      <label className="flex items-center gap-2 text-eyebrow uppercase tracking-wider2 text-lunar">
        Sort
        <select
          value={activeSort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-transparent text-mist focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-obsidian text-lunar">
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {/* Full-screen mobile filter interface */}
      <div
        ref={drawerRef}
        className={`fixed inset-0 z-[80] bg-obsidian transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        aria-labelledby="mobile-filter-heading"
      >
        <div className="flex items-center justify-between border-b border-graphite p-6">
          <p id="mobile-filter-heading" className="eyebrow text-lunar">Filter</p>
          <button
            ref={closeButtonRef}
            onClick={() => setMobileOpen(false)}
            className="text-eyebrow uppercase tracking-wider2 text-lunar"
          >
            Close
          </button>
        </div>
        <div className="p-6">{filterBody}</div>
        <div className="p-6">
          <button
            onClick={() => setMobileOpen(false)}
            className="w-full bg-lunar px-7 py-4 text-eyebrow uppercase tracking-wider3 text-obsidian"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}
