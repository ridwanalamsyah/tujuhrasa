# Dahan Kopi — Website

Website resmi **Dahan Kopi HQ**, coffee & eatery di Ciherang, Banjaran, Kabupaten Bandung.
_Rooted in Good Coffee, Made for Meaningful Moments._

Dibuat dengan Next.js 16 (App Router), TypeScript, dan Tailwind CSS 4. Semua halaman
dirender statis (SSG) dan siap di-deploy ke Vercel.

| Halaman          | Isi                                                                          |
| ---------------- | ---------------------------------------------------------------------------- |
| `/`              | Foto asli, Liter Series, lokasi HQ, pesan online (GoFood/Tokopedia/Shopee)   |
| `/shop`          | Liter Series + link Tokopedia & Shopee                                       |
| `/shop/[produk]` | Detail produk: ukuran, jumlah, tambah ke keranjang                           |
| `/checkout`      | Alamat pengiriman + pembayaran online (Midtrans)                             |
| `/lokasi`        | Alamat, jam buka, status buka, peta, reservasi WhatsApp                      |
| `/tentang`       | Cerita, ruang, fasilitas, kontak                                             |

Link di footer diambil dari Linktree Dahan (Lokasi HQ, GoFood, Tokopedia, Shopee, WhatsApp Admin HQ,
Instagram). Menu kafe sengaja tidak dicantumkan di website. Ubah di `data/site.ts` (`stores`, `contact`, `maps`) dan
`lib/dahan-links.ts`. Dahan Backyard (Cimahi) sengaja tidak dimasukkan.

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

## Mengisi produk toko

Buka **`data/products.ts`**. Isinya Liter Series dengan harga asli dari buku menu. Produk lain
Dahan dijual di Tokopedia & Shopee; tambahkan di sini hanya bila ingin dijual langsung di website.

```ts
{
  slug: "house-blend",                    // URL: /shop/house-blend
  name: "House Blend",
  category: "biji-kopi",                  // "biji-kopi" | "drip-bag" | "merch"
  tagline: "Cokelat, karamel, kacang",
  description: "…",
  details: [{ label: "Roast", value: "Medium-dark" }],
  variants: [
    { id: "200g", label: "200 g", price: 85000, weight: 250 },   // harga rupiah, berat kirim gram
    { id: "1kg", label: "1 kg", price: 370000, weight: 1050 },
  ],
  grinds: true,                           // pembeli memilih gilingan
  image: "/images/products/house-blend.jpg", // opsional: foto produk asli
  art: { bg: "#d9c7ae", body: "#2b1d16", ink: "#f1ece4", shape: "pouch" }, // gambar label sementara
},
```

- Selama `image` belum diisi (atau filenya belum ada), tampil gambar label berwarna dari `art`.
- Ongkos kirim flat dan batas gratis ongkir ada di `shop.shipping` (masih contoh, sesuaikan).
- Produk di beranda dipilih lewat `home.featuredProducts` di `data/site.ts`.

### Mengaktifkan pembayaran online (Midtrans)

1. Daftar di [midtrans.com](https://midtrans.com) dan ambil **Server Key** (Settings → Access Keys).
2. Di Vercel → Project → Settings → Environment Variables, tambahkan:
   - `MIDTRANS_SERVER_KEY` = Server Key Anda
   - `MIDTRANS_PRODUCTION` = `true` (kosongkan selama masih uji coba di sandbox)
3. Di dashboard Midtrans → Settings → Payment → Notification URL, isi
   `https://domain-anda/api/midtrans`.
4. Deploy ulang. Pembeli akan diarahkan ke halaman pembayaran Midtrans (QRIS, e-wallet, virtual
   account, kartu), lalu kembali ke `/checkout/selesai`. Daftar pesanan dan statusnya ada di dashboard
   Midtrans.

Selama `MIDTRANS_SERVER_KEY` belum diisi, tombol bayar menampilkan pilihan **kirim pesanan lewat
WhatsApp** dengan rincian pesanan, total, dan alamat yang sudah terisi.

## Memasukkan foto

Semua foto dan ilustrasi sekarang **asli Dahan**, diambil dari desain Canva ("Book Menu Dahan Clean
Version" dan label Liter Series) dan disimpan di **`public/images/dahan/`**:

| File                                    | Isi                                                   | Dipakai di                    |
| --------------------------------------- | ----------------------------------------------------- | ----------------------------- |
| `bottle-iced/helena/greentea.webp`      | Foto botol Liter Series (dari buku menu)               | Foto produk Liter Series      |
| `liter-bottles.webp`                    | Foto tiga botol Liter Series                           | Beranda, blok Liter Series    |
| `photo-interior.webp`                   | Bar kopi                                               | Beranda, Tentang              |
| `photo-cup.webp`                        | Gelas Dahan di dinding beton                           | Beranda                       |
| `photo-garden.webp`                     | Halaman depan dengan papan DAHAN                       | Beranda, Tentang, Lokasi, SEO |
| `photo-courtyard.webp`                  | Halaman belakang (versi gelap dari poster)             | Beranda (blok kedai), Tentang |

Untuk mengganti, simpan foto baru di `public/images/` lalu ubah `src` di `data/site.ts`
(atau `image` di `data/products.ts` untuk foto produk). Foto produk biji kopi, drip bag, dan merch
belum ada; selama kosong tampil gambar label berwarna.

Tips:

- Format JPG, cahaya alami, tanpa filter. Ukuran file di bawah ~1 MB sudah cukup; website otomatis
  mengecilkan dan mengubah ke format modern (AVIF/WebP) sesuai layar pengunjung.
- Foto dipotong otomatis mengikuti bingkainya. Jika bagian penting terpotong, atur titik fokusnya
  dengan `focus: "50% 30%"` (horizontal, vertikal) pada foto tersebut di `data/site.ts`.
- Perbarui juga teks `alt` (deskripsi foto) bila isi fotonya berbeda.
- Nama file boleh diganti; ubah `src`-nya di `data/site.ts`.

### Logo dan favicon

- Logo: `components/Logo.tsx` memakai path di `components/logo-paths.ts`, yang dilacak dari file
  logo asli di Canva (lencana "DAHAN KOPI" dan rumah berisi ranting). Jika ada file SVG resmi dari
  desainer, ganti isi `logo-paths.ts` dengan path-nya.
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
app/                  Halaman (/, /shop, /checkout, /lokasi, /tentang), API pembayaran, SEO
components/
  layout/             Navbar, footer (blok lokasi + peta), tombol WhatsApp melayang
  home/               Bagian beranda (foto utama, cerita, Kopi/Makanan/Ruang, galeri)
  shop/               Kartu produk, keranjang, checkout
  hours/              Status buka, jam hari ini, daftar jam buka
  ui/                 Komponen kecil: foto, link, tombol, baris bertitik, ikon
data/
  site.ts             Semua teks, kontak, jam buka, foto
  products.ts         Produk toko, ongkir, pilihan gilingan
lib/                  Logika: jam buka (Asia/Jakarta), link WhatsApp/Maps, SEO, format harga
public/images/        Foto
assets/fonts/         Font untuk gambar share (lisensi SIL OFL)
```

## Menambah fitur nanti

- **Reservasi online**: buat `app/reservasi/page.tsx`, lalu di `data/site.ts` ubah
  `features.reservation.mode` menjadi `"page"`. Semua tombol "Reservasi" otomatis mengarah
  ke halaman tersebut (sekarang ke WhatsApp).
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

- Putih dan hitam, satu huruf (Plus Jakarta Sans) untuk judul dan teks. Tanpa dekorasi: foto asli,
  garis tipis, dan teks.
- Warna hanya datang dari foto dan ilustrasi Dahan (label Liter Series).
- Gambar pratinjau link (`app/opengraph-image.tsx`) memakai logo lencana dan font di `assets/fonts/`.
- Semua gerakan mati otomatis jika pengunjung memilih "kurangi gerakan" di perangkatnya.
