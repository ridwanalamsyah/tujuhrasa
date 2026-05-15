"use client";

import { useEffect, useState } from "react";

type Review = {
  id: string;
  ts: string;
  sku: string;
  pname: string;
  rating: number;
  customer: string;
  comment: string;
};

const Stars = ({ value }: { value: number }) => (
  <span className="font-mono text-[var(--tr-brick)] tracking-wider" aria-label={`${value} dari 5 bintang`}>
    {"★".repeat(value)}
    <span className="opacity-25">{"★".repeat(5 - value)}</span>
  </span>
);

export function Reviews({ sku, pname }: { sku: string; pname: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // form state
  const [rating, setRating] = useState(5);
  const [customer, setCustomer] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const profile = localStorage.getItem("tr_profile");
      if (profile) {
        try {
          const p = JSON.parse(profile);
          if (p.customerName) setCustomer(p.customerName);
          if (p.customerEmail) setEmail(p.customerEmail);
        } catch {}
      }
    }
    fetch(`/api/reviews?sku=${encodeURIComponent(sku)}`)
      .then((r) => r.json())
      .then((j) => setReviews(j.items ?? []))
      .finally(() => setLoading(false));
  }, [sku]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sku, pname, rating, customer, email, comment }),
      });
      const j = await r.json();
      if (!r.ok) {
        setErr(j.error ?? "Gagal kirim review.");
      } else {
        setDone(true);
        const refresh = await fetch(`/api/reviews?sku=${encodeURIComponent(sku)}`);
        const items = (await refresh.json()).items ?? [];
        setReviews(items);
        setComment("");
      }
    } catch {
      setErr("Tidak ada koneksi.");
    } finally {
      setBusy(false);
    }
  };

  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <section className="mt-12 border-t-2 border-[var(--tr-ink)] pt-10">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <div>
          <p className="eyebrow mb-1">Ulasan pelanggan</p>
          <p className="font-display font-black text-2xl sm:text-3xl">
            {reviews.length > 0
              ? `${avg.toFixed(1)} dari 5 · ${reviews.length} ulasan`
              : "Belum ada ulasan untuk botol ini."}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn btn-secondary"
        >
          {showForm ? "Tutup form" : "Tulis ulasan"}
        </button>
      </div>

      {showForm && !done && (
        <form onSubmit={submit} className="card-stamp p-6 mb-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="eyebrow">Rating</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="text-2xl"
                aria-label={`${n} bintang`}
              >
                <span
                  className={
                    n <= rating
                      ? "text-[var(--tr-brick)]"
                      : "text-[var(--tr-ink)]/20"
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              required
              placeholder="Nama"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="input text-sm"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input text-sm"
            />
          </div>
          <textarea
            required
            minLength={5}
            placeholder="Cerita kamu tentang botol ini…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="input w-full text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="btn btn-primary disabled:opacity-50"
          >
            {busy ? "Memproses…" : "Kirim ulasan"}
          </button>
          {err && (
            <p className="text-xs text-[var(--tr-brick)] font-mono">{err}</p>
          )}
        </form>
      )}

      {done && (
        <div className="rounded-sm border-2 border-[var(--tr-ink)] shadow-stamp-sm bg-[var(--tr-mustard-soft)]/35 p-4 mb-6">
          <p className="font-display font-bold text-lg">
            Terima kasih! Ulasanmu sudah masuk.
          </p>
        </div>
      )}

      {loading ? (
        <p className="text-[var(--tr-text-muted)] font-hand text-xl">
          memuat ulasan…
        </p>
      ) : reviews.length === 0 ? (
        <p className="text-[var(--tr-text-muted)] text-sm">
          Jadi yang pertama tulis ulasan ya.
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.slice(0, 8).map((r) => (
            <li key={r.id} className="card-stamp p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <p className="font-display font-bold text-lg">{r.customer}</p>
                  <p className="font-mono text-xs text-[var(--tr-text-muted)]">
                    {new Date(r.ts).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Stars value={r.rating} />
              </div>
              <p className="text-sm leading-relaxed text-[var(--tr-text-soft)]">
                {r.comment}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
