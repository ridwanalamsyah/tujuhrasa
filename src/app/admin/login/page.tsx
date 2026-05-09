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
    <div className="container-tr pt-32 pb-20">
      <div className="max-w-md mx-auto rounded-3xl border border-ink/20 p-10 bg-paper card-shadow">
        <p className="eyebrow mb-3">/ admin</p>
        <h1 className="h-display text-4xl mb-2">Pintu samping.</h1>
        <p className="opacity-70 text-sm mb-6">
          Masukkan password untuk membuka dapur belakang. Hanya kamu yang punya
          kunci ini.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="font-mono text-xs opacity-60 lowercase">password</span>
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="input mt-1"
              placeholder="••••••••"
              required
            />
          </label>
          {err && (
            <p className="text-sm text-orange font-mono">{err}</p>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "memverifikasi…" : "masuk"}
          </button>
        </form>
        <p className="mt-6 text-xs opacity-50 leading-relaxed">
          Tip: ganti password lewat env <code className="font-mono">ADMIN_PASSWORD</code>{" "}
          di file <code className="font-mono">.env</code>.
        </p>
      </div>
    </div>
  );
}
