import * as React from "react";
import { cn } from "./cn";

export function Card({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[var(--tr-paper)] border border-[var(--tr-border)]",
        "shadow-[var(--tr-shadow-card)] transition-all duration-200",
        "hover:shadow-[var(--tr-shadow-card-hover)] hover:-translate-y-[2px]",
        className
      )}
      {...rest}
    />
  );
}

export function CardHeader({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6", className)} {...rest} />;
}

export function CardBody({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 sm:px-6 pb-5 sm:pb-6", className)} {...rest} />;
}

export function CardTitle({
  className,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-serif italic text-2xl leading-tight text-[var(--tr-ink)]",
        className
      )}
      {...rest}
    />
  );
}

export function CardCaption({
  className,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm text-[var(--tr-text-muted)] leading-relaxed",
        className
      )}
      {...rest}
    />
  );
}
