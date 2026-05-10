// src/view/pages/settings.js — minimalis dengan tab.
import { h } from '../h.js';
import { Card, Field, Input, Button } from '../components.js';
import { Icon } from '../icons.js';
import { bus } from '../../core/eventBus.js';

const TABS = [
  { id: 'bisnis',     label: 'Bisnis' },
  { id: 'profil',     label: 'Profil' },
  { id: 'integrasi',  label: 'Integrasi' },
  { id: 'keuangan',   label: 'Keuangan' },
  { id: 'lanjutan',   label: 'Lanjutan' },
];

export function settingsPage(app) {
  const root = h('div', { class: 'col gap-4' });
  let active = 'bisnis';

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const cur = app.repos.settings.get() || {};
    const draft = { ...cur };

    // Tab pills
    const tabs = h('div', { class: 'tabs-pill' },
      ...TABS.map(t => h('button', {
        class: active === t.id ? 'active' : '',
        onclick: () => { active = t.id; render(); },
      }, t.label))
    );
    root.append(tabs);

    if (active === 'bisnis')    root.append(bisnisSection(draft));
    if (active === 'profil')    root.append(profilSection());
    if (active === 'integrasi') root.append(integrasiSection(draft));
    if (active === 'keuangan')  root.append(keuanganSection(draft));
    if (active === 'lanjutan')  root.append(lanjutanSection(draft));
  }

  function lanjutanSection(draft) {
    return h('div', { class: 'col gap-4' },
      Card({
        title: 'Approval Workflow',
        sub: 'PO dengan total ≥ threshold butuh approval admin/koordinator sebelum bisa diterima',
        body: h('div', { class: 'col gap-3' },
          Field({ label: 'Threshold approval (Rp)', children: Input({
            type: 'number', value: draft.approvalThreshold ?? 1000000,
            oninput: e => draft.approvalThreshold = +e.target.value || 0,
          }) }),
          Button('Simpan', { variant: 'primary', onclick: () => {
            app.repos.settings.set(draft);
            bus.emit('toast', { severity: 'success', message: 'Threshold disimpan.' });
          }}),
        ),
      }),
      Card({
        title: 'Cabang',
        sub: 'Identitas cabang untuk multi-cabang (masa depan)',
        body: h('div', { class: 'col gap-3' },
          h('div', { class: 'form-grid' },
            Field({ label: 'Branch ID', children: Input({ value: draft.branchId || 'main', oninput: e => draft.branchId = e.target.value }) }),
            Field({ label: 'Branch Name', children: Input({ value: draft.branchName || 'Pusat', oninput: e => draft.branchName = e.target.value }) }),
          ),
          Button('Simpan', { variant: 'primary', onclick: () => {
            app.repos.settings.set(draft);
            bus.emit('toast', { severity: 'success', message: 'Cabang disimpan.' });
          }}),
        ),
      }),
      Card({
        title: 'Pencadangan Otomatis',
        sub: app.services.autoBackup.hasCloud()
          ? 'Data Anda dicadangkan secara otomatis setiap hari. Tidak perlu tindakan apa pun.'
          : 'Aktifkan sinkronisasi cloud di tab Integrasi agar pencadangan otomatis berjalan.',
        body: h('div', { class: 'col gap-3' },
          h('div', { class: 'row gap-2', style: { alignItems: 'center' } },
            h('span', { class: 'status-dot ' + (app.services.autoBackup.hasCloud() ? 'on' : 'off') }),
            h('span', { class: 'text-sm' },
              app.services.autoBackup.hasCloud() ? 'Pencadangan aktif' : 'Pencadangan belum aktif'),
          ),
        ),
      }),
      Card({
        title: 'Thermal Printer (Bluetooth)',
        sub: 'Pasang printer thermal 80mm via Web Bluetooth — Chrome/Edge desktop atau Android',
        body: h('div', { class: 'col gap-3' },
          h('div', { class: 'text-sm text-muted' },
            app.services.printer.available()
              ? '✓ Browser mendukung Web Bluetooth'
              : '⚠ Browser tidak mendukung Web Bluetooth'),
          h('div', { class: 'row gap-2' },
            Button('Pasang Printer', { variant: 'primary', onclick: async () => {
              try {
                const name = await app.services.printer.connect();
                bus.emit('toast', { severity: 'success', message: `Tersambung: ${name}` });
              } catch (e) { bus.emit('toast', { severity: 'error', message: e.message }); }
            }}),
          ),
        ),
      }),

    );
  }

  function bisnisSection(draft) {
    return Card({
      title: 'Identitas Bisnis',
      body: h('div', { class: 'col gap-3' },
        h('div', { class: 'row gap-3', style: { alignItems: 'center', flexWrap: 'wrap' } },
          draft.logoUrl
            ? h('img', { src: draft.logoUrl, style: { width: '64px', height: '64px', borderRadius: '14px', objectFit: 'cover' } })
            : h('div', { class: 'avatar lg' }, draft.logo || '7R'),
          h('div', { class: 'col grow gap-1', style: { minWidth: '200px' } },
            h('input', {
              type: 'file', accept: 'image/*', class: 'input',
              onchange: async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                const data = await readAsDataURL(f);
                draft.logoUrl = data;
                app.repos.settings.set(draft);
                bus.emit('toast', { severity: 'success', message: 'Logo diperbarui.' });
              },
            }),
            h('div', { class: 'text-xs text-muted' }, 'PNG/SVG, square ≤ 256px'),
          ),
        ),
        Input({ value: draft.name, oninput: e => draft.name = e.target.value, placeholder: 'Nama bisnis' }),
        h('div', { class: 'form-grid' },
          Input({ value: draft.logo, oninput: e => draft.logo = e.target.value, maxlength: 4, placeholder: 'Inisial logo' }),
          h('label', { class: 'row gap-2', style: { alignItems: 'center' } },
            h('span', { class: 'text-xs text-muted' }, 'Warna brand'),
            h('input', { type: 'color', value: draft.color, oninput: e => draft.color = e.target.value, style: { width: '40px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer' } }),
          ),
        ),
        Input({ value: draft.tagline, oninput: e => draft.tagline = e.target.value, placeholder: 'Tagline (opsional)' }),
        Input({ value: draft.address, oninput: e => draft.address = e.target.value, placeholder: 'Alamat' }),
        h('div', { class: 'form-grid' },
          Input({ value: draft.phone, oninput: e => draft.phone = e.target.value, placeholder: 'Telepon' }),
          Input({ value: draft.email, oninput: e => draft.email = e.target.value, placeholder: 'Email', type: 'email' }),
        ),
        Button('Simpan', { variant: 'primary', onclick: () => {
          try { app.repos.settings.set(draft); bus.emit('toast', { severity: 'success', message: 'Tersimpan.' }); }
          catch (e) { app.errors.handle(e); }
        }}),
      ),
    });
  }

  function profilSection() {
    const me = app.services.auth.getCurrentUser();
    if (!me) return h('div', null);
    return Card({
      title: 'Profil Saya',
      body: h('div', { class: 'row gap-3', style: { alignItems: 'center', flexWrap: 'wrap' } },
        me.photo
          ? h('img', { class: 'avatar xl', src: me.photo })
          : h('div', { class: 'avatar xl' }, (me.name || '?')[0]),
        h('div', { class: 'col grow gap-2', style: { minWidth: '200px' } },
          h('strong', null, me.name),
          h('span', { class: 'text-sm text-muted' }, me.email),
          h('span', { class: 'text-xs text-muted' }, 'Role: ' + (me.role || '-')),
          h('input', {
            type: 'file', accept: 'image/*', class: 'input',
            onchange: async (e) => {
              const f = e.target.files?.[0]; if (!f) return;
              const data = await readAsDataURL(f);
              app.repos.users.update(me.id, { photo: data });
              bus.emit('toast', { severity: 'success', message: 'Foto profil diperbarui.' });
              render();
            },
          }),
        ),
      ),
    });
  }

  function integrasiSection(draft) {
    let supaCfg = {};
    try { supaCfg = JSON.parse(localStorage.getItem('tr_supabase_cfg') || '{}'); } catch {}
    return h('div', { class: 'col gap-4' },
      Card({
        title: 'Google Sign-In',
        sub: 'Login pakai akun Google. Ambil Client ID dari Google Cloud Console.',
        body: h('div', { class: 'col gap-3' },
          Input({
            value: draft.googleClientId, style: { fontFamily: 'var(--mono)', fontSize: '12px' },
            placeholder: 'xxxxx.apps.googleusercontent.com',
            oninput: e => draft.googleClientId = e.target.value,
          }),
          Button('Simpan', { variant: 'primary', onclick: () => {
            app.repos.settings.set(draft);
            bus.emit('toast', { severity: 'success', message: 'Client ID disimpan.' });
          }}),
        ),
      }),
      Card({
        title: 'Sinkronisasi Cloud',
        sub: 'Aktifkan untuk sinkronisasi data antar perangkat secara otomatis.',
        body: h('div', { class: 'col gap-3' },
          h('div', { class: 'row gap-2', style: { alignItems: 'center' } },
            h('span', { class: 'status-dot ' + ((typeof window !== 'undefined' && window.__supabaseActive) ? 'on' : 'off') }),
            h('span', { class: 'text-sm' },
              (typeof window !== 'undefined' && window.__supabaseActive) ? 'Tersinkron' : 'Belum tersinkron'),
          ),
          h('div', { class: 'row gap-2' },
            Button((typeof window !== 'undefined' && window.__supabaseActive) ? 'Nonaktifkan' : 'Aktifkan', { variant: (typeof window !== 'undefined' && window.__supabaseActive) ? 'ghost' : 'primary', onclick: () => {
              if (typeof window !== 'undefined' && window.__supabaseActive) {
                localStorage.removeItem('tr_supabase_cfg');
                localStorage.setItem('tr_supabase_optout', '1');
                bus.emit('toast', { severity: 'info', message: 'Sinkronisasi dimatikan. Memuat ulang…' });
                setTimeout(() => location.reload(), 600);
              } else {
                localStorage.removeItem('tr_supabase_optout');
                bus.emit('toast', { severity: 'info', message: 'Sinkronisasi diaktifkan. Memuat ulang…' });
                setTimeout(() => location.reload(), 600);
              }
            }}),
          ),
        ),
      }),
    );
  }

  function keuanganSection(draft) {
    const cfg = draft.pointsConfig || {};
    cfg.output = cfg.output || {};
    return h('div', { class: 'col gap-4' },
      Card({
        title: 'Komponen Biaya Tetap',
        sub: 'Per periode (default: bulan), dipakai pada kalkulasi profit',
        body: h('div', { class: 'form-grid' },
          Field({ label: 'Operasional', children: Input({ type: 'number', value: draft.ops, oninput: e => draft.ops = +e.target.value || 0 }) }),
          Field({ label: 'Insentif', children: Input({ type: 'number', value: draft.ins, oninput: e => draft.ins = +e.target.value || 0 }) }),
          Field({ label: 'Pajak', children: Input({ type: 'number', value: draft.pk, oninput: e => draft.pk = +e.target.value || 0 }) }),
          Field({ label: 'Komisi', children: Input({ type: 'number', value: draft.km, oninput: e => draft.km = +e.target.value || 0 }) }),
        ),
      }),
      Card({
        title: 'Bagi Hasil & Poin',
        sub: 'Profit-sharing berbasis Effort + Output',
        body: h('div', { class: 'col gap-3' },
          h('div', { class: 'form-grid' },
            Field({ label: 'Reinvestment rate', children: Input({ type: 'number', step: '0.05', min: 0, max: 1, value: cfg.reinvestmentRate, oninput: e => cfg.reinvestmentRate = +e.target.value }) }),
            Field({ label: 'Cap per user', children: Input({ type: 'number', step: '0.05', min: 0, max: 1, value: cfg.capPerUser, oninput: e => cfg.capPerUser = +e.target.value }) }),
          ),
          h('label', { class: 'row gap-2', style: { alignItems: 'center' } },
            h('input', { type: 'checkbox', checked: cfg.enableCap, onchange: e => cfg.enableCap = e.target.checked }),
            h('span', { class: 'text-sm' }, 'Aktifkan cap per user'),
          ),
          h('div', { class: 'text-xs text-muted', style: { marginTop: '4px' } }, 'Bobot output (poin per kejadian)'),
          h('div', { class: 'form-grid' },
            Field({ label: 'Order via referral', children: Input({ type: 'number', value: cfg.output.orderReferral, oninput: e => cfg.output.orderReferral = +e.target.value }) }),
            Field({ label: 'Customer baru', children: Input({ type: 'number', value: cfg.output.newCustomer, oninput: e => cfg.output.newCustomer = +e.target.value }) }),
            Field({ label: 'QC pass', children: Input({ type: 'number', value: cfg.output.productionQcPass, oninput: e => cfg.output.productionQcPass = +e.target.value }) }),
            Field({ label: 'Per Rp 1jt revenue', children: Input({ type: 'number', value: cfg.output.revenuePerMillion, oninput: e => cfg.output.revenuePerMillion = +e.target.value }) }),
          ),
          Button('Simpan', { variant: 'primary', onclick: () => {
            draft.pointsConfig = cfg;
            app.repos.settings.set(draft);
            bus.emit('toast', { severity: 'success', message: 'Tersimpan.' });
          }}),
        ),
      }),
    );
  }

  function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  render();
  app.store.subscribe(s => s.settings, () => render(), (a, b) => a === b);
  return root;
}


