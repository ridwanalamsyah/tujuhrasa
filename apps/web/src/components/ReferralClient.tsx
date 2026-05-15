"use client";

import { useEffect, useMemo, useState } from "react";

function generateCode(seed: string) {
  // simple deterministic short code from email
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return "TUJU-" + h.toString(36).toUpperCase().slice(0, 5);
}

export function ReferralClient() {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const e = localStorage.getItem("tr_loyalty_email") ?? "";
    if (e) setEmail(e);
  }, []);

  const code = useMemo(
    () => (email ? generateCode(email.toLowerCase()) : ""),
    [email]
  );
  const link = useMemo(() => {
    if (typeof window === "undefined" || !code) return "";
    return `${window.location.origin}/?ref=${code}`;
  }, [code]);

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const shareWa = () => {
    if (!link) return;
    const text = `Cobain kopi botolan Tujuh Rasa. Pakai kode ${code} biar kita berdua dapat Rp 10rb diskon: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="card-stamp p-6 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
      <div className="space-y-3">
        <label className="block">
          <span className="eyebrow block mb-1">
            Email kamu (untuk identitas referral)
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@kamu.com"
            className="input w-full"
          />
        </label>
        {code && (
          <div className="rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper-2)] p-4">
            <p className="eyebrow">Kode referral kamu</p>
            <p className="font-display font-black text-3xl text-[var(--tr-brick)] tracking-wide mt-1">
              {code}
            </p>
            <p className="text-xs text-[var(--tr-text-muted)] font-mono mt-1 break-all">
              {link}
            </p>
            <div className="mt-3 flex gap-2 flex-wrap">
              <button onClick={copy} className="btn btn-primary">
                {copied ? "Tersalin!" : "Salin link"}
              </button>
              <button onClick={shareWa} className="btn btn-secondary">
                Bagi via WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>

      {code && (
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="QR code referral"
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`}
            width={200}
            height={200}
            className="rounded-sm border-2 border-[var(--tr-ink)] bg-white p-2"
          />
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--tr-text-muted)] mt-2">
            Scan untuk pakai
          </p>
        </div>
      )}
    </div>
  );
}
