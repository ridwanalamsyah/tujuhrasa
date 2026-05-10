// src/core/errorHandler.js
// Error handling terpusat. Membungkus error dengan tipe domain, mencatatnya
// ke logger, dan memforward ke EventBus agar UI bisa menampilkan toast/dialog
// tanpa harus tahu detail teknis.

import { logger } from './logger.js';

export class AppError extends Error {
  constructor(code, message, { cause, meta, userMessage } = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause ?? null;
    this.meta = meta ?? null;
    this.userMessage = userMessage ?? message;
  }
}

export class ValidationError extends AppError {
  constructor(issues, meta) {
    super('VALIDATION_FAILED', 'Validasi data gagal', { meta: { issues, ...meta } });
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

export class NotFoundError extends AppError {
  constructor(entity, id) {
    super('NOT_FOUND', `${entity} dengan id ${id} tidak ditemukan`, { meta: { entity, id } });
    this.name = 'NotFoundError';
  }
}

export class StorageError extends AppError {
  constructor(message, cause) {
    super('STORAGE_FAILURE', message, { cause });
    this.name = 'StorageError';
  }
}

export class PermissionError extends AppError {
  constructor(action, role) {
    super('PERMISSION_DENIED', `Role ${role} tidak diizinkan untuk ${action}`, { meta: { action, role } });
    this.name = 'PermissionError';
  }
}

export class ErrorHandler {
  constructor({ bus, logger: log = logger } = {}) {
    this.bus = bus;
    this.logger = log;
  }

  /**
   * Bungkus eksekusi async/sync agar error tertangkap secara seragam.
   */
  async run(fn, ctx = {}) {
    try {
      return await fn();
    } catch (err) {
      this.handle(err, ctx);
      throw err;
    }
  }

  handle(err, ctx = {}) {
    const wrapped = err instanceof AppError ? err : new AppError(
      'UNEXPECTED', err?.message || 'Terjadi kesalahan tak terduga', { cause: err, meta: ctx }
    );

    this.logger.error(wrapped.message, {
      code: wrapped.code,
      ctx,
      stack: err?.stack,
      meta: wrapped.meta,
    });

    if (this.bus) {
      this.bus.emit('error', {
        code: wrapped.code,
        userMessage: wrapped.userMessage,
        meta: wrapped.meta,
      });
    }
  }

  /**
   * Pasang global hooks untuk uncaught error & unhandled rejection.
   */
  installGlobalHandlers(globalObj = globalThis) {
    if (typeof globalObj.addEventListener === 'function') {
      globalObj.addEventListener('error', (ev) => {
        this.handle(ev.error || new Error(ev.message), { source: 'window.error' });
      });
      globalObj.addEventListener('unhandledrejection', (ev) => {
        this.handle(ev.reason, { source: 'unhandledrejection' });
      });
    } else if (typeof process !== 'undefined' && process.on) {
      process.on('uncaughtException', (e) => this.handle(e, { source: 'uncaughtException' }));
      process.on('unhandledRejection', (e) => this.handle(e, { source: 'unhandledRejection' }));
    }
  }
}
