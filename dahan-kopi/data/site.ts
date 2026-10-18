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
  /** Foto latar layar pertama (area taman Dahan, dari desain Canva). */
  background: "/images/canva/garden-crop.webp",
  /** Tagline dipecah per baris (di layar besar). */
  taglineLines: ["Rooted in Good Coffee,", "Made for Meaningful Moments"],
  image: {
    src: "https://images.unsplash.com/photo-1561645179-e087d31418b8", // Unsplash, foto sementara · ganti dengan "/images/hero-garden.jpg"
    alt: "Meja kayu di antara pohon palem",
    shot: "Taman Dahan Kopi, siang · landscape, min. 2400 px",
    tone: "garden",
    focus: "50% 55%",
  } satisfies ImageAsset,
  /** Kalimat kecil di bawah layar pertama (dari desain Canva Dahan). */
  footnote: "Where good coffee takes root.",
};

/** Teks beranda. */
export const home = {
  shopLabel: "Bawa pulang",
  shopTitle: "Shop",
  /** Produk yang tampil di beranda (slug dari data/products.ts). */
  featuredProducts: [
    "house-blend",
    "single-origin-jawa-barat",
    "drip-bag-house-blend",
    "tumbler-dahan",
  ],
  kedaiLabel: "Kedai di Banjaran",
  kedaiText:
    "Bar kopi, ruang dalam yang serba kayu, dan taman. Mampir untuk kopi pagi, makan siang, atau ngobrol sampai malam.",
  kedaiPoster: {
    src: "/images/canva/poster-cover-cup.webp",
    alt: "Poster Dahan Kopi: gelas Dahan di dinding beton, Where good coffee takes root",
  },
};

export const gallery = {
  instagramLabel: "Lihat lebih banyak di Instagram @dahankopi",
  /** 6 foto. Foto 1 dan 6 tampil besar. */
  images: [
    {
      src: "https://images.unsplash.com/photo-1586122891856-5f90886b0cee", // Unsplash, foto sementara · ganti dengan "/images/gallery-01.jpg"
      alt: "Pohon palem di dekat bangunan",
      shot: "Taman dengan pengunjung, sore · 1:1",
      tone: "garden",
    },
    {
      src: "https://images.unsplash.com/photo-1519944990593-1ac66b41ac9a", // Unsplash, foto sementara · ganti dengan "/images/gallery-02.jpg"
      alt: "Secangkir kopi dari dekat",
      shot: "Kopi susu di meja kayu · 1:1",
      tone: "day",
    },
    {
      src: "https://images.unsplash.com/photo-1564992982896-cb2a99f64a25", // Unsplash, foto sementara · ganti dengan "/images/gallery-03.jpg"
      alt: "Dua gelas kopi di meja kayu",
      shot: "Barista menuang susu · 1:1",
      tone: "wood",
    },
    {
      src: "https://images.unsplash.com/photo-1583753075968-1236ccb83c66", // Unsplash, foto sementara · ganti dengan "/images/gallery-04.jpg"
      alt: "Tanaman pot di meja kayu",
      shot: "Sudut ruang dalam · 1:1",
      tone: "wood",
    },
    {
      src: "https://images.unsplash.com/photo-1744638628542-12578d73179b", // Unsplash, foto sementara · ganti dengan "/images/gallery-05.jpg"
      alt: "Kopi dan kue di atas nampan kayu",
      shot: "Makanan dari atas · 1:1",
      tone: "day",
    },
    {
      src: "https://images.unsplash.com/photo-1592319866469-a1016ff5fe89", // Unsplash, foto sementara · ganti dengan "/images/gallery-06.jpg"
      alt: "Cangkir kopi putih di atas tatakan",
      shot: "Taman atau bar malam hari, lampu menyala · 1:1",
      tone: "garden",
    },
  ] satisfies ImageAsset[],
};

/** Liter Series (dijual di kedai). Teks & harga dari label botol dan buku menu Canva. */
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
      image: "/images/illustrations/dahan-iced.webp",
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
      image: "/images/illustrations/dahan-helena.webp",
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
      image: "/images/illustrations/dahan-greentea.webp",
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
  lead: "Kedai kopi dengan bar, ruang dalam serba kayu, dan taman di Jl. Ciherang, Banjaran, Kabupaten Bandung.",
  image: {
    src: "https://images.unsplash.com/photo-1745827213105-59dfd024ad2a", // Unsplash, foto sementara · ganti dengan "/images/about-front.jpg"
    alt: "Meja di jendela kedai kopi",
    shot: "Tampak depan atau pintu masuk · 21:9",
    tone: "wood",
  } satisfies ImageAsset,
  storyTitle: "Kenapa Dahan",
  // Contoh — ganti dengan cerita lengkap Dahan Kopi.
  // Jika paragraf terakhir diakhiri "halaman Menu.", kata itu otomatis jadi link ke /menu.
  paragraphs: [
    "Dahan artinya cabang pohon: tempat burung hinggap, pergi, lalu balik lagi besok. Kami ingin Dahan Kopi jadi tempat seperti itu buat kamu: dekat, santai, dan enak buat mampir lagi.",
    "Kedai kami ada di Jl. Ciherang, Banjaran. Di dalam ada bar kopi dan meja-meja kayu, di luar ada taman. Pagi orang datang buat sarapan dan kopi pertama, siang buat kerja sebentar, malam buat ngobrol sampai kami tutup.",
    "Di bar, kami bikin espresso, kopi susu, manual brew, dan minuman non-kopi. Dari dapur ada makanan berat dan camilan. Daftar lengkapnya ada di halaman Menu.",
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
        src: "https://images.unsplash.com/photo-1461988366670-48e401bafb0a", // Unsplash, foto sementara · ganti dengan "/images/space-bar.jpg"
        alt: "Mesin espresso",
        shot: "Bar kopi · 3:2",
        tone: "wood",
      },
    },
    {
      title: "Ruang dalam",
      text: "Meja-meja kayu, lebih tenang. Enak buat kerja atau ngobrol lama.",
      image: {
        src: "https://images.unsplash.com/photo-1745794621090-d856c53b0cc2", // Unsplash, foto sementara · ganti dengan "/images/space-indoor.jpg"
        alt: "Ruang makan dengan meja dan kursi kayu",
        shot: "Ruang dalam, meja kayu · 4:5",
        tone: "wood",
      },
    },
    {
      title: "Taman",
      text: "Meja di luar, di antara pohon dan tanaman, buat yang suka duduk di udara terbuka.",
      image: {
        src: "https://images.unsplash.com/photo-1563135022-66565e1f042a", // Unsplash, foto sementara · ganti dengan "/images/space-garden.jpg"
        alt: "Dinding penuh tanaman di halaman belakang",
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
