// Derives centimetre values for the size guide directly from the existing
// inch figures in src/lib/config.ts → sizeGuide.chart — never a second,
// hand-typed CM table that could drift out of sync with the approved IN
// data. The approved chart currently uses only plain decimal/whole-number
// strings (e.g. "27.75"), so this is a direct parse — no fraction-glyph
// handling needed.
export function inchesToCm(value: string): string {
  return (Number(value) * 2.54).toFixed(1);
}
