/**
 * Tipe data untuk konten di folder `data/`.
 * Pemilik cukup mengubah `data/site.ts` dan `data/menu.ts`; file ini
 * menjaga agar isian tetap konsisten (salah ketik akan ketahuan saat build).
 */

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type ImageAsset = {
  /**
   * Path foto di dalam folder `public`, mis. "/images/bar.jpg".
   * Selama file belum ada, website menampilkan kotak foto sementara.
   */
  src: string;
  /** Deskripsi isi foto (untuk pembaca layar dan Google). */
  alt: string;
  /** Foto apa yang dibutuhkan; tampil di kotak sementara sebagai panduan memotret. */
  shot: string;
  /** Warna kotak sementara: "garden" (taman), "wood" (bar/kayu/malam), "day" (makanan/minuman). */
  tone: "garden" | "wood" | "day";
  /** Opsional. Titik fokus foto saat dipotong, mis. "50% 30%". */
  focus?: string;
};

export type OpeningHoursRule = {
  /** Teks yang tampil di website, mis. "Senin–Jumat". */
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
  link: { label: string; href: string };
};

export type Space = {
  title: string;
  text: string;
  image: ImageAsset;
};

export type Facility = {
  name: string;
  /** Opsional, isi hanya dengan info yang benar, mis. "motor & mobil". */
  detail?: string;
};

export type Fact = {
  label: string;
  value: string;
};

export type FaqItem = {
  q: string;
  a: string;
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
  /** Opsional. Foto di `public/images/menu/`, mis. "/images/menu/kopi-susu.jpg". */
  image?: string;
};

export type MenuCategory = {
  /** Dipakai di URL, mis. /menu#kopi. Huruf kecil tanpa spasi. */
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
};
