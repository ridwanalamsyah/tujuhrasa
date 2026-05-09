# Tujuh Rasa

Kopi botolan nusantara — full-stack storefront yang **menarik produk live dari ERP**.

Menu (kopi, matcha, susu, seasonal) dibaca real-time dari ERP Tujuh Rasa di Supabase
— `state.products[]`. Kafe atur stok/harga/SOP barista di ERP, web otomatis ikut.
Dibangun sebagai single-repo Next.js app dengan API routes bawaan, Prisma ORM
(stub by-SKU untuk FK keranjang), dan SQLite untuk preview lokal.

## Fitur

**Customer-facing**
- Landing page (`/`) — hero parallax botol ERP, marquee menu, alasan kami, lineup, langganan, jurnal
- Toko (`/shop`) — grid produk dari ERP dengan filter kategori (Kopi/Matcha/Susu/Seasonal)
- Detail produk (`/shop/[slug]`) — SKU, kategori, satuan, volume, SOP barista (live ERP)
- Cart drawer slide-in (semua halaman) — update qty, hapus, total + ongkir gratis di atas Rp 150rb
- Checkout (`/checkout`) — form pengiriman + 4 metode pembayaran (GoPay/OVO/BCA VA/COD) + promo
- Konfirmasi pesanan (`/order/[orderNumber]`)
- Riwayat pesanan (`/account/orders`)
- Langganan (`/langganan`) — 3 jadwal × 3 ukuran kotak × 4 paket
- Jurnal (`/cerita`, `/cerita/[slug]`) — blog artikel
- Tentang (`/tentang`)

**Admin/Backend**
- Admin dashboard (`/admin`) — produk live ERP, pesanan, langganan, ringkasan revenue, sync log
- Admin gate via password (`/admin/login`, env `ADMIN_PASSWORD`, cookie `tr_admin` 7 hari, HMAC-SHA256)
- API routes:
  - `GET /api/products` — list (filter by `?cat=Kopi|Matcha|Susu|Seasonal`) — dibaca dari ERP
  - `GET/POST /api/cart` — list/add
  - `PATCH/DELETE /api/cart/[itemId]` — update/remove
  - `POST /api/checkout` — buat pesanan + push ke ERP (orders/customers/payments/points/stock)
  - `POST /api/subscribe` — daftar langganan + push ke ERP
  - `POST /api/admin/login` — set cookie sesi admin
  - `POST /api/admin/logout` — clear cookie

**Integrasi ERP**
- Produk dibaca live dari `state.products[]` ERP Supabase (fallback ke SQLite kalau ERP unreachable)
- Order checkout otomatis push ke ERP (`state.orders[]`, `state.customers[]`, `state.payments[]`, `state.pointsActivities[]`, decrement `state.products[i].stock`)
- Promo code divalidasi ke ERP dulu, fallback ke local PromoCode

## Stack

- **Next.js 14** App Router, TypeScript, React 18
- **Tailwind CSS** untuk styling, `Fraunces` (serif italic) + `JetBrains Mono` + `Inter`
- **Prisma 5** + SQLite (siap di-swap ke Postgres)
- **Zod** untuk validasi request body
- **Cookie-based session** untuk keranjang (no NextAuth dependency)
- Inline SVG bottle illustrations (tanpa lisensi gambar foto)

## Cara jalanin lokal

Prasyarat: Node 18+ dan npm.

```bash
cp .env.example .env       # isi ERP_SUPABASE_ANON_KEY + ADMIN_PASSWORD
npm install && npm run setup && npm run dev
```

Lalu buka **http://localhost:3000**.

DB lokal: `prisma/dev.db` (SQLite). Hapus dan re-seed kapan saja.

## Cara akses admin

1. Buka `http://localhost:3000/admin`
2. Auto-redirect ke `/admin/login`
3. Masukkan password (default `tujuhrasa`, atau ubah env `ADMIN_PASSWORD`)
4. Cookie `tr_admin` aktif 7 hari
5. Logout: tombol `keluar` di header `/admin`

Untuk production, **wajib** set env `ADMIN_SESSION_SECRET=...` dengan random string panjang.

## Struktur

```
src/
  app/
    page.tsx                         # landing
    shop/page.tsx, [slug]/page.tsx
    cart/page.tsx
    checkout/page.tsx
    order/[orderNumber]/page.tsx
    account/orders/page.tsx
    langganan/page.tsx
    cerita/page.tsx, [slug]/page.tsx
    tentang/page.tsx
    admin/page.tsx
    api/
      products/route.ts
      cart/route.ts, [itemId]/route.ts
      checkout/route.ts
      subscribe/route.ts
  components/
    Nav.tsx, Footer.tsx, Bottle.tsx (fallback bottle by category color)
    AddToCart.tsx, CategoryFilter.tsx, CartItemRow.tsx, CartDrawer.tsx
    CheckoutForm.tsx, SubscribeForm.tsx
  lib/
    prisma.ts, cart.ts
prisma/
  schema.prisma
  seed.ts
```

## Catatan demo

- Pembayaran disimulasikan — tidak ada gateway nyata.
- Halaman `/admin` di-gate password (cookie `tr_admin`). `/account/orders` masih terbuka untuk demo.
- DB SQLite untuk lokal. Untuk production, tukar `provider` di `schema.prisma` ke `postgresql` dan ubah `DATABASE_URL`.
- ERP integration optional — set `ERP_SYNC_ENABLED=false` di `.env` untuk mode lokal saja.
