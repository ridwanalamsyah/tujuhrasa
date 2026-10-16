"use client";

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type MouseEvent } from "react";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { Container } from "@/components/ui/Container";
import type { MenuCategory } from "@/lib/types";

const ALL = "semua";

/* Kategori aktif disimpan di hash URL (/menu#kopi) agar bisa dibagikan. */
const hashListeners = new Set<() => void>();

function subscribeHash(onChange: () => void) {
  hashListeners.add(onChange);
  window.addEventListener("hashchange", onChange);
  return () => {
    hashListeners.delete(onChange);
    window.removeEventListener("hashchange", onChange);
  };
}

function setHash(id: string) {
  const url = id === ALL ? window.location.pathname : `#${id}`;
  window.history.replaceState(null, "", url);
  hashListeners.forEach((listener) => listener());
}

function readHash() {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return "";
  }
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function MenuBrowser({ categories }: { categories: MenuCategory[] }) {
  const visible = categories.filter((category) => category.items.length > 0);
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const active = visible.some((category) => category.id === hash) ? hash : ALL;

  const barRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLUListElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const changedByClick = useRef(false);

  // Kategori berubah dari URL (link /menu#kategori, tombol back/forward):
  // setelah kategori lain disembunyikan, gulir ke kategori yang dipilih.
  useLayoutEffect(() => {
    if (changedByClick.current) {
      changedByClick.current = false;
      return;
    }
    if (active !== ALL) document.getElementById(active)?.scrollIntoView({ block: "start" });
  }, [active]);

  // Geser tombol kategori aktif ke tengah baris (berguna di layar kecil).
  useEffect(() => {
    const row = pillsRef.current;
    const pill = row?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!row || !pill) return;
    const left = pill.offsetLeft - (row.clientWidth - pill.clientWidth) / 2;
    row.scrollTo({ left, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [active]);

  function select(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    if (id === active) return;
    changedByClick.current = true;
    setHash(id);
    const list = listRef.current;
    const bar = barRef.current;
    if (!list || !bar) return;
    const offset = bar.getBoundingClientRect().bottom + 8;
    const top = list.getBoundingClientRect().top + window.scrollY - offset;
    if (window.scrollY > top) {
      window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  }

  const filters = [{ id: ALL, name: "Semua" }, ...visible];

  return (
    <>
      <div
        ref={barRef}
        className="sticky top-(--header-h) z-30 mt-12 border-y border-line bg-cream/95 backdrop-blur-md"
      >
        <Container>
          <nav aria-label="Kategori menu">
            <ul
              ref={pillsRef}
              className="relative -mx-5 flex gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
            >
              {filters.map((filter) => {
                const isActive = filter.id === active;
                return (
                  <li key={filter.id} className="shrink-0">
                    <a
                      href={filter.id === ALL ? "#" : `#${filter.id}`}
                      onClick={(event) => select(event, filter.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-300 ${
                        isActive
                          ? "border-espresso bg-espresso text-cream"
                          : "border-line bg-white text-espresso hover:border-espresso/40"
                      }`}
                    >
                      {filter.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </Container>
      </div>

      <div ref={listRef}>
        <Container className="space-y-20 py-14 sm:py-20">
          {visible.map((category) => (
            <section
              key={category.id}
              id={category.id}
              aria-labelledby={`${category.id}-judul`}
              hidden={active !== ALL && active !== category.id}
              className="scroll-mt-[calc(var(--header-h)+5.5rem)]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line pb-5">
                <h2 id={`${category.id}-judul`} className="heading-display text-5xl sm:text-6xl">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="eyebrow text-muted">{category.description}</p>
                )}
              </div>
              <ul className="mt-8 grid gap-4 md:grid-cols-2 md:gap-5">
                {category.items.map((item) => (
                  <li key={item.name}>
                    <MenuItemCard item={item} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </Container>
      </div>
    </>
  );
}
