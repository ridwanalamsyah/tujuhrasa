"use client";

import { useEffect, useState } from "react";

export function WishlistButton({
  sku,
  pname,
  variant = "stock",
}: {
  sku: string;
  pname: string;
  variant?: "stock" | "price" | "general";
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("tr_loyalty_email");
    if (saved) setEmail(saved);
    const wls = JSON.parse(localStorage.getItem("tr_wishlist") ?? "[]") as string[];
    if (wls.includes(`${sku}:${variant}`)) setDone(true);
  }, [sku, variant]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, sku, pname, notify: variant }),
      });
      const j = await r.json();
      if (!r.ok) {
        setErr(j.error ?? "Gagal");
      } else {
        setDone(true);
        const wls = JSON.parse(localStorage.getItem("tr_wishlist") ?? "[]") as string[];
        wls.push(`${sku}:${variant}`);
        localStorage.setItem("tr_wishlist", JSON.stringify(wls));
        localStorage.setItem("tr_loyalty_email", email);
        setOpen(false);
      }
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-leaf text-leaf px-3 py-1.5 text-xs font-mono lowercase">
        ✓ wishlist tersimpan
      </span>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-ink/40 px-3 py-1.5 text-xs font-mono lowercase hover:bg-ink hover:text-cream transition"
        aria-label={
          variant === "stock"
            ? "kabari saya kalau stok tersedia"
            : variant === "price"
            ? "kabari saya kalau diskon"
            : "tambah ke wishlist"
        }
      >
        ♡{" "}
        {variant === "stock"
          ? "kabari kalau ada"
          : variant === "price"
          ? "kabari kalau diskon"
          : "wishlist"}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="inline-flex items-center gap-2 flex-wrap">
      <input
        type="email"
        required
        placeholder="email kamu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-full border border-ink px-3 py-1.5 bg-cream text-xs"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-ink text-cream px-3 py-1.5 text-xs font-mono lowercase disabled:opacity-50"
      >
        {busy ? "..." : "simpan"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs opacity-60 hover:opacity-100"
      >
        batal
      </button>
      {err && <p className="w-full text-xs text-orange font-mono">{err}</p>}
    </form>
  );
}
