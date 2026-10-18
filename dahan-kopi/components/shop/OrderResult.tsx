"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { cart } from "@/lib/cart";
import { whatsappUrl } from "@/lib/links";

/** Halaman tujuan setelah pembayaran Midtrans (membawa ?order_id & ?transaction_status). */
export function OrderResult() {
  const params = useSearchParams();
  const orderId = params.get("order_id") ?? "";
  const status = params.get("transaction_status") ?? "";
  const paid = status === "settlement" || status === "capture";
  const pending = status === "pending";

  useEffect(() => {
    if (paid || pending) cart.clear();
  }, [paid, pending]);

  return (
    <div className="max-w-xl">
      <h1 className="display-1">
        {paid ? "Terima kasih" : pending ? "Menunggu pembayaran" : "Pembayaran belum selesai"}
      </h1>
      <p className="body-lg mt-4">
        {paid
          ? "Pembayaran diterima. Pesananmu kami siapkan dan kirim dari Banjaran."
          : pending
            ? "Selesaikan pembayaran sesuai instruksi dari Midtrans. Pesanan diproses setelah pembayaran masuk."
            : "Pembayaran dibatalkan atau gagal. Isi keranjangmu masih tersimpan."}
      </p>
      {orderId && <p className="label mt-4 text-muted">No. pesanan: {orderId}</p>}
      <div className="mt-8 flex flex-wrap gap-6">
        <Link
          href={paid || pending ? "/shop" : "/checkout"}
          className="label underline underline-offset-4"
        >
          {paid || pending ? "Kembali ke shop" : "Coba bayar lagi"}
        </Link>
        <a
          href={whatsappUrl(`Halo Dahan Kopi, saya mau tanya pesanan ${orderId}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="label underline underline-offset-4"
        >
          Tanya lewat WhatsApp
        </a>
      </div>
    </div>
  );
}
