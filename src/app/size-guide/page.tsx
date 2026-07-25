import type { Metadata } from 'next';
import { sizeGuide } from '@/lib/config';
import { UtilityPageBackdrop } from '@/components/ui/UtilityPageBackdrop';

export const metadata: Metadata = { title: 'Size Guide' };

export default function SizeGuidePage() {
  return (
    <UtilityPageBackdrop>
      <div className="container-lunaro max-w-2xl pt-32 pb-24 md:pt-40">
      <h1 className="font-display text-display-md text-lunar">SIZE GUIDE</h1>
      <p className="mt-6 text-mist">{sizeGuide.note}</p>

      <table className="mt-10 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-graphite text-left text-mist">
            <th className="py-3 font-normal uppercase tracking-wider2">Size</th>
            <th className="py-3 font-normal uppercase tracking-wider2">Chest (in)</th>
            <th className="py-3 font-normal uppercase tracking-wider2">Length (in)</th>
            <th className="py-3 font-normal uppercase tracking-wider2">Sleeve (in)</th>
          </tr>
        </thead>
        <tbody>
          {sizeGuide.chart.map((row) => (
            <tr key={row.size} className="border-b border-graphite text-lunar">
              <td className="py-3">{row.size}</td>
              <td className="py-3 text-mist">{row.chest}</td>
              <td className="py-3 text-mist">{row.length}</td>
              <td className="py-3 text-mist">{row.sleeve}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </UtilityPageBackdrop>
  );
}
