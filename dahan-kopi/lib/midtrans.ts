/**
 * Pembayaran online lewat Midtrans Snap (QRIS, e-wallet, virtual account, kartu).
 * Butuh environment variable di Vercel:
 *   MIDTRANS_SERVER_KEY   = Server Key dari dashboard Midtrans
 *   MIDTRANS_PRODUCTION   = "true" untuk transaksi sungguhan (kosong = sandbox / uji coba)
 */
export const midtransConfig = {
  serverKey: process.env.MIDTRANS_SERVER_KEY ?? "",
  production: process.env.MIDTRANS_PRODUCTION === "true",
};

export const midtransEnabled = () => midtransConfig.serverKey.length > 0;

export function snapEndpoint() {
  return midtransConfig.production
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

export function authHeader() {
  return `Basic ${Buffer.from(`${midtransConfig.serverKey}:`).toString("base64")}`;
}
