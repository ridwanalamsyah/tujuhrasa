# Deploy Tujuh Rasa — GitHub + Vercel + Supabase

> Panduan lengkap untuk men-deploy Tujuh Rasa secara permanen menggunakan
> GitHub (sumber kode) + Vercel (hosting) + Supabase (database opsional).
> Total waktu setup: ~15 menit.

---

## 1. Push ke GitHub (5 menit)

### A. Buat repo baru

1. Buka https://github.com/new
2. Repository name: `tujuh-rasa-erp` (atau bebas)
3. Visibility: **Private** (rekomendasi karena ada data bisnis) atau Public
4. **Jangan centang** "Initialize this repo with README" — kita sudah punya
5. Klik **Create repository**

### B. Push dari mesin lokal

```bash
cd tujuhrasa-arch                   # masuk ke folder project
git init
git add .
git commit -m "Initial commit: Tujuh Rasa ERP"
git branch -M main
git remote add origin https://github.com/<USERNAME>/tujuh-rasa-erp.git
git push -u origin main
```

Ganti `<USERNAME>` dengan username GitHub Anda.

> Kalau belum punya git, install dulu: `sudo apt install git` (Ubuntu) atau
> dari https://git-scm.com (macOS/Windows). Login pertama kali akan diminta
> Personal Access Token — buat di
> https://github.com/settings/tokens (scope: `repo`).

---

## 2. Deploy ke Vercel (3 menit)

### A. Cara cepat (rekomendasi)

1. Buka https://vercel.com/new
2. Login dengan akun GitHub yang sama
3. Klik **Import** pada repo `tujuh-rasa-erp`
4. **Framework Preset**: pilih **Other** (project ini static HTML/JS)
5. **Root Directory**: biarkan default (`.`)
6. **Build Command**: kosongkan
7. **Output Directory**: kosongkan (default = root)
8. Klik **Deploy**

Setelah ~30 detik, Vercel akan kasih URL seperti
`https://tujuh-rasa-erp.vercel.app`. Setiap push ke `main` akan auto-deploy.

### B. Custom domain (opsional)

Di Vercel dashboard → project → Settings → Domains → Add → masukkan
domain (mis. `erp.tujuhrasa.id`). Vercel akan kasih DNS records yang
harus dipasang di registrar domain Anda.

### C. Daftarkan Vercel URL ke Google OAuth

Setelah dapat URL Vercel:

1. Buka https://console.cloud.google.com/apis/credentials
2. Klik OAuth Client ID
3. Tambahkan ke **Authorized JavaScript origins**:
   - `https://tujuh-rasa-erp.vercel.app` (atau custom domain)
4. Save

Tanpa langkah ini, Google Sign-In akan error 401 di domain baru.

---

## 3. Aktifkan Supabase Backend (5 menit, opsional)

Tanpa Supabase, semua data tersimpan di `localStorage` browser. Cocok untuk
solo / single-device. **Aktifkan Supabase kalau Anda butuh:**

- Akses dari banyak perangkat (HP barista, laptop admin)
- Backup otomatis di cloud
- Multi-user real-time
- Data tidak hilang kalau browser cache di-clear

### A. Buat project Supabase gratis

1. Buka https://supabase.com → Sign up
2. New Project → isi nama (`tujuh-rasa`), password DB, region (Singapore)
3. Tunggu ~2 menit project ready

### B. Jalankan SQL schema

> **Penting:** Tujuh Rasa pakai **single key-value table** (`kv_store`) — bukan banyak tabel terpisah.
> Adapter di `src/core/storage.js` menyimpan seluruh state aplikasi (users, products, orders, dst.)
> sebagai entry JSON di tabel ini. Ini paling simpel untuk migrasi & realtime sync.

Di Supabase dashboard → **SQL Editor** → paste ini → klik **Run**:

```sql
-- Single key-value store untuk seluruh state Tujuh Rasa.
create table if not exists kv_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Index untuk query realtime payload
create index if not exists kv_store_updated_at_idx on kv_store (updated_at desc);

-- Aktifkan Row Level Security
alter table kv_store enable row level security;

-- Policy: anon key boleh read/write semua.
-- (Untuk multi-tenant production, tambah kolom owner_id + policy berbasis auth.uid().)
drop policy if exists "kv_store_anon_rw" on kv_store;
create policy "kv_store_anon_rw" on kv_store
  for all using (true) with check (true);

-- (Opsional) Aktifkan realtime untuk multi-device sync
alter publication supabase_realtime add table kv_store;
```

> Jika baris `alter publication` error karena belum ada publication, abaikan — tabel tetap berfungsi tanpa realtime.

### C. Ambil credentials

Settings → API → catat:

- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: `eyJhbG...`

### D. Aktifkan di app

1. Login ke Tujuh Rasa
2. **Pengaturan → Integrasi**
3. Tempel URL + anon key
4. Klik **Simpan & Aktifkan**
5. Reload halaman

Mulai sekarang semua data tersimpan di Supabase. Multi-device sync otomatis.

---

## 4. Update CI/CD workflow

Setelah pertama kali deploy, alur kerja Anda:

```
edit kode lokal → git commit → git push origin main
                                       ↓
                              Vercel auto-deploy (~30s)
                                       ↓
                              URL production langsung update
```

Vercel kasih preview URL untuk tiap PR/branch — bisa test sebelum merge.

---

## 5. Maintenance

### Backup data (kalau pakai localStorage)
**Pengaturan → Data → Export Backup** → simpan JSON ber-versi.

### Backup data (kalau pakai Supabase)
Supabase auto-backup harian (free tier: 7 hari retention).

### Update aplikasi
```bash
git pull origin main           # tarik perubahan terbaru
# edit kode
git add . && git commit -m "feat: ..."
git push origin main
```

### Restore dari backup
**Pengaturan → Data → Import** → pilih file JSON.

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "Error 401: invalid_client" Google login | Tambah origin Vercel ke Google OAuth |
| Vercel deploy gagal | Cek **Other** sebagai Framework Preset, build command kosong |
| Supabase tidak konek | Cek URL & anon key, pastikan SQL schema sudah jalan |
| Data hilang setelah update | Aktifkan Supabase atau export backup berkala |
| 404 di route `/orders` | Pastikan `vercel.json` rewrites aktif (sudah ada di repo) |

---

## Saran Lanjutan

- **Custom domain** dengan SSL otomatis di Vercel (gratis)
- **Vercel Analytics** untuk pantau traffic (gratis tier)
- **Supabase Auth** ganti email/password manual (lebih aman)
- **GitHub Actions** untuk run smoke test otomatis sebelum merge
- **Sentry** untuk error tracking production

Lihat juga: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) — versi setup awal.
