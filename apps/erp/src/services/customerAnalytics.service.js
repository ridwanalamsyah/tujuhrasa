// src/services/customerAnalytics.service.js
// Cohort, LTV, repeat rate, retention, RFM segmentation.
// Pure analytics — tidak menulis state.

export class CustomerAnalyticsService {
  constructor({ orderRepo, customerRepo, paymentRepo }) {
    this.orders    = orderRepo;
    this.customers = customerRepo;
    this.payments  = paymentRepo;
  }

  /** Kelompokkan order per customer (by buyer name + wa). */
  _byCustomer() {
    const map = new Map();
    for (const o of this.orders.list(o => o.status !== 'cancel')) {
      const key = `${o.buyer}|${o.wa || ''}`;
      const cur = map.get(key) || { name: o.buyer, wa: o.wa, orders: [], spend: 0 };
      cur.orders.push(o);
      cur.spend += (o.total || 0);
      map.set(key, cur);
    }
    return [...map.values()];
  }

  /** Lifetime Value & frekuensi per customer. */
  ltv() {
    return this._byCustomer().map(c => {
      const dates = c.orders.map(o => new Date(o.ts).getTime()).sort();
      const firstAt = dates[0];
      const lastAt  = dates[dates.length - 1];
      const days    = Math.max(1, Math.ceil((lastAt - firstAt) / 86400000) || 1);
      return {
        name: c.name,
        wa: c.wa,
        orders: c.orders.length,
        spend: c.spend,
        avgOrder: c.spend / c.orders.length,
        firstAt, lastAt,
        spanDays: days,
      };
    }).sort((a, b) => b.spend - a.spend);
  }

  /** Cohort retention: customer pertama beli bulan X, masih beli bulan ke-N? */
  cohortRetention() {
    const cohorts = new Map(); // 'YYYY-MM' → { size, retained: { '+1': n, '+2': n, ... } }
    for (const c of this._byCustomer()) {
      const sorted = [...c.orders].sort((a, b) => new Date(a.ts) - new Date(b.ts));
      const first = new Date(sorted[0].ts);
      const cohortKey = `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}`;
      const cur = cohorts.get(cohortKey) || { size: 0, retained: {} };
      cur.size += 1;
      const seenMonths = new Set();
      for (const o of sorted) {
        const d = new Date(o.ts);
        const monthsSince = (d.getFullYear() - first.getFullYear()) * 12 + (d.getMonth() - first.getMonth());
        if (monthsSince > 0 && !seenMonths.has(monthsSince)) {
          cur.retained[monthsSince] = (cur.retained[monthsSince] || 0) + 1;
          seenMonths.add(monthsSince);
        }
      }
      cohorts.set(cohortKey, cur);
    }
    return [...cohorts.entries()]
      .sort()
      .map(([cohort, data]) => ({ cohort, size: data.size, retained: data.retained }));
  }

  /** RFM scoring (Recency, Frequency, Monetary) → segment. */
  rfm() {
    const list = this.ltv();
    if (list.length === 0) return [];
    const now = Date.now();
    const recencies = list.map(c => Math.floor((now - c.lastAt) / 86400000));
    const frequencies = list.map(c => c.orders);
    const monetaries  = list.map(c => c.spend);

    const quintile = (arr, val, reverse = false) => {
      const sorted = [...arr].sort((a, b) => reverse ? b - a : a - b);
      const idx = sorted.findIndex(x => reverse ? x <= val : x >= val);
      const q = Math.ceil((idx + 1) / sorted.length * 5);
      return Math.max(1, Math.min(5, q));
    };

    return list.map((c) => {
      const r = Math.floor((now - c.lastAt) / 86400000);
      const R = quintile(recencies, r, true);   // lower recency days = better
      const F = quintile(frequencies, c.orders);
      const M = quintile(monetaries, c.spend);
      let segment = 'casual';
      if (R >= 4 && F >= 4 && M >= 4) segment = 'champion';
      else if (R >= 4 && F <= 2)      segment = 'new';
      else if (R <= 2 && F >= 3)      segment = 'at_risk';
      else if (R <= 2)                segment = 'churned';
      else if (F >= 4)                segment = 'loyal';
      return { ...c, R, F, M, segment };
    }).sort((a, b) => b.M - a.M || b.F - a.F);
  }

  /** Ringkasan high-level. */
  summary() {
    const list = this.ltv();
    const totalCustomers = list.length;
    const totalSpend = list.reduce((s, c) => s + c.spend, 0);
    const avgLtv = totalCustomers > 0 ? totalSpend / totalCustomers : 0;
    const repeat = list.filter(c => c.orders > 1).length;
    const repeatRate = totalCustomers > 0 ? repeat / totalCustomers * 100 : 0;
    return {
      totalCustomers, totalSpend, avgLtv,
      repeat, repeatRate,
      topCustomers: list.slice(0, 10),
    };
  }
}
