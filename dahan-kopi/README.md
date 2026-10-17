# Dahan Kopi — Website

Website resmi **Dahan Kopi**, kedai kopi dan taman di Banjaran, Kabupaten Bandung.
_Rooted in Good Coffee, Made for Meaningful Moments._

Dibuat dengan Next.js 16 (App Router), TypeScript, dan Tailwind CSS 4. Semua halaman
dirender statis (SSG) dan siap di-deploy ke Vercel.

| Halaman    | Isi                                                                                     |
| ---------- | --------------------------------------------------------------------------------------- |
| `/`        | Foto utama, tagline, status buka + jam hari ini + alamat, cerita singkat, Kopi/Makanan/Ruang, galeri |
| `/menu`    | Menu ala buku menu, filter kategori, unduh buku menu (PDF)                              |
| `/tentang` | Cerita, ruang (bar, ruang dalam, taman), fasilitas, kontak                              |
| Footer     | Blok lokasi di setiap halaman: alamat, jam buka lengkap, kontak, peta Google Maps       |

## Menjalankan di komputer

Butuh Node.js 20.9 atau lebih baru.

```bash
cd dahan-kopi
npm install && npm run dev
```

Buka http://localhost:3000. Setiap perubahan file langsung terlihat di browser.

## Mengganti teks, kontak, dan jam buka

Semua konten ada di **`data/site.ts`**. Komponen tidak perlu disentuh.

- **Teks**: ganti isi di antara tanda kutip. Teks cerita masih contoh; ganti dengan cerita asli.
- **Kontak**: bagian `contact` (telepon, nomor WhatsApp, pesan reservasi, Instagram).
  Nomor WhatsApp ditulis dengan kode negara tanpa `+` dan tanpa `0`, mis. `6282121651788`.
- **Alamat**: bagian `address`. Petunjuk masuk (mis. "parkir di sebelah kiri") di `location.directions`.
- **Jam buka**: bagian `openingHours`, format 24 jam.

  ```ts
  { label: "Senin–Jumat", days: ["mon", "tue", "wed", "thu", "fri"], open: "08:00", close: "22:00" },
  { label: "Sabtu–Minggu", days: ["sat", "sun"], open: "08:00", close: "23:00" },
  ```

  Kode hari: `mon` `tue` `wed` `thu` `fri` `sat` `sun`. Hari yang tidak dicantumkan dianggap libur.
  Jam tutup lewat tengah malam juga bisa (mis. `open: "10:00", close: "01:00"`).
  Status "Buka sekarang / Tutup" dihitung otomatis di browser pengunjung dengan zona waktu Asia/Jakarta.

- **Fakta & fasilitas** (halaman Tentang): `about.facts` (buka sejak, biji kopi, tempat duduk),
  `facilities[].detail` (mis. parkir "motor & mobil"), dan `about.faq`. Kolom yang kosong **tidak
  ditampilkan**, jadi isi hanya dengan info yang benar.
- **Google Maps**: bagian `maps`. `query` dipakai untuk peta dan tombol petunjuk arah. Agar lebih
  tepat, isi `placeUrl` dengan link "Bagikan" dari Google Maps, dan `embedUrl` dengan link dari
  Google Maps → Bagikan → Sematkan peta (ambil isi `src="..."`).

## Mengisi menu

Buka **`data/menu.ts`**. Isinya sekarang hanya **contoh**; ganti dengan menu asli.

```ts
{
  name: "Kopi Susu Dahan",
  description: "Espresso, susu segar, dan gula aren.", // opsional
  price: 25000,                                        // rupiah, tanpa titik (tampil "25")
  tags: ["HOT", "ICE"],                                // opsional: "HOT" dan/atau "ICE"
  featured: true,                                      // opsional: tampil di beranda
  image: "/images/menu/kopi-susu-dahan.jpg",           // opsional: foto kecil di bawah deskripsi
},
```

- Harga tampil ringkas seperti di buku menu (`25`, `27,5`), dengan catatan "Harga dalam ribu rupiah".
- Tambah item: salin satu blok `{ ... }` di dalam `items`.
- Tambah kategori: salin satu blok kategori dan beri `id` unik (huruf kecil, tanpa spasi).
  `id` dipakai di link, mis. `/menu#kopi`. Urutan di file = urutan di website.
- `featured: true`: item tampil di bawah "Kopi" atau "Makanan" di beranda (maks. 3 per kelompok).
- Teks halaman menu (judul, catatan harga) ada di `menuPage` (file yang sama).
- **Buku menu PDF**: ganti file `public/menu-dahan.pdf` dengan buku menu asli (nama file tetap sama).

## Memasukkan foto

Semua foto dicari di **`public/images/`** dengan nama yang sudah tertulis di `data/site.ts`.
Selama file belum ada, website menampilkan **kotak warna polos** berisi keterangan foto yang
dibutuhkan dan nama filenya. Begitu file disimpan dengan nama itu, foto asli langsung tampil
(saat `npm run dev`, atau setelah build/deploy berikutnya). Tata letak tidak berubah.

Daftar ini sekaligus panduan memotret:

| File                     | Foto yang dibutuhkan                              | Bentuk                |
| ------------------------ | ------------------------------------------------- | --------------------- |
| `hero-garden.jpg`        | Taman Dahan Kopi, siang (landscape, min. 2400 px) | lebar, objek di tengah |
| `story-bar.jpg`          | Bar kopi dari depan, barista sedang menyeduh      | 4:3                   |
| `highlight-coffee.jpg`   | Kopi di meja kayu, cahaya alami                   | 4:5 (tegak)           |
| `highlight-food.jpg`     | Makanan andalan dari atas                         | 3:2                   |
| `highlight-space.jpg`    | Taman lebar, kelihatan meja-meja                  | 21:9 (sangat lebar)   |
| `gallery-01.jpg` … `06`  | Taman sore, kopi susu, barista, ruang dalam, makanan, suasana malam | 1:1 |
| `about-front.jpg`        | Tampak depan atau pintu masuk                     | 21:9                  |
| `space-bar.jpg`          | Bar kopi                                          | 3:2                   |
| `space-indoor.jpg`       | Ruang dalam, meja kayu                            | 4:5                   |
| `space-garden.jpg`       | Taman                                             | 16:9                  |

Tips:

- Format JPG, cahaya alami, tanpa filter. Ukuran file di bawah ~1 MB sudah cukup; website otomatis
  mengecilkan dan mengubah ke format modern (AVIF/WebP) sesuai layar pengunjung.
- Foto dipotong otomatis mengikuti bingkainya. Jika bagian penting terpotong, atur titik fokusnya
  dengan `focus: "50% 30%"` (horizontal, vertikal) pada foto tersebut di `data/site.ts`.
- Perbarui juga teks `alt` (deskripsi foto) bila isi fotonya berbeda.
- Nama file boleh diganti; ubah `src`-nya di `data/site.ts`.

### Logo dan favicon

- Logo di navbar: `components/Logo.tsx` (SVG sementara: lingkaran berisi cangkir, plus tulisan
  "DAHAN KOPI").
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
app/                  Halaman (/, /menu, /tentang), layout, SEO (sitemap, robots, gambar share, ikon)
components/
  layout/             Navbar, footer (blok lokasi + peta), tombol WhatsApp melayang
  home/               Bagian beranda (foto utama, cerita, Kopi/Makanan/Ruang, galeri)
  menu/               Filter kategori & baris menu
  hours/              Status buka, jam hari ini, daftar jam buka
  ui/                 Komponen kecil: foto, link, tombol, baris bertitik, ikon
data/
  site.ts             Semua teks, kontak, jam buka, foto
  menu.ts             Isi menu
lib/                  Logika: jam buka (Asia/Jakarta), link WhatsApp/Maps, SEO, format harga
public/images/        Foto
public/menu-dahan.pdf Buku menu
assets/fonts/         Font untuk gambar share (lisensi SIL OFL)
```

## Menambah fitur nanti

- **Reservasi online**: buat `app/reservasi/page.tsx`, lalu di `data/site.ts` ubah
  `features.reservation.mode` menjadi `"page"`. Semua tombol "Reservasi" otomatis mengarah
  ke halaman tersebut (sekarang ke WhatsApp).
- **Pesan antar**: isi `features.delivery`, mis.
  `[{ name: "GoFood", url: "https://gofood.co.id/..." }]`. Link-nya otomatis muncul di halaman Menu.
- **Halaman baru**: buat folder di `app/` (mis. `app/acara/page.tsx`), tambahkan ke `navigation`
  di `data/site.ts` dan ke `app/sitemap.ts`.

## Perintah lain

```bash
npm run build      # build produksi (cek sebelum deploy)
npm run start      # jalankan hasil build
npm run lint       # cek kode dengan ESLint
npm run typecheck  # cek tipe TypeScript
npm run icons      # buat favicon.ico & apple-icon.png dari app/icon.svg
```

## Catatan desain

- Satu latar krem di semua halaman; warna espresso hanya untuk footer. Tidak ada teks di atas foto.
- Judul memakai Instrument Serif (uppercase), teks isi Plus Jakarta Sans, keduanya dari Google
  Fonts lewat `next/font`. Salinan font di `assets/fonts/` dipakai untuk membuat gambar share.
- Foto muncul pelan saat digulir dan foto Kopi/Makanan/Ruang membesar sedikit saat disorot mouse.
  Semua gerakan mati otomatis jika pengunjung memilih "kurangi gerakan" di perangkatnya.
