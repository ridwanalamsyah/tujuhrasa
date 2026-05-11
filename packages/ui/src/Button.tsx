import * as React from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "ink";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tr-orange)] focus-visible:ring-offset-[var(--tr-bg)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

const sizeMap: Record<Size, string> = {
  sm: "px-3.5 h-9 text-sm",
  md: "px-5 h-11 text-[15px]",
  lg: "px-6 h-12 text-base",
};

const variantMap: Record<Variant, string> = {
  primary:
    "bg-[var(--tr-orange)] text-white hover:bg-[var(--tr-orange-deep)] hover:-translate-y-[1px] active:translate-y-0 shadow-[2px_3px_0_var(--tr-ink)]",
  secondary:
    "bg-[var(--tr-ink)] text-[var(--tr-cream)] hover:bg-[var(--tr-ink-soft)] hover:-translate-y-[1px] active:translate-y-0 shadow-[2px_3px_0_var(--tr-orange)]",
  ghost:
    "text-[var(--tr-ink)] hover:bg-[var(--tr-paper-2)]",
  outline:
    "bg-[var(--tr-paper)] text-[var(--tr-ink)] border-[1.5px] border-[var(--tr-ink)] hover:bg-[var(--tr-paper-2)] hover:-translate-y-[1px] active:translate-y-0 shadow-[2px_3px_0_var(--tr-ink)]",
  ink:
    "bg-[var(--tr-ink)] text-[var(--tr-cream)] hover:bg-[var(--tr-ink-soft)] hover:-translate-y-[1px] active:translate-y-0",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(base, sizeMap[size], variantMap[variant], className)}
      {...rest}
    />
  )
);
Button.displayName = "Button";
