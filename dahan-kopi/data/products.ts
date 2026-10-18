/**
 * ============================================================
 *  PRODUK TOKO DAHAN KOPI
 * ============================================================
 *  Liter Series sudah memakai harga asli dari buku menu.
 *  PERHATIAN: biji kopi, drip bag, dan merch di bawah ini masih CONTOH.
 *  Ganti dengan produk asli, lalu ubah `shop.sampleNotice` menjadi false.
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
  sampleNotice: true,
  title: "Shop",
  intro: "Liter Series, biji kopi, drip bag, dan barang Dahan untuk dibawa pulang atau dikirim.",
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
  { id: "biji-kopi", name: "Biji Kopi" },
  { id: "drip-bag", name: "Drip Bag" },
  { id: "merch", name: "Merch" },
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
    image: "/images/dahan/char-iced.webp",
    art: { bg: "#f2c45a", body: "#2b1d16", ink: "#f1ece4", shape: "box" },
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
    image: "/images/dahan/char-helena.webp",
    art: { bg: "#ee98ad", body: "#2b1d16", ink: "#f1ece4", shape: "box" },
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
    image: "/images/dahan/char-greentea.webp",
    art: { bg: "#b9d2a6", body: "#2b1d16", ink: "#f1ece4", shape: "box" },
  },
  {
    slug: "house-blend",
    name: "House Blend",
    category: "biji-kopi",
    tagline: "Cokelat, karamel, kacang",
    description:
      "Blend yang kami pakai untuk Dahan Iced dan kopi susu di bar. Enak untuk espresso maupun kopi susu di rumah.",
    details: [
      { label: "Cocok untuk", value: "Espresso, kopi susu" },
      { label: "Roast", value: "Medium-dark" },
    ],
    variants: [
      { id: "200g", label: "200 g", price: 85000, weight: 250 },
      { id: "500g", label: "500 g", price: 195000, weight: 550 },
      { id: "1kg", label: "1 kg", price: 370000, weight: 1050 },
    ],
    grinds: true,
    art: { bg: "#d9c7ae", body: "#2b1d16", ink: "#f1ece4", shape: "pouch" },
  },
  {
    slug: "single-origin-jawa-barat",
    name: "Single Origin Jawa Barat",
    category: "biji-kopi",
    tagline: "Jeruk, gula aren, teh hitam",
    description: "Kopi arabika dari pegunungan Jawa Barat, disangrai terang untuk seduh manual.",
    details: [
      { label: "Cocok untuk", value: "V60, pour over" },
      { label: "Roast", value: "Light" },
    ],
    variants: [{ id: "200g", label: "200 g", price: 110000, weight: 250 }],
    grinds: true,
    art: { bg: "#cfd8c4", body: "#4f6b45", ink: "#f1ece4", shape: "pouch" },
  },
  {
    slug: "sundanese-blend",
    name: "Sundanese Blend",
    category: "biji-kopi",
    tagline: "Lembut, manis, ringan",
    description: "Blend yang lebih lembut untuk kopi susu sehari-hari, seperti Sundanese di bar.",
    details: [{ label: "Cocok untuk", value: "Kopi susu, moka pot" }],
    variants: [
      { id: "200g", label: "200 g", price: 80000, weight: 250 },
      { id: "500g", label: "500 g", price: 185000, weight: 550 },
    ],
    grinds: true,
    art: { bg: "#e6d9c8", body: "#7a5236", ink: "#f1ece4", shape: "pouch" },
  },
  {
    slug: "drip-bag-house-blend",
    name: "Drip Bag House Blend",
    category: "drip-bag",
    tagline: "Isi 10 sachet",
    description: "Seduh House Blend di mana saja: sobek, gantung di cangkir, tuang air panas.",
    details: [{ label: "Isi", value: "10 × 12 g" }],
    variants: [{ id: "10", label: "Isi 10", price: 90000, weight: 200 }],
    art: { bg: "#ece4d8", body: "#2b1d16", ink: "#f1ece4", shape: "box" },
  },
  {
    slug: "drip-bag-single-origin",
    name: "Drip Bag Single Origin",
    category: "drip-bag",
    tagline: "Isi 10 sachet",
    description: "Single origin Jawa Barat dalam drip bag, untuk kopi seduh tanpa alat.",
    details: [{ label: "Isi", value: "10 × 12 g" }],
    variants: [{ id: "10", label: "Isi 10", price: 110000, weight: 200 }],
    art: { bg: "#dde3d5", body: "#4f6b45", ink: "#f1ece4", shape: "box" },
  },
  {
    slug: "tumbler-dahan",
    name: "Tumbler Dahan",
    category: "merch",
    tagline: "Stainless, 500 ml",
    description: "Tumbler stainless dengan logo Dahan. Bawa ke kedai dan isi ulang kopimu.",
    variants: [{ id: "500ml", label: "500 ml", price: 150000, weight: 400 }],
    art: { bg: "#d3cdc4", body: "#2b1d16", ink: "#f1ece4", shape: "tumbler" },
  },
  {
    slug: "tote-bag-dahan",
    name: "Tote Bag Dahan",
    category: "merch",
    tagline: "Kanvas tebal",
    description: "Tote bag kanvas dengan sablon wordmark Dahan Kopi.",
    variants: [{ id: "std", label: "Satu ukuran", price: 95000, weight: 250 }],
    art: { bg: "#e9e1d4", body: "#efe6d6", ink: "#2b1d16", shape: "tote" },
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
