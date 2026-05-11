"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, ShoppingBag, BookOpen, Gift, Map, Star, Users, FileText, Phone } from "lucide-react";

type Item = {
  group: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
};

const ITEMS: Item[] = [
  { group: "Belanja", label: "Lihat semua menu", href: "/shop", icon: ShoppingBag, keywords: ["botol", "kopi", "produk"] },
  { group: "Belanja", label: "Build a box (langganan)", href: "/build-box", icon: Gift, keywords: ["paket", "box"] },
  { group: "Belanja", label: "Langganan rutin", href: "/langganan", icon: Gift, keywords: ["subscription", "rutin"] },
  { group: "Belanja", label: "Grosir & group buy", href: "/grosir", icon: Users, keywords: ["bulk", "diskon", "borong"] },
  { group: "Cerita", label: "Jurnal & cerita", href: "/cerita", icon: BookOpen, keywords: ["artikel", "blog"] },
  { group: "Cerita", label: "Jelajah rasa nusantara", href: "/jelajah", icon: Map, keywords: ["origin", "petani", "peta"] },
  { group: "Cerita", label: "Event di kafe", href: "/event", icon: Star, keywords: ["acara", "cupping", "kelas"] },
  { group: "Cerita", label: "Tentang Tujuh Rasa", href: "/tentang", icon: FileText, keywords: ["about"] },
  { group: "Cerita", label: "Transparansi & sertifikat", href: "/transparansi", icon: FileText, keywords: ["halal", "bpom", "petani"] },
  { group: "Akun", label: "Pesanan saya", href: "/account/orders", icon: ShoppingBag, keywords: ["order", "history"] },
  { group: "Akun", label: "Poin & loyalti", href: "/poin", icon: Star, keywords: ["reward", "stamp"] },
  { group: "Akun", label: "Wishlist", href: "/account/wishlist", icon: Star, keywords: ["favorit"] },
  { group: "Akun", label: "Referral & undang teman", href: "/referral", icon: Users, keywords: ["share", "ajak"] },
  { group: "Bantuan", label: "FAQ & kontak", href: "/transparansi#faq", icon: Phone, keywords: ["tanya", "help"] },
];

export function CmdK() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("tr:cmdk-open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("tr:cmdk-open", onOpen);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  if (!open) return null;

  const groups = Array.from(new Set(ITEMS.map((i) => i.group)));

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-start justify-center pt-[10vh] px-4 bg-[var(--tr-ink)]/40 backdrop-blur-sm animate-[fadeIn_.18s_ease]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[var(--tr-bg-elev)] border border-[var(--tr-border-strong)] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Tujuh Rasa - cari" loop>
          <div className="flex items-center gap-3 px-4 border-b border-[var(--tr-border)]">
            <Search className="h-4 w-4 text-[var(--tr-text-muted)]" />
            <Command.Input
              placeholder="Cari menu, halaman, fitur…"
              className="flex-1 h-12 bg-transparent outline-none text-[var(--tr-text)] placeholder:text-[var(--tr-text-muted)]"
              autoFocus
            />
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--tr-paper-2)] text-[var(--tr-text-muted)] border border-[var(--tr-border)]">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="px-4 py-8 text-center text-sm text-[var(--tr-text-muted)]">
              Tidak ada hasil. Coba kata kunci lain.
            </Command.Empty>
            {groups.map((g) => (
              <Command.Group
                key={g}
                heading={
                  <span className="eyebrow px-2 py-1.5 block">{g}</span>
                }
              >
                {ITEMS.filter((i) => i.group === g).map((item) => (
                  <Command.Item
                    key={item.href}
                    value={`${item.label} ${item.keywords?.join(" ") ?? ""}`}
                    onSelect={() => go(item.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-[var(--tr-text)] aria-selected:bg-[var(--tr-paper-2)] hover:bg-[var(--tr-paper-2)]/60"
                  >
                    <item.icon className="h-4 w-4 text-[var(--tr-orange)]" />
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
