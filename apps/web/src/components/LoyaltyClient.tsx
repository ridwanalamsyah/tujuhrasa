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
        className="card-stamp p-6 grid sm:grid-cols-[1fr_auto] gap-3 items-end"
      >
        <div>
          <label className="eyebrow block mb-2">
            Email yang kamu pakai untuk pesan
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@kamu.com"
            className="input w-full"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !email}
          className="btn btn-primary disabled:opacity-50"
        >
          {loading ? "Memuat…" : "Lihat poin saya"}
        </button>
      </form>

      {data && !data.found && (
        <div className="card-stamp p-6">
          <p className="font-display font-black text-2xl">
            Belum ada akun untuk email itu.
          </p>
          <p className="font-hand text-xl text-[var(--tr-brick-deep)] mt-2">
            pesan satu botol dulu aja — langsung dapat 10 poin pelanggan baru.
          </p>
        </div>
      )}

      {data?.found && data.customer && (
        <>
          {/* Header card: Customer + Tier */}
          <div className="card-stamp p-6 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <p className="eyebrow">Halo,</p>
              <p className="font-display font-black text-3xl mt-1">
                {data.customer.name}
              </p>
              <p className="text-[var(--tr-text-muted)] mt-1">{data.customer.city}</p>
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <span className="stamp">tier · {data.tier.name}</span>
                {data.tier.next && (
                  <span className="text-xs font-mono text-[var(--tr-text-muted)]">
                    {fmtRp(data.tier.next.min - data.customer.totalSpend)} lagi → {data.tier.next.name}
                  </span>
                )}
              </div>
              <div className="mt-3 h-2 rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper-2)] overflow-hidden">
                <div
                  className="h-full bg-[var(--tr-brick)] transition-all"
                  style={{ width: `${tierProgress * 100}%` }}
                />
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--tr-text-muted)]">
                Poin saldo
              </p>
              <p className="font-display font-black text-5xl text-[var(--tr-brick)] tabular-nums leading-none mt-1">
                {data.pointsBalance}
              </p>
              <p className="text-xs text-[var(--tr-text-muted)] font-mono mt-2">
                terkumpul {data.pointsEarned} · ditukar {data.pointsRedeemed}
              </p>
            </div>
          </div>

          {/* Daily check-in */}
          <div className="card-stamp p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="eyebrow mb-1">Check-in harian</p>
                <p className="font-display font-black text-2xl">
                  Tap sekali tiap hari, dapat poin.
                </p>
                <p className="text-sm text-[var(--tr-text-soft)] mt-1 leading-relaxed">
                  Streak 3 hari = +3 poin · streak 7 hari = +5 poin.
                </p>
              </div>
              <button onClick={checkin} className="btn btn-secondary">
                Check-in hari ini
              </button>
            </div>
            {checkinMsg && (
              <p className="mt-3 font-hand text-xl text-[var(--tr-brick-deep)]">
                {checkinMsg}
              </p>
            )}
          </div>

          {/* Stamp card */}
          <div className="card-stamp p-6">
            <p className="eyebrow mb-2">Stamp card</p>
            <p className="font-display font-black text-2xl mb-4">
              {data.ordersTotal} pesanan · {stampsTotal} botol gratis sudah didapat
            </p>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Array.from({ length: 10 }).map((_, i) => {
                const filled = i < stamps;
                return (
                  <div
                    key={i}
                    className={
                      "aspect-square rounded-sm border-2 border-[var(--tr-ink)] flex items-center justify-center text-xl transition font-mono font-bold " +
                      (filled
                        ? "bg-[var(--tr-brick)] text-[var(--tr-paper)] shadow-stamp-sm"
                        : "bg-[var(--tr-paper-2)] text-[var(--tr-text-muted)]")
                    }
                  >
                    {filled ? "✓" : i + 1}
                  </div>
                );
              })}
            </div>
            <p className="text-xs font-mono text-[var(--tr-text-muted)] mt-3">
              {10 - stamps} botol lagi sampai dapat 1 gratis.
            </p>
          </div>

          {/* Redeem points */}
          <div className="card-stamp p-6">
            <p className="eyebrow mb-2">Tukar poin → diskon</p>
            <p className="font-display font-black text-2xl mb-4">
              1 poin = Rp 1.000 diskon (min. tukar 50 poin).
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                min={50}
                max={Math.max(50, data.pointsBalance)}
                value={redeemPts}
                onChange={(e) => setRedeemPts(parseInt(e.target.value || "0") || 0)}
                className="input w-24 text-center font-mono tabular-nums"
              />
              <span className="font-display font-bold text-xl tabular-nums">
                = {fmtRp(redeemPts * 1000)}
              </span>
              <button
                onClick={redeem}
                disabled={redeeming || redeemPts > data.pointsBalance || redeemPts < 50}
                className="btn btn-primary disabled:opacity-50"
              >
                {redeeming ? "Memproses…" : "Tukar sekarang"}
              </button>
            </div>
            {redeemMsg && (
              <p className="mt-3 font-hand text-xl text-[var(--tr-brick-deep)]">
                {redeemMsg}
              </p>
            )}
          </div>

          {/* Achievements */}
          <div className="card-stamp p-6">
            <p className="eyebrow mb-2">Achievement</p>
            <p className="font-display font-black text-2xl mb-4">
              Lencana yang sudah kamu kumpulkan
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ACHIEVEMENTS.map((a) => {
                const got = a.check(data);
                return (
                  <div
                    key={a.id}
                    className={
                      "rounded-sm border-2 p-4 text-center transition " +
                      (got
                        ? "border-[var(--tr-ink)] bg-[var(--tr-mustard-soft)]/40 shadow-stamp-sm"
                        : "border-[var(--tr-ink)]/20 bg-[var(--tr-paper-2)] opacity-50")
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
          <div className="card-stamp p-6 text-center">
            <p className="eyebrow mb-2">Spin keberuntungan</p>
            <p className="font-display font-black text-2xl mb-4">
              Sekali spin per hari, gratis.
            </p>
            <div className="flex flex-col items-center gap-4">
              <div
                className={
                  "w-32 h-32 rounded-sm border-2 border-[var(--tr-ink)] shadow-stamp bg-[var(--tr-mustard-soft)]/40 relative grid place-items-center " +
                  (spinning ? "animate-spin" : "")
                }
              >
                <span className="text-4xl">🎡</span>
              </div>
              <button
                onClick={spin}
                disabled={spinning}
                className="btn btn-primary disabled:opacity-50"
              >
                {spinning ? "Berputar…" : "Putar roda"}
              </button>
              {spinResult && (
                <div className="text-center">
                  <p className="font-display font-bold text-xl">{spinResult.label}</p>
                  {spinResult.code && (
                    <p className="font-mono text-sm mt-1">
                      kode:{" "}
                      <span className="stamp">{spinResult.code}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Activities */}
          <div className="card-stamp p-6">
            <p className="eyebrow mb-2">Riwayat poin</p>
            {data.activities.length === 0 ? (
              <p className="text-[var(--tr-text-muted)]">Belum ada aktivitas.</p>
            ) : (
              <ul className="divide-y-2 divide-[var(--tr-ink)]/15">
                {data.activities.slice(0, 12).map((a) => (
                  <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--tr-text-muted)]">
                        {new Date(a.ts).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      <p className="text-sm mt-0.5">{a.note}</p>
                    </div>
                    <span
                      className={
                        "font-mono font-bold text-sm tabular-nums " +
                        (a.points > 0 ? "text-[var(--tr-leaf)]" : "text-[var(--tr-brick)]")
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
