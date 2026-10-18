import { getProduct, shop } from "@/data/products";
import type { CartLine } from "@/lib/types";

export type PricedLine = CartLine & {
  key: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  lineTotal: number;
};

export function lineKey(line: Pick<CartLine, "slug" | "variantId" | "grind">) {
  return [line.slug, line.variantId, line.grind ?? ""].join("|");
}

/**
 * Hitung pesanan dari isi keranjang memakai harga di data/products.ts.
 * Dipakai di browser (tampilan) dan di server (sebelum membuat pembayaran),
 * jadi harga tidak bisa diubah dari sisi pembeli.
 */
export function priceOrder(lines: CartLine[]) {
  const items: PricedLine[] = [];
  for (const line of lines) {
    const product = getProduct(line.slug);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    const qty = Math.max(1, Math.min(99, Math.floor(line.qty)));
    if (!product || !variant) continue;
    const grind =
      product.grinds && line.grind && shop.grindOptions.includes(line.grind)
        ? line.grind
        : undefined;
    items.push({
      slug: product.slug,
      variantId: variant.id,
      grind,
      qty,
      key: lineKey({ slug: product.slug, variantId: variant.id, grind }),
      name: product.name,
      variantLabel: [variant.label, grind].filter(Boolean).join(" · "),
      unitPrice: variant.price,
      lineTotal: variant.price * qty,
    });
  }
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const free = shop.shipping.freeOver > 0 && subtotal >= shop.shipping.freeOver;
  const shipping = items.length === 0 || free ? 0 : shop.shipping.flatRate;
  return { items, subtotal, shipping, total: subtotal + shipping };
}
