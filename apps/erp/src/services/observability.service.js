// src/services/observability.service.js
// Wrapper untuk error tracking (Sentry skeleton).
// Tidak load Sentry SDK kecuali settings.sentryDsn terisi → gratis untuk default.

import { logger } from '../core/logger.js';
import { bus } from '../core/eventBus.js';

export class ObservabilityService {
  constructor({ settingsRepo }) {
    this.settings = settingsRepo;
    this._sentryReady = false;
    this._buffer = [];
    this._init();
  }

  async _init() {
    const s = this.settings.get() || {};
    if (!s.sentryDsn) return;
    if (typeof window === 'undefined') return;
    try {
      // Lazy-load Sentry browser SDK from CDN.
      await new Promise((resolve, reject) => {
        const sc = document.createElement('script');
        sc.src = 'https://browser.sentry-cdn.com/7.99.0/bundle.tracing.min.js';
        sc.crossOrigin = 'anonymous';
        sc.onload = resolve;
        sc.onerror = reject;
        document.head.appendChild(sc);
      });
      if (window.Sentry) {
        window.Sentry.init({
          dsn: s.sentryDsn,
          tracesSampleRate: 0.1,
          environment: location.hostname.includes('localhost') ? 'dev' : 'production',
        });
        this._sentryReady = true;
        // Flush buffered errors.
        for (const e of this._buffer) this.captureException(e);
        this._buffer = [];
        logger.info('[Observability] Sentry aktif');
      }
    } catch (e) {
      logger.warn('[Observability] Gagal init Sentry', e);
    }

    // Hook global errors.
    bus.on('error', ({ error }) => this.captureException(error));
  }

  captureException(err) {
    if (!err) return;
    if (this._sentryReady && window.Sentry) {
      window.Sentry.captureException(err);
    } else {
      this._buffer.push(err);
      if (this._buffer.length > 50) this._buffer.shift();
    }
  }

  captureMessage(msg, level = 'info') {
    if (this._sentryReady && window.Sentry) {
      window.Sentry.captureMessage(msg, level);
    }
  }
}
