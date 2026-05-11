// src/core/repository.js
// Repository pattern: bridge antara Store dan Service.
// Kontrak CRUD seragam + validasi schema + emit domain event ke EventBus.

import { assert } from './validator.js';
import { NotFoundError } from './errorHandler.js';
import { bus } from './eventBus.js';

export class CollectionRepository {
  /**
   * @param {Store} store
   * @param {string} key  nama koleksi pada state (mis. 'orders')
   * @param {object} schema schema entitas
   * @param {string} [domain] nama domain untuk event (default = key)
   */
  constructor(store, key, schema, domain = key) {
    this.store = store;
    this.key = key;
    this.schema = schema;
    this.domain = domain;
  }

  list(filter) {
    const arr = this.store.getState()[this.key] || [];
    return filter ? arr.filter(filter) : arr.slice();
  }

  findById(id) {
    return (this.store.getState()[this.key] || []).find(x => x.id === id) || null;
  }

  requireById(id) {
    const found = this.findById(id);
    if (!found) throw new NotFoundError(this.domain, id);
    return found;
  }

  create(entity) {
    const validated = assert(this.schema, entity);
    const ok = this.store.updateCollection(this.key, 'create', validated);
    if (!ok) throw new Error(`${this.domain} dengan id ${entity.id} sudah ada`);
    bus.emit(`${this.domain}:created`, validated);
    return validated;
  }

  update(id, patch) {
    const cur = this.requireById(id);
    const merged = { ...cur, ...patch, id };
    const validated = assert(this.schema, merged);
    this.store.updateCollection(this.key, 'update', validated);
    bus.emit(`${this.domain}:updated`, { prev: cur, next: validated });
    return validated;
  }

  delete(id) {
    const cur = this.requireById(id);
    this.store.updateCollection(this.key, 'delete', { id });
    bus.emit(`${this.domain}:deleted`, cur);
    return cur;
  }
}

/**
 * SingletonRepository — untuk objek tunggal seperti settings.
 */
export class SingletonRepository {
  constructor(store, key, schema, domain = key) {
    this.store = store; this.key = key; this.schema = schema; this.domain = domain;
  }
  get() { return this.store.getState()[this.key]; }
  set(value) {
    const validated = assert(this.schema, value);
    this.store.update(`${this.key}.set`, () => ({ [this.key]: validated }));
    bus.emit(`${this.domain}:updated`, validated);
    return validated;
  }
  patch(partial) {
    const merged = { ...this.get(), ...partial };
    return this.set(merged);
  }
}
