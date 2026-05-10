// src/services/autoBackup.service.js
// Backup harian otomatis ke cloud (Supabase kv_store kalau aktif).
// Menyimpan snapshot di key `tr_backup:YYYY-MM-DD`. Retention: 7 entri terakhir.
// Manual export ke file tetap tersedia lewat tombol Settings → Backup → Download.

import { logger } from '../core/logger.js';

const KEY_LAST = 'tr_last_autobackup';
const BACKUP_PREFIX = 'tr_backup:';
const RETENTION = 7;

export class AutoBackupService {
  constructor({ backupSvc, settingsRepo, store, app }) {
    this.backup   = backupSvc;
    this.settings = settingsRepo;
    this.store    = store;
    this.app      = app || null;
    this._timer   = null;
  }

  todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  shouldBackupToday() {
    const last = (typeof localStorage !== 'undefined') ? localStorage.getItem(KEY_LAST) : null;
    return last !== this.todayKey();
  }

  /** Cloud backend (Supabase) aktif. KV lokal alone tidak qualify. */
  hasCloud() {
    if (this.app && this.app._supabaseActive) return true;
    if (typeof window !== 'undefined' && window.__supabaseActive) return true;
    return false;
  }

  start({ checkEveryMs = 6 * 60 * 60 * 1000 } = {}) {
    if (this._timer) return;
    // Tidak run langsung saat boot — tunggu interval pertama supaya app responsive dulu.
    this._timer = setInterval(() => this._tick(), checkEveryMs);
    // Run sekali setelah 30 detik supaya tidak ganggu first paint.
    setTimeout(() => this._tick(), 30_000);
  }

  stop() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
  }

  /** Backup harian otomatis: simpan snapshot ke cloud kalau aktif, atau skip kalau lokal-only. */
  async _tick() {
    const s = this.settings.get() || {};
    if (s.autoBackup === false) return;
    if (!this.shouldBackupToday()) return;
    if (!this.hasCloud()) {
      // Tanpa cloud: skip diam-diam (jangan auto-download ganggu user).
      return;
    }
    try {
      const snapshot = this.backup.export();
      const key = BACKUP_PREFIX + this.todayKey();
      await this.store._kv.set(key, snapshot);
      localStorage.setItem(KEY_LAST, this.todayKey());
      logger.info('[AutoBackup] Snapshot harian tersimpan ke cloud:', key);
      // Trim retention (best-effort, tidak critical kalau gagal).
      try { await this._trim(); } catch {}
    } catch (e) {
      logger.warn('[AutoBackup] gagal', e);
    }
  }

  async _backupKeys() {
    if (!this.hasCloud() || typeof this.store._kv.keys !== 'function') return [];
    const all = await this.store._kv.keys();
    return all.filter(k => k.startsWith(BACKUP_PREFIX));
  }

  async _trim() {
    const keys = await this._backupKeys();
    keys.sort();
    const toDelete = keys.slice(0, Math.max(0, keys.length - RETENTION));
    for (const k of toDelete) {
      try { await this.store._kv.remove(k); } catch {}
    }
  }

  /** List backup snapshot tersedia di cloud, sorted DESC (terbaru dulu). */
  async list() {
    const keys = await this._backupKeys();
    return keys.sort().reverse().map(k => ({ key: k, date: k.slice(BACKUP_PREFIX.length) }));
  }

  /** Restore snapshot dari cloud ke state aktif. */
  async restore(key) {
    if (!this.hasCloud()) throw new Error('Cloud belum aktif. Aktifkan Supabase untuk fitur ini.');
    const snap = await this.store._kv.get(key);
    if (!snap) throw new Error('Snapshot tidak ditemukan.');
    this.backup.import(snap);
  }

  /** Manual: trigger backup cloud sekarang (tanpa nunggu jadwal). */
  async runNow() {
    if (!this.hasCloud()) throw new Error('Cloud backup butuh Supabase aktif.');
    localStorage.removeItem(KEY_LAST);
    await this._tick();
  }

  /** Hitung jumlah snapshot cloud yg tersedia (untuk badge UI). */
  async count() {
    return (await this._backupKeys()).length;
  }

  /** Manual: download snapshot terbaru sebagai file (eksplisit user-action). */
  downloadCurrent() {
    if (typeof document === 'undefined') return;
    const json = JSON.stringify(this.backup.export(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tujuhrasa-backup-${this.todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}
