"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CartLines } from "@/components/shop/CartLines";
import { shop } from "@/data/products";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { priceOrder } from "@/lib/order";

const fields = [
  { name: "name", label: "Nama lengkap", autoComplete: "name", required: true },
  { name: "phone", label: "Nomor HP / WhatsApp", autoComplete: "tel", type: "tel", required: true },
  {
    name: "email",
    label: "Email (opsional)",
    autoComplete: "email",
    type: "email",
    required: false,
  },
  {
    name: "address",
    label: "Alamat lengkap",
    autoComplete: "street-address",
    required: true,
    textarea: true,
  },
  { name: "city", label: "Kota / kabupaten", autoComplete: "address-level2", required: true },
  {
    name: "postalCode",
    label: "Kode pos",
    autoComplete: "postal-code",
    inputMode: "numeric",
    required: true,
  },
  { name: "note", label: "Catatan (opsional)", required: false, textarea: true },
] as const;

export function CheckoutForm() {
  const lines = useCart();
  const order = priceOrder(lines);
  const [state, setState] = useState<{
    status: "idle" | "sending" | "error";
    message?: string;
    whatsapp?: string;
  }>({
    status: "idle",
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "sending" });
    const customer = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, customer }),
      });
      const data = (await res.json()) as {
        redirectUrl?: string;
        error?: string;
        whatsapp?: string;
      };
      if (data.redirectUrl) {
        window.location.assign(data.redirectUrl);
        return;
      }
      setState({
        status: "error",
        message: data.error ?? "Terjadi kesalahan.",
        whatsapp: data.whatsapp,
      });
    } catch {
      setState({ status: "error", message: "Koneksi bermasalah. Coba lagi." });
    }
  }

  if (order.items.length === 0) {
    return (
      <div className="py-10">
        <p className="text-muted">Keranjang masih kosong.</p>
        <Link href="/shop" className="label mt-4 inline-block underline underline-offset-4">
          Lihat produk
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-10">
      <form onSubmit={submit} className="space-y-5 lg:col-span-7">
        <h2 className="label">Alamat pengiriman</h2>
        {fields.map((f) => (
          <label key={f.name} className="block">
            <span className="text-small">{f.label}</span>
            {"textarea" in f && f.textarea ? (
              <textarea
                name={f.name}
                required={f.required}
                autoComplete={"autoComplete" in f ? f.autoComplete : undefined}
                rows={3}
                className="mt-1 block w-full border border-line bg-white/60 px-3 py-2"
              />
            ) : (
              <input
                name={f.name}
                required={f.required}
                type={"type" in f ? f.type : "text"}
                inputMode={"inputMode" in f ? f.inputMode : undefined}
                autoComplete={"autoComplete" in f ? f.autoComplete : undefined}
                className="mt-1 block min-h-11 w-full border border-line bg-white/60 px-3"
              />
            )}
          </label>
        ))}

        {state.status === "error" && (
          <div role="alert" className="border border-coffee/40 p-4 text-small">
            <p>{state.message}</p>
            {state.whatsapp && (
              <a
                href={state.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 items-center bg-leaf px-5 font-semibold text-white"
              >
                Kirim pesanan lewat WhatsApp
              </a>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={state.status === "sending"}
          className="h-12 w-full bg-espresso text-[0.9375rem] font-semibold text-cream hover:bg-coffee disabled:opacity-60"
        >
          {state.status === "sending" ? "Memproses…" : `Bayar ${formatPrice(order.total)}`}
        </button>
        <p className="text-small text-muted">
          Pembayaran lewat Midtrans: QRIS, GoPay, ShopeePay, transfer bank (virtual account), atau
          kartu.
        </p>
      </form>

      <aside className="mt-12 lg:col-span-5 lg:mt-0">
        <h2 className="label">Pesanan</h2>
        <CartLines items={order.items} />
        <dl className="space-y-2 border-t border-line pt-4">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Ongkos kirim</dt>
            <dd className="tabular-nums">
              {order.shipping === 0 ? "Gratis" : formatPrice(order.shipping)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(order.total)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-small text-muted">{shop.shipping.note}</p>
      </aside>
    </div>
  );
}
