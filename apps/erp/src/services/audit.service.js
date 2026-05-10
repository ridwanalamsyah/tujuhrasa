// src/services/audit.service.js
// Audit log service. Setiap perubahan domain bisa dipanggil di sini, atau
// dipasang sebagai listener bus (auto-audit lewat domain events).

import { uid } from '../core/id.js';
import { bus } from '../core/eventBus.js';

export class AuditService {
  constructor(store, { maxEntries = 5000 } = {}) {
    this.store = store;
    this.max = maxEntries;
  }

  add({ action, resource, resourceId = null, oldValue = null, newValue = null, userId = null, userName = '' }) {
    const entry = {
      id: uid('audit'),
      action,
      resource,
      resourceId,
      oldValue: oldValue ? safeStringify(oldValue) : null,
      newValue: newValue ? safeStringify(newValue) : null,
      userId,
      userName,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    this.store.update('audit.add', (s) => {
      const logs = (s.auditLogs || []).slice();
      logs.push(entry);
      // Jaga ukuran log agar persistence tidak meledak.
      while (logs.length > this.max) logs.shift();
      return { auditLogs: logs };
    });

    bus.emit('audit:added', entry);
    return entry;
  }

  list(filter) {
    const all = this.store.getState().auditLogs || [];
    if (!filter) return all.slice();
    return all.filter((l) =>
      (!filter.userId || l.userId === filter.userId) &&
      (!filter.action || l.action === filter.action) &&
      (!filter.resource || l.resource === filter.resource) &&
      (!filter.from || l.timestamp >= filter.from) &&
      (!filter.to || l.timestamp <= filter.to)
    );
  }

  /**
   * Auto-attach: dengarkan event domain `:created/:updated/:deleted` dan
   * tulis audit secara otomatis. Ini menggantikan kebiasaan menulis
   * AuditLog.add(...) berulang di setiap controller.
   */
  attachAutoAudit({ getCurrentUser, domains = [] }) {
    const offs = [];
    const map = { created: 'CREATE', updated: 'UPDATE', deleted: 'DELETE' };
    for (const d of domains) {
      for (const ev of Object.keys(map)) {
        offs.push(bus.on(`${d}:${ev}`, (payload) => {
          const u = getCurrentUser?.() || {};
          this.add({
            action: map[ev],
            resource: d,
            resourceId: ev === 'updated' ? payload?.next?.id : payload?.id,
            oldValue: ev === 'updated' ? payload?.prev : (ev === 'deleted' ? payload : null),
            newValue: ev === 'updated' ? payload?.next : (ev === 'created' ? payload : null),
            userId: u.id || null,
            userName: u.name || '',
          });
        }));
      }
    }
    return () => offs.forEach(fn => fn());
  }
}

function safeStringify(v) {
  try { return JSON.stringify(v); } catch { return String(v); }
}
