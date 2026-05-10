// src/core/validator.js
// Validator deklaratif minim-bergantung. Berbasis schema POJO dengan rules:
// type, required, min/max, pattern, enum, custom.
// Output: { valid, value, issues[] } (issues: { path, code, message }).

import { ValidationError } from './errorHandler.js';

const TYPES = {
  string:  v => typeof v === 'string',
  number:  v => typeof v === 'number' && Number.isFinite(v),
  integer: v => Number.isInteger(v),
  boolean: v => typeof v === 'boolean',
  array:   v => Array.isArray(v),
  object:  v => v != null && typeof v === 'object' && !Array.isArray(v),
  date:    v => typeof v === 'string' && !isNaN(Date.parse(v)),
};

export function validate(schema, value, path = '') {
  const issues = [];
  const out = _walk(schema, value, path, issues);
  return { valid: issues.length === 0, value: out, issues };
}

export function assert(schema, value) {
  const { valid, value: out, issues } = validate(schema, value);
  if (!valid) throw new ValidationError(issues);
  return out;
}

function _walk(schema, value, path, issues) {
  if (value == null || value === '') {
    if (schema.required) {
      issues.push({ path, code: 'REQUIRED', message: `${path || 'Field'} wajib diisi` });
      return value;
    }
    if (schema.default !== undefined) return typeof schema.default === 'function' ? schema.default() : schema.default;
    return value;
  }

  if (schema.type) {
    const checker = TYPES[schema.type];
    if (!checker) issues.push({ path, code: 'UNKNOWN_TYPE', message: `Tipe ${schema.type} tidak dikenal` });
    else if (!checker(value)) issues.push({ path, code: 'TYPE', message: `${path} harus bertipe ${schema.type}` });
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    if (schema.min != null && value < schema.min) issues.push({ path, code: 'MIN', message: `${path} minimal ${schema.min}` });
    if (schema.max != null && value > schema.max) issues.push({ path, code: 'MAX', message: `${path} maksimal ${schema.max}` });
  }
  if (schema.type === 'string') {
    if (schema.minLength != null && value.length < schema.minLength) issues.push({ path, code: 'MIN_LEN', message: `${path} minimal ${schema.minLength} karakter` });
    if (schema.maxLength != null && value.length > schema.maxLength) issues.push({ path, code: 'MAX_LEN', message: `${path} maksimal ${schema.maxLength} karakter` });
    if (schema.pattern && !schema.pattern.test(value)) issues.push({ path, code: 'PATTERN', message: schema.patternMessage || `${path} format tidak valid` });
  }
  if (schema.enum && !schema.enum.includes(value)) {
    issues.push({ path, code: 'ENUM', message: `${path} harus salah satu dari: ${schema.enum.join(', ')}` });
  }
  if (schema.type === 'array' && Array.isArray(value) && schema.items) {
    value.forEach((item, i) => _walk(schema.items, item, `${path}[${i}]`, issues));
  }
  if (schema.type === 'object' && schema.properties) {
    for (const key of Object.keys(schema.properties)) {
      _walk(schema.properties[key], value[key], path ? `${path}.${key}` : key, issues);
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!schema.properties[key]) issues.push({ path: `${path}.${key}`, code: 'UNKNOWN_FIELD', message: `Field ${key} tidak dikenal` });
      }
    }
  }
  if (typeof schema.custom === 'function') {
    const r = schema.custom(value);
    if (r !== true) issues.push({ path, code: 'CUSTOM', message: typeof r === 'string' ? r : `${path} tidak memenuhi aturan kustom` });
  }
  return value;
}

// Helper builder agar pemanggilan ringkas.
export const v = {
  string:  (opts = {}) => ({ type: 'string',  ...opts }),
  number:  (opts = {}) => ({ type: 'number',  ...opts }),
  integer: (opts = {}) => ({ type: 'integer', ...opts }),
  boolean: (opts = {}) => ({ type: 'boolean', ...opts }),
  array:   (items, opts = {}) => ({ type: 'array', items, ...opts }),
  object:  (properties, opts = {}) => ({ type: 'object', properties, ...opts }),
  date:    (opts = {}) => ({ type: 'date',    ...opts }),
  enum:    (values, opts = {}) => ({ enum: values, ...opts }),
};
