# Supabase Setup — Multi-Device Sync (Opsional)

Backend Supabase **opsional**. Default sistem berjalan offline-first via LocalStorage. Aktifkan Supabase hanya jika butuh:
- Multi-device / multi-user sync realtime
- Backup otomatis di cloud
- Akses dari banyak perangkat sekaligus

---

## 1. Buat Project Gratis

1. Buka https://supabase.com → Sign up dengan akun GitHub atau Google
2. Klik **New Project**
3. Isi nama project (mis. `tujuhrasa-coffee`), pilih region terdekat (Singapore), set **Database Password** yang kuat (simpan!)
4. Tunggu ±2 menit hingga project siap

## 2. Jalankan Schema SQL

Buka **SQL Editor** di dashboard Supabase Anda, copy-paste blok di bawah, lalu klik **Run**:

```sql
-- ────────────────────────────────────────────────────────────
-- Tujuh Rasa ERP — KV store skema
-- ────────────────────────────────────────────────────────────
create table if not exists kv_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id) default auth.uid()
);

create index if not exists kv_store_updated_at_idx on kv_store(updated_at desc);

alter table kv_store enable row level security;

-- Policy: hanya user yang sudah login (anon key + auth) yang dapat CRUD.
-- Untuk multi-tenant (mis. tiap UMKM punya project sendiri), policy ini cukup.
drop policy if exists "owner_rw" on kv_store;
create policy "owner_rw" on kv_store
  for all
  to authenticated
  using (true)
  with check (true);

-- Optional: enable realtime
alter publication supabase_realtime add table kv_store;

-- Auto-update updated_at
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$ language plpgsql;

drop trigger if exists kv_store_updated_at on kv_store;
create trigger kv_store_updated_at
  before update on kv_store
  for each row execute function set_updated_at();
```

## 3. Ambil Credentials

Di dashboard Supabase project Anda:

1. Buka **Settings → API**
2. Salin **Project URL** (mis. `https://xxxx.supabase.co`)
3. Salin **Project API keys → anon public** (key panjang dimulai `eyJ...`)

## 4. Aktifkan di App

1. Login ke Tujuh Rasa ERP
2. Buka **Pengaturan → Integrasi — Supabase Backend**
3. Tempel **Supabase URL** dan **Anon Key**
4. Klik **Simpan & Aktifkan**
5. **Reload halaman** (Ctrl+R)

Setelah reload, console akan menampilkan `[Storage] Supabase adapter aktif`. Semua data baru akan tersinkron ke cloud.

## 5. Migrasi Data Existing (LocalStorage → Supabase)

Sebelum mengaktifkan Supabase, **export backup terlebih dahulu**:

1. Pengaturan → Backup & Restore → **Ekspor JSON**
2. Aktifkan Supabase (langkah 4 di atas)
3. Reload halaman
4. Pengaturan → Backup & Restore → **Import JSON** (mode: Replace)
5. Data lama Anda kini ada di Supabase

## 6. Multi-Device Login

Setelah Supabase aktif, di perangkat lain:

1. Buka URL deploy yang sama (https://tujuhrasa-arch-wvjtlyyn.devinapps.com)
2. Login dengan akun yang sama (Google atau email/password)
3. Pengaturan → masukkan URL & Anon Key yang sama
4. Reload — data otomatis muncul

## 7. Backup & Restore Manual

Snapshot manual selalu tersedia:
- **Pengaturan → Backup & Restore → Ekspor JSON** (semua data → file)
- **Import JSON** (file → state app)

Format ber-versi schema, kompatibel antar deploy.

## 8. Auth Lanjutan (Future)

Untuk skenario multi-user yang lebih ketat (RLS per-user), tambahkan kolom `owner_id` ke setiap row dan policy:

```sql
alter table kv_store add column owner_id uuid references auth.users(id) default auth.uid();
drop policy "owner_rw" on kv_store;
create policy "owner_rw_self" on kv_store
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
```

## 9. Troubleshooting

| Gejala | Solusi |
|--------|--------|
| `Supabase GET 401` | Anon key salah / RLS terlalu ketat. Pastikan policy `to authenticated` ATAU pakai access token user. |
| Data tidak tersinkron | Cek console; pastikan `[Storage] Supabase adapter aktif` muncul. Reload setelah save settings. |
| Quota free tier habis | Free tier: 500MB storage, 50k rows. Cukup untuk UMKM kecil-menengah. Upgrade ke Pro $25/bln untuk skala lebih besar. |
| Realtime tidak bekerja | Load `@supabase/supabase-js` via CDN di `index.html`. Saat ini realtime nonaktif by default — sync polling tiap operasi sudah cukup untuk single-user. |

---

**Catatan**: SupabaseStorageAdapter sudah ter-include di repo (`src/core/storage.js`). Tidak ada paket NPM yang perlu di-install — pakai REST API langsung. Realtime channel butuh `@supabase/supabase-js` via CDN (opsional).
