import { ReactNode } from 'react';

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group border-b border-graphite py-5" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm uppercase tracking-wider2 text-lunar">
        {title}
        <span className="ml-4 text-mist transition-transform duration-300 group-open:rotate-45">+</span>
      </summary>
      <div className="mt-4 text-sm leading-relaxed text-mist">{children}</div>
    </details>
  );
}
