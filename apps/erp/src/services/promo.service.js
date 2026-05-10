// src/services/promo.service.js
// Engine promo / voucher dengan kuota, masa berlaku, marketer attribution.

import { AppError } from '../core/errorHandler.js';
import { uid } from '../core/id.js';

export class PromoService {
  constructor({ promoRepo }) {
    this.repo = promoRepo;
  }

  create({ code, description = '', type = 'percent', value, quota = 0, validFrom, validTo, marketerId = '' }) {
    if (!code) throw new AppError('NO_CODE', 'Kode promo wajib');
    if (!Number.isFinite(value) || value <= 0) throw new AppError('INVALID_VALUE', 'Nilai promo > 0');
    const upper = code.toUpperCase().trim();
    if (this.repo.list(p => p.code === upper).length) throw new AppError('CODE_EXISTS', 'Kode sudah ada');
    return this.repo.create({
      id: uid('pmo'), code: upper, description, type, value,
      quota, used: 0,
      validFrom: validFrom || new Date().toISOString(),
      validTo:   validTo   || '',
      marketerId, active: true,
    });
  }

  /**
   * Validasi kode promo & kembalikan diskon yg berlaku untuk subtotal tertentu.
   * Throw AppError bila tidak valid.
   */
  validate(code, subtotal) {
    const p = this.repo.list(x => x.code === (code || '').toUpperCase())[0];
    if (!p) throw new AppError('PROMO_NOT_FOUND', 'Kode promo tidak ditemukan');
    if (!p.active) throw new AppError('PROMO_INACTIVE', 'Kode promo tidak aktif');
    const now = new Date().toISOString();
    if (p.validFrom && p.validFrom > now) throw new AppError('PROMO_NOT_STARTED', 'Promo belum mulai');
    if (p.validTo   && p.validTo   < now) throw new AppError('PROMO_EXPIRED', 'Promo kadaluarsa');
    if (p.quota > 0 && p.used >= p.quota) throw new AppError('PROMO_QUOTA', 'Kuota promo habis');
    const discAmt = p.type === 'percent'
      ? Math.round(subtotal * (p.value / 100))
      : Math.round(p.value);
    return { promo: p, discAmt, marketerId: p.marketerId };
  }

  redeem(code) {
    const p = this.repo.list(x => x.code === (code || '').toUpperCase())[0];
    if (!p) return null;
    return this.repo.update(p.id, { used: (p.used || 0) + 1 });
  }
}
