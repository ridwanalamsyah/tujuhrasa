import { createHash } from "node:crypto";
import { midtransConfig } from "@/lib/midtrans";

/**
 * Notifikasi pembayaran dari Midtrans (atur URL ini di dashboard Midtrans:
 * Settings → Payment → Notification URL → https://domain-anda/api/midtrans).
 * Tanda tangan diverifikasi agar notifikasi palsu ditolak. Daftar pesanan dan
 * statusnya bisa dilihat di dashboard Midtrans.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, string> | null;
  if (!body || !midtransConfig.serverKey) return new Response("ignored", { status: 200 });

  const expected = createHash("sha512")
    .update(`${body.order_id}${body.status_code}${body.gross_amount}${midtransConfig.serverKey}`)
    .digest("hex");
  if (expected !== body.signature_key) return new Response("invalid signature", { status: 403 });

  console.info(
    "Pembayaran",
    body.order_id,
    body.transaction_status,
    body.payment_type,
    body.gross_amount,
  );
  return new Response("ok", { status: 200 });
}
