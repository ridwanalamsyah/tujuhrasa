// src/services/progressEngine.service.js
// Engine progress otomatis berbasis milestone & weighted activity.
// Generik — bisa dipakai untuk: progress batch produksi, progress order
// per pelanggan, progress proyek bisnis, dsb. (Pada prompt awal dipakai
// untuk "progress skripsi"; pola yang sama berlaku di sini.)
//
// Konsep:
//   project = { id, milestones: [{id, weight, status, dueAt}], activities: [...] }
//   - Bobot total = jumlah weight (dinormalisasi ke 100%).
//   - status milestone: 'todo' | 'in_progress' | 'done' | 'blocked'.
//   - skor = sum(weight * doneFactor) / sum(weight) * 100.
//   - statusOverall ditentukan dari skor + perbandingan dueAt vs now.

import { AppError } from '../core/errorHandler.js';

const DONE_FACTOR = { todo: 0, in_progress: 0.5, done: 1, blocked: 0 };

export class ProgressEngine {
  /**
   * @param {{milestones: Array, activities?: Array, dueAt?: string}} project
   */
  computeScore(project) {
    if (!project || !Array.isArray(project.milestones)) {
      throw new AppError('INVALID_PROJECT', 'project.milestones harus array');
    }
    const totalW = project.milestones.reduce((s, m) => s + (m.weight || 1), 0);
    if (totalW === 0) return 0;
    const got = project.milestones.reduce((s, m) => s + (m.weight || 1) * (DONE_FACTOR[m.status] ?? 0), 0);
    return Math.round((got / totalW) * 1000) / 10; // 1 desimal
  }

  /**
   * Status overall: on_track | at_risk | late | done | blocked.
   * Heuristik:
   *  - blocked: ada milestone status='blocked' tanpa workaround.
   *  - done: skor == 100.
   *  - late: ada milestone overdue (dueAt < now) yang belum 'done'.
   *  - at_risk: progres aktual lebih rendah dari progres ekspektasi waktu (>=15%).
   *  - on_track: lainnya.
   */
  classify(project, now = Date.now()) {
    const score = this.computeScore(project);
    if (score >= 100) return { score, status: 'done' };

    const blockers = (project.milestones || []).filter(m => m.status === 'blocked');
    if (blockers.length > 0) return { score, status: 'blocked', blockers };

    const overdue = (project.milestones || []).filter(m =>
      m.dueAt && m.status !== 'done' && Date.parse(m.dueAt) < now
    );
    if (overdue.length > 0) return { score, status: 'late', overdue };

    if (project.dueAt && project.startAt) {
      const total = Date.parse(project.dueAt) - Date.parse(project.startAt);
      const elapsed = now - Date.parse(project.startAt);
      if (total > 0) {
        const expected = Math.min(100, Math.max(0, (elapsed / total) * 100));
        if (expected - score >= 15) return { score, status: 'at_risk', expected };
      }
    }
    return { score, status: 'on_track' };
  }

  /**
   * Buat insight tekstual yang bisa dirender (atau dikirim ke notifikasi).
   */
  insights(project, now = Date.now()) {
    const r = this.classify(project, now);
    const out = [];
    if (r.status === 'late') {
      out.push({
        severity: 'danger', code: 'PROJECT_LATE',
        title: `Proyek "${project.title || project.id}" terlambat`,
        detail: `${r.overdue.length} milestone melewati deadline.`,
      });
    }
    if (r.status === 'at_risk') {
      out.push({
        severity: 'warning', code: 'PROJECT_AT_RISK',
        title: `Proyek "${project.title || project.id}" berisiko terlambat`,
        detail: `Skor aktual ${r.score}% < ekspektasi ${r.expected.toFixed(0)}%.`,
      });
    }
    if (r.status === 'blocked') {
      out.push({
        severity: 'danger', code: 'PROJECT_BLOCKED',
        title: `Proyek "${project.title || project.id}" terhambat`,
        detail: `Milestone diblokir: ${r.blockers.map(b => b.title || b.id).join(', ')}`,
      });
    }
    return { ...r, insights: out };
  }

  /**
   * Update otomatis: tandai milestone 'done' jika ada activity matching kriteria.
   * activity: { milestoneId, kind, ts }.
   * rules: [{ milestoneId, requireKinds: [...], minCount }]
   */
  autoMarkFromActivities(project, rules) {
    const next = { ...project, milestones: project.milestones.map(m => ({ ...m })) };
    for (const rule of rules) {
      const m = next.milestones.find(x => x.id === rule.milestoneId);
      if (!m || m.status === 'done') continue;
      const acts = (project.activities || []).filter(a => a.milestoneId === rule.milestoneId);
      const passes = rule.requireKinds.every(k =>
        acts.filter(a => a.kind === k).length >= (rule.minCount || 1)
      );
      if (passes) m.status = 'done';
      else if (acts.length > 0 && m.status === 'todo') m.status = 'in_progress';
    }
    return next;
  }
}
