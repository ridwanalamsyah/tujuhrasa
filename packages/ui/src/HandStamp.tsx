import * as React from "react";

/**
 * Hand-stamped circle badge (like a rubber stamp on a paper bag).
 * Used for promo tags, "Baru!", "Habis dipesan", etc.
 */
export function HandStamp({
  children,
  rotate = -8,
  color,
  className,
}: {
  children: React.ReactNode;
  rotate?: number;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        transform: `rotate(${rotate}deg)`,
        padding: "8px 14px",
        border: `2.5px solid ${color ?? "var(--tr-orange, #e07a2c)"}`,
        borderRadius: "999px",
        color: color ?? "var(--tr-orange-deep, #b75e1a)",
        fontFamily: "var(--tr-font-hand)",
        fontSize: "1.05rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        background: "var(--tr-paper, #fefcf6)",
        boxShadow: "var(--tr-shadow-sketch, 1px 1px 0 rgba(0,0,0,0.85))",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
