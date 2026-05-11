"use client";

import { useState } from "react";

export function GrosirForm({
  type,
}: {
  type: "grosir" | "group-buy" | "pre-order";
}) {
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [city, setCity] = useState("Jakarta");
  const [email, setEmail] = useState("");
  const [qty, setQty] = useState(24);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/grosir", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          wa,
          city,
          email: email || undefined,
          qty,
          notes,
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        setErr(j.error ?? "Gagal kirim.");
      } else {
        setDone(true);
      }
    } catch {
      setErr("Tidak ada koneksi.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-cream border border-leaf/40 p-4">
        <p className="font-serif italic text-xl">Sip, sudah masuk!</p>
        <p className="opacity-70 text-sm mt-1">
          Tim kami akan menghubungi {wa} dalam 24 jam untuk konfirmasi & invoice.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
      <input
        required
        placeholder="nama / nama acara"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-full border border-ink px-4 py-2 bg-cream text-sm"
      />
      <input
        required
        placeholder="WhatsApp"
        value={wa}
        onChange={(e) => setWa(e.target.value)}
        className="rounded-full border border-ink px-4 py-2 bg-cream text-sm"
      />
      <input
        required
        placeholder="kota"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="rounded-full border border-ink px-4 py-2 bg-cream text-sm"
      />
      <input
        type="email"
        placeholder="email (opsional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-full border border-ink px-4 py-2 bg-cream text-sm"
      />
      <input
        type="number"
        min={type === "pre-order" ? 1 : 12}
        max={1000}
        value={qty}
        onChange={(e) => setQty(parseInt(e.target.value || "0") || 0)}
        className="rounded-full border border-ink px-4 py-2 bg-cream text-sm"
        aria-label="jumlah botol"
      />
      <select
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="rounded-full border border-ink px-4 py-2 bg-cream text-sm"
      >
        <option value="">tipe acara / tujuan (opsional)</option>
        <option value="kantor">kantor / corporate</option>
        <option value="wedding">pernikahan</option>
        <option value="komunitas">komunitas / RT</option>
        <option value="sekolah">sekolah / kelas</option>
        <option value="lainnya">lainnya</option>
      </select>
      <textarea
        placeholder="catatan tambahan (varian, tanggal antar, dll)"
        value={notes.startsWith("note:") ? notes.slice(5) : ""}
        onChange={(e) => setNotes("note:" + e.target.value)}
        rows={2}
        className="sm:col-span-2 rounded-2xl border border-ink px-4 py-3 bg-cream text-sm"
      />
      <button
        type="submit"
        disabled={busy}
        className="sm:col-span-2 btn-primary disabled:opacity-50 justify-center"
      >
        {busy ? "memproses..." : `kirim ${type === "pre-order" ? "pre-order" : type === "group-buy" ? "pendaftaran" : "permintaan grosir"}`}
      </button>
      {err && <p className="sm:col-span-2 text-xs text-orange font-mono">{err}</p>}
    </form>
  );
}
