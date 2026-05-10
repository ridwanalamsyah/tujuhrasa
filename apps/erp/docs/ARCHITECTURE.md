# Tujuh Rasa — Rekonstruksi Arsitektur (v2)

> Dokumen ini menjelaskan transformasi total `tujuhrasa-glass.html` (~4 073 baris,
> JS monolitik dengan global object `S`, ~175 inline event handler, akses
> langsung ke `localStorage`) menjadi sistem **data-driven, modular,
> production-ready, scalable, dan bebas-bug**.
>
> Output: penjelasan arsitektur + struktur data + alur logic + desain state
> management + implementasi modular JavaScript (ES modules) yang sudah
> diverifikasi via smoke test (`npm test` → 11/11 PASS).
>
> Bukan output: HTML/UI baru. Layer presentasi sengaja diserahkan ke framework
> modern (React/Vue/Svelte) atau view tipis berbasis template — semuanya bisa
> dipasang di atas core ini.

---

## 1. Diagnosa Sistem Lama

| Aspek                        | Kondisi sekarang                                                                  | Risiko                                                       |
|------------------------------|-----------------------------------------------------------------------------------|--------------------------------------------------------------|
| State                        | Single global `const S = { … }` dengan ~75 field bercampur (data + UI + chart instance) | Sulit di-trace, mutasi tersebar di 200+ tempat              |
| Persistence                  | Akses langsung `localStorage.setItem/getItem` di banyak fungsi                    | Tidak bisa diganti backend; data corruption tidak ditangani  |
| Event handling               | 175× inline `onclick=`/`onchange=` di template string                             | XSS-prone (esc inkonsisten), tidak scalable, tidak testable  |
| Validasi                     | Ad-hoc `if (!name) UI.toast('error')`                                             | Aturan duplikat, tidak ada source-of-truth                   |
| Error handling               | `try { … } catch(_){}` (silenced) atau crash                                      | Bug terselubung, sulit didiagnosa                            |
| HPP / progress / scheduling  | Logika tercampur dengan rendering DOM                                             | Tidak reusable, tidak deterministik                          |
| Audit log                    | `AuditLog.add()` dipanggil manual di tiap controller                              | Mudah lupa → audit gap                                       |
| Performance                  | Tidak ada debounce, semua re-render manual                                        | Lag pada list besar; banyak duplicate work                   |

## 2. Prinsip Arsitektur Baru

1. **Single Source of Truth** — semua data hanya di `Store`. Tidak ada modul yang menyimpan state-nya sendiri.
2. **Layered, Dependency-Inversion** — UI → Controller → Service → Repository → Store → KV → StorageAdapter. Layer atas hanya tahu interface layer bawah.
3. **Schema-First** — setiap entitas punya schema kanonis (`src/core/schemas.js`). Validasi terjadi di repository, bukan di UI.
4. **Immutable State Updates** — setiap update menghasilkan objek state baru (shallow-frozen). Tidak ada mutasi in-place.
5. **Defensive by Default** — semua input divalidasi, semua error dibungkus `AppError`, ada global handler untuk `uncaughtException`/`unhandledrejection`.
6. **Event-Driven Side Effects** — operasi sekunder (audit log, reminder, sync ke backend) berlangganan ke `EventBus` alih-alih dipanggil langsung.
7. **Performance-Aware** — debounce input, microtask-batched notifikasi subscriber, equality check pada selector.
8. **Storage-Agnostic** — `StorageAdapter` punya 3 implementasi siap pakai (`Memory`, `LocalStorage`, `IndexedDB`). Migrasi ke backend (Supabase/REST) cukup dengan menambah adapter baru tanpa mengubah service.

## 3. Diagram Lapisan

```
┌───────────────────────────────────────────────────────────────┐
│  View (HTML / framework — di luar scope dokumen ini)          │
│   ▲                                                           │
│   │  data via subscribe(selector)        emit user intent     │
│   ▼                                                           │
│  Controller (1 per fitur, pengganti inline handler)          │
│   ▲   delegated DOM events                                    │
│   │                                                           │
│   ▼   memanggil method service                                │
│  Service (logika bisnis murni)                                │
│   ▲   memanggil Repository                                    │
│   │                                                           │
│   ▼                                                           │
│  Repository (CRUD + validasi + emit domain event)             │
│   ▲                                                           │
│   ▼                                                           │
│  Store (centralized state, immutable, pub/sub)                │
│   ▲                                                           │
│   ▼                                                           │
│  KVStore (JSON-aware namespace)                               │
│   ▲                                                           │
│   ▼                                                           │
│  StorageAdapter (Memory / LocalStorage / IndexedDB / REST*)   │
└───────────────────────────────────────────────────────────────┘
                  ╲                              ╱
                   ╲    EventBus (lintas-modul) ╱
                    ╲                          ╱
                     ── ErrorHandler / Logger ──
```

## 4. Struktur State (Schema)

State adalah **flat object** dengan koleksi-koleksi domain. Setiap koleksi
diakses lewat `Repository`, dan setiap entitas mengikuti schema di
`src/core/schemas.js`. Versi schema ditandai (`SCHEMA_VERSION`) supaya migrasi
bisa otomatis (lihat §10).

```js
state = {
  setupComplete: boolean,
  currentUser:   string|null,    // user id

  users:           User[],
  products:        Product[],
  ingredients:     Ingredient[],
  recipes:         { [productId]: RecipeItem[] },
  batches:         Batch[],
  suppliers:       Supplier[],
  orders:          Order[],
  customers:       Customer[],
  purchaseOrders:  PurchaseOrder[],
  mutations:       StockMutation[],
  schedules:       ScheduleEvent[],
  notifications:   Notification[],
  auditLogs:       AuditEntry[],

  rbac:     { [role]: { [page]: 0|1 } },
  settings: Settings,
  checklist: boolean[],

  // Transient — tidak dipersist:
  posCart:     CartItem[],
  orderFilter: string,
};
```

Schema ringkas (selengkapnya di `schemas.js`):

* **User** — id, name, email (regex), pw (≥6), role∈{admin,koordinator,produksi,sales}, status∈{active,pending,disabled}.
* **Product** — id, name, cat, sku, supId, **bb,tk,oh,km,kg,mtk** (komponen HPP), sell≥0, gros, minStk, stock={bandung,transit,samarinda}.
* **Ingredient** — id, nama, satuan, stok≥0, minStok, harga, supplier.
* **RecipeItem** — id (ingredient ref), qty.
* **Order** — id, buyer, wa, city, pid, pname, qty≥1, sell, total, disc 0-100, ongkir, dp, status∈{pending,dp,packing,shipped,lunas,cancel}, metode∈{transfer,cash,qris,cod}, batch, ts, hpp_*.
* **Customer** — id, name, wa, city, email, orders, totalSpend.
* **PurchaseOrder** — id, supId, items[], status∈{draft,dipesan,sebagian,diterima,batal}.
* **ScheduleEvent** — id, title, type∈{produksi,pengiriman,meeting,deadline,lainnya}, start, end, recurrence={freq,interval,byWeekday[],until,count}, refId, notes.
* **Reminder/Notification** — id (stable), title, severity∈{info,warning,danger}, refType, refId, dismissed.
* **Settings** — name, color (hex), batch, kr/km/pk/ops/ins (komponen biaya tetap), waTplInvoice/Reminder, partnerNames[].

## 5. Data Abstraction Layer

```
StorageAdapter (raw bytes/strings)
   ├─ MemoryStorageAdapter      ← unit test, server-side
   ├─ LocalStorageAdapter       ← migrasi langsung dari versi lama
   └─ IndexedDBStorageAdapter   ← dataset besar (auditLog, history)

KVStore (JSON serialization, namespace, default value, error wrapping)

Repository (CRUD + validasi + domain event)
   ├─ CollectionRepository<T>  ← list/findById/create/update/delete
   └─ SingletonRepository<T>   ← get/set/patch (settings, recipes)
```

**Aturan ketat:** tidak ada modul di atas `KVStore` yang boleh memanggil
`localStorage` / `JSON.parse` / `JSON.stringify` langsung. Kalau perlu storage
baru (mis. REST API), buat adapter baru dan inject di `createApp()`.

## 6. Centralized State (`Store`)

* `getState()` mengembalikan referensi state shallow-frozen.
* `update(name, mutator)` — mutator menerima state lama, mengembalikan **patch** (dishallow-merge) atau `null` (no-op).
* `updateCollection(key, action, entity)` — helper khusus koleksi (create/update/delete by id).
* `subscribe(selector, listener, eq?)` — listener hanya dipanggil bila hasil selector berubah. Notifikasi di-batch via `queueMicrotask` agar 100 mutasi berurutan menghasilkan **1** kali render.
* Persistence transparan via `KVStore` — nama field transient (`posCart`, `orderFilter`) di-skip.
* `migrate(rawFromStorage)` — hook saat load: tambah field baru, normalisasi format lama, dst.

## 7. Validation Layer

`src/core/validator.js` menyediakan validator deklaratif:

```js
const orderSchema = v.object({
  qty:    v.integer({ min: 1, required: true }),
  status: v.enum(['pending','dp','packing','shipped','lunas','cancel'], { required: true }),
  email:  v.string({ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: 'Email tidak valid' }),
});
const { valid, issues } = validate(orderSchema, payload);
// atau langsung throw: assert(orderSchema, payload)  →  ValidationError
```

Repository memanggil `assert()` di `create()` dan `update()` sehingga **tidak
mungkin** ada data invalid masuk ke state. Pesan error berbahasa Indonesia dan
membawa `path` field yang gagal.

## 8. Error Handling Global

Hirarki error:

```
Error
└── AppError(code, userMessage, meta?, cause?)
    ├── ValidationError (issues[])
    ├── NotFoundError   (entity, id)
    ├── StorageError    (storage failures)
    └── PermissionError (RBAC)
```

`ErrorHandler.installGlobalHandlers()`:

* Browser: `addEventListener('error')` + `'unhandledrejection'`.
* Node: `process.on('uncaughtException'/'unhandledRejection')`.

Setiap error dilog (`logger`), lalu di-`emit('error', { code, userMessage })`.
View berlangganan `bus.on('error', toast)` untuk menampilkan UI feedback —
**tanpa** kebocoran detail teknis ke user.

## 9. Event-Driven Side Effects

`EventBus` adalah pub/sub minimalis. Konvensi nama:

* Domain CRUD: `users:created`, `orders:updated`, `products:deleted`.
* Sistem: `store:change`, `store:persisted`, `auth:login`, `error`, `toast`.
* Service-spesifik: `inventory:produced`, `order:checkout`, `reminder:scanned`.

Implikasi:
* **Audit log otomatis**: `AuditService.attachAutoAudit()` mendaftarkan listener untuk semua domain → tidak ada controller yang perlu memanggil `audit.add` manual lagi.
* **Reminder**: berlangganan `orders:updated` untuk re-evaluasi status.
* **Sync ke backend**: kalau Supabase aktif, modul sync cukup `bus.on('store:change', sendDelta)`.

## 10. Migrasi dari Versi Lama

`tr_erp_v2` (key lama) → struktur baru tanpa kehilangan data:

1. `LocalStorageAdapter` membaca raw key; jika ditemukan format lama, jalankan adapter migration:
   ```js
   migrate(raw) {
     // v1 → v2
     if (!raw.schedules) raw.schedules = [];
     if (!raw.notifications) raw.notifications = [];
     if (!raw.purchaseOrders[0]?.items) {
       // legacy: PO single-item → bungkus ke items[]
       raw.purchaseOrders = (raw.purchaseOrders || []).map(po => ({
         ...po,
         items: po.items || [{ ingredientId: po.ingId, qty: po.qty, price: po.price }],
       }));
     }
     return raw;
   }
   ```
2. `BackupService.import()` mendukung mode `replace` (default) dan `merge` (gabung by id) untuk konsolidasi data antar perangkat.

## 11. Modul Kunci (singkat)

### 11.1 ProductService — HPP Otomatis

```js
hpp = bb + tk + round(tk * mtk%) + oh + km + kg
```

`syncBBFromRecipes()` menyinkronkan field `bb` produk dengan harga ingredient
× resep — sehingga **kenaikan harga bahan otomatis** mengubah HPP produk dan
margin di seluruh aplikasi.

### 11.2 OrderService — Lifecycle

Status flow ketat: `pending → dp → packing → shipped → lunas`. `cancel` bisa
terjadi dari status apa pun dan **mengembalikan stok** (idempoten). `checkout`:

1. Validasi pembeli & cart (≥1 item).
2. Konsumsi stok lokasi `bandung` per item (atomik per item — bila item ke-N gagal, item 1..N-1 yang sudah dikurangi tetap ditulis sebagai order valid; dapat diubah ke transaksi penuh dengan menumpuk perubahan dulu).
3. Tulis Order entries lewat `OrderRepository.create()` (validasi schema).
4. Upsert ringkasan customer (`orders` count, `totalSpend`).
5. Emit `order:checkout` → audit + reminder picked up.

### 11.3 FinanceService — Insight Otomatis

* `stats({from, to})`: omzet, DP, sisa, HPP per komponen, profit, margin, biaya tetap, biaya PO diterima.
* `insights()`: heuristik (margin <10% danger, >35% info, piutang/dp ratio, konsentrasi Pareto top-20% produk ≥70% omzet).
* `monthlyTrend(year)`: array 12 bulan untuk chart.

### 11.4 ScheduleEngine — Recurring + Conflict

* `expand(event, windowStart, windowEnd)` — daily/weekly (byWeekday)/monthly, dengan `until` dan `count` cap.
* `listOccurrences(window)` — flatten + sort.
* `detectConflicts(occurrences, predicate)` — O(n log n) sweep, mendukung filter (mis. hanya tipe `produksi`).

### 11.5 ProgressEngine — Auto-Progress Berbasis Milestone

Generik (analog "auto-progress skripsi" pada prompt awal). Diterapkan ke
batch produksi / proyek bisnis di domain ini:

* `computeScore(project)` — weighted score 0-100.
* `classify(project, now)` → `{score, status}` di mana `status ∈ {on_track, at_risk, late, blocked, done}`. Ekspektasi vs aktual dihitung dari `startAt`/`dueAt`.
* `autoMarkFromActivities(project, rules)` — mark milestone `done` otomatis bila ada activity yang memenuhi kriteria (mis. milestone "QC selesai" auto-done bila ada ≥1 activity `kind=qc_pass`).

### 11.6 ReminderEngine — Deadline Scanner

Dijalankan periodik (`start({ intervalMs: 60_000 })`). Memindai 5 sumber:
1. Stok produk-jadi ≤ minStk.
2. Bahan baku ≤ minStok.
3. Order pending >3 hari.
4. Schedule occurrence ≤24 jam ke depan (atau sudah lewat).
5. PO `dipesan` >7 hari belum diterima.

Output: `state.notifications` (id stable agar tidak duplikat), `dismiss(id)`
mempersist flag.

### 11.7 BackupService — JSON Versioned

* `export()` → `{ app, schemaVersion, exportedAt, data: {...} }`.
* `import(payload, { mode: 'replace'|'merge' })` — migrasi otomatis berdasarkan `schemaVersion`.

## 12. Pengganti Inline Handler — Pola Controller

Di file lama:
```html
<button onclick="Orders.advance('${o.id}')">Lanjut</button>
```

Di arsitektur baru:
```html
<button data-action="order:advance" data-id="${o.id}">Lanjut</button>
```

`OrderController.mount()` memasang **satu** delegated listener pada root
container; semua tombol child ditangani lewat `data-action`. Keuntungan:
* Tidak perlu `esc()` template string yang rapuh — atribut `data-*` aman.
* Reusable di list besar — tidak perlu pasang N listener.
* Mudah di-mock untuk unit test (cukup dispatch `MouseEvent` ke root).

Pola yang sama berlaku untuk semua modul (POS, Customers, Products, dst).

## 13. Performance Playbook

| Hot path                          | Teknik                                                          | Implementasi                       |
|-----------------------------------|-----------------------------------------------------------------|------------------------------------|
| Search input                      | debounce 200-300 ms                                              | `perf.debounce`                    |
| Resize / scroll                   | throttle 100 ms                                                  | `perf.throttle`                    |
| Subscriber notify                 | Microtask batching                                               | `Store._scheduleNotify`            |
| Render filtered list              | Memoize selector by input args                                   | `perf.memoize`                     |
| Equality check selector           | `Object.is` referensi (state immutable)                          | `Store.subscribe`                  |
| Persist                           | Async + batched, skip transient                                  | `Store._schedulePersist`           |
| Audit log size                    | Bounded ring buffer (`maxEntries`)                               | `AuditService`                     |
| Recurring expansion               | `count`/`until` cap + window prune                               | `ScheduleEngine.expand`            |

## 14. Strategi Testing

`tests/smoke.test.js` (Node, ESM, tanpa dependency) memverifikasi alur ujung-
ke-ujung: bootstrap → validation → auth → store immutability → checkout
→ finance stats → schedule expansion+conflict → progress classification →
reminder scan → backup roundtrip. Jalankan:

```bash
npm test
# 11 passed, 0 failed
```

Untuk test lebih dalam, tambah Vitest/Jest:
* **Unit**: validator (truth-table per rule), ProductCalc.hpp, FinanceService.stats, ScheduleEngine.expand (cases: weekly+byWeekday, monthly DST, until before count).
* **Integration**: order checkout dengan stok tidak cukup → tidak ada order ditulis (atomicity).
* **Property-based**: idempotency `orders:advance` saat status sudah `lunas`, recurrence dengan `until` < `start`, validator round-trip.

## 15. Ekspansi ke Backend / Framework

Karena layer presentasi tidak terikat, langkah ekspansi:

1. **Tambah RestApiAdapter** yang implements interface `StorageAdapter` (atau `Repository`-level untuk granularitas lebih tinggi).
2. **Sync engine**: `bus.on('store:change', diff => api.patch(diff))`. Karena state immutable, diff trivial dihitung.
3. **Framework integration**:
   * React: `useSyncExternalStore(store.subscribe, store.getState)` → otomatis konsisten.
   * Vue: `reactive` proxy yang menyalin dari `store.getState()` di setiap event.
   * Svelte: writable store wrapper.
4. **Auth backend**: `AuthService` tinggal diganti dengan implementasi yang panggil API; signature tidak berubah.

## 16. Konvensi Kode

* ESM (`"type": "module"`), tanpa transpiler — file produksi siap dipakai langsung.
* Tidak ada framework mandatory.
* Tidak ada akses langsung ke `window.localStorage`, `document`, `JSON.parse` di service/repository — hanya di adapter atau view.
* Setiap service menerima dependency lewat constructor (DI manual). Composition root: `src/app.js`.
* Pesan error & user-facing string default berbahasa Indonesia (sesuai aplikasi).
* Tidak ada mutasi state in-place. Pakai spread / array-method yang return baru.
* Setiap modul ≤ ~250 baris; refactor bila membesar.

## 17. Daftar File

```
tujuhrasa-arch/
├── docs/
│   └── ARCHITECTURE.md            ← dokumen ini
├── src/
│   ├── app.js                     ← composition root
│   ├── core/
│   │   ├── id.js                  ← uid, shortCode
│   │   ├── logger.js              ← Logger (level + sinks)
│   │   ├── errorHandler.js        ← AppError + ErrorHandler
│   │   ├── eventBus.js            ← EventBus pub/sub
│   │   ├── perf.js                ← debounce/throttle/memoize/scheduler/shallowEqual
│   │   ├── storage.js             ← Memory/LocalStorage/IndexedDB adapters + KVStore
│   │   ├── validator.js           ← Validator deklaratif
│   │   ├── schemas.js             ← Schema kanonis seluruh entitas
│   │   ├── store.js               ← Centralized state, immutable, pub/sub
│   │   └── repository.js          ← CollectionRepository, SingletonRepository
│   ├── services/
│   │   ├── auth.service.js        ← AuthService + RBACService
│   │   ├── audit.service.js       ← AuditService (auto-audit dari domain events)
│   │   ├── product.service.js     ← ProductService + ProductCalc.hpp
│   │   ├── inventory.service.js   ← mutate/produceBatch/consume/receivePurchase
│   │   ├── order.service.js       ← checkout/advance/cancel/recordPayment
│   │   ├── finance.service.js     ← stats/insights/monthlyTrend
│   │   ├── scheduleEngine.service.js  ← expand recurring + conflict detection
│   │   ├── reminder.service.js    ← scanner periodik 5 sumber
│   │   ├── progressEngine.service.js  ← weighted milestone progress + auto-classify
│   │   └── backup.service.js      ← export/import JSON + migrate
│   └── controllers/
│       └── order.controller.js    ← contoh delegated event + subscribe (template untuk modul lain)
├── tests/
│   └── smoke.test.js              ← 11 test ujung-ke-ujung, lulus
└── package.json
```

## 18. Roadmap Lanjut

| Prioritas | Pekerjaan                                                          | Estimasi |
|-----------|---------------------------------------------------------------------|----------|
| P0        | Generate controllers untuk seluruh modul (POS, Products, Inventory, Customers, Invoice, Audit, Settings) sesuai pola `OrderController` | M        |
| P0        | Adapter Supabase (`SupabaseStorageAdapter` atau `SupabaseRepository`) menggantikan `tr_erp_v2`                | M        |
| P1        | Selector library tipis di atas `Store.subscribe` (memoized, composable)                                       | S        |
| P1        | Vitest setup + 80% coverage target untuk `src/core` & `src/services`                                          | M        |
| P2        | i18n: ekstrak string user-facing                                                                              | S        |
| P2        | Web Worker untuk ekspor XLSX besar agar UI tidak nge-freeze                                                    | M        |
| P2        | E2E (Playwright) di atas view yang baru                                                                        | M        |

---

**Status verifikasi**: `node tests/smoke.test.js` → **11/11 PASS** pada commit ini.
