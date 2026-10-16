import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

type Props = {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
};

/** Pembuka halaman (Menu, Tentang): judul besar dengan ruang lega di bawah navbar. */
export function PageHeader({ eyebrow, title, children, actions }: Props) {
  return (
    <header className="pt-[calc(var(--header-h)+4rem)] sm:pt-[calc(var(--header-h)+6rem)]">
      <Container>
        <p className="eyebrow animate-rise text-leaf">{eyebrow}</p>
        <h1 className="heading-display mt-4 max-w-4xl animate-rise text-6xl [animation-delay:100ms] sm:text-7xl lg:text-8xl">
          {title}
        </h1>
        {children && (
          <div className="mt-6 max-w-xl animate-rise text-base leading-relaxed text-muted [animation-delay:180ms] sm:text-lg">
            {children}
          </div>
        )}
        {actions && (
          <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:240ms]">
            {actions}
          </div>
        )}
      </Container>
    </header>
  );
}
