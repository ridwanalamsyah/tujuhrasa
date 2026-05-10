// src/services/printer.service.js
// Web Bluetooth thermal printer (ESC/POS 80mm).
// Menggunakan navigator.bluetooth — hanya jalan di Chrome/Edge desktop & Android.
// Browser tanpa support akan throw saat connect; UI harus catch & fallback ke print() dialog.

const ESC = '\x1B';
const GS  = '\x1D';
const LF  = '\x0A';

function bytes(s) { return new TextEncoder().encode(s); }

function buildReceipt({ brand, address, phone, order, items, total, payments, sisa }) {
  const W = 32; // 80mm thermal ~32 char
  const center = (t) => {
    if (t.length >= W) return t;
    const pad = Math.floor((W - t.length) / 2);
    return ' '.repeat(pad) + t;
  };
  const line = (l, r) => {
    const pad = Math.max(1, W - l.length - r.length);
    return l + ' '.repeat(pad) + r;
  };
  const sep = '-'.repeat(W);
  const out = [];
  out.push(ESC + '@');                    // init
  out.push(ESC + 'a' + '\x01');           // center
  out.push(ESC + '!' + '\x18');           // double height
  out.push(brand + LF);
  out.push(ESC + '!' + '\x00');           // normal
  if (address) out.push(address + LF);
  if (phone)   out.push(phone + LF);
  out.push(sep + LF);
  out.push(ESC + 'a' + '\x00');           // left
  out.push(line('Order', order.id) + LF);
  out.push(line('Tgl', new Date(order.ts).toLocaleString('id-ID')) + LF);
  out.push(line('Pelanggan', (order.buyer || '').slice(0, 20)) + LF);
  out.push(sep + LF);
  for (const it of items) {
    out.push(it.name.slice(0, W) + LF);
    out.push(line(`${it.qty} x ${it.price.toLocaleString('id-ID')}`,
                  it.subtotal.toLocaleString('id-ID')) + LF);
  }
  out.push(sep + LF);
  out.push(line('TOTAL', 'Rp ' + total.toLocaleString('id-ID')) + LF);
  for (const p of payments) {
    out.push(line(`Bayar (${p.method})`, 'Rp ' + p.amount.toLocaleString('id-ID')) + LF);
  }
  if (sisa > 0) out.push(line('SISA', 'Rp ' + sisa.toLocaleString('id-ID')) + LF);
  out.push(sep + LF);
  out.push(ESC + 'a' + '\x01');
  out.push('Terima kasih :)' + LF);
  out.push(LF + LF + LF + LF);
  out.push(GS + 'V' + '\x42' + '\x00');   // partial cut
  return bytes(out.join(''));
}

export class PrinterService {
  constructor({ orderRepo, paymentRepo, productRepo, settingsRepo }) {
    this.orders    = orderRepo;
    this.payments  = paymentRepo;
    this.products  = productRepo;
    this.settings  = settingsRepo;
    this._device   = null;
    this._char     = null;
  }

  available() {
    return typeof navigator !== 'undefined' && !!navigator.bluetooth;
  }

  /** Pair sekali; user pilih printer dari OS dialog. */
  async connect() {
    if (!this.available()) {
      throw new Error('Web Bluetooth tidak didukung browser ini. Pakai Chrome/Edge desktop atau Chrome Android.');
    }
    // Generic ESC/POS service UUIDs (covers most thermal Bluetooth printers).
    const SERVICE = 0x18f0;
    const CHAR    = 0x2af1;
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SERVICE] }],
      optionalServices: ['battery_service'],
    });
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE);
    const ch = await service.getCharacteristic(CHAR);
    this._device = device;
    this._char   = ch;
    device.addEventListener('gattserverdisconnected', () => {
      this._device = null; this._char = null;
    });
    return device.name || 'Printer';
  }

  async _writeChunked(data) {
    if (!this._char) throw new Error('Printer belum tersambung. Klik Pasang Printer dulu.');
    const CHUNK = 100;
    for (let i = 0; i < data.byteLength; i += CHUNK) {
      const slice = data.slice(i, Math.min(i + CHUNK, data.byteLength));
      await this._char.writeValueWithoutResponse(slice);
      await new Promise(r => setTimeout(r, 30));
    }
  }

  async printReceipt(orderId) {
    const o = this.orders.findById(orderId);
    if (!o) throw new Error('Order tidak ditemukan.');
    const settings = this.settings.get() || {};
    const total = (o.total || 0) + (o.ongkir || 0);
    const items = [{ name: o.pname, qty: o.qty, price: o.sell, subtotal: total }];
    const payments = (this.payments.list(p => p.orderId === orderId) || [])
      .map(p => ({ method: p.method, amount: p.amount }));
    const paid = payments.reduce((s, p) => s + p.amount, 0);
    const data = buildReceipt({
      brand: settings.name || 'Tujuh Rasa',
      address: settings.address,
      phone: settings.phone,
      order: o, items, total, payments,
      sisa: Math.max(0, total - paid),
    });
    await this._writeChunked(data);
  }
}
