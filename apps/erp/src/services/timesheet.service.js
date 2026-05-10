// src/services/timesheet.service.js
// Pencatatan jam kerja per user + role multiplier.
// Effort points untuk sistem bagi hasil dihitung dari sini.

import { AppError } from '../core/errorHandler.js';
import { uid } from '../core/id.js';
import { bus } from '../core/eventBus.js';

export class TimesheetService {
  constructor({ timesheetRepo, userRepo }) {
    this.repo = timesheetRepo;
    this.users = userRepo;
  }

  /** Mulai shift kerja. */
  checkIn({ userId, note = '' }) {
    if (!userId) throw new AppError('NO_USER', 'User wajib');
    const open = this.repo.list(t => t.userId === userId && !t.checkOut);
    if (open.length) throw new AppError('ALREADY_OPEN', 'Anda masih punya sesi kerja yang terbuka');
    const t = this.repo.create({
      id: uid('ts'),
      userId,
      checkIn: new Date().toISOString(),
      checkOut: '',
      hours: 0,
      note,
      approvedBy: '',
    });
    bus.emit('timesheet:checkIn', t);
    return t;
  }

  /** Tutup shift kerja & hitung jam. */
  checkOut({ userId, note }) {
    const open = this.repo.list(t => t.userId === userId && !t.checkOut)[0];
    if (!open) throw new AppError('NO_OPEN_SESSION', 'Tidak ada sesi terbuka');
    const checkOut = new Date();
    const start = new Date(open.checkIn);
    const hours = Math.round((checkOut - start) / 36e5 * 100) / 100;
    const next = this.repo.update(open.id, {
      checkOut: checkOut.toISOString(),
      hours,
      note: note ?? open.note,
    });
    bus.emit('timesheet:checkOut', next);
    return next;
  }

  /** Ringkasan total jam per user pada periode. */
  hoursPerUser({ from, to } = {}) {
    const map = new Map();
    for (const t of this.repo.list(x => !!x.checkOut)) {
      if (from && t.checkIn < from) continue;
      if (to   && t.checkIn > to)   continue;
      map.set(t.userId, (map.get(t.userId) || 0) + (t.hours || 0));
    }
    return [...map.entries()].map(([userId, hours]) => {
      const u = this.users.findById(userId);
      return { userId, name: u?.name || userId, role: u?.role || '', hours };
    }).sort((a, b) => b.hours - a.hours);
  }

  currentlyOpen() {
    return this.repo.list(t => !t.checkOut);
  }
}
