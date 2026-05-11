import * as React from "react";
import { cn } from "./cn";

type Tone = "default" | "leaf" | "orange" | "plum" | "sky" | "cocoa" | "ink";

const toneMap: Record<Tone, string> = {
  default:
    "bg-[var(--tr-paper-2)] text-[var(--tr-ink)] border-[var(--tr-line)]",
  leaf:
    "bg-[var(--tr-leaf-soft)] text-[var(--tr-leaf-deep)] border-[var(--tr-leaf-deep)]",
  orange:
    "bg-[var(--tr-orange-soft)] text-[var(--tr-orange-deep)] border-[var(--tr-orange-deep)]",
  plum:
    "bg-[var(--tr-plum-soft)] text-[var(--tr-plum)] border-[var(--tr-plum)]",
  sky: "bg-[var(--tr-sky-soft)] text-[var(--tr-sky)] border-[var(--tr-sky)]",
  cocoa:
    "bg-[var(--tr-cocoa-soft)] text-[var(--tr-cocoa)] border-[var(--tr-cocoa)]",
  ink: "bg-[var(--tr-ink)] text-[var(--tr-cream)] border-[var(--tr-ink)]",
};

export function Badge({
  className,
  tone = "default",
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium",
        toneMap[tone],
        className
      )}
      {...rest}
    />
  );
}
