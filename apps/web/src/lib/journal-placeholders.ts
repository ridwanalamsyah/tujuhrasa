// Unsplash placeholder posts. Shown when DB is empty so the journal section
// has visual presence instead of an empty state. Real posts in the DB will
// always win; these only fill in gaps.

export type PlaceholderPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  cover: string; // unsplash URL
  createdAt: string;
};

export const PLACEHOLDER_POSTS: PlaceholderPost[] = [
  {
    id: "p-unsplash-1",
    slug: "kopi-pagi-bandung",
    title: "Kopi pagi: cara seduh paling jujur",
    excerpt:
      "Catatan dari dapur — ratio air, suhu, dan ritual kecil tiap pagi yang bikin kopi botolan kami tetap konsisten.",
    author: "Tim Tujuh Rasa",
    cover:
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-05-12T07:00:00.000Z",
  },
  {
    id: "p-unsplash-2",
    slug: "matcha-cerita-daun",
    title: "Matcha dari mana? Cerita di balik daun.",
    excerpt:
      "Bukan bubuk biasa. Kami pakai matcha culinary grade dari Jepang, ditakar gram-per-gram supaya rasa tetap stabil.",
    author: "Tim Tujuh Rasa",
    cover:
      "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-05-05T09:00:00.000Z",
  },
  {
    id: "p-unsplash-3",
    slug: "halal-jujur-takarannya",
    title: "Halal & jujur takarannya.",
    excerpt:
      "Sertifikasi halal bukan cuma stempel — kami buka daftar bahan, sumber, dan proses ke siapapun yang nanya.",
    author: "Tim Tujuh Rasa",
    cover:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-04-28T10:00:00.000Z",
  },
  {
    id: "p-unsplash-4",
    slug: "anak-kos-anak-kelas",
    title: "Buat anak kos & anak kelas pagi.",
    excerpt:
      "10rb-an, tinggal sruput, gak perlu mampir kantin. Cerita dari pelanggan harian kami di Bandung.",
    author: "Salma",
    cover:
      "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-04-20T12:00:00.000Z",
  },
  {
    id: "p-unsplash-5",
    slug: "botol-balik-program",
    title: "Botol balik = 2 ribu balik.",
    excerpt:
      "Cara kerja program botol kembali kami — niatnya bukan ribet, tapi ramah ke kantong dan ramah ke lingkungan.",
    author: "Tim Tujuh Rasa",
    cover:
      "https://images.unsplash.com/photo-1582719478145-19c4ca15bb55?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-04-14T08:00:00.000Z",
  },
  {
    id: "p-unsplash-6",
    slug: "weekend-meja-sebelah",
    title: "Akhir pekan di meja sebelah.",
    excerpt:
      "Obrolan-obrolan kecil dengan pelanggan yang singgah ke booth: dari skripsi yang macet sampai resep es kopi sendiri di kos.",
    author: "Faris",
    cover:
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-04-07T11:00:00.000Z",
  },
];
