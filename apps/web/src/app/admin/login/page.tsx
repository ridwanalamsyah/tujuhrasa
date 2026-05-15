"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/admin";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error ?? "Password salah.");
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal masuk.");
      setLoading(false);
    }
  };

  return (
    <div className="container-tr py-16 sm:py-24">
      <div className="max-w-md mx-auto card-stamp p-8 sm:p-10">
        <span className="stamp mb-3 inline-block">Admin</span>
        <h1 className="font-display font-black text-4xl sm:text-5xl leading-[0.98] tracking-[-0.02em] mb-2">
          Pintu samping.
        </h1>
        <p className="font-hand text-xl text-[var(--tr-brick-deep)] mb-6">
          masukkan password untuk membuka dapur belakang —
        </p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="eyebrow block mb-1">Password</span>
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="input w-full"
              placeholder="••••••••"
              required
            />
          </label>
          {err && (
            <p className="text-sm text-[var(--tr-brick)] font-mono">{err}</p>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Memverifikasi…" : "Masuk"}
          </button>
        </form>
        <p className="mt-6 text-xs text-[var(--tr-text-muted)] leading-relaxed">
          Tip: ganti password lewat env{" "}
          <code className="font-mono text-[var(--tr-ink)]">ADMIN_PASSWORD</code>{" "}
          di file <code className="font-mono text-[var(--tr-ink)]">.env</code>.
        </p>
      </div>
    </div>
  );
}
