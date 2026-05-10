// src/services/finance.service.js
// Analitik keuangan + insight + cash flow projection.
// Pure & deterministic. Tidak menulis state — hanya menghitung.

import { ProductCalc } from './product.service.js';

export class FinanceService {
  constructor({ orderRepo, productRepo, settingsRepo, purchaseRepo, paymentRepo, ledger }) {
    this.orders   = orderRepo;
    this.products = productRepo;
    this.settings = settingsRepo;
    this.purchases= purchaseRepo;
    this.payments = paymentRepo;
    this.ledger   = ledger;
  }

  /** Statistik agregat untuk dashboard. */
  stats({ from = null, to = null } = {}) {
    const orders = this.orders.list((o) =>
      o.status !== 'cancel' &&
      (!from || o.ts >= from) &&
      (!to   || o.ts <= to)
    );

    const omz   = orders.reduce((s, o) => s + (o.total || 0) + (o.ongkir || 0), 0);
    const paid  = (this.payments?.list() || [])
      .filter(p => {
        const o = this.orders.findById(p.orderId);
        return o && o.status !== 'cancel'
          && (!from || p.ts >= from) && (!to || p.ts <= to);
      })
      .reduce((s, p) => s + (p.amount || 0), 0);
    const sisa  = Math.max(0, omz - paid);

    const hppT  = orders.reduce((s, o) => {
      const p = this.products.findById(o.pid);
      return s + (o.hpp || (p ? ProductCalc.hpp(p) : 0)) * o.qty;
    }, 0);

    const settings = this.settings.get() || {};
    const fixed   = (settings.pk || 0) + (settings.ops || 0) + (settings.ins || 0);
    const profit  = omz - hppT - fixed;
    const margin  = omz > 0 ? profit / omz * 100 : 0;
    const poCost  = (this.purchases?.list((p) => p.status === 'diterima') || [])
      .reduce((s, p) => {
        if (p.items?.length) return s + p.items.reduce((t, it) => t + (it.qty || 0) * (it.price || 0), 0);
        return s + (p.qty || 0) * (p.price || 0);
      }, 0);

    return {
      orders: orders.length,
      omz, paid, sisa,
      hpp: { total: hppT },
      fixed, profit, margin,
      poCost,
    };
  }

  /** Insight otomatis berbasis ambang batas. */
  insights() {
    const out = [];
    const s = this.stats();
    if (s.orders === 0) return out;

    if (s.margin < 10) {
      out.push({
        severity: 'danger', code: 'LOW_MARGIN',
        title: 'Margin keuntungan rendah',
        detail: `Margin ${s.margin.toFixed(1)}% < target 10%. HPP terlalu tinggi atau diskon terlalu sering.`,
        action: 'Tinjau resep & harga bahan utama, kurangi diskon promo.',
      });
    } else if (s.margin > 35) {
      out.push({
        severity: 'info', code: 'HIGH_MARGIN',
        title: 'Margin sangat sehat',
        detail: `Margin ${s.margin.toFixed(1)}%. Pertimbangkan ekspansi produksi/marketing.`,
      });
    }

    if (s.sisa > s.paid * 0.4 && s.sisa > 0) {
      out.push({
        severity: 'warning', code: 'HIGH_RECEIVABLES',
        title: 'Piutang menumpuk',
        detail: `Sisa tagihan Rp ${Math.round(s.sisa).toLocaleString('id-ID')} cukup besar dibanding kas masuk.`,
        action: 'Kirim reminder pembayaran ke pelanggan dengan sisa tagihan.',
      });
    }

    // Pareto
    const byProduct = new Map();
    for (const o of this.orders.list((o) => o.status !== 'cancel')) {
      const cur = byProduct.get(o.pid) || { qty: 0, omz: 0, name: o.pname };
      cur.qty += o.qty;
      cur.omz += o.total || 0;
      byProduct.set(o.pid, cur);
    }
    const ranked = [...byProduct.values()].sort((a, b) => b.omz - a.omz);
    if (ranked.length >= 5) {
      const top20 = Math.max(1, Math.ceil(ranked.length * 0.2));
      const top  = ranked.slice(0, top20).reduce((sum, r) => sum + r.omz, 0);
      const total = ranked.reduce((sum, r) => sum + r.omz, 0);
      const share = total > 0 ? top / total * 100 : 0;
      if (share >= 70) {
        out.push({
          severity: 'warning', code: 'CONCENTRATION_RISK',
          title: 'Konsentrasi produk tinggi (Pareto)',
          detail: `Top ${top20} produk menyumbang ${share.toFixed(0)}% omzet — risiko ketergantungan.`,
          action: 'Diversifikasi katalog atau promosikan produk lain.',
        });
      }
    }
    return out;
  }

  monthlyTrend(year) {
    const out = Array.from({ length: 12 }, (_, m) => ({ month: m + 1, orders: 0, omz: 0, profit: 0 }));
    for (const o of this.orders.list((x) => x.status !== 'cancel')) {
      const d = new Date(o.ts);
      if (year && d.getFullYear() !== year) continue;
      const idx = d.getMonth();
      const net = (o.total || 0) + (o.ongkir || 0);
      const p = this.products.findById(o.pid);
      const hpp = (o.hpp || (p ? ProductCalc.hpp(p) : 0)) * o.qty;
      out[idx].orders += 1;
      out[idx].omz    += net;
      out[idx].profit += net - hpp;
    }
    return out;
  }

  /**
   * Profit-impact analyzer per produk: identifikasi "produk hero" & "anjlok".
   * Returns: [{ pid, name, qty, omz, profit, profitShare, status }]
   */
  productProfitImpact() {
    const map = new Map();
    for (const o of this.orders.list(o => o.status !== 'cancel')) {
      const cur = map.get(o.pid) || { pid: o.pid, name: o.pname, qty: 0, omz: 0, profit: 0 };
      cur.qty += o.qty;
      cur.omz += (o.total || 0);
      const p = this.products.findById(o.pid);
      const hpp = (o.hpp || (p ? ProductCalc.hpp(p) : 0)) * o.qty;
      cur.profit += (o.total || 0) - hpp;
      map.set(o.pid, cur);
    }
    const arr = [...map.values()];
    const totalProfit = arr.reduce((s, x) => s + x.profit, 0) || 1;
    return arr.map(x => {
      const profitShare = x.profit / totalProfit * 100;
      let status = 'normal';
      if (profitShare > 30) status = 'hero';
      else if (x.profit < 0) status = 'rugi';
      else if (profitShare < 5) status = 'rendah';
      return { ...x, profitShare, status };
    }).sort((a, b) => b.profit - a.profit);
  }

  /**
   * Cash flow projection N hari ke depan berbasis order outstanding (piutang),
   * PO outstanding (hutang), dan rata-rata pengeluaran rutin (ops + ins + pk).
   */
  cashflowProjection(days = 30) {
    const today = new Date();
    const settings = this.settings.get() || {};
    const monthlyFixed = (settings.pk || 0) + (settings.ops || 0) + (settings.ins || 0);
    const dailyFixed   = monthlyFixed / 30;

    // Proyeksi inflow harian = piutang outstanding dibagi rata pada 14 hari ke depan.
    const outstandingOrders = this.orders.list(o => ['pending', 'partial'].includes(o.status));
    const totalOutstanding  = outstandingOrders.reduce((s, o) => {
      const due  = (o.total || 0) + (o.ongkir || 0);
      const paid = (this.payments?.list(p => p.orderId === o.id) || []).reduce((q, p) => q + (p.amount || 0), 0);
      return s + Math.max(0, due - paid);
    }, 0);
    const inflowPerDay = totalOutstanding / 14;

    // Outflow: PO outstanding tersebar 7 hari, plus daily fixed cost.
    const outstandingPO = (this.purchases?.list(p => p.status === 'dipesan' || p.status === 'sebagian') || []);
    const totalPO = outstandingPO.reduce((s, p) => {
      if (p.items?.length) return s + p.items.reduce((t, it) => t + (it.qty || 0) * (it.price || 0), 0);
      return s + (p.qty || 0) * (p.price || 0);
    }, 0);
    const outflowPerDay = totalPO / 7 + dailyFixed;

    const series = [];
    let cumulative = 0;
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const inflow  = i < 14 ? inflowPerDay : 0;
      const outflow = (i < 7 ? totalPO / 7 : 0) + dailyFixed;
      cumulative += inflow - outflow;
      series.push({
        date: d.toISOString().slice(0, 10),
        inflow: Math.round(inflow),
        outflow: Math.round(outflow),
        net: Math.round(inflow - outflow),
        cumulative: Math.round(cumulative),
      });
    }
    return { series, totalOutstanding, totalPO, dailyFixed };
  }
}
