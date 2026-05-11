# Tujuh Rasa — Workflow Assessment per Role

> Dokumen ini membedah alur kerja end-to-end per role, identifikasi gap, dan
> rekomendasi struktural agar tiap orang fokus pada job-nya.

## Ringkasan Role

| Role | Halaman utama (landing) | KPI utama | Output ke sistem |
|------|------------------------|-----------|------------------|
| Barista | `/pos` | order/jam, drink/jam | Order, struk, points |
| Sales | `/pos` | revenue/shift, conversion | Order, customer, points |
| Produksi | `/production` | batch/hari, QC pass-rate | Stock, journal HPP, points |
| Marketing | `/promo` | redemption, customer baru | Promo, points referral |
| Koordinator | `/orders` | OTD %, sisa piutang | Status order, payment |
| Admin | `/dashboard` | profit, kas, growth | Settings, points dist. |

## Alur Per Role

### 1) Barista (counter)
**Workflow tipikal:**
1. Buka shift kasir → set saldo awal
2. POS: pilih produk → tambah ke keranjang → pembayaran (cash/QRIS/transfer)
3. Cetak struk thermal otomatis
4. Recipe Card untuk drink baru (SOP + bahan)
5. Tutup shift → reconcile cash drawer

**Gap teridentifikasi:**
- ✗ Tidak ada quick-reorder untuk pelanggan reguler — barista harus ketik nama tiap kali. **Saran:** tombol "Order Ulang Terakhir" di profil customer.
- ✗ Wastage harus pindah halaman. **Saran:** shortcut "Catat Wastage" di topbar shift aktif.
- ✓ Recipe scaling slider sudah ada (drag "buat 50 cup" → real-time bahan).

### 2) Produksi
**Workflow tipikal:**
1. Cek MRP → lihat bahan mana yang harus di-PO
2. Buat Production Order (Recipe + Qty)
3. Saat selesai: tandai complete → stock produk jadi auto-tambah, bahan auto-kurang, jurnal HPP auto-post
4. Catat Wastage jika ada barang rusak
5. QC pass → dapat poin output

**Gap:**
- ✗ Tidak ada check batch FEFO (first-expired-first-out). **Saran:** tambah field `expDate` di stok bahan + sort warning.
- ✗ Cupping/sensory log absen. **Saran:** opsional tambahan di Production Order (di-skip user di iterasi sebelumnya, tapi bisa diaktifkan kapan saja).

### 3) Sales (POS + customer-facing)
**Workflow tipikal:**
1. Same as barista ditambah: input pembeli baru saat checkout
2. Apply promo code di POS
3. Follow up customer existing untuk repeat order

**Gap:**
- ✗ CRM pipeline absent (lead → order → repeat). **Saran:** halaman customer detail dengan timeline order + reminder follow-up.
- ✓ Quick filter per customer di Pelanggan page sudah ada via search.

### 4) Marketing
**Workflow tipikal:**
1. Buat promo code (modal "+ Buat Promo")
2. Distribusikan kode ke channel (manual)
3. Pantau redemption di Promo page
4. Saat pelanggan checkout pakai kode → marketer otomatis dapat poin
5. Akhir bulan: lihat leaderboard di Bagi Hasil & Poin

**Gap:**
- ✗ Tidak ada UTM tracking dari link sosial media. **Saran:** tambah field `utmSource` di order (manual atau dari URL param).
- ✗ Tidak ada export list customer untuk bulk WA blast. **Saran:** sudah ada CSV export di Pelanggan page.
- ✓ Daily digest popup sekarang menampilkan KPI pagi hari.

### 5) Koordinator (operasional & follow-up)
**Workflow tipikal:**
1. Pantau Order: lifecycle pending → partial → paid → packing → shipped
2. Pencatatan pembayaran cicilan
3. Hubungi pelanggan piutang
4. Atur jadwal pengiriman

**Gap:**
- ✗ Bulk action tidak ada (tandai banyak order packing sekaligus). **Saran:** checkbox per row + bulk button.
- ✗ Reminder otomatis untuk piutang > 30 hari belum aktif. **Saran:** sudah ada `reminderEngine`, tinggal tambah scanner piutang aging.
- ✓ Quick filter pills + status filter sudah memadai.

### 6) Admin (helicopter view + decision)
**Workflow tipikal:**
1. Dashboard: lihat KPI omzet/profit/piutang harian
2. Akuntansi: P&L, Neraca, Trial Balance
3. Bagi Hasil: distribusi profit bulanan
4. Pengguna: assign role
5. Pengaturan: brand, integrasi, output points config

**Gap:**
- ✗ Tidak ada audit per-user view (lihat aktivitas user X). **Saran:** filter "By User" di Audit Log page (sebagian sudah ada via filter generic).
- ✗ Approval workflow untuk PO besar absent. **Saran:** P1 — tambah `requiresApproval` di PO + role admin sebagai approver.

## Rekomendasi Struktural

### A. Cross-Role
1. **Notification drawer kanan** — semua role lihat reminder yang relevan saja (RBAC-filtered). Saat ini drawer ada tapi tidak filtered per role.
2. **Audit footprint per aksi** — auto-attach `userId + role` ke setiap `audit.log` (sudah jalan).
3. **Hotkey global** — saat ini `Esc` close modal, `?` show shortcut. Bisa ditambah `n` = new (context-aware: di Pelanggan = customer baru, di Order = order baru).

### B. Penyederhanaan UI (sudah dieksekusi v6)
- ✅ Hilangkan ⌘K palette (jarang dipakai user awam)
- ✅ Topbar minimalis: brand · spacer · theme · bell · avatar
- ✅ Settings di-tab pill (5 tab)
- ✅ Modal "+ Tambah" universal untuk Customer/Supplier/User/Promo
- ✅ Quick filter pills di Order, Finance, Reports
- ✅ Daily ops digest popup pagi
- ✅ PWA install prompt halus (toast saat eligible)
- ✅ CSV export di halaman utama

### C. Belum Dieksekusi (rekomendasi P1 berikutnya)
- ☐ Loyalty: customer ke-10 cup gratis (auto-trigger via `bus.on('orders:lunas', applyLoyalty)`)
- ☐ Subscription kopi mingguan (entity `Subscription` + scheduler harian)
- ☐ Equipment maintenance schedule (sudah ada `scheduleEngine`)
- ☐ Approval workflow PO besar
- ☐ FEFO/expiry tracking di Inventory
- ☐ Mobile-first polish 360px (sebagian sudah responsive, perlu testing menyeluruh)
- ☐ Backend Supabase (skeleton siap — user tinggal aktifkan dari Settings)

## Workflow Diagram (per Order)

```
   POS → checkout
     ↓
   OrderService.checkout
     ├─→ stock-deduction atomic
     ├─→ payment.create (kalau ada)
     ├─→ ledger.post (Penjualan, HPP, Kas/Piutang)
     ├─→ points.award (referral marketer if couponCode)
     ├─→ audit.log
     └─→ pdf.thermal (auto-print)
     ↓
   Status lifecycle: pending → partial → paid → packing → shipped
     ↓
   Customer.totalSpend update
     ↓
   reminderEngine: alert kalau >30 hari belum lunas
```

## Score Tiap Role (post-v6)

| Role | Workflow Coverage | Friction | Score |
|------|------------------|----------|-------|
| Barista | 90% | rendah | 9/10 |
| Produksi | 85% | rendah | 8/10 |
| Sales | 88% | rendah | 8/10 |
| Marketing | 82% | sedang (butuh UTM) | 8/10 |
| Koordinator | 75% | sedang (butuh bulk action) | 7/10 |
| Admin | 92% | rendah | 9/10 |

**Total system maturity:** ~84% sebagai ERP UMKM kopi end-to-end. Sisa 16% adalah fitur enterprise (approval, multi-company, subscription, mobile native) yang relevan untuk fase scaling.
