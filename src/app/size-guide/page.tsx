import type { Metadata } from 'next';
import { bottomsSizeGuide } from '@/lib/config';
import { canonicalUrl } from '@/lib/canonical';
import { UtilityPageBackdrop } from '@/components/ui/UtilityPageBackdrop';
import SizeGuideChart from '@/components/product/SizeGuideChart';

export const metadata: Metadata = {
  title: 'Size Guide',
  description: 'Measurements for LUNARO tees and bottoms.',
  alternates: { canonical: canonicalUrl('/size-guide') },
};

export default async function SizeGuidePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const isBottoms = searchParams.category === 'bottoms';

  return (
    <UtilityPageBackdrop>
      <div className="container-lunaro max-w-2xl pt-32 pb-24 md:pt-40">
      <h1 className="font-display text-display-md text-lunar">SIZE GUIDE</h1>

      {isBottoms ? (
        <>
          <p className="mt-6 text-mist">{bottomsSizeGuide.note}</p>

          <div className="mt-10 overflow-x-auto">
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
        <div className="mt-3">
          <SizeGuideChart spacing="page" />
        </div>
      )}
    </div>
    </UtilityPageBackdrop>
  );
}
