"use client";

import { useState } from "react";

export function RsvpForm({
  eventSlug,
  eventTitle,
}: {
  eventSlug: string;
  eventTitle: string;
}) {
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [city, setCity] = useState("Jakarta");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErr("");
    try {
      const r = await fetch("/api/event/rsvp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          wa,
          city,
          email: email || undefined,
          guests,
          eventSlug,
          notes: notes || `RSVP untuk ${eventTitle}`,
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        setErr(j.error ?? "Gagal kirim RSVP.");
      } else {
        setDone(true);
      }
    } catch {
      setErr("Tidak ada koneksi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-sm border-2 border-[var(--tr-ink)] shadow-stamp-sm bg-[var(--tr-mustard-soft)]/35 p-4 text-sm">
        <p className="font-display font-black text-lg">
          Sampai jumpa di kafe ya, {name}!
        </p>
        <p className="font-hand text-lg text-[var(--tr-brick-deep)] mt-1">
          konfirmasi akan kami kirim via WhatsApp ke {wa} —
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        required
        placeholder="Nama"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input w-full text-sm"
      />
      <input
        required
        placeholder="Nomor WA"
        value={wa}
        onChange={(e) => setWa(e.target.value)}
        className="input w-full text-sm"
      />
      <div className="flex gap-2">
        <input
          required
          placeholder="Kota"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="input flex-1 text-sm"
        />
        <input
          type="number"
          min={1}
          max={10}
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value || "1") || 1)}
          className="input w-16 text-sm text-center tabular-nums"
          aria-label="jumlah orang"
        />
      </div>
      <input
        type="email"
        placeholder="Email (opsional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input w-full text-sm"
      />
      <textarea
        placeholder="Catatan (opsional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="input w-full text-sm"
      />
      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary w-full disabled:opacity-50"
      >
        {submitting ? "Memproses…" : "Kirim RSVP"}
      </button>
      {err && (
        <p className="text-xs font-mono text-[var(--tr-brick)]">{err}</p>
      )}
    </form>
  );
}
