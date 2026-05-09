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

  return (
    <form onSubmit={submit} className="space-y-8">
      <div>
        <p className="eyebrow mb-3">jadwal pengiriman</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {plans.map((p) => (
            <button
              key={p.v}
              type="button"
              onClick={() => setPlan(p.v)}
              className={
                "relative text-left rounded-2xl border-2 p-4 transition " +
                (plan === p.v ? "border-ink bg-ink text-cream" : "border-ink/20 hover:border-ink/40")
              }
            >
              {p.recommended && (
                <span className="absolute -top-2 right-3 bg-orange text-cream font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                  populer
                </span>
              )}
              <p className="font-serif italic text-2xl">{p.l}</p>
              <p className="text-xs opacity-70 mt-1">{p.note}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-3">isi tiap kotak</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {sizes.map((p) => (
            <button
              key={p.v}
              type="button"
              onClick={() => setSize(p.v)}
              className={
                "relative text-left rounded-2xl border-2 p-4 transition " +
                (size === p.v ? "border-ink bg-ink text-cream" : "border-ink/20 hover:border-ink/40")
              }
            >
              {p.recommended && (
                <span className="absolute -top-2 right-3 bg-orange text-cream font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                  pas
                </span>
              )}
              <p className="font-serif italic text-2xl">{p.l}</p>
              <p className="text-xs opacity-70 mt-1">{p.note}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-3">pilih paket</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {prefs.map((p) => (
            <label key={p.v} className={"cursor-pointer rounded-2xl border-2 p-4 transition flex items-center gap-3 " + (pref === p.v ? "border-ink bg-ink text-cream" : "border-ink/20 hover:border-ink/40")}>
              <input
                type="radio"
                name="preference"
                value={p.v}
                checked={pref === p.v}
                onChange={() => setPref(p.v)}
              />
              <span className="font-serif italic text-lg">{p.l}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-paper border border-ink/20 p-6 space-y-4">
        <p className="eyebrow">data kamu</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <input name="customerName" required placeholder="nama lengkap" className="rounded-xl border border-ink/30 bg-cream px-4 py-3" />
          <input name="customerEmail" required type="email" placeholder="email" className="rounded-xl border border-ink/30 bg-cream px-4 py-3" />
        </div>
        <input name="customerPhone" placeholder="no. WhatsApp (untuk reminder)" className="w-full rounded-xl border border-ink/30 bg-cream px-4 py-3" />
        <input name="address" required placeholder="alamat lengkap (untuk pengiriman rutin)" className="w-full rounded-xl border border-ink/30 bg-cream px-4 py-3" />
      </div>

      {err && <p className="text-orange font-mono text-sm">{err}</p>}
      {done && (
        <div className="rounded-2xl bg-orange/10 border border-orange/40 p-5 text-sm">
          <p className="font-serif italic text-2xl">Selamat datang di langganan!</p>
          <p className="opacity-80 mt-2">
            Konfirmasi langganan <strong>{done.plan}</strong> sudah kami catat untuk <strong>{done.email}</strong>. Kami akan kirim email konfirmasi sebentar lagi.
          </p>
        </div>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full justify-center text-base">
        {pending ? "memproses…" : "mulai langganan →"}
      </button>
    </form>
  );
}
