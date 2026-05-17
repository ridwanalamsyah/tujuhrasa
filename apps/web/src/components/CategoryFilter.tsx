"use client";
import { useRouter, useSearchParams } from "next/navigation";

const CAT_COLORS: Record<string, string> = {
  Kopi: "#3a1410",
  "Kopi Botol": "#3a1410",
  Matcha: "#7e8c5a",
  Susu: "#e6cfb0",
  Seasonal: "#a04a2a",
  Wedang: "#d97757",
  Teh: "#7c3a26",
};

function colorFor(cat: string): string {
  return CAT_COLORS[cat] ?? "#5b1a14";
}

export function CategoryFilter({
  categories,
  current,
}: {
  categories: string[];
  current: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const set = (key: string) => {
    const sp = new URLSearchParams(params);
    if (key === "all") sp.delete("cat");
    else sp.set("cat", key);
    router.push("/shop" + (sp.toString() ? "?" + sp.toString() : ""));
  };

  const items = [{ key: "all", label: "semua" }, ...categories.map((c) => ({ key: c, label: c.toLowerCase() }))];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((c) => {
        const active = current === c.key || (current === "all" && c.key === "all");
        return (
          <button
            key={c.key}
            onClick={() => set(c.key)}
            className={
              "inline-flex items-center gap-2 rounded-sm px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest transition border-2 " +
              (active
                ? "bg-[var(--tr-ink)] text-[var(--tr-paper)] border-[var(--tr-ink)] shadow-stamp-sm"
                : "bg-[var(--tr-paper)] text-[var(--tr-ink)] border-[var(--tr-ink)] hover:shadow-stamp-sm hover:-translate-x-[1px] hover:-translate-y-[1px]")
            }
          >
            <span
              className="inline-block w-2 h-2 rounded-sm border border-[var(--tr-ink)]"
              style={{ background: c.key === "all" ? "var(--tr-brick)" : colorFor(c.key) }}
            />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
