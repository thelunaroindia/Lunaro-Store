import { ReactNode } from 'react';

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  headingClassName = 'text-sm uppercase tracking-wider2',
  bodyClassName = 'text-sm leading-relaxed text-mist',
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  // Optional per-instance typography overrides — default values reproduce
  // the original classes exactly, so existing callers (e.g. the FAQ page)
  // render unchanged unless they opt in.
  headingClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <details className="group border-b border-graphite py-5" open={defaultOpen}>
      <summary className={`flex cursor-pointer list-none items-center justify-between text-lunar ${headingClassName}`}>
        {title}
        <span className="ml-4 text-mist transition-transform duration-300 group-open:rotate-45">+</span>
      </summary>
      <div className={`mt-4 ${bodyClassName}`}>{children}</div>
    </details>
  );
}
