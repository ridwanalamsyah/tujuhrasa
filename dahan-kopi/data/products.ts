/**
 * ============================================================
 *  PRODUK TOKO DAHAN KOPI
 * ============================================================
 *  Liter Series memakai harga asli dari buku menu. Produk lain Dahan dijual di
 *  Tokopedia & Shopee (link di data/site.ts → stores). Tambahkan produk di sini
 *  bila ingin dijual langsung lewat website.
 *
 *  - slug     : dipakai di URL (/shop/house-blend). Huruf kecil, tanpa spasi.
 *  - variants : pilihan ukuran + harga (rupiah, tanpa titik) + berat kirim (gram).
 *  - grinds   : true = pembeli memilih gilingan (biji utuh / espresso / filter).
 *  - details  : baris info singkat (asal, proses, roast, dsb.). Isi hanya yang benar.
 *  - image    : opsional, foto produk di public/images/products/. Jika kosong,
 *               tampil gambar label berwarna (art).
 * ============================================================
 */

import type { Product, ProductCategory } from "@/lib/types";

export const shop = {
  /** Tampilkan catatan "produk masih contoh" di toko. Ubah ke false setelah produk asli diisi. */
  sampleNotice: false,
  title: "Shop",
  intro: "Liter Series dibotolkan segar di kedai. Produk Dahan lainnya ada di Tokopedia dan Shopee.",
  shipping: {
    /** Ongkos kirim flat ke seluruh Indonesia (rupiah). Contoh, sesuaikan. */
    flatRate: 20000,
    /** Gratis ongkir jika subtotal mencapai angka ini (0 = tidak ada). Contoh, sesuaikan. */
    freeOver: 300000,
    note: "Dikirim dari Banjaran, Kabupaten Bandung, 1–2 hari kerja setelah pembayaran.",
  },
  /** Catatan di halaman produk Liter Series (minuman dingin). */
  literNote:
    "Minuman dingin: dikirim hanya untuk area Bandung dengan kurir instan, atau ambil di kedai Banjaran.",
  grindOptions: ["Biji utuh", "Giling espresso", "Giling filter / V60", "Giling French press"],
};

export const categories: { id: ProductCategory; name: string }[] = [
  { id: "liter", name: "Liter Series" },
];

export const products: Product[] = [
  // Liter Series: nama, deskripsi, dan harga asli dari buku menu & label botol Dahan di Canva.
  {
    slug: "dahan-iced-liter",
    name: "Dahan Iced",
    category: "liter",
    tagline: "Signature blend · susu · gula aren",
    description:
      "Kopi susu khas Dahan dengan karakter bold dan sentuhan manis yang bikin ingin kembali lagi. Dibotolkan segar di kedai.",
    details: [
      { label: "Simpan", value: "Dingin, kocok sebelum diminum" },
      { label: "Pengiriman", value: "Area Bandung, kurir instan" },
    ],
    variants: [
      { id: "500ml", label: "500 ml", price: 45000, weight: 600 },
      { id: "1l", label: "1 liter", price: 90000, weight: 1150 },
    ],
    image: "/images/dahan/bottle-iced.webp",
    art: { bg: "#f0f0f0", body: "#2b1d16", ink: "#f1ece4", shape: "box" },
  },
  {
    slug: "helena-liter",
    name: "Helena",
    category: "liter",
    tagline: "Coffee mocktail · blueberry & cherry",
    description:
      "Mocktail kopi dengan sentuhan blueberry dan cherry yang fruity dan menyegarkan. Dibotolkan segar di kedai.",
    details: [
      { label: "Simpan", value: "Dingin, kocok sebelum diminum" },
      { label: "Pengiriman", value: "Area Bandung, kurir instan" },
    ],
    variants: [
      { id: "500ml", label: "500 ml", price: 105000, weight: 600 },
      { id: "1l", label: "1 liter", price: 185000, weight: 1150 },
    ],
    image: "/images/dahan/bottle-helena.webp",
    art: { bg: "#f0f0f0", body: "#2b1d16", ink: "#f1ece4", shape: "box" },
  },
  {
    slug: "greentea-latte-liter",
    name: "Greentea Latte",
    category: "liter",
    tagline: "Green tea · creamy milk",
    description:
      "Matcha dengan rasa khas yang lembut, berpadu dengan susu creamy dalam setiap tegukan. Dibotolkan segar di kedai.",
    details: [
      { label: "Simpan", value: "Dingin, kocok sebelum diminum" },
      { label: "Pengiriman", value: "Area Bandung, kurir instan" },
    ],
    variants: [
      { id: "500ml", label: "500 ml", price: 45000, weight: 600 },
      { id: "1l", label: "1 liter", price: 90000, weight: 1150 },
    ],
    image: "/images/dahan/bottle-greentea.webp",
    art: { bg: "#f0f0f0", body: "#2b1d16", ink: "#f1ece4", shape: "box" },
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
