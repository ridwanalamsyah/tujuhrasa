"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, UserPlus, Zap } from "lucide-react";

const payments = [
  { v: "gopay", l: "GoPay" },
  { v: "ovo", l: "OVO" },
  { v: "bca-va", l: "BCA Virtual Account" },
  { v: "cod", l: "Bayar di tempat (COD)" },
];

type SavedProfile = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingZip?: string;
  birthDate?: string;
};

type PromoCheck =
  | { ok: true; code: string; discount: number; source: string }
  | { ok: false; reason: string }
  | null;

type CheckoutError =
  | { kind: "validation"; message: string; fields?: string[] }
  | { kind: "stock"; message: string; insufficient: { name: string; want: number; have: number }[] }
  | { kind: "payment"; message: string; retryable: boolean }
  | { kind: "network"; message: string }
  | null;

type Mode = "account" | "guest";

export function CheckoutForm({ subtotalIdr }: { subtotalIdr: number }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<CheckoutError>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);
  const [promo, setPromo] = useState<PromoCheck>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  const [attempt, setAttempt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // pre-select mode if account cookie/profile exists
    const hasMember = document.cookie.includes("tr_member=");
    const raw = localStorage.getItem("tr_profile");
    if (hasMember || raw) {
      setMode("account");
    }
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as SavedProfile;
      const f = formRef.current;
      if (!f) return;
      for (const [k, v] of Object.entries(saved)) {
        if (typeof v !== "string") continue;
        const el = f.elements.namedItem(k) as HTMLInputElement | null;
        if (el && !el.value) el.value = v;
      }
      setHasSaved(true);
    } catch {
      // ignore
    }
  }, []);

  const clearSaved = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("tr_profile");
    const f = formRef.current;
    if (f) {
      ["customerName", "customerEmail", "customerPhone", "shippingAddress", "shippingCity", "shippingZip", "birthDate"].forEach((k) => {
        const el = f.elements.namedItem(k) as HTMLInputElement | null;
        if (el) el.value = "";
      });
    }
    setHasSaved(false);
  };

  const checkPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoChecking(true);
    setPromo(null);
    try {
      const res = await fetch("/api/erp/promo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), subtotal: subtotalIdr }),
      });
      const data = await res.json();
      if (data.ok) {
        setPromo({ ok: true, code: data.code, discount: data.discount, source: data.source });
      } else {
        setPromo({ ok: false, reason: data.reason ?? "Promo tidak valid." });
      }
    } catch {
      setPromo({ ok: false, reason: "Koneksi error." });
    } finally {
      setPromoChecking(false);
    }
  };

  const doSubmit = async (formEl: HTMLFormElement) => {
    setErr(null);
    setAttempt((n) => n + 1);
    const fd = new FormData(formEl);
    const obj = Object.fromEntries(fd.entries());
    const payload = {
      ...obj,
      promoCode: promo && promo.ok ? promo.code : undefined,
      accountMode: mode === "account" ? "member" : "guest",
    };
    if (typeof window !== "undefined") {
      const profile: SavedProfile = {
        customerName: String(obj.customerName ?? ""),
        customerEmail: String(obj.customerEmail ?? ""),
        customerPhone: String(obj.customerPhone ?? ""),
        shippingAddress: String(obj.shippingAddress ?? ""),
        shippingCity: String(obj.shippingCity ?? ""),
        shippingZip: String(obj.shippingZip ?? ""),
        birthDate: String(obj.birthDate ?? ""),
      };
      // Always save profile so user doesn't have to retype on retry.
      localStorage.setItem("tr_profile", JSON.stringify(profile));
      if (profile.customerEmail) {
        localStorage.setItem("tr_loyalty_email", profile.customerEmail);
      }
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data: Record<string, unknown> = {};
      try {
        data = await res.json();
      } catch {
        // body not JSON
      }
      if (res.ok && (data as { order?: { orderNumber: string } }).order) {
        router.push(`/order/${(data as { order: { orderNumber: string } }).order.orderNumber}`);
        return;
      }
      if (res.status === 409 && data.error === "stok_kurang") {
        setErr({
          kind: "stock",
          message:
            (data.message as string) ??
            "Stok berkurang sejak kamu tambah ke keranjang.",
          insufficient: (data.insufficient as { name: string; want: number; have: number }[]) ?? [],
        });
        return;
      }
      if (res.status === 400) {
        const flat = data.error as
          | { formErrors?: string[]; fieldErrors?: Record<string, string[]> }
          | undefined;
        const fieldErrs = flat?.fieldErrors
          ? Object.keys(flat.fieldErrors).filter((k) => (flat.fieldErrors as Record<string, string[]>)[k]?.length)
          : [];
        setErr({
          kind: "validation",
          message:
            flat?.formErrors?.[0] ??
            (fieldErrs.length > 0
              ? `Lengkapi: ${fieldErrs.join(", ")}`
              : "Form belum lengkap atau format salah."),
          fields: fieldErrs,
        });
        return;
      }
      setErr({
        kind: "payment",
        message:
          (data.message as string) ??
          (typeof data.error === "string" ? (data.error as string) : null) ??
          "Pembayaran tidak terkonfirmasi. Coba metode lain atau ulangi.",
        retryable: true,
      });
    } catch {
      setErr({
        kind: "network",
        message:
          "Sambungan ke server putus. Cek koneksi internet dan coba lagi — pesananmu belum dibuat.",
      });
    }
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    start(() => doSubmit(formEl));
  };

  const retry = () => {
    const f = formRef.current;
    if (!f) return;
    start(() => doSubmit(f));
  };

  if (mode === null) {
    return <ModePicker onPick={setMode} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] px-4 py-3 shadow-stamp-sm">
        <div className="flex items-center gap-3">
          <span
            className={
              "grid place-items-center w-9 h-9 rounded-sm border-2 border-[var(--tr-ink)] " +
              (mode === "account"
                ? "bg-[var(--tr-brick)] text-[var(--tr-paper)]"
                : "bg-[var(--tr-matcha)] text-[var(--tr-ink)]")
            }
            aria-hidden
          >
            {mode === "account" ? (
              <UserPlus className="h-4 w-4" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
          </span>
          <div>
            <p className="font-display font-bold leading-tight">
              {mode === "account"
                ? "Buat akun → dapet poin"
                : "Bayar tanpa akun"}
            </p>
            <p className="text-xs text-[var(--tr-text-muted)]">
              {mode === "account"
                ? "Poin loyalti aktif, alamat & profil tersimpan."
                : "Tanpa daftar — langsung bayar, otomatis masuk sistem."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMode(null)}
          className="font-mono text-[11px] uppercase tracking-widest underline opacity-70 hover:opacity-100"
        >
          ganti
        </button>
      </div>

      <form ref={formRef} onSubmit={submit} className="space-y-5">
      {hasSaved && (
        <div className="rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-mustard-soft)]/30 px-4 py-3 flex items-center justify-between gap-3 text-sm shadow-stamp-sm">
          <span className="font-display">
            <span className="font-bold">Tersimpan.</span> Data alamat &amp; email otomatis terisi.
          </span>
          <button
            type="button"
            onClick={clearSaved}
            className="font-mono text-[11px] uppercase tracking-widest underline opacity-70 hover:opacity-100"
          >
            ganti
          </button>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field name="customerName" label="nama" placeholder="Alya Az." required />
        <Field name="customerPhone" label="no. telepon" placeholder="0812 3456 7890" required />
      </div>
      <Field name="customerEmail" type="email" label="email" placeholder="kamu@email.com" required />
      <Field name="shippingAddress" label="alamat lengkap" placeholder="Jl. A.H. Nasution No. 105, Cibiru" required />
      <div className="grid sm:grid-cols-[1fr_180px] gap-4">
        <Field name="shippingCity" label="kota" placeholder="Bandung" required />
        <Field name="shippingZip" label="kode pos" placeholder="12150" required />
      </div>
      <Field name="birthDate" type="date" label="tanggal lahir (opsional, dapat hadiah ulang tahun)" />
      <Field name="notes" label="catatan kurir (opsional)" placeholder="rumah cat hijau, di sebelah warung" />

      <div>
        <p className="eyebrow mb-2">Kode promo (opsional)</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value.toUpperCase());
              setPromo(null);
            }}
            placeholder="HALAL10 / GRATISONGKIR / TUJUHRIBU"
            className="flex-1 rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] px-4 py-3 font-mono text-sm uppercase tracking-wide focus:outline-none focus:shadow-stamp-sm focus:-translate-x-[1px] focus:-translate-y-[1px] transition"
          />
          <button
            type="button"
            onClick={checkPromo}
            disabled={!promoCode.trim() || promoChecking}
            className="rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] px-4 py-3 font-mono text-[11px] uppercase tracking-widest hover:bg-[var(--tr-ink)] hover:text-[var(--tr-paper)] hover:shadow-stamp-sm hover:-translate-x-[1px] hover:-translate-y-[1px] transition disabled:opacity-50"
          >
            {promoChecking ? "cek…" : "Pakai"}
          </button>
        </div>
        {promo && promo.ok && (
          <p className="mt-2 text-sm font-mono text-[var(--tr-leaf)] inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {promo.code} dipakai · potongan Rp {promo.discount.toLocaleString("id-ID")}
            {promo.source === "erp" && " (dari ERP)"}
          </p>
        )}
        {promo && !promo.ok && (
          <p className="mt-2 text-sm font-mono text-[var(--tr-brick)]">× {promo.reason}</p>
        )}
      </div>

      <div>
        <p className="eyebrow mb-3">Metode pembayaran</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {payments.map((p, i) => (
            <label
              key={p.v}
              className="cursor-pointer rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] px-4 py-3 has-[:checked]:bg-[var(--tr-ink)] has-[:checked]:text-[var(--tr-paper)] has-[:checked]:shadow-stamp-sm transition flex items-center gap-3 font-display font-semibold text-[14px]"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={p.v}
                defaultChecked={i === 0}
                className="accent-[var(--tr-brick)]"
              />
              <span>{p.l}</span>
            </label>
          ))}
        </div>
      </div>

      {err && <ErrorPanel err={err} onRetry={retry} attempt={attempt} />}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending
          ? "Memproses…"
          : err
            ? "Coba bayar lagi →"
            : mode === "account"
              ? "Simpan akun & bayar →"
              : "Konfirmasi & bayar →"}
      </button>
      <p className="text-xs text-[var(--tr-text-muted)] text-center">
        Demo: pembayaran disimulasikan, tidak ada transaksi nyata. Order tetap
        masuk ke ERP {mode === "account" ? "sebagai member" : "sebagai guest"}.
      </p>
      </form>
    </div>
  );
}

function ModePicker({ onPick }: { onPick: (m: Mode) => void }) {
  return (
    <div className="space-y-4">
      <p className="eyebrow">Cara checkout</p>
      <p className="text-[var(--tr-text-soft)] max-w-prose">
        Dua jalur, satu sistem. Apa pun pilihanmu, pesananmu otomatis
        tercatat di Tujuh Rasa dan dikirim via GoSend / GrabExpress sekitar
        Bandung.
      </p>
      <p className="font-hand text-2xl text-[var(--tr-brick-deep)] -rotate-[1deg]">
        santai aja, bisa upgrade nanti —
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onPick("account")}
          className="text-left card-stamp p-6 bg-[var(--tr-paper)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[8px_10px_0_var(--tr-ink)] transition"
        >
          <span className="inline-grid place-items-center w-10 h-10 rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-brick)] text-[var(--tr-paper)] mb-4">
            <UserPlus className="h-5 w-5" />
          </span>
          <p className="font-display font-black text-2xl leading-tight">
            Buat akun → dapet poin.
          </p>
          <p className="font-hand text-2xl text-[var(--tr-brick-deep)] mt-1">
            7 poin / botol, alamat tersimpan —
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--tr-text-soft)] leading-relaxed">
            <li>· Riwayat order &amp; resi tersimpan</li>
            <li>· Poin loyalti aktif (7 poin / botol)</li>
            <li>· Alamat &amp; profil otomatis terisi</li>
            <li>· Diskon ulang tahun &amp; promo member</li>
          </ul>
        </button>
        <button
          type="button"
          onClick={() => onPick("guest")}
          className="text-left card-stamp p-6 bg-[var(--tr-matcha-soft)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[8px_10px_0_var(--tr-ink)] transition"
        >
          <span className="inline-grid place-items-center w-10 h-10 rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-cocoa)] text-[var(--tr-paper)] mb-4">
            <Zap className="h-5 w-5" />
          </span>
          <p className="font-display font-black text-2xl leading-tight">
            Bayar tanpa akun.
          </p>
          <p className="font-hand text-2xl text-[var(--tr-cocoa)] mt-1">
            langsung bayar, no signup —
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--tr-text-soft)] leading-relaxed">
            <li>· Tanpa daftar, isi alamat &amp; bayar</li>
            <li>· Order tetap masuk ke ERP otomatis</li>
            <li>· Bisa upgrade ke akun kapan saja</li>
            <li>· Tanpa poin loyalti</li>
          </ul>
        </button>
      </div>
    </div>
  );
}

function ErrorPanel({
  err,
  onRetry,
  attempt,
}: {
  err: NonNullable<CheckoutError>;
  onRetry: () => void;
  attempt: number;
}) {
  if (err.kind === "stock") {
    return (
      <div className="rounded-sm border-2 border-[var(--tr-brick)] bg-[var(--tr-brick)]/8 p-4 space-y-3">
        <p className="font-display font-bold flex items-center gap-2 text-[var(--tr-brick)]">
          <AlertTriangle className="h-4 w-4" />
          Stok berubah saat kamu checkout
        </p>
        <p className="text-sm text-[var(--tr-text-soft)]">{err.message}</p>
        <ul className="text-sm font-mono space-y-1">
          {err.insufficient.map((it) => (
            <li key={it.name}>
              · {it.name} — kamu pesan {it.want}, stok tinggal{" "}
              <span className="font-bold">{it.have}</span>
            </li>
          ))}
        </ul>
        <a
          href="/cart"
          className="inline-block mt-1 font-mono text-[11px] uppercase tracking-widest underline"
        >
          ← Sesuaikan keranjang
        </a>
      </div>
    );
  }
  if (err.kind === "validation") {
    return (
      <div className="rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-mustard-soft)]/50 p-4 space-y-2">
        <p className="font-display font-bold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Lengkapi data dulu
        </p>
        <p className="text-sm text-[var(--tr-text-soft)]">{err.message}</p>
      </div>
    );
  }
  if (err.kind === "network") {
    return (
      <div className="rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper-2)] p-4 space-y-3">
        <p className="font-display font-bold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Sambungan putus
        </p>
        <p className="text-sm text-[var(--tr-text-soft)]">{err.message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="font-mono text-[11px] uppercase tracking-widest underline"
        >
          ↻ Coba lagi
        </button>
      </div>
    );
  }
  // payment
  return (
    <div className="rounded-sm border-2 border-[var(--tr-brick)] bg-[var(--tr-brick)]/8 p-4 space-y-3">
      <p className="font-display font-bold flex items-center gap-2 text-[var(--tr-brick)]">
        <AlertTriangle className="h-4 w-4" />
        Pembayaran belum berhasil
      </p>
      <p className="text-sm text-[var(--tr-text-soft)]">{err.message}</p>
      <div className="text-sm text-[var(--tr-text-soft)]">
        Coba salah satu:
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Pilih metode pembayaran lain (GoPay / OVO / VA / COD)</li>
          <li>Pastikan saldo e-wallet atau limit kartu cukup</li>
          <li>Tunggu 30 detik lalu coba lagi</li>
        </ul>
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onRetry}
          className="font-mono text-[11px] uppercase tracking-widest underline"
        >
          ↻ Coba bayar lagi {attempt > 1 && `(${attempt})`}
        </button>
        <a
          href="https://wa.me/628000000000?text=Halo%20Tujuh%20Rasa%2C%20bantu%20cek%20pembayaran%20checkout%20saya"
          target="_blank"
          rel="noopener"
          className="font-mono text-[11px] uppercase tracking-widest underline opacity-80"
        >
          Bantu via WhatsApp →
        </a>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, required }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] px-4 py-3 font-body text-[15px] focus:outline-none focus:shadow-stamp-sm focus:-translate-x-[1px] focus:-translate-y-[1px] transition"
      />
    </label>
  );
}
