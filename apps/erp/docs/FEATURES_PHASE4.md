# Phase 4 — Feature Completion

Ringkasan fitur baru yang ditambahkan di phase ini.

## 1. Approval Workflow (PO)

**Lokasi:** `src/services/approval.service.js`, halaman *Purchase Order*.

- PO dengan total ≥ threshold (default Rp 1.000.000) menampilkan badge **"Perlu Approval"**
- Hanya role `admin` / `koordinator` yang bisa setujui via tombol **"✓ Setujui"**
- Setelah disetujui, tombol **"Terima"** baru tersedia untuk eksekusi penerimaan barang
- Threshold dapat diubah di **Pengaturan → Lanjutan → Approval Workflow**

## 2. Subscription / Membership

**Lokasi:** `src/services/subscription.service.js`, halaman **Subscription** (sidebar).

- Frekuensi: weekly / biweekly / monthly
- Auto-generate Order pending pada tanggal `nextDueDate` setiap startup app
- Tombol **"▶ Jalankan due hari ini"** untuk eksekusi manual
- Pause / Resume / Hapus per subscription
- Cocok untuk paket reseller / langganan kantor

## 3. Customer Analytics

**Lokasi:** `src/services/customerAnalytics.service.js`, halaman **Customer Analytics** (sidebar).

- **LTV** (Lifetime Value) per pelanggan
- **RFM segmentation:** Champion, Loyal, At Risk, Churned, New, Casual
- **Cohort retention:** matrix bulan-pertama-beli vs persentase masih beli pada bulan ke-N
- Repeat rate, average order value, top customers

## 4. Web Bluetooth Thermal Printer

**Lokasi:** `src/services/printer.service.js`.

- Driver ESC/POS untuk printer thermal Bluetooth 80mm
- Pair via **Pengaturan → Lanjutan → Pasang Printer** (sekali saja)
- POS auto-print thermal jika printer tersambung; fallback ke print() PDF kalau belum
- Hanya jalan di Chrome/Edge desktop & Chrome Android

## 5. WhatsApp Reminder Generator

**Lokasi:** `src/services/notification.service.js`, tombol **💬** di halaman Order.

- Tombol kirim reminder WA muncul di order pending/partial yang punya nomor WA
- Klik → buka `wa.me/<nomor>?text=<pesan terformat>` di tab baru
- Template pesan dapat di-custom di **Pengaturan → Bisnis → WA Templates**
- Format nomor otomatis dinormalisasi (08xxx → 628xxx)

## 6. Auto-Backup Harian

**Lokasi:** `src/services/autoBackup.service.js`.

- Cek setiap 30 menit; download file `tujuhrasa-backup-YYYY-MM-DD.json` jika belum hari itu
- Aktif by default, dapat dimatikan di **Pengaturan → Lanjutan → Backup Otomatis**
- Tombol **"Backup Sekarang"** untuk trigger manual
- File JSON struktur sama dengan Export manual → mudah restore via Import

## 7. AI Insight Generator (Local)

**Lokasi:** `src/services/aiInsight.service.js`, tombol **🤖 AI Digest** di Dashboard.

- Narasi ringkasan harian rules-based (omzet today vs yesterday, tren, stok kritis, top customer)
- Action items dengan prioritas (high/medium) berbasis margin, repeat rate, piutang
- Tombol "Salin teks" → bisa paste ke WA grup tim
- **Hooks untuk OpenAI:** field `settings.openaiKey` siap digunakan untuk versi berbasis LLM

## 8. Capacitor / Mobile Build

**Lokasi:** `capacitor.config.json`, panduan di `docs/MOBILE_BUILD.md`.

- App ID: `id.tujuhrasa.erp`
- Wrap PWA jadi APK Android atau IPA iOS
- Alternatif lebih ringan: TWA via Bubblewrap

## 9. Multi-Cabang Foundation

**Lokasi:** `Settings.branchId`, `Settings.branchName`.

- Setiap install instance bisa di-set `branchId` berbeda (e.g. `bandung`, `jakarta`)
- Saat sync via Supabase, data dari multiple cabang dapat dipilah berdasarkan `branchId`
- Fully wired untuk masa depan (filter laporan per cabang, transfer stok antar cabang)

## 10. Sentry Observability

**Lokasi:** `src/services/observability.service.js`.

- Lazy-load Sentry SDK dari CDN hanya jika `settings.sentryDsn` terisi
- Auto-capture global errors via EventBus listener
- Buffer error sebelum SDK ready, flush setelah init

---

## Cara mengaktifkan fitur baru

1. **Reload app** (Ctrl+Shift+R) untuk dapat versi v9-features
2. Buka **Pengaturan → Lanjutan** → set threshold approval, branch, sentry DSN, dll
3. Sidebar baru: **Subscription**, **Customer Analytics**
4. Dashboard: tombol **🤖 AI Digest** di header

## Pengujian

Smoke test 30/30 PASS. Semua service self-contained, tidak modifikasi pipeline/event yang sudah ada.

## Service-service yang siap diintegrasi (future work)

- `notification.service.js` — sudah ada generator WA URL; tinggal tambah listener untuk auto-send via Fonnte/WA Business API
- `observability.service.js` — Sentry skeleton, butuh DSN dari user
- `aiInsight.service.js` — narasi lokal, hooks untuk OpenAI ada di `settings.openaiKey`
- `customerAnalytics.service.js` — pure analytics, bisa export CSV per segment
