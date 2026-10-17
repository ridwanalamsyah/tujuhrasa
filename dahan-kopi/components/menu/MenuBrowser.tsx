"use client";

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type MouseEvent } from "react";
import { MenuRow } from "@/components/menu/MenuRow";
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
    if (active !== ALL)
      document.getElementById(active)?.scrollIntoView({ block: "start", behavior: "instant" });
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
    const offset = bar.getBoundingClientRect().bottom;
    const top = list.getBoundingClientRect().top + window.scrollY - offset;
    if (window.scrollY > top) {
      window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  }

  const filters = [{ id: ALL, name: "Semua" }, ...visible];
  const shown = visible.filter((category) => active === ALL || active === category.id);

  return (
    <>
      <div ref={barRef} className="sticky top-(--header-h) z-30 border-y border-line bg-cream">
        <Container>
          <nav aria-label="Kategori menu">
            <ul
              ref={pillsRef}
              className="relative -mx-4 flex gap-6 overflow-x-auto px-4 [scroll-padding-inline:1rem] [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:gap-7 lg:px-0 [&::-webkit-scrollbar]:hidden"
            >
              {filters.map((filter) => {
                const isActive = filter.id === active;
                return (
                  <li key={filter.id} className="shrink-0">
                    <a
                      href={filter.id === ALL ? "#" : `#${filter.id}`}
                      onClick={(event) => select(event, filter.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={`relative inline-flex min-h-12 min-w-11 items-center justify-center whitespace-nowrap focus-visible:outline-offset-[-2px] text-[0.9375rem] transition-colors duration-150 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 ${
                        isActive
                          ? "font-semibold text-espresso after:bg-coffee"
                          : "font-medium text-muted hover:text-espresso"
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
        <Container className="pt-8 lg:pt-12">
          {visible.map((category) => {
            const isHidden = !shown.includes(category);
            const isFirst = shown[0] === category;
            return (
              <section
                key={category.id}
                id={category.id}
                aria-labelledby={`${category.id}-judul`}
                hidden={isHidden}
                className={`scroll-mt-[3.125rem] pb-8 lg:grid lg:grid-cols-12 lg:gap-6 lg:pb-10 ${
                  isFirst ? "" : "border-t border-line pt-8 lg:pt-10"
                }`}
              >
                <div className="self-start lg:sticky lg:top-[calc(var(--header-h)+3.125rem+1.5rem)] lg:col-span-4">
                  <h2 id={`${category.id}-judul`} className="display-2">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="mt-1 text-small text-muted">{category.description}</p>
                  )}
                </div>
                <ul className="mt-5 max-w-[40rem] space-y-5 lg:col-span-6 lg:col-start-6 lg:mt-0">
                  {category.items.map((item) => (
                    <MenuRow key={item.name} item={item} />
                  ))}
                </ul>
              </section>
            );
          })}
        </Container>
      </div>
    </>
  );
}
