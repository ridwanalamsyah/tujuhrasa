// src/services/auth.service.js
// Auth & session: password hashing (PBKDF2-SHA-256 via WebCrypto) + Google
// Sign-In via ID token (JWT) yang diterbitkan Google Identity Services.

import { AppError, PermissionError } from '../core/errorHandler.js';
import { bus } from '../core/eventBus.js';
import { uid } from '../core/id.js';

// PBKDF2 hash dengan WebCrypto. Output base64.
async function hashPassword(password, salt) {
  if (typeof crypto?.subtle === 'undefined') {
    // Fallback (Node tanpa WebCrypto, untuk tests). Bukan crypto-grade tapi
    // cukup untuk testing — production selalu di browser dengan WebCrypto.
    let h = 0;
    for (let i = 0; i < password.length; i++) {
      h = (h * 31 + password.charCodeAt(i) + salt.charCodeAt(i % salt.length)) | 0;
    }
    return `fallback:${(h >>> 0).toString(36)}`;
  }
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256,
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

function genSalt() {
  if (typeof crypto?.getRandomValues === 'function') {
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    return btoa(String.fromCharCode(...a));
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Decode JWT payload tanpa verifikasi (verifikasi dilakukan oleh GIS sebelum diteruskan). */
function decodeJwtPayload(jwt) {
  const parts = (jwt || '').split('.');
  if (parts.length < 2) throw new AppError('JWT_INVALID', 'Token tidak valid');
  const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
  return JSON.parse(atob(padded));
}

const SESSION_KEY = 'tr_session';

function readSession() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function writeSession(userId) {
  try {
    if (typeof localStorage === 'undefined') return;
    if (userId) localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, ts: Date.now() }));
    else localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export class AuthService {
  constructor({ userRepo, store, audit }) {
    this.userRepo = userRepo;
    this.store = store;
    this.audit = audit;
  }

  /** Restore session per-browser. Dipanggil sekali saat boot setelah store.load(). */
  restoreSession() {
    const sess = readSession();
    if (!sess?.userId) return null;
    const u = this.userRepo.findById(sess.userId);
    if (!u || u.status === 'banned') {
      writeSession(null);
      return null;
    }
    this.store.update('auth.restore', () => ({ currentUser: u.id }));
    return u;
  }

  getCurrentUser() {
    const id = this.store.getState().currentUser;
    if (!id) return null;
    return this.userRepo.findById(id);
  }

  /**
   * Login email/password. Mendukung user lama dengan field `pw` (plaintext)
   * dan user baru dengan `pwHash`+`pwSalt`. Auto-migrasi saat login berhasil.
   */
  async login({ email, password }) {
    const e = String(email || '').trim().toLowerCase();
    const candidate = this.userRepo.list().find(u =>
      (u.email || '').toLowerCase() === e && (u.status === 'active' || u.status === 'pending')
    );
    if (!candidate) throw new AppError('AUTH_INVALID', 'Email atau password salah');

    let ok = false;
    if (candidate.pwHash && candidate.pwSalt) {
      const h = await hashPassword(password, candidate.pwSalt);
      ok = h === candidate.pwHash;
    } else if (candidate.pw) {
      // Legacy plaintext — hash & migrate.
      ok = candidate.pw === password;
      if (ok) {
        const salt = genSalt();
        const h = await hashPassword(password, salt);
        this.userRepo.update(candidate.id, { pwHash: h, pwSalt: salt, pw: '' });
      }
    }
    if (!ok) throw new AppError('AUTH_INVALID', 'Email atau password salah');

    this.store.update('auth.login', () => ({ currentUser: candidate.id }));
    writeSession(candidate.id);
    this.audit?.add({ action: 'LOGIN', resource: 'auth', resourceId: candidate.id, userId: candidate.id, userName: candidate.name });
    bus.emit('auth:login', candidate);
    return candidate;
  }

  /**
   * Login dengan Google ID Token (dari Google Identity Services).
   * Bila user dengan email yang sama belum ada → auto-register status active.
   * Bila ada → update photo + googleSub.
   */
  async loginWithGoogleCredential(credential) {
    const claims = decodeJwtPayload(credential);
    const email = String(claims.email || '').toLowerCase();
    if (!email) throw new AppError('GOOGLE_NO_EMAIL', 'Token tidak berisi email');

    let user = this.userRepo.list().find(u => (u.email || '').toLowerCase() === email);
    if (!user) {
      user = this.userRepo.create({
        id: uid('u'),
        name: claims.name || claims.given_name || email,
        email,
        pos: '',
        pwHash: '', pwSalt: '',
        googleSub: claims.sub,
        photo: claims.picture || '',
        role: 'admin',                          // user pertama yang login Google = admin demo.
        wa: '',
        status: 'active',
        roleMultiplier: 1,
        createdAt: new Date().toISOString(),
      });
    } else {
      this.userRepo.update(user.id, {
        googleSub: claims.sub,
        photo: claims.picture || user.photo || '',
        status: 'active',
      });
      user = this.userRepo.requireById(user.id);
    }
    this.store.update('auth.login', () => ({ currentUser: user.id }));
    writeSession(user.id);
    this.audit?.add({ action: 'LOGIN_GOOGLE', resource: 'auth', resourceId: user.id, userId: user.id, userName: user.name });
    bus.emit('auth:login', user);
    return user;
  }

  logout() {
    const u = this.getCurrentUser();
    this.store.update('auth.logout', () => ({ currentUser: null }));
    writeSession(null);
    if (u) this.audit?.add({ action: 'LOGOUT', resource: 'auth', resourceId: u.id, userId: u.id, userName: u.name });
    bus.emit('auth:logout', u);
  }

  async register(payload) {
    if (payload.pw !== payload.pw2) throw new AppError('AUTH_PW_MISMATCH', 'Konfirmasi password tidak cocok');
    if (!payload.pw || payload.pw.length < 6) throw new AppError('AUTH_PW_WEAK', 'Password minimal 6 karakter');
    if (this.userRepo.list().some(u => (u.email || '').toLowerCase() === (payload.email || '').toLowerCase())) {
      throw new AppError('AUTH_EMAIL_EXISTS', 'Email sudah terdaftar');
    }
    const salt = genSalt();
    const pwHash = await hashPassword(payload.pw, salt);
    const created = this.userRepo.create({
      id: payload.id || uid('u'),
      name: payload.name,
      pos: payload.pos || '',
      email: payload.email,
      pwHash, pwSalt: salt,
      role: payload.role,
      wa: payload.wa || '',
      photo: '',
      status: 'active',
      roleMultiplier: 1,
      createdAt: new Date().toISOString(),
    });
    this.audit?.add({ action: 'REGISTER', resource: 'users', resourceId: created.id, newValue: created, userId: created.id, userName: created.name });
    return created;
  }

  /**
   * Buat user demo bila kosong (untuk seed). Aman dipanggil berulang.
   */
  async ensureSeedUser({ email, name, password, role }) {
    if (this.userRepo.list().some(u => (u.email || '').toLowerCase() === email.toLowerCase())) return;
    const salt = genSalt();
    const pwHash = await hashPassword(password, salt);
    this.userRepo.create({
      id: uid('u'), name, pos: '', email,
      pwHash, pwSalt: salt,
      role, wa: '', photo: '',
      status: 'active', roleMultiplier: 1,
      createdAt: new Date().toISOString(),
    });
  }
}

export class RBACService {
  constructor(store) { this.store = store; }
  can(role, page) {
    if (!role) return false;
    if (page === 'profil' || page === 'dashboard') return true;
    return (this.store.getState().rbac?.[role]?.[page] ?? 0) === 1;
  }
  enforce(user, page) {
    if (!user) throw new PermissionError(page, '(no-user)');
    if (!this.can(user.role, page)) throw new PermissionError(page, user.role);
  }
  setMatrix(matrix) {
    this.store.update('rbac.set', () => ({ rbac: matrix }));
    bus.emit('rbac:updated', matrix);
  }
}
