import * as React from "react";

/**
 * Hand-drawn squiggle underline. Renders an SVG path that mimics a
 * pencil scribble drawn under a word/phrase. Use as decoration:
 *
 *  <span className="relative inline-block">
 *    rasa
 *    <Squiggle className="absolute -bottom-2 left-0 w-full" />
 *  </span>
 */
export function Squiggle({
  className,
  color = "currentColor",
  strokeWidth = 3,
  variant = "wave",
}: {
  className?: string;
  color?: string;
  strokeWidth?: number;
  variant?: "wave" | "double" | "scratch" | "ribbon";
}) {
  const paths: Record<string, string> = {
    wave: "M2 8 Q 20 2, 40 8 T 80 8 T 120 8 T 160 8 T 198 8",
    double:
      "M2 6 Q 20 2, 40 6 T 80 6 T 120 6 T 160 6 T 198 6 M4 12 Q 22 8, 42 12 T 82 12 T 122 12 T 162 12 T 196 12",
    scratch: "M2 10 L 40 4 L 80 11 L 120 5 L 160 10 L 198 6",
    ribbon: "M0 8 C 30 0, 70 16, 100 8 S 170 0, 200 8",
  };
  return (
    <svg
      viewBox="0 0 200 16"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d={paths[variant]}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Animated squiggle: stroke-dasharray "draws-in" when the element
 * enters the viewport. Use as a section divider.
 */
export function SquiggleDivider({
  className,
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M0 20 Q 50 5, 100 20 T 200 20 T 300 20 T 400 20 T 500 20 T 600 20 T 700 20 T 800 20 T 900 20 T 1000 20 T 1100 20 T 1200 20"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1400"
        strokeDashoffset="1400"
        style={{
          animation: "tr-draw 1.4s var(--tr-ease, ease) forwards",
        }}
      />
      <style>{`@keyframes tr-draw { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
  );
}
