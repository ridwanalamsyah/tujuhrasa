// src/view/pages/schedule.js
import { h, fmt } from '../h.js';
import { Card, Empty, KPI, Field, Input, Select, Button, Badge } from '../components.js';
import { Icon } from '../icons.js';
import { bus } from '../../core/eventBus.js';
import { uid } from '../../core/id.js';

export function schedulePage(app) {
  const root = h('div', { class: 'col gap-4' });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let windowDays = 14;

  // Form state
  let form = newForm();
  function newForm() {
    return {
      title: '', type: 'produksi',
      startDate: dateOnly(new Date()), startTime: '09:00',
      endDate:   dateOnly(new Date()), endTime: '11:00',
      freq: 'none', interval: 1, byWeekday: [], until: '',
      notes: '',
    };
  }

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const wStart = today.toISOString();
    const wEnd   = new Date(today.getTime() + windowDays * 86400000).toISOString();
    const occ = app.services.scheduleEngine.listOccurrences(wStart, wEnd);
    const conflicts = app.services.scheduleEngine.detectConflicts(occ);
    const conflictKeys = new Set(conflicts.flatMap(c => [
      c.a.occurrenceOf + '|' + c.a.start,
      c.b.occurrenceOf + '|' + c.b.start,
    ]));

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Jadwal'),
        h('div', { class: 'page-sub' }, `${windowDays} hari ke depan • ${occ.length} kegiatan • ${conflicts.length} konflik`),
      ),
      h('div', { class: 'page-actions' },
        Select(
          [{ value: 7, label: '7 hari' }, { value: 14, label: '14 hari' }, { value: 30, label: '30 hari' }, { value: 60, label: '60 hari' }],
          { value: windowDays, onchange: e => { windowDays = +e.target.value; render(); } }
        ),
      ),
    ));

    // KPIs
    root.append(h('div', { class: 'kpi-grid' },
      KPI({ label: 'Kegiatan terjadwal', value: occ.length }),
      KPI({ label: 'Tipe Produksi', value: occ.filter(o => o.type === 'produksi').length }),
      KPI({ label: 'Tipe Pengiriman', value: occ.filter(o => o.type === 'pengiriman').length }),
      KPI({ label: 'Konflik Waktu', value: conflicts.length, deltaDir: conflicts.length > 0 ? 'down' : 'up', delta: conflicts.length > 0 ? 'perlu rescheduling' : 'bebas konflik' }),
    ));

    // Timeline + Form
    root.append(h('div', { class: 'grid-2' },
      Card({
        title: 'Timeline',
        sub: 'Diurutkan & dideteksi otomatis',
        body: occ.length === 0
          ? Empty({ icon: '📅', title: 'Tidak ada kegiatan', detail: 'Buat jadwal baru di kanan.' })
          : h('div', { class: 'col' }, ...occ.map(o => {
              const key = o.occurrenceOf + '|' + o.start;
              const conflict = conflictKeys.has(key);
              return h('div', { class: 'timeline-item' + (conflict ? ' conflict' : '') },
                h('div', { class: 'col' },
                  h('span', { class: 'when' }, fmt.dt(o.start)),
                  h('span', { class: 'text-xs text-muted' }, `s/d ${new Date(o.end).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`),
                ),
                h('div', { class: 'col grow' },
                  h('strong', null, o.title),
                  h('div', { class: 'text-xs text-muted' }, o.notes || ''),
                ),
                conflict ? Badge('Konflik', 'danger') : Badge(o.type, 'brand'),
              );
            })),
      }),
      Card({
        title: 'Buat Jadwal',
        sub: 'Mendukung kegiatan berulang (recurring)',
        body: h('div', { class: 'col gap-3' },
          Field({ label: 'Judul', children: Input({ value: form.title, oninput: e => form.title = e.target.value, placeholder: 'mis. Produksi Batch Mingguan' }) }),
          Field({ label: 'Tipe', children: Select(
            ['produksi','pengiriman','meeting','deadline','lainnya'].map(v => ({ value: v, label: v })),
            { value: form.type, onchange: e => form.type = e.target.value }
          ) }),
          h('div', { class: 'form-grid' },
            Field({ label: 'Tanggal Mulai', children: Input({ type: 'date', value: form.startDate, oninput: e => form.startDate = e.target.value }) }),
            Field({ label: 'Jam Mulai', children: Input({ type: 'time', value: form.startTime, oninput: e => form.startTime = e.target.value }) }),
          ),
          h('div', { class: 'form-grid' },
            Field({ label: 'Tanggal Selesai', children: Input({ type: 'date', value: form.endDate, oninput: e => form.endDate = e.target.value }) }),
            Field({ label: 'Jam Selesai', children: Input({ type: 'time', value: form.endTime, oninput: e => form.endTime = e.target.value }) }),
          ),
          h('div', { class: 'form-grid' },
            Field({ label: 'Pengulangan', children: Select(
              [{ value: 'none', label: 'Tidak berulang' }, { value: 'daily', label: 'Harian' }, { value: 'weekly', label: 'Mingguan' }, { value: 'monthly', label: 'Bulanan' }],
              { value: form.freq, onchange: e => { form.freq = e.target.value; render(); } }
            ) }),
            Field({ label: 'Interval', children: Input({ type: 'number', min: 1, value: form.interval, oninput: e => form.interval = +e.target.value || 1 }) }),
          ),
          form.freq === 'weekly' ? Field({
            label: 'Hari (mingguan)',
            children: h('div', { class: 'row gap-2' },
              ...['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map((d, i) =>
                h('button', {
                  class: 'btn sm' + (form.byWeekday.includes(i) ? ' primary' : ''),
                  onclick: () => { form.byWeekday = form.byWeekday.includes(i) ? form.byWeekday.filter(x => x !== i) : [...form.byWeekday, i]; render(); },
                }, d)
              ),
            ),
          }) : null,
          form.freq !== 'none' ? Field({ label: 'Berakhir pada (opsional)', children: Input({ type: 'date', value: form.until, oninput: e => form.until = e.target.value }) }) : null,
          Field({ label: 'Catatan', children: Input({ value: form.notes, oninput: e => form.notes = e.target.value }) }),
          Button('Tambahkan', { variant: 'primary', onclick: () => {
            try {
              const start = new Date(form.startDate + 'T' + form.startTime).toISOString();
              const end   = new Date(form.endDate + 'T' + form.endTime).toISOString();
              const recurrence = form.freq === 'none'
                ? { freq: 'none' }
                : { freq: form.freq, interval: form.interval, byWeekday: form.byWeekday, until: form.until ? new Date(form.until + 'T23:59:59').toISOString() : undefined };
              app.repos.schedules.create({
                id: uid('sch'), title: form.title || '(tanpa judul)', type: form.type,
                start, end, recurrence, notes: form.notes,
              });
              form = newForm();
              bus.emit('toast', { severity: 'success', message: 'Jadwal dibuat.' });
              render();
            } catch (e) {
              app.errors.handle(e);
              bus.emit('toast', { severity: 'error', message: e.userMessage || e.message });
            }
          } }),
        ),
      }),
    ));
  }

  render();
  app.store.subscribe(s => s.schedules, () => render(), (a, b) => a === b);
  return root;
}

function dateOnly(d) {
  const yy = d.getFullYear(), mm = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0');
  return `${yy}-${mm}-${dd}`;
}
