'use client';

import { useEffect, useRef } from 'react';
import { sizeGuide, bottomsSizeGuide } from '@/lib/config';

type Category = 'tops' | 'bottoms';

// Renders the same sizeGuide/bottomsSizeGuide data as /size-guide — never a
// second, hand-authored chart that could drift out of sync — in a drawer so
// a visitor can check sizing without losing their colour/size selection on
// the PDP.
export default function SizeGuideDrawer({
  open,
  onClose,
  category,
}: {
  open: boolean;
  onClose: () => void;
  category: Category;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      panelRef.current?.focus();
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

  const isBottoms = category === 'bottoms';

  return (
    <div
      className={`fixed inset-0 z-[80] ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-obsidian/70 transition-opacity duration-500 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Size Guide"
        tabIndex={-1}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto bg-obsidian shadow-2xl transition-transform duration-500 ease-lunar ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-graphite p-6">
          <p className="eyebrow text-lunar">Size Guide</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="text-eyebrow uppercase tracking-wider2 text-lunar"
          >
            Close
          </button>
        </div>

        <div className="flex-1 p-6">
          {isBottoms ? (
            <>
              <p className="text-sm text-mist">{bottomsSizeGuide.note}</p>

              <div className="mt-8 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-graphite text-left text-mist">
                      <th className="py-3 font-normal uppercase tracking-wider2">Size</th>
                      <th className="py-3 font-normal uppercase tracking-wider2">Waist (in)</th>
                      <th className="py-3 font-normal uppercase tracking-wider2">Hip (in)</th>
                      <th className="py-3 font-normal uppercase tracking-wider2">Outseam (in)</th>
                      <th className="py-3 font-normal uppercase tracking-wider2">Inseam (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bottomsSizeGuide.chart.map((row) => (
                      <tr key={row.size} className="border-b border-graphite text-lunar">
                        <td className="py-3">{row.size}</td>
                        <td className="py-3 text-mist">{row.waist}</td>
                        <td className="py-3 text-mist">{row.hip}</td>
                        <td className="py-3 text-mist">{row.outseam}</td>
                        <td className="py-3 text-mist">{row.inseam}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-mist">{sizeGuide.note}</p>

              <div className="mt-8 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-graphite text-left text-mist">
                      <th className="py-3 font-normal uppercase tracking-wider2">Size</th>
                      <th className="py-3 font-normal uppercase tracking-wider2">Chest (in)</th>
                      <th className="py-3 font-normal uppercase tracking-wider2">Length (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeGuide.chart.map((row) => (
                      <tr key={row.size} className="border-b border-graphite text-lunar">
                        <td className="py-3">{row.size}</td>
                        <td className="py-3 text-mist">{row.chest}</td>
                        <td className="py-3 text-mist">{row.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
