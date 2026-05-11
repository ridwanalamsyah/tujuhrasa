import * as React from "react";

/**
 * Slightly imperfect SVG border for cards - emulates hand-drawn box.
 * Wraps children. Border is slightly off-rectangle, like drawn with a pen.
 */
export function SketchyBorder({
  children,
  className,
  rotate = 0,
  color,
  fill,
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
  color?: string;
  fill?: string;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="none"
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <path
          d="M8 14 Q 4 6, 14 4 L 386 6 Q 396 4, 394 14 L 392 226 Q 396 234, 386 236 L 14 234 Q 4 236, 6 226 Z"
          fill={fill ?? "var(--tr-paper, #fefcf6)"}
          stroke={color ?? "var(--tr-ink, #2a241e)"}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      </svg>
      <div style={{ position: "relative", padding: "20px 24px" }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Decorative torn-paper edge. Renders an SVG that looks like a piece
 * of paper torn at one or more sides.
 */
export function TornEdge({
  side = "bottom",
  className,
  color,
}: {
  side?: "top" | "bottom";
  className?: string;
  color?: string;
}) {
  const path =
    side === "bottom"
      ? "M0 0 L 0 16 L 30 12 L 60 18 L 90 10 L 120 16 L 160 8 L 200 14 L 250 10 L 300 16 L 340 8 L 400 14 L 400 0 Z"
      : "M0 16 L 30 6 L 60 12 L 90 4 L 120 10 L 160 2 L 200 8 L 250 4 L 300 10 L 340 2 L 400 8 L 400 16 Z";
  return (
    <svg
      viewBox="0 0 400 18"
      preserveAspectRatio="none"
      aria-hidden
      className={className}
    >
      <path d={path} fill={color ?? "var(--tr-paper, #fefcf6)"} />
    </svg>
  );
}
