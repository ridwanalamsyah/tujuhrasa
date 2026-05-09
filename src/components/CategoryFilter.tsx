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
              "inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-xs lowercase transition border " +
              (active
                ? "bg-ink text-cream border-ink"
                : "bg-cream text-ink border-ink/30 hover:border-ink")
            }
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: c.key === "all" ? "#5b1a14" : colorFor(c.key) }}
            />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
