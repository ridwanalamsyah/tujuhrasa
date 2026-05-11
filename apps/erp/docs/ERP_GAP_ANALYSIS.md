# ERP Gap Analysis — Tujuh Rasa

> Posisi saat ini: **sistem manajemen bisnis UMKM yang matang** (POS, order
> lifecycle, inventory multi-lokasi, HPP otomatis, finance summary, schedule
> recurring + conflict, reminder, audit, RBAC, backup/restore, dark mode,
> command palette).
>
> Untuk naik kelas menjadi **ERP penuh** (setara Odoo / SAP B1 / Zoho One pada
> skala UMKM-menengah), berikut gap yang masih perlu ditutup, dengan estimasi
> dan prioritas. Setiap modul disertai catatan integrasi pada arsitektur yang
> sudah ada (tidak perlu rewrite — tinggal `Schemas` baru, `Repository` baru,
> `Service` baru di `src/services/`).

Legenda prioritas: **P0** (wajib agar disebut ERP), **P1** (penting),
**P2** (nice-to-have), **P3** (untuk skala enterprise).

---

## 1. Akuntansi & Buku Besar (General Ledger) — P0
**Gap:** sistem sekarang menghitung profit dari order, tapi belum punya **double-entry bookkeeping**.
**Tambahkan:**
- `ChartOfAccounts` (Aset, Kewajiban, Modal, Pendapatan, HPP, Beban) dengan struktur hierarkis (parent/child).
- `JournalEntry` { lines: [{ accountId, debit, credit, ref }], date, source: 'order'|'po'|'manual' }.
- `LedgerService.post(entry)` — validasi `sum(debit) === sum(credit)`, immutable (entri salah → dibalik dengan reversing entry, bukan diedit).
- Auto-posting:
  - Order `lunas`     → DR Kas/Bank, CR Pendapatan, CR PPN Keluaran
  - Order checkout    → DR HPP, CR Persediaan
  - PO `diterima`     → DR Persediaan, CR Hutang Usaha (atau Kas)
  - Pembayaran biaya  → DR Beban, CR Kas
- Laporan turunan: **Buku Besar**, **Neraca Saldo**, **Laba Rugi**, **Neraca**, **Arus Kas**.

**Integrasi:** `LedgerService` berlangganan `bus.on('orders:updated', autoPost)`, `bus.on('purchaseOrders:updated', autoPost)`. Tidak menyentuh service lain.

## 2. Pajak (PPN, PPh) & Faktur Pajak — P0 (Indonesia)
**Gap:** harga sekarang final tanpa breakdown PPN.
**Tambahkan:**
- Field `taxes: [{ code: 'PPN_11', rate: 11, type: 'output' }]` pada Product/Order.
- `TaxService.calculate(line)` — inclusive/exclusive tax rules.
- E-faktur output: nomor seri faktur (NSFP), validasi NPWP, ekspor CSV format DJP/coretax.
- PPh 21/23 untuk komisi reseller & gaji.

## 3. Manajemen Pembelian Lanjutan & Workflow Approval — P0
**Gap:** PO sekarang hanya CRUD sederhana.
**Tambahkan:**
- **Multi-step approval**: Draft → Approval (oleh role koordinator/admin) → Dipesan → Sebagian/Diterima → Lunas/Closed.
- `ApprovalRule { resource, condition: 'amount > 5000000', approvers: ['role:admin'] }`
- Goods Receipt Note (GRN) terpisah dari PO — bisa receive sebagian.
- Three-way matching: PO ↔ GRN ↔ Invoice.
- Vendor bills (hutang) + jadwal pembayaran.

## 4. Manufacturing — BOM, MRP, Routing — P0
**Gap:** sekarang hanya `recipes[productId]` flat ingredient list.
**Tambahkan:**
- **Bill of Materials (BOM)** multi-level: produk jadi → sub-assembly → bahan baku.
- **Routing/Workcenter**: urutan operasi (mixing → bottling → labeling → QC) dengan estimasi waktu & biaya per workcenter.
- **MRP (Material Requirements Planning)**: dari forecast permintaan + stok aktual + lead time supplier → generate plan PO + plan produksi otomatis.
- **Production Order** (manufacturing order) terpisah dari Order penjualan, dengan progress per operasi (terhubung ke `progressEngine`).
- **Quality Control**: checkpoint per operasi (pass/fail/rework), defect tracking.

## 5. Multi-Gudang & Stock Operations Lanjutan — P0
**Gap:** `bandung/transit/samarinda` di-hardcode pada Product.
**Tambahkan:**
- `Warehouse[]` sebagai entity (dapat ditambah/dihapus).
- `StockLevel { productId, warehouseId, qty, reserved, available }` matrix.
- **Reservation system**: order pending mengurangi `available` tapi belum `qty`.
- **Lot/Batch tracking**: tiap produksi dapat lot number → traceability sampai bahan baku (penting untuk F&B & farmasi).
- **Expiry management**: warning H-7 / FIFO / FEFO picking.
- **Stock take/opname**: form penghitungan fisik + adjustment journal otomatis.

## 6. CRM — Lead/Opportunity Pipeline & Marketing — P1
**Gap:** sekarang hanya Customer (sudah jadi pelanggan).
**Tambahkan:**
- `Lead` { source, score, status: new/contacted/qualified/won/lost }.
- `Opportunity` { value, stage, probability, expectedClose }.
- Aktivitas: call, email, meeting (terhubung ke schedule).
- Email/WhatsApp marketing campaign + template + auto-follow up.
- Loyalty points, referral tracking.

## 7. HR & Payroll — P1
**Tambahkan:**
- `Employee` + kontrak + posisi + gaji pokok.
- `Attendance` (cek-in geo, shift) + Leave management.
- `PayrollRun` bulanan: gaji + tunjangan + insentif − potongan (BPJS, PPh 21) → Journal Entry otomatis.
- Performance review template.

## 8. Subscription / Recurring Billing — P1
Untuk model **reseller bulanan** atau **paket langganan**.
- `Subscription { customerId, planId, period: monthly, nextInvoiceAt }`.
- Auto-generate invoice → email/WhatsApp → recurring revenue dashboard.
- Proration, upgrade/downgrade.

## 9. Document Management & PDF Output — P1
**Gap:** belum ada export PDF.
**Tambahkan:**
- Template engine (Handlebars/Mustache) untuk Invoice, Quotation, Purchase Order, Delivery Order, Receipt.
- Generator PDF (jsPDF + autoTable, atau server-side via Chromium headless).
- Signed URL untuk attachment per resource (S3/Supabase Storage adapter).
- Versioning template — perubahan template tidak mempengaruhi dokumen yang sudah dicetak.

## 10. Multi-Currency & Multi-Company — P2
- `Currency { code, symbol, rate }` + auto-fetch kurs harian (BI/Open Exchange Rate).
- Tiap transaksi disimpan dalam **functional currency** + **transaction currency**.
- **Multi-company / multi-tenant**: 1 instance, banyak entitas hukum, antar-perusahaan dapat dikonsolidasi.

## 11. Budgeting, Forecasting & FP&A — P2
- `Budget { period, accountId, amount }` per departemen.
- Variance report: actual vs budget.
- Cash-flow forecasting 90-hari berbasis komitmen (PO outstanding, invoice jatuh tempo, payroll).
- Skenario analysis ("what-if harga kopi naik 10%?").

## 12. Workflow / Business Process Automation — P2
- BPMN-lite: definisikan state machine + transisi + actor.
- Misal: order ≥ 1 juta → wajib approval koordinator dulu sebelum produksi.
- Notification & SLA per step.
- Sudah didukung sebagian via `EventBus` — tinggal tambah `WorkflowEngine` deklaratif.

## 13. Reporting Builder & Dashboards Custom — P2
- User-definable dashboards (drag-drop widget) per role.
- Query builder (pilih dimensi/metric tanpa SQL).
- Scheduled report (kirim PDF/Excel ke email setiap Senin pagi).
- Export ke CSV/XLSX/PDF/JSON — sebagian sudah ada (JSON backup).

## 14. Audit Trail Tamper-Proof — P2
**Gap:** audit log saat ini bisa diedit/diganti via `localStorage`.
**Tambahkan:**
- Hash chain (Merkle): setiap entry menyimpan `hash(prevHash + entry)`.
- Optional: anchor hash periodik ke blockchain publik / external timestamping (RFC 3161).
- Read-only role: auditor eksternal hanya boleh `list()` audit, tidak boleh menulis ke koleksi lain.

## 15. Authentication & Security Lanjutan — P0
**Gap:** password sekarang `pw` plaintext di state.
**Tambahkan:**
- Hashing password (Argon2id / bcrypt) — jangan pernah simpan plaintext.
- 2FA (TOTP via authenticator app).
- Session JWT + refresh token, rotasi otomatis.
- Rate limiting login + lockout.
- Data encryption at rest untuk field sensitif (NIK, NPWP, rekening) menggunakan WebCrypto AES-GCM.
- Row-level security per record (dimulai dari RBAC yang sudah ada).

## 16. Backend & Sinkronisasi Multi-Device — P0 (untuk usaha riil)
**Gap:** sistem 100% client-side.
**Tambahkan:**
- **Backend pluggable**: implementasi `Repository` di atas Supabase / Firebase / REST API.
- **Sync engine**: outbox pattern + last-write-wins atau CRDT untuk offline-first.
- **WebSocket / SSE**: realtime updates antar perangkat (kasir A buka order, kasir B langsung lihat).
- **Conflict resolution UI**: kalau dua user edit data yang sama — minta resolve.
- **Backup terjadwal otomatis** ke cloud storage (S3/Drive).

## 17. Skala & Performa — P2
- Pagination, virtual list (`@tanstack/virtual`) untuk tabel >10 ribu baris.
- IndexedDB query terindex untuk pencarian cepat.
- Web Worker untuk: ekspor Excel besar, kalkulasi MRP, kalkulasi laba rugi.
- Progressive Web App (PWA): offline + install ke homescreen + push notification.

## 18. Internasionalisasi (i18n) & Aksesibilitas (a11y) — P2
- Ekstrak semua user-facing string ke `src/view/i18n/{id,en}.json`.
- `t('key', vars)` helper.
- `aria-label` lengkap, navigasi keyboard, kontras WCAG AA.
- RTL support kalau ekspansi ke Timur Tengah.

## 19. Testing & QA — P1
- **Vitest** sudah siap dipasang — cukup `npm i -D vitest`. Smoke test kita bisa diport.
- Target coverage: `src/core` 90%+, `src/services` 80%+.
- E2E: Playwright untuk flow utama (login → POS → checkout → order → reminder → backup).
- Visual regression: storybook + chromatic per komponen.
- Mutation testing (stryker) untuk kualitas test.

## 20. Observability — P3
- `logger` sudah berlapis sink — tambah:
  - **Sentry/Rollbar** sink untuk error production.
  - **PostHog/Plausible** untuk product analytics (event apa yang sering dipakai).
  - **OpenTelemetry**: trace antar layer (controller → service → repository → adapter).

## 21. Integrasi Eksternal — P1
- **Marketplace sync**: Tokopedia/Shopee/TikTok Shop → Order otomatis masuk.
- **Payment gateway**: Midtrans/Xendit untuk DP & pembayaran online.
- **Logistics API**: JNE/J&T/SiCepat → cek tarif, generate resi otomatis.
- **WhatsApp Business API** (Meta) untuk invoice & reminder otomatis (saat ini masih manual via `wa.me/`).
- **Akuntansi populer**: Accurate, Mekari Jurnal, Xero — export format mereka.

## 22. UX/UI Tingkat Lanjut — P2
Yang **sudah** ada di sistem:
- ✓ Light + Dark mode
- ✓ Command palette (⌘K)
- ✓ Notifikasi drawer
- ✓ Toast queue
- ✓ Empty states
- ✓ Skeleton loader (komponen siap)
- ✓ Keyboard shortcuts (⌘K, ⌘B, Esc)
- ✓ Delegated event handlers (ganti seluruh inline `onclick=`)
- ✓ Mobile responsive shell

Yang **patut ditambahkan**:
- Drag-and-drop kanban untuk order/production status.
- Inline editing tabel (klik sel → edit langsung).
- Bulk actions (pilih banyak order → ubah status massal).
- Undo/Redo (event-sourcing-friendly karena kita sudah ada EventBus).
- Print preview & PDF embedded preview.
- Onboarding tour (Shepherd.js).

---

## Roadmap Eksekusi yang Direkomendasikan

| Sprint | Modul | Output |
|--------|-------|--------|
| 1 (1-2 mgg) | Backend Supabase + Auth hashing + sync | Sistem siap multi-device, password aman |
| 2 (1 mgg)   | GL + Journal otomatis dari order/PO     | Laporan Laba-Rugi, Neraca akurat |
| 3 (1 mgg)   | PPN + Faktur Pajak                      | Compliance pajak Indonesia |
| 4 (2 mgg)   | BOM multi-level + MRP + Production Order| Manufacturing-grade |
| 5 (1 mgg)   | Multi-warehouse + lot tracking          | Skalabilitas operasional |
| 6 (1 mgg)   | Approval workflow + GRN                 | Kontrol pembelian rapi |
| 7 (1 mgg)   | PDF generator + invoice/PO/DO templates | Output dokumen siap kirim |
| 8 (1 mgg)   | Marketplace + Logistics + WA Business   | Otomasi kanal jualan |
| 9 (1 mgg)   | Vitest + Playwright coverage 80%        | Quality gate |
| 10 (1 mgg)  | PWA + Web Worker                        | Mobile-first, offline |

**Estimasi total:** ~12 minggu untuk versi 3.0 yang layak disebut ERP UMKM-menengah.

---

**Catatan penting:**
Karena fondasi arsitektur (Store, Repository, EventBus, Validator, ErrorHandler)
sudah solid, **setiap modul di atas dapat ditambahkan secara independen tanpa
rewrite**. Pola kerjanya selalu sama:

1. Tambah schema baru di `src/core/schemas.js`.
2. Tambah `Repository` baru di `app.js` (1 baris konstruksi).
3. Tulis `Service` baru di `src/services/` yang memanggil repository + emit event.
4. Tambah listener (auto-audit, auto-journal, auto-reminder) lewat `bus.on()`.
5. Tambah Controller / Page baru di `src/view/pages/` mengikuti pola yang ada.
6. Smoke test, lalu masuk ke layer presentasi.

Inilah keuntungan arsitektur **layered + event-driven + schema-first**.
