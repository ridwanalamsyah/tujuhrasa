"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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

export function CheckoutForm({ subtotalIdr }: { subtotalIdr: number }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);
  const [promo, setPromo] = useState<PromoCheck>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("tr_profile");
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

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const obj = Object.fromEntries(fd.entries());
    const payload = {
      ...obj,
      promoCode: promo && promo.ok ? promo.code : undefined,
    };
    // simpan profil supaya next checkout otomatis terisi
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
      localStorage.setItem("tr_profile", JSON.stringify(profile));
      if (profile.customerEmail) {
        localStorage.setItem("tr_loyalty_email", profile.customerEmail);
      }
    }
    start(async () => {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error?.formErrors?.[0] || data?.error || "Gagal checkout. Coba lagi.");
        return;
      }
      router.push(`/order/${data.order.orderNumber}`);
    });
  };

  return (
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
      <Field name="shippingAddress" label="alamat lengkap" placeholder="Jl. Tetangga No. 7, RT 03 RW 02" required />
      <div className="grid sm:grid-cols-[1fr_180px] gap-4">
        <Field name="shippingCity" label="kota" placeholder="Jakarta Selatan" required />
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
            placeholder="TETANGGA / GRATISONGKIR / TUJUHRIBU"
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
          <p className="mt-2 text-sm font-mono text-[var(--tr-leaf)]">
            ✓ {promo.code} dipakai · potongan Rp {promo.discount.toLocaleString("id-ID")}
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

      {err && (
        <p className="text-[var(--tr-brick)] text-sm font-mono border-2 border-[var(--tr-brick)] rounded-sm px-3 py-2 bg-[var(--tr-brick)]/10">
          {err}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Memproses…" : "Konfirmasi & bayar →"}
      </button>
      <p className="text-xs text-[var(--tr-text-muted)] text-center">
        Demo: pembayaran disimulasikan, tidak ada transaksi nyata.
      </p>
    </form>
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
