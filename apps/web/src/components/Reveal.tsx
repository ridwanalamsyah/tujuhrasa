"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  once?: boolean;
  className?: string;
  as?: "div" | "section" | "ul" | "li" | "h2";
};

/**
 * Wrapper that fades + slides children up when they scroll into view.
 * Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  once = true,
  className,
  as = "div",
}: Props) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{ once, amount: 0.2 }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
