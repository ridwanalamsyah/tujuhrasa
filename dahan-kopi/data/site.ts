/**
 * ============================================================
 *  KONTEN WEBSITE DAHAN KOPI
 * ============================================================
 *  Ubah teks, kontak, jam buka, dan foto di file ini.
 *  Tidak perlu menyentuh folder `components/` atau `app/`.
 *
 *  - Teks: ganti isi di antara tanda kutip "...".
 *  - Foto: saat ini memakai foto stok Unsplash sebagai contoh. Untuk foto asli,
 *    simpan file di `public/images/` lalu ganti `src` dengan path-nya
 *    (nama yang disarankan tertulis di komentar tiap foto, mis. "/images/hero-garden.jpg").
 *  - Jam buka: format 24 jam "HH:MM".
 *  - Kolom yang dikosongkan ("") tidak ditampilkan. Isi hanya dengan info yang benar.
 *  Setelah mengubah, cek dengan `npm run dev` lalu buka http://localhost:3000
 * ============================================================
 */

import type {
  DeliveryLink,
  Facility,
  Fact,
  FaqItem,
  ImageAsset,
  NavItem,
  OpeningHoursRule,
  Space,
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
  /** Judul tab browser dan hasil pencarian Google. Deskripsinya dibuat otomatis dari alamat & jam buka. */
  seo: {
    title: "Dahan Kopi — Coffee & Eatery di Banjaran, Bandung",
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
  whatsappMessage: "Halo Dahan Kopi, saya mau reservasi.\nTanggal: \nJam: \nJumlah orang: ",
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
  /** Versi singkat, tampil di layar pertama beranda dan menu mobile. */
  short: "Jl. Ciherang, Jl. Raya Kamasan, Banjaran",
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
    label: "Senin–Jumat",
    days: ["mon", "tue", "wed", "thu", "fri"],
    open: "08:00",
    close: "22:00",
  },
  {
    label: "Sabtu–Minggu",
    days: ["sat", "sun"],
    open: "08:00",
    close: "23:00",
  },
];

/* ---------- Navigasi ---------- */

export const navigation: NavItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "Tentang", href: "/tentang" },
  { label: "Lokasi", href: "/lokasi" },
];

/* ---------- Beranda ---------- */

export const hero = {
  /** Label kecil di atas judul. */
  kicker: "Dahan Kopi · Banjaran, Bandung",
  /** Foto utama Dahan (dipakai untuk Google / pratinjau link). */
  image: {
    src: "/images/dahan/photo-garden.webp",
    alt: "Halaman depan Dahan Kopi dengan pohon, tanaman, dan papan DAHAN",
    shot: "Halaman depan Dahan",
    tone: "garden",
  } satisfies ImageAsset,
  /** Kalimat kecil di bawah ilustrasi (dari desain Canva Dahan). */
  footnote: "Where good coffee takes root.",
};

/** Teks beranda. */
export const home = {
  shopLabel: "Bawa pulang",
  shopTitle: "Biji kopi & drip bag",
  /** Produk yang tampil di beranda (slug dari data/products.ts). */
  featuredProducts: [
    "house-blend",
    "single-origin-jawa-barat",
    "drip-bag-house-blend",
    "tumbler-dahan",
  ],
  /** Kalimat besar di beranda. */
  statementLabel: "Kenapa Dahan",
  statement:
    "Dahan artinya cabang pohon: tempat burung hinggap, pergi, lalu balik lagi besok. Kami ingin Dahan Kopi jadi tempat seperti itu buat kamu.",
  kedaiLabel: "Kedai di Banjaran",
  kedaiText:
    "Bar kopi, ruang dalam beton dan kayu, dan halaman penuh tanaman. Mampir untuk kopi pagi, makan siang, atau ngobrol sampai malam.",
  /** Foto latar blok kedai. */
  kedaiPhoto: {
    src: "/images/dahan/photo-courtyard.webp",
    alt: "Halaman belakang Dahan Kopi: meja, kursi besi, cermin, dan dinding penuh tanaman",
  },
};

/** Foto asli Dahan (dari buku menu Canva). Tampil di beranda dalam bingkai berbentuk rumah logo Dahan. */
export const photos = [
  {
    src: "/images/dahan/photo-interior.webp",
    alt: "Bar kopi Dahan: dinding beton, lampu gantung, rak gelas, dan tanaman monstera",
    caption: "Bar",
    width: 1617,
    height: 3067,
  },
  {
    src: "/images/dahan/photo-cup.webp",
    alt: "Gelas kertas putih berlogo Dahan di atas dinding beton",
    caption: "Gelas Dahan",
    width: 1200,
    height: 1512,
  },
  {
    src: "/images/dahan/photo-garden.webp",
    alt: "Halaman depan Dahan Kopi dengan pohon, tanaman, dan papan DAHAN",
    caption: "Halaman depan",
    width: 1617,
    height: 3067,
  },
];

/** Liter Series (layar pertama beranda). Teks & harga dari label botol dan buku menu Canva. `slug` = produk di data/products.ts. */
export const literSeries = {
  label: "Dahan in a bottle",
  title: "Liter Series",
  intro:
    "Minuman favorit Dahan dalam botol 500 ml dan 1 liter. Ambil di kedai, simpan dingin, kocok sebelum diminum.",
  items: [
    {
      id: "iced",
      name: "Dahan Iced",
      notes: "Signature Blend · Bottled Fresh",
      text: "Kopi susu khas Dahan dengan karakter bold dan sentuhan manis yang bikin ingin kembali lagi.",
      prices: [
        { label: "500 ml", price: 45000 },
        { label: "1 L", price: 90000 },
      ],
      sky: "#f2c45a",
      slug: "dahan-iced-liter",
      scene: "/images/dahan/scene-iced.webp",
    },
    {
      id: "helena",
      name: "Helena",
      notes: "Coffee Mocktail · Berry Infusion",
      text: "Mocktail kopi dengan sentuhan blueberry dan cherry yang fruity dan menyegarkan.",
      prices: [
        { label: "500 ml", price: 105000 },
        { label: "1 L", price: 185000 },
      ],
      sky: "#ee98ad",
      slug: "helena-liter",
      scene: "/images/dahan/scene-helena.webp",
    },
    {
      id: "greentea",
      name: "Greentea Latte",
      notes: "Green Tea · Creamy Milk",
      text: "Matcha dengan rasa khas yang lembut, berpadu dengan susu creamy dalam setiap tegukan.",
      prices: [
        { label: "500 ml", price: 45000 },
        { label: "1 L", price: 90000 },
      ],
      sky: "#b9d2a6",
      slug: "greentea-latte-liter",
      scene: "/images/dahan/scene-greentea.webp",
    },
  ],
};

/** Poster dari desain Canva Dahan, tampil di galeri beranda. */
export const posters = [
  {
    src: "/images/canva/poster-cover-bar.webp",
    alt: "Poster Dahan Kopi: bar kopi dengan lampu gantung",
  },
  { src: "/images/canva/poster-garden.webp", alt: "Poster: area taman Dahan, The Favorites Place" },
  {
    src: "/images/canva/poster-favorites.webp",
    alt: "Poster: interior kayu Dahan, The favorites everyone keeps coming back for",
  },
  { src: "/images/canva/poster-signature.webp", alt: "Poster menu Signature Coffee Dahan" },
  {
    src: "/images/canva/poster-clean-cover.webp",
    alt: "Sampul buku menu Dahan: Rooted in Good Coffee",
  },
];

/** Marquee di bawah layar pertama. */
export const marquee = [
  "Where good coffee takes root",
  "Our menu, your choice",
  "Open everyday 08.00–22.00",
  "See you at @dahankopi",
];

/* ---------- Blok lokasi (footer, tampil di semua halaman) ---------- */

export const location = {
  /** Judul blok lokasi. */
  venueTitle: "Banjaran",
  /** Petunjuk masuk, mis. "Masuk dari Jl. Ciherang, parkir di sebelah kiri." Kosongkan jika belum ada. */
  directions: "",
  hoursLabel: "Jam buka",
  contactLabel: "Kontak",
  whatsappLabel: "Chat WhatsApp",
  mapsLabel: "Buka di Google Maps",
};

/* ---------- Halaman Tentang ---------- */

export const about = {
  title: "Tentang Dahan Kopi",
  lead: "Kedai kopi dengan bar, ruang beton dan kayu, dan halaman penuh tanaman di Jl. Ciherang, Banjaran, Kabupaten Bandung.",
  image: {
    src: "/images/dahan/photo-garden.webp",
    alt: "Halaman depan Dahan Kopi dengan pohon, tanaman, dan papan DAHAN",
    shot: "Tampak depan atau pintu masuk · 21:9",
    tone: "garden",
    focus: "50% 62%",
  } satisfies ImageAsset,
  storyTitle: "Kenapa Dahan",
  // Contoh — ganti dengan cerita lengkap Dahan Kopi.
  // Jika paragraf terakhir diakhiri "halaman Lokasi.", kata itu otomatis jadi link ke /lokasi.
  paragraphs: [
    "Dahan artinya cabang pohon: tempat burung hinggap, pergi, lalu balik lagi besok. Kami ingin Dahan Kopi jadi tempat seperti itu buat kamu: dekat, santai, dan enak buat mampir lagi.",
    "Kedai kami ada di Jl. Ciherang, Banjaran. Di dalam ada bar kopi dan meja-meja kayu, di luar ada taman. Pagi orang datang buat sarapan dan kopi pertama, siang buat kerja sebentar, malam buat ngobrol sampai kami tutup.",
    "Di bar, kami bikin espresso, kopi susu, manual brew, dan minuman non-kopi. Dari dapur ada makanan berat dan camilan. Daftar lengkapnya ada di menu kafe (PDF) di halaman Lokasi.",
  ],
  /** Fakta singkat. Isi `value` hanya dengan info yang benar; baris kosong tidak tampil. */
  facts: [
    { label: "Buka sejak", value: "" },
    { label: "Biji kopi", value: "" },
    { label: "Tempat duduk", value: "" },
  ] satisfies Fact[],
  spacesTitle: "Ruang",
  spaces: [
    {
      title: "Bar kopi",
      text: "Duduk di depan bar kalau mau lihat kopimu dibuat.",
      image: {
        src: "/images/dahan/photo-interior.webp",
        alt: "Bar kopi Dahan: dinding beton, lampu gantung, rak gelas, dan tanaman monstera",
        shot: "Bar kopi · 3:2",
        tone: "wood",
      },
    },
    {
      title: "Halaman depan",
      text: "Pohon besar, tanaman, dan papan DAHAN di depan pintu. Tempat foto favorit.",
      image: {
        src: "/images/dahan/photo-garden.webp",
        alt: "Halaman depan Dahan Kopi dengan pohon, tanaman, dan papan DAHAN",
        shot: "Ruang dalam, meja kayu · 4:5",
        tone: "wood",
      },
    },
    {
      title: "Halaman belakang",
      text: "Meja di luar, di antara dinding penuh tanaman, buat yang suka duduk di udara terbuka.",
      image: {
        src: "/images/dahan/photo-courtyard.webp",
        alt: "Halaman belakang Dahan Kopi: meja, kursi besi, cermin, dan dinding penuh tanaman",
        shot: "Taman · 16:9",
        tone: "garden",
      },
    },
  ] satisfies Space[],
  facilitiesTitle: "Fasilitas",
  /** `detail` opsional, isi hanya dengan info yang benar, mis. { name: "Parkir", detail: "motor & mobil" }. */
  facilities: [
    { name: "Wi-Fi" },
    { name: "Colokan" },
    { name: "Area outdoor" },
    { name: "Parkir" },
    { name: "Musholla" },
  ] as Facility[],
  /** Tanya-jawab opsional, mis. { q: "Ada area merokok?", a: "Ada, di taman." }. Kosong = tidak tampil. */
  faq: [] as FaqItem[],
  contactTitle: "Kontak",
  contactText:
    "Mau pesan tempat buat rombongan atau acara? Chat kami di WhatsApp, sebutkan tanggal, jam, dan jumlah orang.",
  contactButton: "Reservasi lewat WhatsApp",
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
   * maka link-nya otomatis muncul di halaman Menu.
   */
  delivery: [] as DeliveryLink[],
  /** File buku menu di folder `public`. */
  menuPdf: "/menu-dahan.pdf",
};
