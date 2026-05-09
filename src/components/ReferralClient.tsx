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
    <div className="rounded-3xl border border-ink/20 bg-paper p-6 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
      <div className="space-y-3">
        <label className="block">
          <span className="font-mono text-xs lowercase opacity-60">
            email kamu (untuk identitas referral)
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@kamu.com"
            className="mt-1 w-full rounded-full border border-ink px-4 py-2 bg-cream"
          />
        </label>
        {code && (
          <div className="rounded-2xl border border-ink/20 bg-cream p-4">
            <p className="font-mono text-xs opacity-60 lowercase">kode referral kamu</p>
            <p className="font-serif italic text-3xl">{code}</p>
            <p className="text-xs opacity-50 font-mono mt-1 break-all">{link}</p>
            <div className="mt-3 flex gap-2 flex-wrap">
              <button onClick={copy} className="btn-primary">
                {copied ? "tersalin!" : "salin link"}
              </button>
              <button onClick={shareWa} className="btn-secondary">
                bagi via whatsapp
              </button>
            </div>
          </div>
        )}
      </div>

      {code && (
        <div className="text-center">
          <img
            alt="QR code referral"
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`}
            width={200}
            height={200}
            className="rounded-2xl border border-ink/15 bg-white p-2"
          />
          <p className="font-mono text-[10px] opacity-60 mt-2">scan untuk pakai</p>
        </div>
      )}
    </div>
  );
}
