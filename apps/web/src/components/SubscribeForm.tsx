"use client";
import { useState, useTransition } from "react";

const plans = [
  { v: "weekly", l: "Mingguan", note: "tiap 7 hari" },
  { v: "biweekly", l: "Dua mingguan", note: "tiap 14 hari", recommended: true },
  { v: "monthly", l: "Bulanan", note: "tiap 30 hari" },
];

const sizes = [
  { v: 4, l: "4 botol", note: "buat satu orang" },
  { v: 7, l: "7 botol", note: "stok seminggu", recommended: true },
  { v: 14, l: "14 botol", note: "buat dibagi tetangga" },
];

const prefs = [
  { v: "mixed", l: "Campur semua menu" },
  { v: "kopi-pack", l: "Paket kopi (susu & gula aren)" },
  { v: "matcha-pack", l: "Paket matcha & susu" },
  { v: "petualang", l: "Surprise tiap pengiriman" },
];

export function SubscribeForm() {
  const [plan, setPlan] = useState("biweekly");
  const [size, setSize] = useState(7);
  const [pref, setPref] = useState("mixed");
  const [pending, start] = useTransition();
  const [done, setDone] = useState<{ plan: string; email: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setDone(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      customerName: String(fd.get("customerName") || ""),
      customerEmail: String(fd.get("customerEmail") || ""),
      customerPhone: String(fd.get("customerPhone") || ""),
      address: String(fd.get("address") || ""),
      plan,
      bottlesPerBox: size,
      preference: pref,
    };
    start(async () => {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error?.formErrors?.[0] || "Gagal daftar. Coba lagi.");
        return;
      }
      setDone({ plan: data.subscription.plan, email: data.subscription.customerEmail });
      (e.target as HTMLFormElement).reset();
    });
  };

  const tileBase =
    "relative text-left rounded-sm border-2 border-[var(--tr-ink)] p-4 transition";
  const tileActive =
    "bg-[var(--tr-ink)] text-[var(--tr-paper)] shadow-stamp";
  const tileIdle =
    "bg-[var(--tr-paper)] hover:shadow-stamp-sm hover:-translate-x-[1px] hover:-translate-y-[1px]";

  return (
    <form onSubmit={submit} className="space-y-8 p-5 sm:p-7">
      <div>
        <p className="eyebrow mb-3">Jadwal pengiriman</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {plans.map((p) => (
            <button
              key={p.v}
              type="button"
              onClick={() => setPlan(p.v)}
              className={tileBase + " " + (plan === p.v ? tileActive : tileIdle)}
            >
              {p.recommended && (
                <span className="absolute -top-2 right-3 bg-[var(--tr-brick)] text-[var(--tr-paper)] font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm border border-[var(--tr-ink)]">
                  populer
                </span>
              )}
              <p className="font-display font-black text-2xl">{p.l}</p>
              <p className="text-xs opacity-70 mt-1 font-mono">{p.note}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-3">Isi tiap kotak</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {sizes.map((p) => (
            <button
              key={p.v}
              type="button"
              onClick={() => setSize(p.v)}
              className={tileBase + " " + (size === p.v ? tileActive : tileIdle)}
            >
              {p.recommended && (
                <span className="absolute -top-2 right-3 bg-[var(--tr-mustard)] text-[var(--tr-ink)] font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm border border-[var(--tr-ink)]">
                  pas
                </span>
              )}
              <p className="font-display font-black text-2xl">{p.l}</p>
              <p className="text-xs opacity-70 mt-1 font-mono">{p.note}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-3">Pilih paket</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {prefs.map((p) => (
            <label
              key={p.v}
              className={
                "cursor-pointer rounded-sm border-2 border-[var(--tr-ink)] p-4 transition flex items-center gap-3 " +
                (pref === p.v
                  ? "bg-[var(--tr-ink)] text-[var(--tr-paper)] shadow-stamp-sm"
                  : "bg-[var(--tr-paper)] hover:shadow-stamp-sm")
              }
            >
              <input
                type="radio"
                name="preference"
                value={p.v}
                checked={pref === p.v}
                onChange={() => setPref(p.v)}
                className="accent-[var(--tr-brick)]"
              />
              <span className="font-display font-semibold text-base">{p.l}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-sm bg-[var(--tr-paper-2)] border-2 border-[var(--tr-ink)] p-6 space-y-3">
        <p className="eyebrow">Data kamu</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            name="customerName"
            required
            placeholder="Nama lengkap"
            className="rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] px-4 py-3 focus:outline-none focus:shadow-stamp-sm focus:-translate-x-[1px] focus:-translate-y-[1px] transition"
          />
          <input
            name="customerEmail"
            required
            type="email"
            placeholder="Email"
            className="rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] px-4 py-3 focus:outline-none focus:shadow-stamp-sm focus:-translate-x-[1px] focus:-translate-y-[1px] transition"
          />
        </div>
        <input
          name="customerPhone"
          placeholder="No. WhatsApp (untuk reminder)"
          className="w-full rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] px-4 py-3 focus:outline-none focus:shadow-stamp-sm focus:-translate-x-[1px] focus:-translate-y-[1px] transition"
        />
        <input
          name="address"
          required
          placeholder="Alamat lengkap (untuk pengiriman rutin)"
          className="w-full rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] px-4 py-3 focus:outline-none focus:shadow-stamp-sm focus:-translate-x-[1px] focus:-translate-y-[1px] transition"
        />
      </div>

      {err && (
        <p className="text-[var(--tr-brick)] font-mono text-sm border-2 border-[var(--tr-brick)] rounded-sm px-3 py-2 bg-[var(--tr-brick)]/10">
          {err}
        </p>
      )}
      {done && (
        <div className="rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-mustard-soft)]/30 p-5 text-sm shadow-stamp-sm">
          <p className="font-display font-black text-2xl">Selamat datang di langganan!</p>
          <p className="opacity-80 mt-2">
            Konfirmasi langganan <strong>{done.plan}</strong> sudah kami catat untuk <strong>{done.email}</strong>. Kami akan kirim email konfirmasi sebentar lagi.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full justify-center text-base disabled:opacity-60"
      >
        {pending ? "Memproses…" : "Mulai langganan →"}
      </button>
    </form>
  );
}
