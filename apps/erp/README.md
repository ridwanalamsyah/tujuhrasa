# Tujuh Rasa — Sistem ERP Coffee

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ridwanalamsyah/tujuhrasa-erp)

Single-page ERP UMKM kopi: layered architecture (View → Controller → Service → Repository → Store → KVStore → StorageAdapter), schema-first validation, event-driven (EventBus), immutable Store, defensive errors, dan **glassmorphism Apple-style UI**.

> **Quick deploy:** baca [docs/DEPLOY.md](docs/DEPLOY.md) — total ~15 menit untuk setup GitHub + Vercel + Supabase.

## Highlights

| Domain | Fitur |
|---|---|
| **POS** | Kasir cepat, single-stock, **tanpa DP** — diganti modul `Payment` (cash/transfer/QRIS, partial → full lunas otomatis), dukungan kode promo. |
| **Order** | Lifecycle `pending → partial → paid → packing → shipped`, cancel-with-restock (auto-reverse journal). |
| **Inventory** | Stok bahan baku + produk-jadi single-location. Weighted-average price saat receivePurchase. |
| **HPP & Resep** | `recipes[productId] = [{id, qty, kind}]`. HPP otomatis di-recompute; revaluasi inventory saat harga bahan berubah. |
| **Akuntansi GL** | Chart of Accounts (18 akun default), double-entry journal, **auto-posting** dari order/payment/PO/wastage, Trial Balance, P&L, Neraca, Buku Besar. |
| **Recipe Card Barista** | SOP barista, yield (ml), suhu (°C), waktu (s) per produk + **What-if simulator** harga bahan → tabel before/after margin per produk + rekomendasi. |
| **Wastage** | Catat barang rusak/tumpah/expired. Otomatis ter-jurnal sebagai beban kerugian + tarik dari inventory. |
| **Production + MRP** | Plan → start → complete production order. Konsumsi bahan via BOM, masuk batch ke inventory. MRP saran PO untuk bahan kurang. |
| **Shift Kasir** | Open/close shift, hitung expected drawer (modal + cash payments), variance, handover note. |
| **Bagi Hasil + Poin** | Sistem **Effort + Output**: jam kerja × roleMultiplier + KPI output (order referral, customer baru, QC pass, revenue/Rp 1jt). Distribusi profit otomatis dengan reinvestment rate + opsional cap per user. Leaderboard live. |
| **Promo / Voucher** | Kode promo (% atau Rp), kuota, expiry, tracking marketer (poin reward saat redeem). |
| **Auth** | Email + password (PBKDF2-SHA-256 / WebCrypto) **+ Google Sign-In** (GIS) — Client ID di Settings (tidak hardcode). Foto profil dari upload manual atau otomatis dari Google. |
| **PWA** | Manifest + Service Worker (cache-first untuk shell statis). |
| **Backup** | Export/Import JSON ber-versi schema (mode replace/merge). Migrasi otomatis v2 → v3 (flatten multi-warehouse, hapus DP). |

## Arsitektur (ringkas)

```
View (pages/*.js, glassmorphism)
  ↓ data-action delegated
Controller (controllers/*)
  ↓
Service (services/*.js — domain logic, emit events)
  ↓
Repository (CollectionRepository, SingletonRepository)
  ↓ schema-validated
Store (immutable, shallow-frozen, microtask-batched)
  ↓ persist
KVStore + StorageAdapter (Memory / LocalStorage / IndexedDB / future REST)
```

EventBus menjadi tulang punggung integrasi: `orders:created`, `payments:received`, `wastage:recorded`, `production:done`, dst. Subsistem (Audit, Ledger, Points) cukup `bus.on(...)` — **tidak ada coupling antar service**.

## Schema v3

- `Product.stock`: integer (single-location).
- `Order`: tanpa `dp`. Field `paid` = `Σ payments[orderId].amount`. Status: `pending | partial | paid | packing | shipped | cancel`.
- `Payment`: koleksi terpisah (`{orderId, method, amount, ts, shiftId, cashierId}`).
- `Wastage`, `ProductionOrder`, `Account`, `JournalEntry`, `Timesheet`, `PointsActivity`, `Shift`, `Promo`: koleksi baru.
- `Settings.googleClientId`, `Settings.logoUrl`, `Settings.pointsConfig`: configurable di UI.

## Quickstart

```bash
# Static server lokal (no build step)
python3 -m http.server 8765
# Buka http://localhost:8765/index.html

# Smoke test (Node 18+)
node tests/smoke.test.js   # 30 passed, 0 failed
```

**Demo login**: `ridwan@tujuhrasa.id` / `ridwan123`

## Branch / Path / Files

```
src/
  core/            # store, repo, schemas, validator, eventBus, errorHandler, storage
  services/        # auth, audit, product, inventory, order, payment, ledger,
                   # wastage, production, timesheet, points, shift, promo,
                   # finance, scheduleEngine, reminder, progressEngine, backup
  controllers/     # pure delegated event-routing
  view/
    pages/         # dashboard, pos, orders, recipe, production, wastage,
                   # shifts, points, accounting, promo, settings, auth, ...
    shell.js, components.js, h.js, theme.js, icons.js, router.js
assets/styles.css  # design system + glassmorphism
docs/
  ARCHITECTURE.md
  ERP_GAP_ANALYSIS.md
tests/smoke.test.js
manifest.webmanifest
sw.js
index.html
```

## Verifikasi end-to-end

- 30/30 smoke test PASS
- Login email/password + Google Sign-In aktif (Client ID dari Settings)
- POS checkout single-stock + Payment partial→paid
- Recipe Card barista + What-if margin
- Wastage auto-journal beban kerugian
- Production order complete → batch produksi konsumsi BOM
- Shift open/close menghitung variance kas drawer
- Points distribute → leaderboard + share% sums ≈ 1
- Promo kode validasi & redeem
- GL: trial balance balance, P&L numeric, neraca seimbang
- Migration v2 → v3 (flatten multi-warehouse, hapus DP)
