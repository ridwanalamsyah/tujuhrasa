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
      <div className="rounded-2xl bg-cream border border-ink/20 p-4 text-sm">
        <p className="font-serif italic text-lg">Sampai jumpa di kafe ya, {name}!</p>
        <p className="opacity-70 mt-1">
          Konfirmasi akan kami kirim via WhatsApp ke {wa}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        required
        placeholder="nama"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-full border border-ink px-3 py-2 bg-cream text-sm"
      />
      <input
        required
        placeholder="nomor WA"
        value={wa}
        onChange={(e) => setWa(e.target.value)}
        className="w-full rounded-full border border-ink px-3 py-2 bg-cream text-sm"
      />
      <div className="flex gap-2">
        <input
          required
          placeholder="kota"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex-1 rounded-full border border-ink px-3 py-2 bg-cream text-sm"
        />
        <input
          type="number"
          min={1}
          max={10}
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value || "1") || 1)}
          className="w-16 rounded-full border border-ink px-3 py-2 bg-cream text-sm text-center"
          aria-label="jumlah orang"
        />
      </div>
      <input
        type="email"
        placeholder="email (opsional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-full border border-ink px-3 py-2 bg-cream text-sm"
      />
      <textarea
        placeholder="catatan (opsional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-full rounded-2xl border border-ink px-3 py-2 bg-cream text-sm"
      />
      <button
        type="submit"
        disabled={submitting}
        className="w-full btn-primary disabled:opacity-50"
      >
        {submitting ? "memproses..." : "kirim rsvp"}
      </button>
      {err && <p className="text-xs font-mono text-orange">{err}</p>}
    </form>
  );
}
