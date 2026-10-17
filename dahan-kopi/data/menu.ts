/**
 * ============================================================
 *  MENU DAHAN KOPI
 * ============================================================
 *  PERHATIAN: isi di bawah ini hanya CONTOH (placeholder).
 *  Ganti dengan menu asli Dahan Kopi.
 *
 *  Cara menambah item: salin satu blok { ... } lalu ubah isinya.
 *  - name        : nama menu
 *  - description : deskripsi singkat (opsional)
 *  - price       : harga dalam rupiah tanpa titik, mis. 25000
 *  - tags        : ["HOT"], ["ICE"], atau ["HOT", "ICE"] (opsional)
 *  - image       : foto di public/images/menu/ (opsional)
 *  - featured    : true = tampil di beranda (maks. 3 per kelompok)
 *
 *  Cara menambah kategori: salin satu blok kategori, beri `id` unik
 *  (huruf kecil, tanpa spasi). Urutan di sini = urutan di website.
 * ============================================================
 */

import type { MenuCategory } from "@/lib/types";

/** Teks di halaman /menu. */
export const menuPage = {
  title: "Menu",
  priceNote: "Harga dalam ribu rupiah.",
  pdfLabel: "Unduh buku menu (PDF)",
  deliveryLabel: "Pesan antar:",
  note: "Harga bisa berubah sewaktu-waktu.",
};

export const menu: MenuCategory[] = [
  {
    id: "kopi",
    name: "Kopi",
    description: "Berbasis espresso",
    items: [
      {
        name: "Kopi Susu Dahan",
        description: "Espresso, susu segar, dan gula aren.",
        price: 25000,
        tags: ["HOT", "ICE"],
        featured: true,
      },
      {
        name: "Americano",
        description: "Espresso dan air, ringan dan bersih.",
        price: 22000,
        tags: ["HOT", "ICE"],
        featured: true,
      },
      {
        name: "Caffè Latte",
        description: "Espresso dengan susu yang lembut.",
        price: 28000,
        tags: ["HOT", "ICE"],
      },
    ],
  },
  {
    id: "manual-brew",
    name: "Manual Brew",
    description: "Seduh manual per cangkir",
    items: [
      {
        name: "V60",
        description: "Diseduh manual dengan dripper V60.",
        price: 30000,
        tags: ["HOT", "ICE"],
        featured: true,
      },
      {
        name: "Japanese Iced Coffee",
        description: "Diseduh langsung di atas es.",
        price: 30000,
        tags: ["ICE"],
      },
    ],
  },
  {
    id: "non-kopi",
    name: "Non-Kopi",
    description: "Teh, cokelat, dan yang segar",
    items: [
      {
        name: "Matcha Latte",
        description: "Matcha dan susu segar.",
        price: 28000,
        tags: ["HOT", "ICE"],
      },
      {
        name: "Chocolate",
        description: "Cokelat pekat dengan susu.",
        price: 26000,
        tags: ["HOT", "ICE"],
      },
      {
        name: "Lemon Tea",
        description: "Teh dengan perasan lemon.",
        price: 20000,
        tags: ["ICE"],
      },
    ],
  },
  {
    id: "makanan",
    name: "Makanan",
    description: "Makanan berat",
    items: [
      {
        name: "Nasi Goreng Dahan",
        description: "Nasi goreng kampung, telur mata sapi, dan kerupuk.",
        price: 35000,
        featured: true,
      },
      {
        name: "Chicken Rice Bowl",
        description: "Ayam dengan saus di atas nasi.",
        price: 38000,
        featured: true,
      },
    ],
  },
  {
    id: "camilan",
    name: "Camilan",
    description: "Teman ngopi",
    items: [
      {
        name: "French Fries",
        description: "Kentang goreng renyah dengan saus.",
        price: 22000,
      },
      {
        name: "Pisang Goreng",
        description: "Pisang goreng dengan gula aren dan keju.",
        price: 22000,
        featured: true,
      },
      {
        name: "Croissant",
        description: "Butter croissant, dihangatkan.",
        price: 24000,
      },
    ],
  },
];
