// src/view/pages/auth.js
// Login / Register futuristik — full-bleed gradient mesh + glass card.
import { h } from '../h.js';
import { Field, Input, Select, Button } from '../components.js';
import { bus } from '../../core/eventBus.js';

export function authView(app, onAuthed) {
  const root = h('div', { class: 'auth-shell' },
    h('div', { class: 'auth-mesh' },
      h('div', { class: 'blob b1' }),
      h('div', { class: 'blob b2' }),
      h('div', { class: 'blob b3' }),
    ),
  );
  let mode = 'login';
  let error = '';
  let busy = false;

  function render() {
    // Hapus card lama, simpan mesh.
    root.querySelectorAll('.auth-card').forEach(n => n.remove());
    const settings = app.repos.settings.get() || {};
    const logoUrl = settings.logoUrl || '';
    const brand = settings.name || 'Tujuh Rasa';

    const card = h('div', { class: 'auth-card' },
      logoUrl
        ? h('img', { src: logoUrl, class: 'auth-logo', style: { padding: 0 } })
        : h('div', { class: 'auth-logo' }, settings.logo || '7R'),
      h('div', { class: 'auth-title' }, brand),
      h('div', { class: 'auth-sub' }, mode === 'login' ? 'Masuk untuk mulai mengelola coffee shop Anda' : 'Daftar akun baru'),

      h('div', { class: 'auth-tabs-pill' },
        h('button', { class: mode === 'login' ? 'active' : '', onclick: () => { mode = 'login'; error = ''; render(); } }, 'Masuk'),
        h('button', { class: mode === 'register' ? 'active' : '', onclick: () => { mode = 'register'; error = ''; render(); } }, 'Daftar'),
      ),

      mode === 'login' ? loginForm() : registerForm(),
      error ? h('div', { class: 'field-error mt-3' }, error) : null,
      h('div', { class: 'auth-divider' }, 'atau'),
      googleButton(),
    );

    root.append(card);
  }

  function loginForm() {
    const f = { email: '', pw: '' };
    return h('form', { class: 'col gap-3', onsubmit: async (e) => {
      e.preventDefault(); if (busy) return; busy = true;
      try { await app.services.auth.login({ email: f.email, password: f.pw }); await app.store.flush?.(); error = ''; onAuthed(); }
      catch (err) { error = err.userMessage || err.message || 'Login gagal'; render(); }
      finally { busy = false; }
    }},
      Input({ type: 'email', autocomplete: 'username', placeholder: 'Email', oninput: e => f.email = e.target.value, required: true }),
      Input({ type: 'password', autocomplete: 'current-password', placeholder: 'Password', oninput: e => f.pw = e.target.value, required: true }),
      h('button', { class: 'auth-btn-primary', type: 'submit' }, 'Masuk'),
    );
  }

  function registerForm() {
    const f = { name: '', pos: '', email: '', pw: '', pw2: '', role: 'sales', wa: '' };
    return h('form', { class: 'col gap-3', onsubmit: async (e) => {
      e.preventDefault();
      if (f.pw !== f.pw2) { error = 'Password tidak sama'; render(); return; }
      try {
        await app.services.auth.register(f);
        await app.store.flush?.();
        error = '';
        bus.emit('toast', { severity: 'success', message: 'Registrasi berhasil. Silakan masuk.' });
        mode = 'login'; render();
      }
      catch (err) { error = err.userMessage || err.message; render(); }
    }},
      Input({ placeholder: 'Nama lengkap', oninput: e => f.name = e.target.value, required: true }),
      Input({ type: 'email', placeholder: 'Email', oninput: e => f.email = e.target.value, required: true }),
      h('div', { class: 'form-grid' },
        Input({ type: 'password', placeholder: 'Password', oninput: e => f.pw = e.target.value, required: true, minlength: 6 }),
        Input({ type: 'password', placeholder: 'Konfirmasi', oninput: e => f.pw2 = e.target.value, required: true, minlength: 6 }),
      ),
      Select(
        ['admin','koordinator','produksi','sales','marketing','barista'].map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) })),
        { value: f.role, onchange: e => f.role = e.target.value }
      ),
      h('button', { class: 'auth-btn-primary', type: 'submit' }, 'Buat Akun'),
    );
  }

  function googleButton() {
    const settings = app.repos.settings.get() || {};
    const cid = settings.googleClientId || '';
    const wrap = h('div', { class: 'col gap-2', style: { alignItems: 'center' } });

    if (!cid) {
      wrap.append(h('div', { class: 'text-xs text-muted', style: { textAlign: 'center' } },
        'Google Sign-In butuh Client ID. Setel di ',
        h('a', { href: '#/settings', style: { color: 'var(--text)', textDecoration: 'underline', fontWeight: 600 } }, 'Pengaturan')
      ));
      return wrap;
    }

    const btn = h('div', { id: 'gsi-btn', style: { minHeight: '44px', display: 'flex', justifyContent: 'center', width: '100%' } });
    wrap.append(btn);

    const tryRender = () => {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        setTimeout(tryRender, 200); return;
      }
      try {
        window.google.accounts.id.initialize({
          client_id: cid,
          callback: async (resp) => {
            try {
              await app.services.auth.loginWithGoogleCredential(resp.credential);
              await app.store.flush?.();
              onAuthed();
            } catch (e) {
              console.error('[GoogleLogin]', e);
              const msg = e.userMessage || e.message || String(e);
              error = 'Google login gagal: ' + msg;
              render();
            }
          },
        });
        const target = root.querySelector('#gsi-btn');
        if (target) {
          target.innerHTML = '';
          // Width adaptif berdasarkan parent untuk mencegah overflow.
          const w = Math.min(320, Math.max(220, target.parentElement.offsetWidth - 8));
          window.google.accounts.id.renderButton(target, {
            theme: document.documentElement.dataset.theme === 'dark' ? 'filled_black' : 'outline',
            size: 'large', type: 'standard', shape: 'pill', width: w, text: 'continue_with',
          });
        }
      } catch (_) { /* GIS unavailable, ignore */ }
    };
    setTimeout(tryRender, 50);
    return wrap;
  }

  render();
  return root;
}
