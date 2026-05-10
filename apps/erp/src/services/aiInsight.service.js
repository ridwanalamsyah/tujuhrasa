// src/services/aiInsight.service.js
// Generator narasi laporan harian — rules-based lokal (tanpa API).
// Hooks: jika settings.openaiKey terisi, future-version bisa kirim payload ke
// OpenAI API untuk narasi yang lebih natural. Untuk sekarang full deterministik.

export class AiInsightService {
  constructor({ finance, customerAnalytics, orderRepo, productRepo, settingsRepo }) {
    this.finance  = finance;
    this.cust     = customerAnalytics;
    this.orders   = orderRepo;
    this.products = productRepo;
    this.settings = settingsRepo;
  }

  rp(n) { return 'Rp ' + Math.round(n).toLocaleString('id-ID'); }

  /** Narasi laporan harian. */
  dailyDigest() {
    const today = new Date();
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const yesterdayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString();

    const todayStats = this.finance.stats({ from: dayStart });
    const yesterdayStats = this.finance.stats({ from: yesterdayStart, to: dayStart });

    const lines = [];
    lines.push(`📅 *Ringkasan ${today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}*`);
    lines.push('');
    lines.push(`Order hari ini: *${todayStats.orders}* (kemarin ${yesterdayStats.orders})`);
    lines.push(`Omzet: *${this.rp(todayStats.omz)}* (kemarin ${this.rp(yesterdayStats.omz)})`);

    if (yesterdayStats.omz > 0) {
      const delta = ((todayStats.omz - yesterdayStats.omz) / yesterdayStats.omz) * 100;
      const arrow = delta > 5 ? '📈' : delta < -5 ? '📉' : '➡️';
      lines.push(`Tren: ${arrow} ${delta >= 0 ? '+' : ''}${delta.toFixed(0)}% vs kemarin`);
    }

    const insights = this.finance.insights() || [];
    if (insights.length) {
      lines.push('');
      lines.push('*Hal penting:*');
      for (const i of insights.slice(0, 3)) {
        const icon = i.severity === 'danger' ? '🔴' : i.severity === 'warning' ? '🟡' : '🟢';
        lines.push(`${icon} ${i.title} — ${i.detail || ''}`);
        if (i.action) lines.push(`   → ${i.action}`);
      }
    }

    // Stok kritis
    const lowStock = this.products.list().filter(p => p.minStk > 0 && (p.stock || 0) <= p.minStk);
    if (lowStock.length) {
      lines.push('');
      lines.push(`📦 *${lowStock.length} produk* stok menipis:`);
      for (const p of lowStock.slice(0, 5)) {
        lines.push(`  • ${p.name}: ${p.stock} ${p.sat || 'pcs'} (min ${p.minStk})`);
      }
    }

    // Customer hero hari ini
    const todayOrders = this.orders.list(o => o.ts >= dayStart && o.status !== 'cancel');
    if (todayOrders.length > 0) {
      const byBuyer = {};
      for (const o of todayOrders) byBuyer[o.buyer] = (byBuyer[o.buyer] || 0) + (o.total || 0);
      const top = Object.entries(byBuyer).sort((a, b) => b[1] - a[1])[0];
      if (top) {
        lines.push('');
        lines.push(`🏆 Top customer hari ini: *${top[0]}* (${this.rp(top[1])})`);
      }
    }

    return lines.join('\n');
  }

  /** Saran tindakan (actionable list). */
  actionItems() {
    const out = [];
    const lowStock = this.products.list().filter(p => p.minStk > 0 && (p.stock || 0) <= p.minStk);
    if (lowStock.length) {
      out.push({
        priority: 'high',
        action: `Restock ${lowStock.length} produk yang menipis`,
        detail: lowStock.slice(0, 3).map(p => p.name).join(', '),
      });
    }

    const summary = this.cust.summary();
    if (summary.repeatRate < 30 && summary.totalCustomers >= 10) {
      out.push({
        priority: 'medium',
        action: `Repeat rate hanya ${summary.repeatRate.toFixed(0)}% — jalankan loyalty/promo retention`,
        detail: 'Target repeat rate >40%. Coba promo voucher untuk customer yang sudah 30+ hari tidak order.',
      });
    }

    const stats = this.finance.stats();
    if (stats.margin < 15 && stats.orders > 0) {
      out.push({
        priority: 'high',
        action: 'Margin di bawah 15% — review HPP & struktur harga',
        detail: 'Cek What-If Simulator di Recipe Card untuk reformulasi resep.',
      });
    }

    if (stats.sisa > stats.paid * 0.4) {
      out.push({
        priority: 'high',
        action: `Piutang ${this.rp(stats.sisa)} menumpuk — kirim WA reminder`,
        detail: 'Buka Order → filter Pending/Partial → tombol "Kirim WA reminder".',
      });
    }
    return out;
  }
}
