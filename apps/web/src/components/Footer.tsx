import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-ink text-cream mt-20">
      <div className="container-tr py-16 grid lg:grid-cols-[1.2fr_2fr] gap-10">
        <div>
          <p className="font-serif italic text-5xl leading-none">Tujuh Rasa</p>
          <p className="opacity-60 mt-2 text-sm">(tujuh rasa, satu meja)</p>
          <p className="mt-6 text-sm leading-relaxed opacity-80 max-w-sm">
            Kopi botolan nusantara. Diseduh segar setiap pagi di kedai kami,
            dibotolkan ke kaca, diantar ke pintu rumahmu hari yang sama.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="eyebrow text-cream/60 mb-3">jelajahi</p>
            <ul className="space-y-2 opacity-90">
              <li><Link href="/shop" className="tr-link">Semua botol</Link></li>
              <li><Link href="/build-box" className="tr-link">Build your box</Link></li>
              <li><Link href="/langganan" className="tr-link">Langganan</Link></li>
              <li><Link href="/grosir" className="tr-link">Grosir & group buy</Link></li>
              <li><Link href="/event" className="tr-link">Event kafe</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-cream/60 mb-3">temukan</p>
            <ul className="space-y-2 opacity-90">
              <li><a href="https://instagram.com" target="_blank" rel="noopener" className="tr-link">Instagram</a></li>
              <li><a href="https://tiktok.com" target="_blank" rel="noopener" className="tr-link">TikTok</a></li>
              <li><a href="https://open.spotify.com" target="_blank" rel="noopener" className="tr-link">Playlist Senja</a></li>
              <li><a href="mailto:halo@tujuhrasa.id" className="tr-link">halo@tujuhrasa.id</a></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-cream/60 mb-3">layanan</p>
            <ul className="space-y-2 opacity-90">
              <li><Link href="/account/orders" className="tr-link">Pesanan saya</Link></li>
              <li><Link href="/poin" className="tr-link">Poin & loyalti</Link></li>
              <li><Link href="/referral" className="tr-link">Ajak tetangga</Link></li>
              <li><Link href="/jelajah" className="tr-link">Jelajah rasa</Link></li>
              <li><Link href="/transparansi" className="tr-link">Transparansi & FAQ</Link></li>
              <li><Link href="/admin" className="tr-link">Admin</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/15">
        <div className="container-tr py-5 flex flex-wrap justify-between gap-3 text-xs opacity-60">
          <p>© {new Date().getFullYear()} Tujuh Rasa. Diseduh dengan sabar.</p>
          <p className="italic">PT Tujuh Rasa Nusantara · Jl. Tetangga No. 7, Jakarta Selatan</p>
        </div>
      </div>
    </footer>
  );
}
