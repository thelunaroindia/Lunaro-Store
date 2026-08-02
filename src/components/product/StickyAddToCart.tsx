'use client';

type Props = {
  title: string;
  priceLabel: string;
  disabled: boolean;
  isPending: boolean;
  onAdd: () => void;
};

// Display-only: strips a trailing "| LUNARO" suffix some Shopify titles
// carry (e.g. "Universe oversized | LUNARO"). Does not mutate the prop.
function stripLunaroSuffix(title: string): string {
  return title.replace(/\s*\|\s*lunaro\s*$/i, '').trim();
}

export default function StickyAddToCart({ title, priceLabel, disabled, isPending, onAdd }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-graphite bg-obsidian/95 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm text-lunar">{stripLunaroSuffix(title)}</p>
          <p className="text-xs text-mist">{priceLabel}</p>
        </div>
        <button
          onClick={onAdd}
          disabled={disabled || isPending}
          className="flex-shrink-0 bg-lunar px-6 py-3 text-eyebrow uppercase tracking-wider3 text-obsidian disabled:opacity-40"
        >
          {disabled ? 'Sold Out' : isPending ? 'Processing…' : 'Buy Now'}
        </button>
      </div>
    </div>
  );
}
