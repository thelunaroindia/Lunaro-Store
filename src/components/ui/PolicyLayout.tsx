import { UtilityPageBackdrop } from './UtilityPageBackdrop';

export function PolicyLayout({
  heading,
  intro,
  points,
  children,
}: {
  heading: string;
  intro: string;
  points: readonly string[];
  children?: React.ReactNode;
}) {
  return (
    <UtilityPageBackdrop>
      <div className="container-lunaro max-w-2xl pt-32 pb-24 md:pt-40">
        <h1 className="font-display text-display-md text-lunar">{heading}</h1>
        <p className="mt-6 text-mist">{intro}</p>
        <ul className="mt-10 space-y-6 border-t border-graphite pt-10">
          {points.map((point) => (
            <li key={point} className="text-sm leading-relaxed text-mist">
              {point}
            </li>
          ))}
        </ul>
        {children}
      </div>
    </UtilityPageBackdrop>
  );
}
