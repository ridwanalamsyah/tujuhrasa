// src/services/scheduleEngine.service.js
// Engine jadwal: validasi waktu, expand recurring → occurrences,
// deteksi konflik (overlap), sort, dan filter rentang.
// Tidak berkaitan dengan UI; output adalah array of occurrences murni.

import { AppError } from '../core/errorHandler.js';

const DAY_MS = 86400000;

export class ScheduleEngine {
  constructor({ scheduleRepo }) {
    this.repo = scheduleRepo;
  }

  validate(event) {
    const start = Date.parse(event.start);
    const end   = Date.parse(event.end);
    if (isNaN(start) || isNaN(end)) throw new AppError('INVALID_DATE', 'Tanggal mulai/selesai tidak valid');
    if (end < start) throw new AppError('INVALID_RANGE', 'Tanggal selesai harus >= tanggal mulai');
    if (event.recurrence?.until && Date.parse(event.recurrence.until) < start) {
      throw new AppError('INVALID_RECURRENCE', '`until` lebih awal daripada `start`');
    }
  }

  /**
   * Expand sebuah event (mungkin recurring) menjadi list occurrence
   * di [windowStart, windowEnd] (ISO strings).
   */
  expand(event, windowStart, windowEnd) {
    this.validate(event);
    const wStart = Date.parse(windowStart);
    const wEnd   = Date.parse(windowEnd);
    const start  = Date.parse(event.start);
    const end    = Date.parse(event.end);
    const dur    = end - start;
    const r = event.recurrence;
    const occurrences = [];

    const push = (ts) => {
      if (ts > wEnd || ts + dur < wStart) return;
      occurrences.push({
        ...event,
        start: new Date(ts).toISOString(),
        end:   new Date(ts + dur).toISOString(),
        occurrenceOf: event.id,
      });
    };

    if (!r || r.freq === 'none' || !r.freq) {
      push(start);
      return occurrences;
    }

    const interval = Math.max(1, r.interval || 1);
    const limitTs  = r.until ? Date.parse(r.until) : wEnd;
    const maxCount = r.count || 1000;
    let cur = start;
    let count = 0;
    while (cur <= limitTs && cur <= wEnd && count < maxCount) {
      if (r.freq === 'weekly' && Array.isArray(r.byWeekday) && r.byWeekday.length) {
        const dow = new Date(cur).getDay();
        if (r.byWeekday.includes(dow)) push(cur);
      } else {
        push(cur);
      }
      count++;
      if (r.freq === 'daily')   cur += interval * DAY_MS;
      else if (r.freq === 'weekly') cur += interval * 7 * DAY_MS;
      else if (r.freq === 'monthly') {
        const d = new Date(cur);
        d.setMonth(d.getMonth() + interval);
        cur = d.getTime();
      } else break;
    }
    return occurrences;
  }

  /**
   * Daftar occurrences gabungan dari semua event di rentang waktu, sudah ter-sort.
   */
  listOccurrences(windowStart, windowEnd) {
    const out = [];
    for (const ev of this.repo.list()) {
      out.push(...this.expand(ev, windowStart, windowEnd));
    }
    out.sort((a, b) => a.start.localeCompare(b.start));
    return out;
  }

  /**
   * Deteksi konflik: dua occurrence overlap pada window waktu yang sama.
   * Bisa difilter dengan predikat (mis. hanya tipe 'produksi').
   */
  detectConflicts(occurrences, predicate = () => true) {
    const items = occurrences.filter(predicate).sort((a, b) => a.start.localeCompare(b.start));
    const conflicts = [];
    for (let i = 0; i < items.length; i++) {
      const a = items[i];
      for (let j = i + 1; j < items.length; j++) {
        const b = items[j];
        if (b.start >= a.end) break;
        conflicts.push({ a, b });
      }
    }
    return conflicts;
  }
}
