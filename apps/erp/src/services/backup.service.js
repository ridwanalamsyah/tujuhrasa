// src/services/backup.service.js
// Export/import seluruh state sebagai JSON terstruktur, dengan versioning
// schema agar import dari versi lama bisa dimigrasikan.

import { AppError } from '../core/errorHandler.js';
import { SCHEMA_VERSION } from '../core/schemas.js';

export class BackupService {
  constructor({ store, audit }) {
    this.store = store;
    this.audit = audit;
  }

  /**
   * Hasilkan objek backup. Gunakan downloader UI-layer untuk menulis file.
   */
  export() {
    const state = this.store.getState();
    return {
      app: 'tujuhrasa',
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        users: state.users,
        products: state.products,
        ingredients: state.ingredients,
        recipes: state.recipes,
        batches: state.batches,
        suppliers: state.suppliers,
        orders: state.orders,
        customers: state.customers,
        purchaseOrders: state.purchaseOrders,
        mutations: state.mutations,
        auditLogs: state.auditLogs,
        rbac: state.rbac,
        settings: state.settings,
        schedules: state.schedules || [],
      },
    };
  }

  /**
   * Import dari payload JSON. Memvalidasi struktur dasar, melakukan migrasi
   * minor antar versi, dan menulis kembali ke store sebagai operasi atomik.
   */
  import(payload, { mode = 'replace' } = {}) {
    if (!payload || typeof payload !== 'object') throw new AppError('BAD_BACKUP', 'Payload backup tidak valid');
    if (payload.app && payload.app !== 'tujuhrasa') throw new AppError('BAD_BACKUP', 'Backup bukan dari aplikasi ini');
    const data = this._migrate(payload);
    this.store.update('backup.import', () => mode === 'merge' ? this._merge(data) : data);
    this.audit?.add({ action: 'IMPORT', resource: 'backup', newValue: { mode, schemaVersion: payload.schemaVersion } });
  }

  _migrate(payload) {
    const ver = payload.schemaVersion || 1;
    let data = payload.data || payload; // backwards-compat: file lama tanpa wrapper
    if (ver === 1) {
      // contoh migrasi: field "schedules" tidak ada di v1.
      data = { ...data, schedules: data.schedules || [] };
    }
    return data;
  }

  _merge(data) {
    const cur = this.store.getState();
    const out = {};
    for (const k of Object.keys(data)) {
      const a = cur[k], b = data[k];
      if (Array.isArray(a) && Array.isArray(b)) {
        // Merge by id; entitas yang sama dipertahankan dari import.
        const map = new Map(a.map(x => [x.id, x]));
        for (const x of b) if (x?.id) map.set(x.id, x);
        out[k] = [...map.values()];
      } else if (a && b && typeof a === 'object' && typeof b === 'object') {
        out[k] = { ...a, ...b };
      } else {
        out[k] = b;
      }
    }
    return out;
  }
}
