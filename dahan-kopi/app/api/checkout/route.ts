import { randomBytes } from "node:crypto";
import { whatsappUrl } from "@/lib/links";
import { authHeader, midtransEnabled, snapEndpoint } from "@/lib/midtrans";
import { formatPrice } from "@/lib/format";
import { priceOrder } from "@/lib/order";
import { siteUrl } from "@/lib/site-url";
import type { CartLine } from "@/lib/types";

type Customer = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  note?: string;
};

const clean = (value: unknown, max = 200) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function parse(body: unknown): { lines: CartLine[]; customer: Customer } | string {
  if (!body || typeof body !== "object") return "Data pesanan tidak valid.";
  const { lines, customer } = body as { lines?: unknown; customer?: Record<string, unknown> };
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 50) return "Keranjang kosong.";
  const c: Customer = {
    name: clean(customer?.name, 80),
    phone: clean(customer?.phone, 20),
    email: clean(customer?.email, 120),
    address: clean(customer?.address, 300),
    city: clean(customer?.city, 80),
    postalCode: clean(customer?.postalCode, 10),
    note: clean(customer?.note, 300),
  };
  if (!c.name || !c.phone || !c.address || !c.city || !c.postalCode)
    return "Lengkapi nama, nomor HP, dan alamat.";
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) return "Format email tidak valid.";
  const safeLines = lines
    .filter((l): l is CartLine => !!l && typeof l === "object")
    .map((l) => ({
      slug: clean(l.slug, 80),
      variantId: clean(l.variantId, 40),
      grind: clean(l.grind, 60) || undefined,
      qty: Number(l.qty) || 1,
    }));
  return { lines: safeLines, customer: c };
}

/** Ringkasan pesanan untuk WhatsApp (dipakai bila pembayaran online belum aktif). */
function whatsappSummary(orderId: string, order: ReturnType<typeof priceOrder>, c: Customer) {
  const lines = order.items.map(
    (i) => `- ${i.qty}× ${i.name} (${i.variantLabel}) ${formatPrice(i.lineTotal)}`,
  );
  return [
    `Halo Dahan Kopi, saya mau pesan (${orderId}):`,
    ...lines,
    `Ongkir: ${formatPrice(order.shipping)}`,
    `Total: ${formatPrice(order.total)}`,
    "",
    `Nama: ${c.name}`,
    `HP: ${c.phone}`,
    `Alamat: ${c.address}, ${c.city} ${c.postalCode}`,
    c.note ? `Catatan: ${c.note}` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");
}

export async function POST(request: Request) {
  const parsed = parse(await request.json().catch(() => null));
  if (typeof parsed === "string") return Response.json({ error: parsed }, { status: 400 });

  const { lines, customer } = parsed;
  const order = priceOrder(lines);
  if (order.items.length === 0)
    return Response.json({ error: "Produk di keranjang tidak ditemukan." }, { status: 400 });

  const orderId = `DHN-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;

  if (!midtransEnabled()) {
    return Response.json(
      {
        error:
          "Pembayaran online belum diaktifkan. Kirim pesanan lewat WhatsApp, kami bantu proses.",
        whatsapp: whatsappUrl(whatsappSummary(orderId, order, customer)),
      },
      { status: 503 },
    );
  }

  const origin = new URL(request.url).origin || siteUrl;
  const items = order.items.map((i) => ({
    id: `${i.slug}-${i.variantId}`.slice(0, 50),
    price: i.unitPrice,
    quantity: i.qty,
    name: `${i.name} ${i.variantLabel}`.slice(0, 50),
  }));
  if (order.shipping > 0)
    items.push({ id: "ongkir", price: order.shipping, quantity: 1, name: "Ongkos kirim" });

  const res = await fetch(snapEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      transaction_details: { order_id: orderId, gross_amount: order.total },
      item_details: items,
      customer_details: {
        first_name: customer.name,
        email: customer.email || undefined,
        phone: customer.phone,
        shipping_address: {
          first_name: customer.name,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          postal_code: customer.postalCode,
          country_code: "IDN",
        },
      },
      custom_field1: customer.note || undefined,
      callbacks: { finish: `${origin}/checkout/selesai` },
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    redirect_url?: string;
    error_messages?: string[];
  };
  if (!res.ok || !data.redirect_url) {
    console.error("Midtrans error", res.status, data.error_messages);
    return Response.json(
      { error: "Gagal membuat pembayaran. Coba lagi sebentar." },
      { status: 502 },
    );
  }
  return Response.json({ orderId, redirectUrl: data.redirect_url });
}
