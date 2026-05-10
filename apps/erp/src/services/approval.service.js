// src/services/approval.service.js
// Approval workflow untuk Purchase Order di atas threshold.
// Stateless service — menyimpan keputusan ke field PO langsung.

import { bus } from '../core/eventBus.js';

export class ApprovalService {
  constructor({ purchaseRepo, settingsRepo, auth }) {
    this.purchases = purchaseRepo;
    this.settings  = settingsRepo;
    this.auth      = auth;
  }

  threshold() {
    const s = this.settings.get() || {};
    return Number(s.approvalThreshold || 1_000_000);
  }

  poTotal(po) {
    if (!po) return 0;
    if (po.items?.length) {
      // Support both `price` (Schema) and `harga` (legacy/UI) fields.
      return po.items.reduce((s, it) => s + (it.qty || 0) * (it.price || it.harga || 0), 0);
    }
    return (po.qty || 0) * (po.price || po.harga || 0);
  }

  needsApproval(po) {
    return this.poTotal(po) >= this.threshold() && !po.approvedBy;
  }

  /** Approve PO; throws bila user bukan admin/koordinator. */
  approve(poId, { byUserId, role, note = '' } = {}) {
    if (!['admin', 'koordinator'].includes(role)) {
      throw new Error('Hanya admin/koordinator yang bisa setujui PO.');
    }
    const po = this.purchases.findById(poId);
    if (!po) throw new Error('PO tidak ditemukan.');
    if (po.approvedBy) throw new Error('PO sudah disetujui sebelumnya.');
    const approvedAt = new Date().toISOString();
    this.purchases.update(poId, {
      approvedBy: byUserId,
      approvedAt,
      approvalNote: note,
    });
    bus.emit('po:approved', { poId, byUserId, approvedAt });
    return this.purchases.findById(poId);
  }

  /** List PO menunggu approval. */
  pending() {
    return this.purchases.list(po =>
      po.status !== 'batal' && this.needsApproval(po)
    );
  }
}
