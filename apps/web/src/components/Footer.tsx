import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[var(--tr-ink)] text-[var(--tr-paper)] mt-20 border-t-2 border-[var(--tr-ink)]">
      <div className="container-tr py-14 lg:py-20 grid lg:grid-cols-[1.2fr_2fr] gap-10 lg:gap-16">
        <div>
          <p className="font-display font-black text-5xl lg:text-6xl leading-none">
            Tujuh<br />Rasa.
          </p>
          <p className="font-hand text-2xl mt-3 text-[var(--tr-mustard-soft)]">
            (tujuh rasa, satu meja)
          </p>
          <p className="mt-6 text-sm leading-relaxed text-[var(--tr-paper)]/70 max-w-sm">
            Kopi botolan nusantara. Diseduh segar setiap pagi di kedai kami,
            dibotolkan ke kaca, diantar ke pintu rumahmu hari yang sama.
          </p>
          <p className="mt-6 font-mono text-[11px] text-[var(--tr-paper)]/50 tracking-widest uppercase">
            Est. 2025 · Jakarta
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--tr-mustard-soft)] mb-4">
              Jelajahi
            </p>
            <ul className="space-y-2.5">
              <li><Link href="/shop" className="tr-link">Semua botol</Link></li>
              <li><Link href="/build-box" className="tr-link">Build a box</Link></li>
              <li><Link href="/langganan" className="tr-link">Langganan</Link></li>
              <li><Link href="/grosir" className="tr-link">Grosir</Link></li>
              <li><Link href="/event" className="tr-link">Event kafe</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--tr-mustard-soft)] mb-4">
              Temukan
            </p>
            <ul className="space-y-2.5">
              <li><a href="https://instagram.com" target="_blank" rel="noopener" className="tr-link">Instagram</a></li>
              <li><a href="https://tiktok.com" target="_blank" rel="noopener" className="tr-link">TikTok</a></li>
              <li><a href="mailto:halo@tujuhrasa.id" className="tr-link">halo@tujuhrasa.id</a></li>
              <li><a href="https://wa.me/628000000000" target="_blank" rel="noopener" className="tr-link">WhatsApp</a></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--tr-mustard-soft)] mb-4">
              Layanan
            </p>
            <ul className="space-y-2.5">
              <li><Link href="/account/orders" className="tr-link">Pesanan saya</Link></li>
              <li><Link href="/poin" className="tr-link">Poin &amp; loyalti</Link></li>
              <li><Link href="/referral" className="tr-link">Ajak tetangga</Link></li>
              <li><Link href="/transparansi" className="tr-link">FAQ &amp; transparansi</Link></li>
              <li><Link href="/admin" className="tr-link opacity-60">Admin</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--tr-paper)]/15">
        <div className="container-tr py-5 flex flex-wrap justify-between gap-3 text-[11px] font-mono uppercase tracking-widest text-[var(--tr-paper)]/50">
          <p>© {new Date().getFullYear()} Tujuh Rasa. Diseduh dengan sabar.</p>
          <p>PT Tujuh Rasa Nusantara · Jl. Tetangga No. 7</p>
        </div>
      </div>
    </footer>
  );
}
