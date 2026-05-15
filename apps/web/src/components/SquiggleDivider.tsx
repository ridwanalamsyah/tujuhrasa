"use client";

/**
 * Replaced legacy squiggle with a clean horizontal rule (Tuku menu style).
 * Kept the export name for backward compat.
 */
export function SquiggleDividerInline({
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <div className={"container-tr py-8 " + className}>
      <div className="rule-soft" />
    </div>
  );
}
