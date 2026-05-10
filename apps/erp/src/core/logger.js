// src/core/logger.js
// Logger terpusat. Level-aware. Bisa diarahkan ke console / sink kustom (mis. Sentry).

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, fatal: 50 };

export class Logger {
  constructor({ level = 'info', sinks = [defaultSink] } = {}) {
    this.level = LEVELS[level] ?? LEVELS.info;
    this.sinks = sinks;
  }

  setLevel(level) {
    if (LEVELS[level] != null) this.level = LEVELS[level];
  }

  addSink(sink) { this.sinks.push(sink); }

  _log(level, msg, meta) {
    if (LEVELS[level] < this.level) return;
    const entry = {
      ts: new Date().toISOString(),
      level,
      msg: String(msg),
      meta: meta ?? null,
    };
    for (const sink of this.sinks) {
      try { sink(entry); } catch (_) { /* sink gagal tidak boleh crash app */ }
    }
  }

  debug(msg, meta) { this._log('debug', msg, meta); }
  info(msg, meta)  { this._log('info', msg, meta); }
  warn(msg, meta)  { this._log('warn', msg, meta); }
  error(msg, meta) { this._log('error', msg, meta); }
  fatal(msg, meta) { this._log('fatal', msg, meta); }
}

function defaultSink(entry) {
  const fn = console[entry.level] || console.log;
  fn(`[${entry.ts}] ${entry.level.toUpperCase()} ${entry.msg}`, entry.meta ?? '');
}

export const logger = new Logger({ level: 'info' });
