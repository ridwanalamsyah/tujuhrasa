"use client";
import * as React from "react";

/**
 * Animated liquid-level bottle SVG.
 * Liquid fills up to `level` (0-100). On hover, surface goes wavy.
 */
export function LiquidBottle({
  level = 70,
  color = "var(--tr-cocoa, #6a4928)",
  label,
  className,
  width = 96,
  height = 192,
}: {
  level?: number;
  color?: string;
  label?: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, level));
  const liquidY = 60 + (180 - 60) * (1 - clamped / 100);
  return (
    <svg
      viewBox="0 0 100 200"
      width={width}
      height={height}
      className={className}
      aria-label={label ?? `Botol ${clamped}% terisi`}
    >
      <defs>
        <clipPath id={`tr-bottle-clip-${clamped}`}>
          <path d="M40 8 Q 40 4, 44 4 L 56 4 Q 60 4, 60 8 L 60 30 Q 78 36, 78 60 L 78 175 Q 78 192, 60 192 L 40 192 Q 22 192, 22 175 L 22 60 Q 22 36, 40 30 Z" />
        </clipPath>
      </defs>

      {/* Bottle silhouette (sketchy outline) */}
      <path
        d="M40 8 Q 40 4, 44 4 L 56 4 Q 60 4, 60 8 L 60 30 Q 78 36, 78 60 L 78 175 Q 78 192, 60 192 L 40 192 Q 22 192, 22 175 L 22 60 Q 22 36, 40 30 Z"
        fill="var(--tr-paper, #fefcf6)"
        stroke="var(--tr-ink, #2a241e)"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Liquid (clipped to bottle) */}
      <g clipPath={`url(#tr-bottle-clip-${clamped})`}>
        <rect
          x={20}
          y={liquidY}
          width={60}
          height={200 - liquidY}
          fill={color}
          opacity={0.85}
        >
          <animate
            attributeName="y"
            values={`${liquidY};${liquidY - 1.5};${liquidY}`}
            dur="2.4s"
            repeatCount="indefinite"
          />
        </rect>
        {/* Wavy surface */}
        <path
          d={`M22 ${liquidY} Q 35 ${liquidY - 3}, 50 ${liquidY} T 78 ${liquidY} L 78 ${liquidY + 8} L 22 ${liquidY + 8} Z`}
          fill={color}
        >
          <animate
            attributeName="d"
            values={`
              M22 ${liquidY} Q 35 ${liquidY - 3}, 50 ${liquidY} T 78 ${liquidY} L 78 ${liquidY + 8} L 22 ${liquidY + 8} Z;
              M22 ${liquidY} Q 35 ${liquidY + 3}, 50 ${liquidY} T 78 ${liquidY} L 78 ${liquidY + 8} L 22 ${liquidY + 8} Z;
              M22 ${liquidY} Q 35 ${liquidY - 3}, 50 ${liquidY} T 78 ${liquidY} L 78 ${liquidY + 8} L 22 ${liquidY + 8} Z
            `}
            dur="3.2s"
            repeatCount="indefinite"
          />
        </path>
      </g>

      {/* Cap */}
      <rect
        x={36}
        y={0}
        width={28}
        height={10}
        rx={2}
        fill="var(--tr-ink, #2a241e)"
      />

      {/* Label rectangle */}
      <rect
        x={28}
        y={92}
        width={44}
        height={56}
        rx={4}
        fill="var(--tr-paper, #fefcf6)"
        stroke="var(--tr-ink, #2a241e)"
        strokeWidth={1.2}
      />
      {label ? (
        <text
          x={50}
          y={118}
          textAnchor="middle"
          fontFamily="var(--tr-font-hand, cursive)"
          fontSize={11}
          fontWeight={600}
          fill="var(--tr-ink, #2a241e)"
        >
          {label.length > 8 ? label.slice(0, 8) + "…" : label}
        </text>
      ) : null}
      <text
        x={50}
        y={134}
        textAnchor="middle"
        fontFamily="var(--tr-font-hand, cursive)"
        fontSize={9}
        fill="var(--tr-ink-muted, #7a6f63)"
      >
        Tujuh Rasa
      </text>
    </svg>
  );
}
