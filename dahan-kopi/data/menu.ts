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
 *
 *  Cara menambah kategori: salin satu blok kategori, beri `id` unik
 *  (huruf kecil, tanpa spasi). Urutan di sini = urutan di website.
 * ============================================================
 */

import type { MenuCategory } from "@/lib/types";

/** Teks pembuka dan catatan di halaman /menu. */
export const menuPage = {
  eyebrow: "Menu",
  title: "Dari bar & dapur kami",
  intro: "Kopi yang diseduh dengan teliti dan hidangan sederhana untuk menemaninya.",
  pdfLabel: "Unduh buku menu (PDF)",
  note: "Harga dalam rupiah dan dapat berubah sewaktu-waktu. Tanyakan menu musiman kepada barista kami.",
};

export const menu: MenuCategory[] = [
  {
    id: "kopi",
    name: "Kopi",
    description: "Espresso based",
    items: [
      {
        name: "Kopi Susu Dahan",
        description: "Espresso, susu segar, dan gula aren.",
        price: 25000,
        tags: ["HOT", "ICE"],
        image: "/images/menu/kopi-susu-dahan.jpg",
      },
      {
        name: "Americano",
        description: "Espresso dan air, ringan dan bersih.",
        price: 22000,
        tags: ["HOT", "ICE"],
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
    description: "Single origin pilihan",
    items: [
      {
        name: "V60",
        description: "Seduh tangan, tanyakan biji yang tersedia hari ini.",
        price: 30000,
        tags: ["HOT", "ICE"],
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
    description: "Teh, cokelat, dan segar-segaran",
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
    description: "Hidangan utama",
    items: [
      {
        name: "Nasi Goreng Dahan",
        description: "Nasi goreng kampung, telur mata sapi, dan kerupuk.",
        price: 35000,
        image: "/images/menu/nasi-goreng-dahan.jpg",
      },
      {
        name: "Chicken Rice Bowl",
        description: "Ayam saus pilihan di atas nasi hangat.",
        price: 38000,
      },
    ],
  },
  {
    id: "camilan",
    name: "Camilan",
    description: "Teman minum kopi",
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
      },
      {
        name: "Croissant",
        description: "Butter croissant, dihangatkan.",
        price: 24000,
      },
    ],
  },
];
