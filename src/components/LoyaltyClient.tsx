"use client";

import { useEffect, useState } from "react";

type Loyalty = {
  found: boolean;
  customer: { name: string; email: string; wa: string; city: string; totalSpend: number; orderCount: number; joinedAt: string } | null;
  pointsBalance: number;
  pointsEarned: number;
  pointsRedeemed: number;
  activities: { id: string; ts: string; kind: string; points: number; note: string }[];
  tier: { name: string; min: number; next: { name: string; min: number } | null };
  ordersTotal: number;
  freeAtCount: number;
  recentOrders: { id: string; ts: string; pname: string; qty: number; total: number; status: string }[];
};

const fmtRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

const ACHIEVEMENTS: { id: string; label: string; emoji: string; check: (l: Loyalty) => boolean }[] = [
  { id: "first", label: "Pesanan pertama", emoji: "🎉", check: (l) => l.ordersTotal >= 1 },
  { id: "five", label: "5 pesanan", emoji: "🪶", check: (l) => l.ordersTotal >= 5 },
  { id: "ten", label: "Stamp penuh", emoji: "🏅", check: (l) => l.ordersTotal >= 10 },
  { id: "spend100", label: "Top up Rp 100rb", emoji: "💰", check: (l) => (l.customer?.totalSpend ?? 0) >= 100_000 },
  { id: "spend500", label: "Sahabat kafe", emoji: "🤝", check: (l) => (l.customer?.totalSpend ?? 0) >= 500_000 },
  { id: "spend2m", label: "Saudagar", emoji: "👑", check: (l) => (l.customer?.totalSpend ?? 0) >= 2_000_000 },
  { id: "redeem", label: "Tukar pertama", emoji: "🎁", check: (l) => l.pointsRedeemed > 0 },
  { id: "earn50", label: "50 poin terkumpul", emoji: "🌟", check: (l) => l.pointsEarned >= 50 },
];

const SPIN_PRIZES = [
  { label: "Diskon Rp 5.000", code: "SPIN-5K", value: 5000 },
  { label: "Gratis ongkir", code: "SPIN-GRATIS-ONGKIR", value: 15000 },
  { label: "Diskon Rp 3.000", code: "SPIN-3K", value: 3000 },
  { label: "Coba lagi", code: "", value: 0 },
  { label: "Diskon Rp 7.000", code: "SPIN-7K", value: 7000 },
  { label: "Diskon Rp 2.000", code: "SPIN-2K", value: 2000 },
];

export function LoyaltyClient() {
  const [email, setEmail] = useState("");
  const [data, setData] = useState<Loyalty | null>(null);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemPts, setRedeemPts] = useState(50);
  const [redeemMsg, setRedeemMsg] = useState<string>("");
  const [checkinMsg, setCheckinMsg] = useState<string>("");
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<{ label: string; code: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("tr_loyalty_email");
    if (saved) setEmail(saved);
  }, []);

  const lookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setRedeemMsg("");
    setCheckinMsg("");
    try {
      const r = await fetch(`/api/points/lookup?email=${encodeURIComponent(email)}`);
      const j: Loyalty = await r.json();
      setData(j);
      localStorage.setItem("tr_loyalty_email", email);
    } finally {
      setLoading(false);
    }
  };

  const redeem = async () => {
    if (!data?.found) return;
    setRedeeming(true);
    setRedeemMsg("");
    try {
      const r = await fetch("/api/points/redeem", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, points: redeemPts }),
      });
      const j = await r.json();
      if (!r.ok) {
        setRedeemMsg(j.error ?? "Gagal tukar.");
      } else {
        setRedeemMsg(
          `Berhasil! Pakai kode ${j.promoCode} di checkout — diskon ${fmtRp(j.discountIdr)}.`
        );
        await lookup();
      }
    } finally {
      setRedeeming(false);
    }
  };

  const checkin = async () => {
    if (!data?.found) return;
    setCheckinMsg("");
    const r = await fetch("/api/points/checkin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const j = await r.json();
    if (!r.ok) {
      setCheckinMsg(j.error ?? "Gagal check-in.");
    } else {
      setCheckinMsg(`+${j.points} poin (streak hari ke-${j.streak}). Sampai jumpa besok!`);
      await lookup();
    }
  };

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setSpinResult(null);
    setTimeout(() => {
      const pick = SPIN_PRIZES[Math.floor(Math.random() * SPIN_PRIZES.length)];
      setSpinResult({ label: pick.label, code: pick.code });
      setSpinning(false);
    }, 1500);
  };

  const stamps = data?.found ? Math.min(10, data.ordersTotal % 10) : 0;
  const stampsTotal = data?.found ? Math.floor(data.ordersTotal / 10) : 0;
  const tierProgress = (() => {
    if (!data?.customer) return 0;
    const next = data.tier.next;
    if (!next) return 1;
    const span = next.min - data.tier.min;
    const done = data.customer.totalSpend - data.tier.min;
    return Math.max(0, Math.min(1, done / span));
  })();

  return (
    <div className="space-y-8">
      <form
        onSubmit={lookup}
        className="rounded-3xl border border-ink/20 bg-paper p-6 grid sm:grid-cols-[1fr_auto] gap-3 items-end"
      >
        <div>
          <label className="block font-mono text-xs opacity-60 mb-2 lowercase">
            email yang kamu pakai untuk pesan
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@kamu.com"
            className="w-full rounded-full border border-ink px-4 py-2 bg-cream"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !email}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? "memuat..." : "lihat poin saya"}
        </button>
      </form>

      {data && !data.found && (
        <div className="rounded-3xl border border-ink/20 bg-paper p-6">
          <p className="font-serif italic text-2xl">Belum ada akun untuk email itu.</p>
          <p className="opacity-70 mt-2">
            Pesan satu botol dulu aja ya, langsung dapat 10 poin pelanggan baru.
          </p>
        </div>
      )}

      {data?.found && data.customer && (
        <>
          {/* Header card: Customer + Tier */}
          <div className="rounded-3xl border border-ink/20 bg-paper p-6 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <p className="font-mono text-xs opacity-60 lowercase">halo,</p>
              <p className="font-serif italic text-3xl">{data.customer.name}</p>
              <p className="opacity-70 mt-1">{data.customer.city}</p>
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <span className="rounded-full border border-ink/30 px-3 py-1 text-xs font-mono bg-cream">
                  tier · {data.tier.name}
                </span>
                {data.tier.next && (
                  <span className="text-xs font-mono opacity-60">
                    {fmtRp(data.tier.next.min - data.customer.totalSpend)} lagi → {data.tier.next.name}
                  </span>
                )}
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-ink/10 overflow-hidden">
                <div
                  className="h-full bg-orange transition-all"
                  style={{ width: `${tierProgress * 100}%` }}
                />
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="font-mono text-[10px] opacity-60 uppercase">poin saldo</p>
              <p className="font-serif italic text-5xl">{data.pointsBalance}</p>
              <p className="text-xs opacity-50 font-mono mt-1">
                terkumpul {data.pointsEarned} · ditukar {data.pointsRedeemed}
              </p>
            </div>
          </div>

          {/* Daily check-in */}
          <div className="rounded-3xl border border-ink/20 bg-paper p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="eyebrow mb-1">/ check-in harian</p>
                <p className="font-serif italic text-2xl">
                  Tap sekali tiap hari, dapat poin.
                </p>
                <p className="text-sm opacity-70 mt-1">
                  Streak 3 hari = +3 poin · streak 7 hari = +5 poin.
                </p>
              </div>
              <button onClick={checkin} className="btn-secondary">
                check-in hari ini
              </button>
            </div>
            {checkinMsg && (
              <p className="mt-3 font-mono text-sm text-orange">{checkinMsg}</p>
            )}
          </div>

          {/* Stamp card */}
          <div className="rounded-3xl border border-ink/20 bg-paper p-6">
            <p className="eyebrow mb-2">/ stamp card</p>
            <p className="font-serif italic text-2xl mb-4">
              {data.ordersTotal} pesanan · {stampsTotal} botol gratis sudah didapat
            </p>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Array.from({ length: 10 }).map((_, i) => {
                const filled = i < stamps;
                return (
                  <div
                    key={i}
                    className={
                      "aspect-square rounded-full border-2 flex items-center justify-center text-xl transition " +
                      (filled
                        ? "bg-orange border-orange text-cream"
                        : "border-ink/20 text-ink/30 bg-cream")
                    }
                  >
                    {filled ? "☕" : i + 1}
                  </div>
                );
              })}
            </div>
            <p className="text-xs font-mono opacity-60 mt-3">
              {10 - stamps} botol lagi sampai dapat 1 gratis.
            </p>
          </div>

          {/* Redeem points */}
          <div className="rounded-3xl border border-ink/20 bg-paper p-6">
            <p className="eyebrow mb-2">/ tukar poin → diskon</p>
            <p className="font-serif italic text-2xl mb-4">
              1 poin = Rp 1.000 diskon (min. tukar 50 poin).
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                min={50}
                max={Math.max(50, data.pointsBalance)}
                value={redeemPts}
                onChange={(e) => setRedeemPts(parseInt(e.target.value || "0") || 0)}
                className="w-24 rounded-full border border-ink px-3 py-2 bg-cream font-mono text-center"
              />
              <span className="font-serif italic text-xl">
                = {fmtRp(redeemPts * 1000)}
              </span>
              <button
                onClick={redeem}
                disabled={redeeming || redeemPts > data.pointsBalance || redeemPts < 50}
                className="btn-primary disabled:opacity-50"
              >
                {redeeming ? "memproses..." : "tukar sekarang"}
              </button>
            </div>
            {redeemMsg && (
              <p className="mt-3 font-mono text-sm text-orange">{redeemMsg}</p>
            )}
          </div>

          {/* Achievements */}
          <div className="rounded-3xl border border-ink/20 bg-paper p-6">
            <p className="eyebrow mb-2">/ achievement</p>
            <p className="font-serif italic text-2xl mb-4">
              Lencana yang sudah kamu kumpulkan
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ACHIEVEMENTS.map((a) => {
                const got = a.check(data);
                return (
                  <div
                    key={a.id}
                    className={
                      "rounded-2xl border p-4 text-center transition " +
                      (got
                        ? "border-orange bg-orange/10"
                        : "border-ink/15 bg-cream opacity-50")
                    }
                  >
                    <div className="text-3xl mb-1">{got ? a.emoji : "🔒"}</div>
                    <p className="font-mono text-[10px] uppercase tracking-widest">
                      {a.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spin wheel */}
          <div className="rounded-3xl border border-ink/20 bg-paper p-6 text-center">
            <p className="eyebrow mb-2">/ spin keberuntungan</p>
            <p className="font-serif italic text-2xl mb-4">
              Sekali spin per hari, gratis.
            </p>
            <div className="flex flex-col items-center gap-4">
              <div
                className={
                  "w-32 h-32 rounded-full border-4 border-orange relative grid place-items-center " +
                  (spinning ? "animate-spin" : "")
                }
              >
                <span className="text-3xl">🎡</span>
              </div>
              <button
                onClick={spin}
                disabled={spinning}
                className="btn-primary disabled:opacity-50"
              >
                {spinning ? "berputar..." : "putar roda"}
              </button>
              {spinResult && (
                <div className="text-center">
                  <p className="font-serif italic text-xl">{spinResult.label}</p>
                  {spinResult.code && (
                    <p className="font-mono text-sm mt-1">
                      kode: <span className="bg-cream px-2 py-1 rounded border border-ink/20">{spinResult.code}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Activities */}
          <div className="rounded-3xl border border-ink/20 bg-paper p-6">
            <p className="eyebrow mb-2">/ riwayat poin</p>
            {data.activities.length === 0 ? (
              <p className="opacity-60">Belum ada aktivitas.</p>
            ) : (
              <ul className="divide-y divide-ink/10">
                {data.activities.slice(0, 12).map((a) => (
                  <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs opacity-60">
                        {new Date(a.ts).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      <p className="text-sm">{a.note}</p>
                    </div>
                    <span
                      className={
                        "font-mono text-sm tabular-nums " +
                        (a.points > 0 ? "text-leaf" : "text-orange")
                      }
                    >
                      {a.points > 0 ? "+" : ""}
                      {a.points}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
