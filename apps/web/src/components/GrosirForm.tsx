"use client";

import { useState } from "react";

export function GrosirForm({
  type,
}: {
  type: "grosir" | "group-buy" | "pre-order";
}) {
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [city, setCity] = useState("Bandung");
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
      <div className="rounded-sm border-2 border-[var(--tr-ink)] shadow-stamp-sm bg-[var(--tr-mustard-soft)]/35 p-5">
        <p className="font-display font-black text-xl">Sip, sudah masuk!</p>
        <p className="font-hand text-lg text-[var(--tr-brick-deep)] mt-1">
          tim kami akan menghubungi {wa} dalam 24 jam untuk konfirmasi & invoice —
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
      <input
        required
        placeholder="Nama / nama acara"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input text-sm"
      />
      <input
        required
        placeholder="WhatsApp"
        value={wa}
        onChange={(e) => setWa(e.target.value)}
        className="input text-sm"
      />
      <input
        required
        placeholder="Kota"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="input text-sm"
      />
      <input
        type="email"
        placeholder="Email (opsional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input text-sm"
      />
      <input
        type="number"
        min={type === "pre-order" ? 1 : 12}
        max={1000}
        value={qty}
        onChange={(e) => setQty(parseInt(e.target.value || "0") || 0)}
        className="input text-sm tabular-nums"
        aria-label="jumlah botol"
      />
      <select
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="input text-sm"
      >
        <option value="">Tipe acara / tujuan (opsional)</option>
        <option value="kantor">Kantor / corporate</option>
        <option value="wedding">Pernikahan</option>
        <option value="komunitas">Komunitas / RT</option>
        <option value="sekolah">Sekolah / kelas</option>
        <option value="lainnya">Lainnya</option>
      </select>
      <textarea
        placeholder="Catatan tambahan (varian, tanggal antar, dll)"
        value={notes.startsWith("note:") ? notes.slice(5) : ""}
        onChange={(e) => setNotes("note:" + e.target.value)}
        rows={2}
        className="input sm:col-span-2 text-sm"
      />
      <button
        type="submit"
        disabled={busy}
        className="btn btn-primary sm:col-span-2 disabled:opacity-50 justify-center"
      >
        {busy ? "Memproses…" : `Kirim ${type === "pre-order" ? "pre-order" : type === "group-buy" ? "pendaftaran" : "permintaan grosir"}`}
      </button>
      {err && (
        <p className="sm:col-span-2 text-xs text-[var(--tr-brick)] font-mono">
          {err}
        </p>
      )}
    </form>
  );
}
