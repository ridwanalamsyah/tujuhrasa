/**
 * Tipe data untuk konten di folder `data/`.
 * Pemilik cukup mengubah `data/site.ts` dan `data/menu.ts`; file ini
 * menjaga agar isian tetap konsisten (salah ketik akan ketahuan saat build).
 */

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type ImageAsset = {
  /** Path gambar di dalam folder `public`, mis. "/images/bar.jpg". */
  src: string;
  /** Deskripsi singkat isi foto (untuk pembaca layar dan SEO). */
  alt: string;
};

export type OpeningHoursRule = {
  /** Teks yang tampil di website, mis. "Senin – Jumat". */
  label: string;
  days: DayKey[];
  /** Format 24 jam "HH:MM". Jika `close` lebih kecil dari `open`, dianggap tutup lewat tengah malam. */
  open: string;
  close: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export type Highlight = {
  title: string;
  text: string;
  image: ImageAsset;
  href?: string;
};

export type Facility = {
  name: string;
  text: string;
};

export type DeliveryLink = {
  /** Nama layanan, mis. "GoFood" atau "GrabFood". */
  name: string;
  url: string;
};

export type MenuTag = "HOT" | "ICE";

export type MenuItem = {
  name: string;
  description?: string;
  /** Harga dalam rupiah, tanpa titik. Contoh: 25000. */
  price: number;
  tags?: MenuTag[];
  /** Opsional. Path foto di `public`, mis. "/images/menu/kopi-susu.jpg". */
  image?: string;
};

export type MenuCategory = {
  /** Dipakai di URL, mis. /menu#kopi. Huruf kecil tanpa spasi. */
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
};
