// src/services/points.service.js
// Sistem poin "Effort + Output" untuk profit-sharing yang fair.
// Mendengarkan event domain → log aktivitas otomatis. Admin boleh adjust manual.
//
// Formula bagi hasil:
//   total_points[user] = effort_hours × roleMultiplier × 1
//                      + Σ(output_kpi × kpi_weight)
//                      − penalti
//   distributable_profit = profit × (1 − reinvestmentRate)
//   share[user] = (points[user] / Σ points) × distributable_profit
//   (optional) capping: share ≤ capPerUser × distributable_profit

import { uid } from '../core/id.js';
import { bus } from '../core/eventBus.js';

function periodOf(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export class PointsService {
  constructor({ pointsRepo, timesheetRepo, userRepo, settingsRepo, orderRepo }) {
    this.repo = pointsRepo;
    this.timesheets = timesheetRepo;
    this.users = userRepo;
    this.settings = settingsRepo;
    this.orders = orderRepo;
  }

  config() {
    const s = this.settings.get() || {};
    return s.pointsConfig || {
      reinvestmentRate: 0.3,
      capPerUser: 0.4,
      enableCap: false,
      output: {
        orderReferral: 5, newCustomer: 10,
        productionQcPass: 3, zeroDefectDay: 5,
        revenuePerMillion: 2,
      },
    };
  }

  /**
   * Catat aktivitas poin manual atau dari listener domain.
   */
  log({ userId, kind, points, refType = '', refId = '', note = '', createdBy = '', date }) {
    if (!userId) return null;
    const a = this.repo.create({
      id: uid('pts'),
      userId, kind, points, refType, refId, note, createdBy,
      period: periodOf(date),
      ts: (date && (typeof date === 'string' ? date : date.toISOString())) || new Date().toISOString(),
    });
    bus.emit('points:logged', a);
    return a;
  }

  /**
   * Total poin user pada periode (default bulan ini).
   */
  totalForUser(userId, period = periodOf()) {
    return this.repo.list(a => a.userId === userId && a.period === period)
      .reduce((s, a) => s + (a.points || 0), 0);
  }

  /**
   * Leaderboard: { userId, name, points } urut menurun.
   */
  leaderboard(period = periodOf()) {
    const map = new Map();
    for (const a of this.repo.list(x => x.period === period)) {
      map.set(a.userId, (map.get(a.userId) || 0) + (a.points || 0));
    }
    return [...map.entries()]
      .map(([userId, points]) => {
        const u = this.users.findById(userId);
        return {
          userId, points,
          name: u?.name || userId,
          role: u?.role || '',
          photo: u?.photo || '',
        };
      })
      .sort((a, b) => b.points - a.points);
  }

  /**
   * Hitung distribusi profit untuk periode.
   * `profit` diambil dari ledger.profitAndLoss() atau finance.stats().profit.
   */
  distribute(profit, period = periodOf()) {
    const cfg = this.config();
    const distributable = Math.max(0, profit * (1 - (cfg.reinvestmentRate || 0)));
    const board = this.leaderboard(period);
    const totalPts = board.reduce((s, b) => s + b.points, 0);
    if (totalPts <= 0 || distributable <= 0) {
      return { distributable, totalPts, shares: [] };
    }
    let shares = board.map(b => ({
      ...b,
      sharePct: b.points / totalPts,
      amount: Math.floor(distributable * (b.points / totalPts)),
    }));
    if (cfg.enableCap && cfg.capPerUser > 0) {
      const cap = distributable * cfg.capPerUser;
      shares = shares.map(s => ({ ...s, amount: Math.min(s.amount, cap) }));
    }
    return { distributable, totalPts, shares, reinvestmentRate: cfg.reinvestmentRate };
  }

  /**
   * Kalkulasi effort dari timesheets pada periode + roleMultiplier.
   */
  effortFromTimesheets(period = periodOf()) {
    const out = [];
    for (const u of this.users.list()) {
      const sheets = this.timesheets.list(t => t.userId === u.id && periodOf(t.checkIn) === period);
      const hours = sheets.reduce((s, t) => s + (t.hours || 0), 0);
      const points = hours * (u.roleMultiplier || 1);
      out.push({ userId: u.id, name: u.name, hours, multiplier: u.roleMultiplier || 1, points });
    }
    return out;
  }

  /**
   * Re-rate effort points: hapus effort_hours pada periode → tulis ulang dari timesheet.
   * Idempotent. Panggil di akhir periode.
   */
  rebuildEffortPoints(period = periodOf()) {
    const old = this.repo.list(a => a.period === period && a.kind === 'effort_hours');
    old.forEach(a => this.repo.delete(a.id));
    const efforts = this.effortFromTimesheets(period);
    efforts.forEach(e => {
      if (e.points > 0) this.log({
        userId: e.userId, kind: 'effort_hours', points: e.points,
        note: `${e.hours.toFixed(1)} jam × ${e.multiplier}`,
      });
    });
  }

  // ───────────────────────── Auto listeners ────────────────────────────────
  attachAutoListeners() {
    // Order baru dengan promo / marketerId → poin marketer.
    bus.on('orders:checkout', ({ orders }) => {
      const cfg = this.config().output;
      for (const o of orders) {
        if (o.marketerId) {
          this.log({
            userId: o.marketerId, kind: 'order_referral',
            points: cfg.orderReferral, refType: 'order', refId: o.id,
            note: `Order ${o.id}`,
          });
        }
        // Pos cashier revenue points (per Rp 1jt).
        if (o.cashierId) {
          const pts = ((o.total || 0) + (o.ongkir || 0)) / 1_000_000 * cfg.revenuePerMillion;
          if (pts > 0) {
            this.log({
              userId: o.cashierId, kind: 'pos_revenue',
              points: Math.round(pts * 10) / 10,
              refType: 'order', refId: o.id,
            });
          }
        }
      }
    });

    bus.on('customers:new', ({ wa, name }) => {
      // Poin diberikan bila ada marketer terkait pada order yang menciptakan customer baru.
      // Kita cari order terbaru WA yang sama dengan marketerId.
      const matched = this.orders?.list(o => o.wa === wa && o.marketerId)?.[0];
      const cfg = this.config().output;
      if (matched?.marketerId) {
        this.log({
          userId: matched.marketerId, kind: 'new_customer',
          points: cfg.newCustomer, refType: 'customer', refId: wa,
          note: `Customer baru: ${name}`,
        });
      }
    });

    bus.on('production:done', ({ productionOrder, qcPassFirst, operatorId }) => {
      const cfg = this.config().output;
      if (qcPassFirst && operatorId) {
        this.log({
          userId: operatorId, kind: 'production_qc',
          points: cfg.productionQcPass, refType: 'production', refId: productionOrder.id,
        });
      }
    });

    bus.on('wastages:created', (w) => {
      if (w.reportedBy && w.reason === 'damaged') {
        // Penalti ringan — −1 poin per kerusakan stok yang berat.
        if ((w.totalCost || 0) > 50_000) {
          this.log({
            userId: w.reportedBy, kind: 'wastage_penalty', points: -2,
            refType: 'wastage', refId: w.id, note: w.reason,
          });
        }
      }
    });
  }
}
