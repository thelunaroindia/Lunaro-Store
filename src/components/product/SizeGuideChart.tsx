'use client';

import { useState } from 'react';
import { sizeGuide } from '@/lib/config';
import { inchesToCm } from '@/lib/sizeGuide';

type Unit = 'in' | 'cm';

// Single shared UI for the oversized-tee size chart — used by both
// /size-guide (the standalone page) and the PDP's SizeGuideDrawer, so the
// IN/CM toggle, table treatment, and columns can never drift apart between
// the two surfaces. Only sizeGuide.chart (src/lib/config.ts) is the data
// source; the IN/CM toggle here only changes display formatting via
// inchesToCm, never a second hand-typed dataset.
export default function SizeGuideChart({
  spacing = 'compact',
}: {
  // 'compact' matches the PDP drawer's narrow panel; 'page' matches the
  // wider standalone page's existing, more generous rhythm. Same content,
  // data and logic either way — only the spacing/type scale differs.
  spacing?: 'compact' | 'page';
}) {
  const [unit, setUnit] = useState<Unit>('in');
  const isPage = spacing === 'page';

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow text-silver">{sizeGuide.subheading}</p>

        <div
          role="group"
          aria-label="Measurement unit"
          className="inline-flex flex-shrink-0 rounded-full border border-graphite p-0.5"
        >
          {(['in', 'cm'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setUnit(option)}
              aria-pressed={unit === option}
              className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider2 transition-colors duration-200 ${
                unit === option
                  ? 'bg-lunar text-obsidian'
                  : 'text-mist hover:text-lunar'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className={`${isPage ? 'mt-10' : 'mt-6'} overflow-x-auto rounded-2xl border border-graphite`}>
        <table className="w-full min-w-[360px] border-collapse text-sm">
          <thead>
            <tr className="bg-charcoal/60 text-left text-mist">
              <th className="px-4 py-3 font-normal uppercase tracking-wider2">Size</th>
              <th className="px-4 py-3 font-normal uppercase tracking-wider2">Chest</th>
              <th className="px-4 py-3 font-normal uppercase tracking-wider2">Shoulder</th>
              <th className="px-4 py-3 font-normal uppercase tracking-wider2">Length</th>
              <th className="px-4 py-3 font-normal uppercase tracking-wider2">Sleeve</th>
            </tr>
          </thead>
          <tbody>
            {sizeGuide.chart.map((row, index) => (
              <tr
                key={row.size}
                className={`text-lunar ${
                  index < sizeGuide.chart.length - 1 ? 'border-b border-graphite' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium">{row.size}</td>
                <td className="px-4 py-3 text-mist">
                  {unit === 'cm' ? inchesToCm(row.chest) : row.chest}
                </td>
                <td className="px-4 py-3 text-mist">
                  {unit === 'cm' ? inchesToCm(row.shoulder) : row.shoulder}
                </td>
                <td className="px-4 py-3 text-mist">
                  {unit === 'cm' ? inchesToCm(row.length) : row.length}
                </td>
                <td className="px-4 py-3 text-mist">
                  {unit === 'cm' ? inchesToCm(row.sleeve) : row.sleeve}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
