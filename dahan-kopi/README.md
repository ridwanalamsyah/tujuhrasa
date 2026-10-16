# Dahan Kopi — Website

Website resmi **Dahan Kopi**, Coffee & Eatery di Banjaran, Kabupaten Bandung.
_Rooted in Good Coffee, Made for Meaningful Moments._

Dibuat dengan Next.js 16 (App Router), TypeScript, dan Tailwind CSS 4. Semua halaman
dirender statis (SSG) dan siap di-deploy ke Vercel.

| Halaman    | Isi                                                                         |
| ---------- | --------------------------------------------------------------------------- |
| `/`        | Hero, jam buka & status buka hari ini, cerita, 3 highlight, galeri, lokasi  |
| `/menu`    | Menu per kategori dengan filter, tombol unduh buku menu (PDF)               |
| `/tentang` | Cerita lengkap, ruang (indoor, taman, bar), fasilitas, kontak               |

## Menjalankan di komputer

Butuh Node.js 20.9 atau lebih baru.

```bash
cd dahan-kopi
npm install && npm run dev
```

Buka http://localhost:3000. Setiap perubahan file langsung terlihat di browser.

## Mengganti teks, kontak, dan jam buka

Semua konten ada di **`data/site.ts`**. Komponen tidak perlu disentuh.

- **Teks**: ganti isi di antara tanda kutip, mis. `title: "Berakar pada kopi yang baik"`.
- **Kontak**: bagian `contact` (telepon, nomor WhatsApp, pesan reservasi, Instagram).
  Nomor WhatsApp ditulis dengan kode negara tanpa `+` dan tanpa `0`, mis. `6282121651788`.
- **Alamat**: bagian `address`.
- **Jam buka**: bagian `openingHours`, format 24 jam.

  ```ts
  { label: "Senin – Jumat", days: ["mon", "tue", "wed", "thu", "fri"], open: "08:00", close: "22:00" },
  { label: "Sabtu – Minggu", days: ["sat", "sun"], open: "08:00", close: "23:00" },
  ```

  Kode hari: `mon` `tue` `wed` `thu` `fri` `sat` `sun`. Hari yang tidak dicantumkan dianggap libur.
  Jam tutup lewat tengah malam juga bisa (mis. `open: "10:00", close: "01:00"`).
  Status "Buka sekarang / Tutup" dihitung otomatis di browser pengunjung dengan zona waktu Asia/Jakarta.

- **Google Maps**: bagian `maps`. `query` dipakai untuk peta dan tombol petunjuk arah. Agar lebih
  tepat, isi `placeUrl` dengan link "Bagikan" dari Google Maps, dan `embedUrl` dengan link dari
  Google Maps → Bagikan → Sematkan peta (ambil isi `src="..."`).

## Mengisi menu

Buka **`data/menu.ts`**. Isinya sekarang hanya **contoh**; ganti dengan menu asli.

```ts
{
  name: "Kopi Susu Dahan",
  description: "Espresso, susu segar, dan gula aren.", // opsional
  price: 25000,                                        // rupiah, tanpa titik
  tags: ["HOT", "ICE"],                                // opsional: "HOT" dan/atau "ICE"
  image: "/images/menu/kopi-susu-dahan.jpg",           // opsional
},
```

- Tambah item: salin satu blok `{ ... }` di dalam `items`.
- Tambah kategori: salin satu blok kategori dan beri `id` unik (huruf kecil, tanpa spasi).
  `id` dipakai di link, mis. `/menu#kopi`. Urutan di file = urutan di website.
- Teks pembuka halaman menu ada di `menuPage` (file yang sama).
- **Buku menu PDF**: ganti file `public/menu-dahan.pdf` dengan buku menu asli (nama file tetap sama).

## Mengganti foto

Foto ada di **`public/images/`**. Cara termudah: **simpan foto asli dengan nama file yang sama**
(menimpa placeholder). Bisa juga memakai nama baru, lalu ubah path-nya di `data/site.ts`.

| File                                                 | Dipakai di                    | Saran ukuran      |
| ---------------------------------------------------- | ----------------------------- | ----------------- |
| `hero-garden.jpg`                                    | Hero beranda & gambar share   | 2400 × 1600 (3:2) |
| `story-bar.jpg`                                      | Cerita singkat beranda        | 1200 × 1500 (4:5) |
| `highlight-coffee.jpg`, `-food.jpg`, `-space.jpg`    | 3 kartu highlight beranda     | 1200 × 1500 (4:5) |
| `gallery-01.jpg` … `gallery-06.jpg`                  | Galeri beranda                | 1200 × 1200 (1:1) |
| `about-hero.jpg`                                     | Foto lebar halaman Tentang    | 2400 × 1200 (2:1) |
| `space-indoor.jpg`, `space-garden.jpg`, `bar.jpg`    | Ruang-ruang di halaman Tentang | 1200 × 1500 (4:5) |
| `menu/*.jpg`                                         | Foto item menu (opsional)     | 600 × 600 (1:1)   |

Tips:

- Format JPG, ukuran file di bawah ~1 MB. Website otomatis mengecilkan dan mengubah ke
  format modern (AVIF/WebP) sesuai layar pengunjung.
- Foto dipotong otomatis mengikuti bingkainya, jadi letakkan objek utama di tengah.
- Jangan lupa perbarui teks `alt` (deskripsi foto) di `data/site.ts`.
- Placeholder yang terhapus bisa dibuat ulang dengan `npm run images:placeholder`
  (hanya membuat file yang belum ada; foto asli tidak akan ditimpa).

### Logo dan favicon

- Logo di navbar & footer: `components/Logo.tsx` (SVG sementara: lingkaran, cangkir, tulisan DAHAN).
- Favicon: ganti `app/icon.svg`, lalu jalankan `npm run icons` untuk membuat ulang
  `app/favicon.ico` dan `app/apple-icon.png`.

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Di [vercel.com/new](https://vercel.com/new), import repo-nya.
3. Pada **Root Directory**, pilih **`dahan-kopi`**. Framework otomatis terdeteksi sebagai Next.js;
   perintah build dan install biarkan default.
4. (Opsional) Tambah Environment Variable `NEXT_PUBLIC_SITE_URL` berisi domain website,
   mis. `https://dahankopi.com`. Jika kosong, domain produksi Vercel dipakai otomatis.
5. Klik **Deploy**. Setiap push ke branch utama akan otomatis memperbarui website.

Domain sendiri bisa ditambahkan di Vercel → Project → Settings → Domains. Setelah itu,
isi juga `site.url` di `data/site.ts` (atau `NEXT_PUBLIC_SITE_URL`) agar sitemap dan SEO memakai domain tersebut.

## Struktur folder

```
app/                  Halaman (/, /menu, /tentang), layout, SEO (sitemap, robots, OG image, ikon)
components/
  layout/             Navbar, Footer, tombol WhatsApp melayang
  home/               Section beranda (hero, info, cerita, highlight, galeri, lokasi)
  menu/               Filter kategori & kartu menu
  ui/                 Komponen kecil: tombol, judul section, ikon, animasi scroll
data/
  site.ts             Semua teks, kontak, jam buka, foto
  menu.ts             Isi menu
lib/                  Logika: jam buka (Asia/Jakarta), link WhatsApp/Maps, SEO, format harga
public/images/        Foto
public/menu-dahan.pdf Buku menu
scripts/              Pembuat placeholder & ikon
```

## Menambah fitur nanti

- **Reservasi online**: buat `app/reservasi/page.tsx`, lalu di `data/site.ts` ubah
  `features.reservation.mode` menjadi `"page"`. Tombol "Reservasi" di navbar otomatis mengarah
  ke halaman tersebut (sekarang ke WhatsApp).
- **Pesan antar**: isi `features.delivery`, mis.
  `[{ name: "GoFood", url: "https://gofood.co.id/..." }]`. Tombolnya otomatis muncul di halaman Menu.
- **Halaman baru**: buat folder di `app/` (mis. `app/acara/page.tsx`), tambahkan ke `navigation`
  di `data/site.ts` dan ke `app/sitemap.ts`.

## Perintah lain

```bash
npm run build              # build produksi (cek sebelum deploy)
npm run start              # jalankan hasil build
npm run lint               # cek kode dengan ESLint
npm run typecheck          # cek tipe TypeScript
npm run images:placeholder # buat ulang foto placeholder yang hilang
npm run icons              # buat favicon.ico & apple-icon.png dari app/icon.svg
```

## Catatan

- Gerakan halus (fade-in saat scroll, hover foto) otomatis dimatikan jika pengunjung
  memilih "kurangi gerakan" di pengaturan perangkatnya.
- Font: Instrument Serif (judul) dan Plus Jakarta Sans (isi), dari Google Fonts lewat `next/font`.
  Salinan Instrument Serif di `assets/fonts/` dipakai untuk membuat gambar share (lisensi SIL OFL, lihat `assets/fonts/OFL.txt`).
