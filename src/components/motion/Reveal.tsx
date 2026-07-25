'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ReactNode } from 'react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * The single scroll-reveal primitive for the homepage. Deliberately one
 * component with a few dials, rather than a different bespoke animation per
 * section — consistency is what reads as "designed," not variety.
 *
 * Renders children unanimated (and un-observed) when the user prefers
 * reduced motion — no delayed opacity flash, just present immediately.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  scale,
  once = true,
  as: Component = motion.div,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scale?: number;
  once?: boolean;
  as?: typeof motion.div;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants: Variants = {
    hidden: { opacity: 0, y, scale: scale ?? 1 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.9, ease: EASE, delay },
    },
  };

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-10% 0px' }}
      variants={variants}
    >
      {children}
    </Component>
  );
}

/** Stagger wrapper — use around a group of <Reveal as={motion.span}> or similar for sequenced entry. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}
