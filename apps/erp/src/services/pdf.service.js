// src/services/pdf.service.js
// Print-to-PDF tanpa dependency eksternal: render HTML print-friendly di iframe lalu panggil print().
// User dapat memilih "Save as PDF" pada dialog print untuk hasil PDF, atau cetak langsung ke printer.

import { fmt } from '../view/h.js';

export class PdfService {
  constructor({ settingsRepo, productRepo, customerRepo, supplierRepo, paymentRepo, ledger, accounts, journals }) {
    this.settings = settingsRepo;
    this.products = productRepo;
    this.customers = customerRepo;
    this.suppliers = supplierRepo;
    this.payments = paymentRepo;
    this.ledger = ledger;
    this.accounts = accounts;
    this.journals = journals;
  }

  _lineItems(order) {
    if (order.items && order.items.length) {
      return order.items.map(it => {
        const p = this.products.findById(it.id);
        const name = p?.name || it.name || it.id;
        const sat = p?.sat || it.sat || '';
        const price = it.sell ?? p?.sell ?? 0;
        const qty = it.qty || 0;
        return { name, qty, sat, price, sub: qty * price };
      });
    }
    // Legacy schema (pid/pname/qty/sell)
    if (order.pid) {
      const p = this.products.findById(order.pid);
      const name = p?.name || order.pname || order.pid;
      const sat = p?.sat || '';
      const price = order.sell ?? p?.sell ?? 0;
      const qty = order.qty || 1;
      return [{ name, qty, sat, price, sub: qty * price }];
    }
    return [];
  }

  /** Cetak struk POS thermal 80mm. */
  printReceipt(order) {
    const s = this.settings.get() || {};
    const cust = this.customers.findById(order.custId);
    const items = this._lineItems(order);
    const pays = this.payments.list(p => p.orderId === order.id);
    const sub = items.reduce((a, b) => a + b.sub, 0);
    const disc = order.disc || 0;
    const ongkir = order.ongkir || 0;
    const total = sub - disc + ongkir;
    const paid = pays.reduce((s, p) => s + (p.amount || 0), 0);

    const html = `
      <html><head><meta charset="utf-8"><title>Struk ${order.id}</title>
      <style>
        @page { size: 80mm auto; margin: 4mm; }
        * { box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; font-size: 11px; color: #000; margin: 0; padding: 0; width: 72mm; }
        h1, h2, h3, h4 { margin: 0; }
        .center { text-align: center; }
        .right { text-align: right; }
        .row { display: flex; justify-content: space-between; gap: 4px; }
        .hr { border-top: 1px dashed #000; margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 1px 0; vertical-align: top; }
        .brand { font-size: 14px; font-weight: 700; }
        .small { font-size: 9px; }
        @media print { body { width: 72mm; } }
      </style></head><body>
        <div class="center">
          <div class="brand">${esc(s.name || 'Tujuh Rasa')}</div>
          <div class="small">${esc(s.tagline || '')}</div>
          ${s.address ? `<div class="small">${esc(s.address)}</div>` : ''}
          ${s.phone ? `<div class="small">${esc(s.phone)}</div>` : ''}
        </div>
        <div class="hr"></div>
        <div class="row"><span>${esc(order.id)}</span><span>${fmt.rel(order.ts)}</span></div>
        ${cust ? `<div class="row"><span>Pelanggan</span><span>${esc(cust.name)}</span></div>` : ''}
        <div class="hr"></div>
        <table>
          ${items.map(it => `
            <tr><td colspan="2">${esc(it.name)}</td></tr>
            <tr><td>${it.qty} ${esc(it.sat)} × ${fmt.rp(it.price)}</td><td class="right">${fmt.rp(it.sub)}</td></tr>
          `).join('')}
        </table>
        <div class="hr"></div>
        <div class="row"><span>Subtotal</span><span>${fmt.rp(sub)}</span></div>
        ${disc ? `<div class="row"><span>Diskon</span><span>-${fmt.rp(disc)}</span></div>` : ''}
        ${ongkir ? `<div class="row"><span>Ongkir</span><span>${fmt.rp(ongkir)}</span></div>` : ''}
        <div class="row"><strong>TOTAL</strong><strong>${fmt.rp(total)}</strong></div>
        <div class="hr"></div>
        ${pays.map(p => `<div class="row"><span>${esc(p.method.toUpperCase())}</span><span>${fmt.rp(p.amount)}</span></div>`).join('')}
        <div class="row"><span>Dibayar</span><span>${fmt.rp(paid)}</span></div>
        ${paid < total ? `<div class="row"><strong>Sisa</strong><strong>${fmt.rp(total - paid)}</strong></div>` : ''}
        <div class="hr"></div>
        <div class="center small">Terima kasih atas pesanan Anda!<br/>${esc(s.email || '')}</div>
      </body></html>`;
    openPrintWindow(html);
  }

  /** Cetak invoice A4. */
  printInvoice(order) {
    const s = this.settings.get() || {};
    const cust = this.customers.findById(order.custId);
    const items = this._lineItems(order);
    const pays = this.payments.list(p => p.orderId === order.id);
    const sub = items.reduce((a, b) => a + b.sub, 0);
    const total = sub - (order.disc || 0) + (order.ongkir || 0);
    const paid = pays.reduce((s, p) => s + (p.amount || 0), 0);
    const sisa = total - paid;

    openPrintWindow(layoutA4({
      title: `Invoice ${order.id}`,
      logoUrl: s.logoUrl,
      brand: s.name || 'Tujuh Rasa',
      tagline: s.tagline,
      address: s.address,
      phone: s.phone,
      email: s.email,
      docTitle: 'INVOICE',
      docNo: order.id,
      docDate: order.ts,
      to: cust ? { label: 'Kepada', name: cust.name, sub: cust.wa, address: cust.city } : null,
      tableHead: ['#','Item','Qty','Sat','Harga','Subtotal'],
      tableRows: items.map((it, i) => [
        i + 1, esc(it.name), it.qty, esc(it.sat), fmt.rp(it.price), fmt.rp(it.sub),
      ]),
      summary: [
        ['Subtotal', fmt.rp(sub)],
        ['Diskon', fmt.rp(order.disc || 0)],
        ['Ongkir', fmt.rp(order.ongkir || 0)],
        ['<strong>Total</strong>', `<strong>${fmt.rp(total)}</strong>`],
        ['Dibayar', fmt.rp(paid)],
        [sisa > 0 ? '<strong>Sisa</strong>' : '<span style="color:#16a34a">Lunas</span>', sisa > 0 ? `<strong>${fmt.rp(sisa)}</strong>` : fmt.rp(0)],
      ],
      payments: pays.map(p => `${p.method.toUpperCase()} • ${fmt.rp(p.amount)} • ${fmt.rel(p.ts)}`),
      note: 'Terima kasih atas kepercayaan Anda. Pertanyaan? Hubungi kami via WhatsApp.',
    }));
  }

  /** Cetak Purchase Order A4. */
  printPurchaseOrder(po) {
    const s = this.settings.get() || {};
    const sup = this.suppliers.findById(po.supId);
    const total = (po.items || []).reduce((sum, it) => sum + (it.qty * (it.harga || 0)), 0);
    openPrintWindow(layoutA4({
      title: `PO ${po.id}`,
      logoUrl: s.logoUrl,
      brand: s.name || 'Tujuh Rasa',
      tagline: s.tagline,
      address: s.address, phone: s.phone, email: s.email,
      docTitle: 'PURCHASE ORDER',
      docNo: po.id,
      docDate: po.ts || po.expectedAt,
      to: sup ? { label: 'Supplier', name: sup.name, sub: sup.pic, address: sup.wa } : null,
      tableHead: ['#','Bahan','Qty','Sat','Harga','Subtotal'],
      tableRows: (po.items || []).map((it, i) => [
        i + 1, esc(it.name || it.ingId), it.qty, esc(it.sat || ''),
        fmt.rp(it.harga || 0), fmt.rp(it.qty * (it.harga || 0)),
      ]),
      summary: [
        ['<strong>Total</strong>', `<strong>${fmt.rp(total)}</strong>`],
      ],
      note: `Term: ${po.term || 'NET 30'} • Status: ${po.status || 'draft'}`,
    }));
  }

  /** Cetak laporan keuangan (P&L + Neraca + Trial Balance). */
  printFinancialReport({ from, to } = {}) {
    const s = this.settings.get() || {};
    const tb = this.ledger.trialBalance({ from, to });
    const pl = this.ledger.profitAndLoss({ from, to });
    const bs = this.ledger.balanceSheet({ from, to });
    const period = (from && to) ? `${from} — ${to}` : `${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;

    const tbRows = tb.map(a => [a.code, esc(a.name), a.kind, fmt.rp(a.debit), fmt.rp(a.credit), fmt.rp(a.balance)]);
    const plRows = pl.details.map(a => [a.code, esc(a.name), a.kind, fmt.rp(a.balance)]);

    openPrintWindow(layoutA4({
      title: `Laporan Keuangan ${period}`,
      logoUrl: s.logoUrl,
      brand: s.name || 'Tujuh Rasa',
      tagline: s.tagline,
      address: s.address, phone: s.phone, email: s.email,
      docTitle: 'LAPORAN KEUANGAN',
      docNo: period,
      docDate: new Date().toISOString(),
      sections: [
        {
          title: 'Ringkasan Laba / Rugi',
          rows: [
            ['Pendapatan', fmt.rp(pl.revenue)],
            ['HPP', fmt.rp(pl.cogs)],
            ['<strong>Laba Kotor</strong>', `<strong>${fmt.rp(pl.grossProfit)}</strong>`],
            ['Beban Operasi', fmt.rp(pl.expenses)],
            ['<strong>Laba Bersih</strong>', `<strong>${fmt.rp(pl.netProfit)}</strong>`],
          ],
        },
        {
          title: 'Neraca',
          rows: [
            ['Aset', fmt.rp(bs.assets)],
            ['Kewajiban', fmt.rp(bs.liabilities)],
            ['Modal + Laba Ditahan', fmt.rp(bs.equity)],
          ],
        },
      ],
      tableHead: ['Kode','Akun','Tipe','Debit','Kredit','Saldo'],
      tableRows: tbRows,
      tableTitle: 'Trial Balance',
      note: `Dicetak ${new Date().toLocaleString('id-ID')}.`,
    }));
  }
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function layoutA4(opts) {
  const {
    title, logoUrl, brand, tagline, address, phone, email,
    docTitle, docNo, docDate, to,
    tableHead, tableRows, tableTitle,
    summary, payments, note, sections,
  } = opts;

  const tableHtml = tableHead && tableRows ? `
    ${tableTitle ? `<h3 style="margin-top:24px;font-size:13px">${esc(tableTitle)}</h3>` : ''}
    <table class="items">
      <thead><tr>${tableHead.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${tableRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>` : '';

  const sectionsHtml = (sections || []).map(s => `
    <div class="section">
      <h3>${esc(s.title)}</h3>
      <table class="kv">
        ${s.rows.map(([k, v]) => `<tr><td>${k}</td><td class="right">${v}</td></tr>`).join('')}
      </table>
    </div>
  `).join('');

  const summaryHtml = summary ? `
    <table class="summary">
      ${summary.map(([k, v]) => `<tr><td>${k}</td><td class="right">${v}</td></tr>`).join('')}
    </table>` : '';

  const paymentsHtml = payments && payments.length ? `
    <div style="margin-top:16px"><strong>Pembayaran:</strong><br/>${payments.map(p => esc(p)).join('<br/>')}</div>
  ` : '';

  return `
    <html><head><meta charset="utf-8"><title>${esc(title)}</title>
    <style>
      @page { size: A4; margin: 16mm; }
      body { font-family: 'Inter','Helvetica Neue',sans-serif; color: #111; font-size: 12px; margin: 0; }
      h1, h2, h3 { margin: 0 0 6px 0; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 2px solid #C47040; }
      .brand-row { display: flex; gap: 12px; align-items: center; }
      .brand-row .logo { width: 56px; height: 56px; border-radius: 12px; background: linear-gradient(135deg,#C47040,#E08B5C); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; overflow: hidden; }
      .brand-row .logo img { width: 100%; height: 100%; object-fit: cover; }
      .brand-name { font-size: 16px; font-weight: 700; }
      .brand-meta { font-size: 11px; color: #555; }
      .doc-meta { text-align: right; }
      .doc-meta .title { font-size: 18px; font-weight: 700; color: #C47040; }
      .doc-meta .no { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #444; }
      .to { margin: 16px 0; padding: 12px; background: #FBF8F3; border-radius: 8px; }
      .to .label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.04em; }
      .to .name { font-weight: 700; font-size: 14px; }
      table.items { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; }
      table.items th, table.items td { padding: 8px 6px; border-bottom: 1px solid #eaeaea; text-align: left; }
      table.items th { background: #FBF8F3; font-weight: 600; }
      table.items td:nth-child(n+3) { text-align: right; }
      table.summary { margin-left: auto; margin-top: 16px; min-width: 280px; font-size: 12px; }
      table.summary td { padding: 4px 8px; }
      table.summary tr:last-child td { border-top: 1px solid #C47040; }
      table.kv { width: 100%; font-size: 11px; }
      table.kv td { padding: 4px 6px; border-bottom: 1px dotted #eaeaea; }
      .right { text-align: right; }
      .section { margin-top: 24px; padding: 12px; background: #FBF8F3; border-radius: 8px; }
      .footer { margin-top: 32px; padding-top: 16px; border-top: 1px dashed #ccc; font-size: 10px; color: #777; }
      @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    </style></head><body>
      <div class="header">
        <div class="brand-row">
          <div class="logo">${logoUrl ? `<img src="${esc(logoUrl)}"/>` : esc((brand || '7R').slice(0, 2))}</div>
          <div>
            <div class="brand-name">${esc(brand || 'Tujuh Rasa')}</div>
            <div class="brand-meta">
              ${tagline ? esc(tagline) + '<br/>' : ''}
              ${address ? esc(address) + '<br/>' : ''}
              ${[phone, email].filter(Boolean).map(esc).join(' • ')}
            </div>
          </div>
        </div>
        <div class="doc-meta">
          <div class="title">${esc(docTitle)}</div>
          <div class="no">${esc(docNo)}</div>
          ${docDate ? `<div class="brand-meta">${esc(new Date(docDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }))}</div>` : ''}
        </div>
      </div>

      ${to ? `
        <div class="to">
          <div class="label">${esc(to.label || 'Kepada')}</div>
          <div class="name">${esc(to.name)}</div>
          ${to.sub ? `<div class="brand-meta">${esc(to.sub)}</div>` : ''}
          ${to.address ? `<div class="brand-meta">${esc(to.address)}</div>` : ''}
        </div>` : ''}

      ${sectionsHtml}
      ${tableHtml}
      ${summaryHtml}
      ${paymentsHtml}
      ${note ? `<div class="footer">${esc(note)}</div>` : ''}
    </body></html>`;
}

function openPrintWindow(html) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.append(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open(); doc.write(html); doc.close();
  // Need next tick for layout (especially with images).
  setTimeout(() => {
    try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (e) { console.warn(e); }
    setTimeout(() => iframe.remove(), 1000);
  }, 200);
}
