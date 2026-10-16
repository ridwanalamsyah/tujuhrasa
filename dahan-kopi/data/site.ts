/**
 * ============================================================
 *  KONTEN WEBSITE DAHAN KOPI
 * ============================================================
 *  Ubah teks, kontak, jam buka, dan foto di file ini.
 *  Tidak perlu menyentuh folder `components/` atau `app/`.
 *
 *  - Teks: ganti isi di antara tanda kutip "...".
 *  - Foto: simpan file di `public/images/`, lalu tulis path-nya
 *    di sini, mis. "/images/nama-foto.jpg".
 *  - Jam buka: format 24 jam "HH:MM".
 *  Setelah mengubah, cek dengan `npm run dev` lalu buka http://localhost:3000
 * ============================================================
 */

import type {
  DeliveryLink,
  Facility,
  Highlight,
  ImageAsset,
  NavItem,
  OpeningHoursRule,
} from "@/lib/types";

/* ---------- Identitas & kontak ---------- */

export const site = {
  name: "Dahan Kopi",
  /**
   * Domain website setelah online, mis. "https://dahankopi.com".
   * Biarkan kosong untuk memakai domain Vercel secara otomatis.
   */
  url: "",
  tagline: "Rooted in Good Coffee, Made for Meaningful Moments",
  closingTagline: "The Favorites Place, Everyone Keeps Coming Back For",
  closingCta: "See You at @Dahankopi",
  /** Dipakai untuk judul tab browser dan hasil pencarian Google. */
  seo: {
    title: "Dahan Kopi — Coffee & Eatery di Banjaran, Bandung",
    description:
      "Rooted in Good Coffee, Made for Meaningful Moments. Dahan Kopi adalah kafe dengan bar kopi, interior kayu, dan taman hijau di Jl. Raya Kamasan, Banjaran, Kabupaten Bandung. Buka setiap hari.",
    keywords: [
      "Dahan Kopi",
      "kafe Banjaran",
      "coffee shop Banjaran",
      "kopi Kabupaten Bandung",
      "kafe taman Bandung",
    ],
  },
  /** Zona waktu untuk status "Buka sekarang / Tutup". */
  timeZone: "Asia/Jakarta",
};

export const contact = {
  phoneDisplay: "+62 821 2165 1788",
  /** Format internasional tanpa spasi, untuk link telepon. */
  phone: "+6282121651788",
  /** Nomor WhatsApp: kode negara 62 tanpa tanda + dan tanpa angka 0 di depan. */
  whatsapp: "6282121651788",
  /** Pesan awal saat pengunjung menekan tombol "Reservasi". */
  whatsappMessage: "Halo Dahan Kopi, saya mau reservasi",
  instagram: {
    handle: "dahankopi",
    url: "https://instagram.com/dahankopi",
  },
};

export const address = {
  street: "Jl. Ciherang, Jl. Raya Kamasan",
  locality: "Banjaran",
  regency: "Kabupaten Bandung",
  province: "Jawa Barat",
  postalCode: "40377",
  country: "ID",
  /** Versi singkat yang tampil di strip info beranda. */
  short: "Jl. Raya Kamasan, Banjaran",
};

export const maps = {
  /** Kata kunci pencarian di Google Maps. Sebaiknya sama persis dengan nama tempat di Google Maps. */
  query: "Dahan Kopi, Jl. Raya Kamasan, Banjaran, Kabupaten Bandung",
  /**
   * Opsional. Link "Bagikan" dari Google Maps (mis. https://maps.app.goo.gl/xxxx).
   * Jika diisi, tombol "Buka di Google Maps" memakai link ini.
   */
  placeUrl: "",
  /**
   * Opsional. Link dari Google Maps → Bagikan → Sematkan peta (ambil isi atribut src="...").
   * Jika kosong, peta dibuat otomatis dari `query`.
   */
  embedUrl: "",
};

/* ---------- Jam buka ---------- */

export const openingHours: OpeningHoursRule[] = [
  {
    label: "Senin – Jumat",
    days: ["mon", "tue", "wed", "thu", "fri"],
    open: "08:00",
    close: "22:00",
  },
  {
    label: "Sabtu – Minggu",
    days: ["sat", "sun"],
    open: "08:00",
    close: "23:00",
  },
];

/* ---------- Navigasi ---------- */

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Tentang", href: "/tentang" },
];

/* ---------- Beranda ---------- */

export const hero = {
  eyebrow: "Coffee & Eatery · Banjaran, Bandung",
  title: site.tagline,
  image: {
    src: "/images/hero-garden.jpg",
    alt: "Area taman Dahan Kopi yang hijau dan rimbun",
  } satisfies ImageAsset,
  primaryCta: "Lihat Menu",
  secondaryCta: "Petunjuk Arah",
};

export const story = {
  eyebrow: "Cerita kami",
  title: "Berakar pada kopi yang baik",
  // Placeholder — ganti dengan cerita Dahan Kopi (2–3 kalimat).
  text: "Dahan Kopi tumbuh dari keinginan sederhana: punya tempat yang tenang untuk kopi yang dibuat dengan sungguh-sungguh. Di antara bar kopi, interior kayu, dan taman yang rimbun, kami menyiapkan ruang untuk bertemu, bekerja, atau sekadar berhenti sejenak.",
  image: {
    src: "/images/story-bar.jpg",
    alt: "Barista menyiapkan kopi di bar Dahan Kopi",
  } satisfies ImageAsset,
  linkLabel: "Kenali Dahan Kopi",
};

export const highlights = {
  eyebrow: "Di Dahan",
  title: "Kopi, makanan, dan ruang",
  items: [
    {
      title: "Kopi",
      text: "Espresso dan manual brew dari biji pilihan, diseduh dengan teliti setiap hari.",
      image: { src: "/images/highlight-coffee.jpg", alt: "Secangkir kopi di meja kayu" },
      href: "/menu#kopi",
    },
    {
      title: "Makanan",
      text: "Hidangan rumahan dan camilan untuk menemani kopi, dari pagi sampai malam.",
      image: { src: "/images/highlight-food.jpg", alt: "Hidangan Dahan Kopi di atas meja" },
      href: "/menu#makanan",
    },
    {
      title: "Ruang",
      text: "Taman yang hijau dan ruang dalam yang hangat, untuk duduk lebih lama.",
      image: {
        src: "/images/highlight-space.jpg",
        alt: "Suasana taman dan ruang dalam Dahan Kopi",
      },
      href: "/tentang",
    },
  ] satisfies Highlight[],
};

export const gallery = {
  eyebrow: "Galeri",
  title: "Momen di Dahan",
  instagramLabel: "Lihat lebih banyak di Instagram @dahankopi",
  /** 6 foto untuk grid galeri di beranda. */
  images: [
    { src: "/images/gallery-01.jpg", alt: "Kopi susu di meja taman" },
    { src: "/images/gallery-02.jpg", alt: "Barista menuang susu ke espresso" },
    { src: "/images/gallery-03.jpg", alt: "Sudut ruang dalam dengan interior kayu" },
    { src: "/images/gallery-04.jpg", alt: "Pepohonan rimbun di area taman" },
    { src: "/images/gallery-05.jpg", alt: "Hidangan dan minuman di meja" },
    { src: "/images/gallery-06.jpg", alt: "Suasana Dahan Kopi di malam hari" },
  ] satisfies ImageAsset[],
};

export const location = {
  eyebrow: "Lokasi",
  title: "Mampir ke Dahan",
  text: "Buka setiap hari, dari pagi sampai malam.",
  mapsCta: "Buka di Google Maps",
};

/* ---------- Halaman Tentang ---------- */

export const about = {
  eyebrow: "Tentang",
  title: "Tempat yang membuat orang kembali",
  image: {
    src: "/images/about-hero.jpg",
    alt: "Suasana Dahan Kopi dari area taman",
  } satisfies ImageAsset,
  intro:
    "Kafe dengan bar kopi, interior kayu, dan taman yang rimbun di Banjaran, Kabupaten Bandung.",
  storyTitle: "Cerita kami",
  // Placeholder — ganti dengan cerita lengkap Dahan Kopi.
  paragraphs: [
    "Nama Dahan kami ambil dari cabang pohon: bagian yang tumbuh dari akar yang kuat, menjadi tempat bernaung, dan selalu didatangi kembali. Semangat itu yang ingin kami hadirkan di Banjaran.",
    "Setiap cangkir disiapkan dari biji kopi pilihan dan diseduh dengan teliti oleh barista kami. Di dapur, kami menyiapkan hidangan sederhana yang jujur rasanya, cocok untuk sarapan, makan siang, atau teman ngobrol sampai malam.",
    "Lebih dari sekadar kafe, Dahan Kopi adalah ruang untuk momen yang berarti: bertemu teman lama, merayakan hal kecil, atau menikmati sore di bawah pepohonan.",
  ],
  spacesTitle: "Ruang-ruang kami",
  spaces: [
    {
      title: "Ruang dalam",
      text: "Interior kayu yang hangat dan tenang, nyaman untuk bekerja atau berbincang.",
      image: {
        src: "/images/space-indoor.jpg",
        alt: "Ruang dalam Dahan Kopi dengan interior kayu",
      },
    },
    {
      title: "Taman",
      text: "Area terbuka yang hijau dan rimbun, teduh di siang hari dan syahdu di malam hari.",
      image: { src: "/images/space-garden.jpg", alt: "Area taman Dahan Kopi" },
    },
    {
      title: "Bar kopi",
      text: "Duduk di depan bar dan lihat barista menyeduh kopi pesananmu dari dekat.",
      image: { src: "/images/bar.jpg", alt: "Bar kopi Dahan Kopi" },
    },
  ] satisfies Highlight[],
  facilitiesTitle: "Fasilitas",
  // Placeholder — sesuaikan dengan fasilitas yang tersedia.
  facilities: [
    { name: "Wi-Fi", text: "Internet gratis untuk pengunjung." },
    { name: "Colokan listrik", text: "Tersedia di area dalam dan sebagian taman." },
    { name: "Area outdoor", text: "Taman terbuka dengan banyak pepohonan." },
    { name: "Parkir", text: "Area parkir untuk motor dan mobil." },
    { name: "Musholla", text: "Ruang ibadah yang bersih dan nyaman." },
  ] satisfies Facility[],
  contactTitle: "Kunjungi kami",
  contactText: "Untuk reservasi tempat atau acara, hubungi kami lewat WhatsApp.",
};

/* ---------- Fitur (untuk dikembangkan nanti) ---------- */

export const features = {
  /**
   * Reservasi saat ini lewat WhatsApp. Jika nanti ada sistem reservasi online,
   * ubah `mode` menjadi "page" dan buat halaman di `app/reservasi/page.tsx`.
   */
  reservation: {
    mode: "whatsapp" as "whatsapp" | "page",
    label: "Reservasi",
    pagePath: "/reservasi",
  },
  /**
   * Pesan antar. Isi daftar link (mis. GoFood, GrabFood, ShopeeFood),
   * maka tombolnya otomatis muncul di halaman Menu.
   */
  delivery: [] as DeliveryLink[],
  /** File buku menu di folder `public`. */
  menuPdf: "/menu-dahan.pdf",
};
