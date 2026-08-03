// Display-only: strips a trailing "| LUNARO" suffix some Shopify titles
// carry (e.g. "Bearded God | LUNARO"). Anchored to the end and
// case-insensitive, so "Lunaro" appearing earlier in an actual product
// name is left untouched. Never mutates the underlying Shopify title.
export function cleanProductTitle(title: string): string {
  return title.replace(/\s*\|\s*lunaro\s*$/i, '').trim();
}
