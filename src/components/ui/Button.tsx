import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

type Variant = 'primary' | 'ghost' | 'underline';

const base =
  'inline-flex items-center justify-center gap-2 text-eyebrow uppercase tracking-wider3 transition duration-300 ease-lunar hover:scale-[1.015] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:hover:scale-100';

const variants: Record<Variant, string> = {
  primary: 'bg-lunar text-obsidian px-7 py-4 hover:bg-silver',
  ghost: 'border border-mist/40 text-lunar px-7 py-4 hover:border-lunar',
  underline: 'text-lunar link-underline py-1 hover:scale-100', // underline links keep their own micro-interaction, no scale
};

type CommonProps = { variant?: Variant; children: ReactNode; className?: string };

export function Button({
  variant = 'primary',
  children,
  className,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  variant = 'primary',
  children,
  className,
  href,
  ...props
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <Link href={href} className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </Link>
  );
}
