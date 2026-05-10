"use client";
import { motion } from "framer-motion";

export function SquiggleDividerInline({
  color = "var(--tr-orange)",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <div className={"flex items-center justify-center py-6 " + className}>
      <motion.svg
        viewBox="0 0 800 24"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
        className="w-full max-w-2xl h-6 opacity-70"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      >
        <motion.path
          d="M0 12 Q 50 4, 100 12 T 200 12 T 300 12 T 400 12 T 500 12 T 600 12 T 700 12 T 800 12"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </motion.svg>
    </div>
  );
}
