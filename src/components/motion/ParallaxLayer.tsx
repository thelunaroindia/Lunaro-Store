'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ReactNode, RefObject } from 'react';

/**
 * Moves a purely decorative layer at a fraction of scroll speed relative to
 * a target section, for a restrained sense of depth. Never used on content
 * that carries information — decoration only. `range` is the max pixel
 * offset applied across the full scroll of the target section.
 */
export function ParallaxLayer({
  targetRef,
  range = 40,
  className,
  children,
}: {
  targetRef: RefObject<HTMLElement>;
  range?: number;
  className?: string;
  children: ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, range]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
