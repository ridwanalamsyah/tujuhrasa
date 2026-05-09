"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      // simulasi: simpan ke localStorage; produksi: POST ke /api/newsletter
      if (typeof window !== "undefined") {
        localStorage.setItem("tr_newsletter", email);
      }
      await new Promise((r) => setTimeout(r, 400));
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <p className="font-serif italic text-xl">
        Sip, kami simpan {email}. Cek inbox Jumat sore ya.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2 max-w-lg">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email kamu"
        className="flex-1 rounded-full border border-ink px-4 py-2 bg-cream"
      />
      <button
        type="submit"
        disabled={busy}
        className="btn-primary disabled:opacity-50"
      >
        {busy ? "..." : "daftar gratis"}
      </button>
    </form>
  );
}
