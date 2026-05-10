// src/services/notification.service.js
// Generator pesan WhatsApp + Email untuk reminder/invoice/promo.
// Tidak mengirim langsung — open wa.me / mailto: agar zero dependency.
//
// Untuk pengiriman otomatis (broadcast piutang), butuh integrasi WA Business API
// atau wrapper seperti Fonnte. Wrapper ada di docs/INTEGRATIONS.md.

export class NotificationService {
  constructor({ orderRepo, paymentRepo, customerRepo, settingsRepo }) {
    this.orders    = orderRepo;
    this.payments  = paymentRepo;
    this.customers = customerRepo;
    this.settings  = settingsRepo;
  }

  /** Format nomor WA: 0812 → 62812, hapus karakter non-digit. */
  static normalizeWa(wa) {
    if (!wa) return '';
    let n = String(wa).replace(/[^\d]/g, '');
    if (n.startsWith('0')) n = '62' + n.slice(1);
    if (n.startsWith('8')) n = '62' + n;
    return n;
  }

  /** Build URL wa.me untuk reminder pembayaran. */
  buildPaymentReminderUrl(orderId) {
    const o = this.orders.findById(orderId);
    if (!o) throw new Error('Order tidak ditemukan');
    const wa = NotificationService.normalizeWa(o.wa);
    if (!wa) throw new Error('Customer belum punya nomor WA.');

    const paid = (this.payments.list(p => p.orderId === orderId) || [])
      .reduce((s, p) => s + (p.amount || 0), 0);
    const total = (o.total || 0) + (o.ongkir || 0);
    const sisa  = Math.max(0, total - paid);

    const settings = this.settings.get() || {};
    const tpl = settings.waTplReminder
      || `Halo {buyer},\n\nReminder pembayaran order *{orderId}* di {brand}.\nTotal: Rp {total}\nSudah dibayar: Rp {paid}\nSisa: *Rp {sisa}*\n\nMohon segera diselesaikan, terima kasih.`;
    const text = tpl
      .replace('{buyer}', o.buyer)
      .replace('{orderId}', o.id)
      .replace('{brand}', settings.name || 'Tujuh Rasa')
      .replace('{total}', total.toLocaleString('id-ID'))
      .replace('{paid}', paid.toLocaleString('id-ID'))
      .replace('{sisa}', sisa.toLocaleString('id-ID'));
    return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
  }

  /** Build URL wa.me untuk konfirmasi order siap kirim. */
  buildShippingNoticeUrl(orderId) {
    const o = this.orders.findById(orderId);
    if (!o) throw new Error('Order tidak ditemukan');
    const wa = NotificationService.normalizeWa(o.wa);
    if (!wa) throw new Error('Customer belum punya nomor WA.');
    const settings = this.settings.get() || {};
    const text = `Halo ${o.buyer},\n\nOrder *${o.id}* (${o.pname} x${o.qty}) sudah siap kirim hari ini dari ${settings.name || 'Tujuh Rasa'}.\nTerima kasih telah berbelanja!`;
    return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
  }

  /** List order dengan piutang outstanding > X hari. */
  outstandingOrders({ minDaysOld = 0 } = {}) {
    const now = Date.now();
    return this.orders.list(o => ['pending', 'partial'].includes(o.status))
      .map(o => {
        const ageMs = now - new Date(o.ts).getTime();
        const ageDays = Math.floor(ageMs / 86400000);
        const paid = (this.payments.list(p => p.orderId === o.id) || [])
          .reduce((s, p) => s + (p.amount || 0), 0);
        const total = (o.total || 0) + (o.ongkir || 0);
        const sisa = Math.max(0, total - paid);
        return { order: o, ageDays, sisa, total, paid };
      })
      .filter(x => x.ageDays >= minDaysOld && x.sisa > 0)
      .sort((a, b) => b.ageDays - a.ageDays);
  }
}
