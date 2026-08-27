// Small, pure variant-matching helpers used by launch-mode Quick Add
// (ProductCard.tsx). Deliberately separate from ProductOptions.tsx (the PDP
// buy flow) rather than shared — ProductOptions.tsx is real checkout logic
// and is left untouched by the launch-mode upgrade. This operates on the
// slimmer ProductCardData.filterVariants shape, not the full ProductVariant.

type MatchableVariant = {
  id: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
};

export function findMatchingVariant(
  variants: MatchableVariant[],
  selected: Record<string, string>
): MatchableVariant | undefined {
  return variants.find((variant) =>
    variant.selectedOptions.every(
      (option) => selected[option.name] === option.value
    )
  );
}

export function isValueAvailable(
  variants: MatchableVariant[],
  selected: Record<string, string>,
  optionName: string,
  value: string
): boolean {
  const candidate = { ...selected, [optionName]: value };

  return variants.some(
    (variant) =>
      variant.availableForSale &&
      variant.selectedOptions.every((option) => {
        const chosen = candidate[option.name];
        return !chosen || chosen === option.value;
      })
  );
}

// Shopify gives every product at least one option; products with no real
// customer choice carry a single "Title" / "Default Title" placeholder
// option that should never render as a selectable pill.
export function isRealOption(option: { name: string; values: string[] }): boolean {
  return !(
    option.name === 'Title' &&
    option.values.length === 1 &&
    option.values[0] === 'Default Title'
  );
}

// The single purchasable variant when a product genuinely has no choice to
// make — either it has exactly one variant overall, or exactly one
// available-for-sale variant among several sold-out ones. Returns null when
// a real choice exists (Quick Add must then open the size selector).
export function singlePurchasableVariant(
  variants: MatchableVariant[]
): MatchableVariant | null {
  const purchasable = variants.filter((v) => v.availableForSale);
  return purchasable.length === 1 ? purchasable[0]! : null;
}

// Mirrors ProductOptions.tsx's getInitialSelectedOptions, independently —
// Quick Add operates on ProductCardData's slimmer shape and deliberately
// does not import from ProductOptions.tsx (real PDP/checkout logic, left
// untouched). Size is never auto-selected when a genuine choice exists, to
// avoid silently adding the wrong size.
export function getInitialQuickAddSelection(
  options: { name: string; values: string[] }[],
  variants: MatchableVariant[]
): Record<string, string> {
  const initial: Record<string, string> = {};

  for (const option of options) {
    const isSize = option.name.toLowerCase() === 'size';

    if (isSize && option.values.length > 1) {
      initial[option.name] = '';
      continue;
    }

    const firstAvailable = variants.find(
      (variant) =>
        variant.availableForSale &&
        variant.selectedOptions.some((o) => o.name === option.name)
    );

    initial[option.name] =
      firstAvailable?.selectedOptions.find((o) => o.name === option.name)
        ?.value ??
      option.values[0] ??
      '';
  }

  return initial;
}
