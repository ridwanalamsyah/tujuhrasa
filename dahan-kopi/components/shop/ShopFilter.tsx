"use client";

import { useState, type ReactNode } from "react";
import type { ProductCategory } from "@/lib/types";

/** Tab kategori di atas grid produk. Kartu produk dirender di server dan dikirim sebagai `items`. */
export function ShopFilter({
  categories,
  items,
}: {
  categories: { id: ProductCategory; name: string }[];
  items: { key: string; category: ProductCategory; node: ReactNode }[];
}) {
  const [active, setActive] = useState<ProductCategory | "semua">("semua");
  const tabs = [{ id: "semua" as const, name: "Semua" }, ...categories];

  return (
    <>
      <div className="flex gap-6 overflow-x-auto border-b border-line [scrollbar-width:none]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={tab.id === active}
            onClick={() => setActive(tab.id)}
            className={`label relative min-h-12 shrink-0 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 ${
              tab.id === active
                ? "text-espresso after:bg-espresso"
                : "text-muted hover:text-espresso"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
        {items
          .filter((item) => active === "semua" || item.category === active)
          .map((item) => (
            <li key={item.key}>{item.node}</li>
          ))}
      </ul>
    </>
  );
}
