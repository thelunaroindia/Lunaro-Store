import Link from 'next/link';

// Launch-mode-only category/quick-shop row, directly under the Hero — lets a
// visitor jump straight into a category without scrolling the whole page.
// Every href points at a real, already-shoppable destination (never an
// invented collection): /new-drop and /shop are real pages; oversized-tees
// is a confirmed live Shopify collection (already linked from CollectionCarousel
// and /collections); #most-wanted anchors to this same homepage's own Most
// Wanted section (see MostWanted.tsx's id).
//
// No colour chips (Black / Off-White) — checked the live Storefront API
// directly: the only real product currently in the store has a single
// "Title: Default Title" option, no colour option at all, so there is no
// confirmed real value to route to and `/shop`'s colour filter
// (catalogue.ts) would return zero results for every product today. Add
// them back once real coloured variants exist and their exact option
// values are known.
const CHIPS = [
  { label: 'New Drop', href: '/new-drop', active: true },
  { label: 'All', href: '/shop', active: false },
  { label: 'Tees', href: '/collections/oversized-tees', active: false },
  { label: 'Best Sellers', href: '/#most-wanted', active: false },
] as const;

export default function CategoryChips() {
  return (
    <nav
      aria-label="Shop by category"
      className="border-t border-graphite py-4"
    >
      <div className="flex gap-2.5 overflow-x-auto pl-5 pr-5 [-ms-overflow-style:none] [scrollbar-width:none] sm:pl-8 lg:pl-12 [&::-webkit-scrollbar]:hidden">
        {CHIPS.map((chip) => (
          <Link
            key={chip.label}
            href={chip.href}
            className={
              'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[11px] uppercase tracking-wider2 transition-colors duration-300 ' +
              (chip.active
                ? 'border-lunar bg-lunar text-obsidian'
                : 'border-graphite text-mist hover:border-lunar hover:text-lunar')
            }
          >
            {chip.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
