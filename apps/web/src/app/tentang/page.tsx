export default function TentangPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="container-tr max-w-4xl">
        <p className="eyebrow mb-3">/ tentang kami</p>
        <h1 className="h-display text-[clamp(48px,7vw,96px)] leading-[1] mb-8">
          Tujuh rasa,<br/><span className="text-ink-soft">satu meja besar.</span>
        </h1>
        <p className="text-xl leading-relaxed mb-6">
          Tujuh Rasa berawal dari kedai kecil di Kebayoran Lama, Jakarta Selatan. Dari sebuah meja yang setiap pagi diisi tujuh tetangga: pak satpam, ibu warung, kurir, mahasiswa, dua anak SMA yang nongkrong dan satu turis yang tersesat.
        </p>
        <p className="text-base leading-relaxed opacity-80 mb-6">
          Kami sadar — kopi tidak harus mahal untuk jadi spesial. Yang spesial adalah orang-orang yang ditemui di sekitarnya. Jadi kami botolkan kopi, biar yang tidak sempat mampir tetap bisa ikut duduk di meja kami, di mana pun mereka berada.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 my-12">
          {[
            { n: "7", l: "varian rasa nusantara" },
            { n: "12", l: "petani mitra di 4 daerah" },
            { n: "0", l: "bahan pengawet" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-ink/20 bg-paper p-6">
              <p className="font-serif italic text-6xl">{s.n}</p>
              <p className="opacity-80 mt-1">{s.l}</p>
            </div>
          ))}
        </div>

        <h2 className="h-display text-3xl mb-4 mt-12">Janji kami.</h2>
        <ul className="space-y-3 list-none">
          {[
            "Botol diseduh segar setiap pagi — tidak ada stok lama.",
            "Biji dibeli langsung dari petani Indonesia dengan harga adil.",
            "Tidak ada bahan pengawet, tidak ada perasa buatan.",
            "Botol kaca bisa ditukar kembali — kami bersihkan & gunakan ulang.",
            "Pengiriman lokal tetangga: sebisa mungkin sepeda atau motor listrik.",
          ].map((p, i) => (
            <li key={i} className="flex gap-4 border-t border-ink/20 pt-3">
              <span className="font-mono text-xs opacity-50 w-8 mt-1.5">0{i + 1}</span>
              <p className="text-base leading-relaxed">{p}</p>
            </li>
          ))}
        </ul>

        <h2 className="h-display text-3xl mb-4 mt-16">Tim kecil kami.</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { n: "Rara", r: "Co-founder, kepala dapur", c: "#e07a3c" },
            { n: "Bayu", r: "Roaster", c: "#7e8c5a" },
            { n: "Yudha", r: "Operasional kurir", c: "#5a4632" },
          ].map((m) => (
            <div key={m.n} className="rounded-2xl p-6 text-cream" style={{ background: m.c }}>
              <p className="font-serif italic text-3xl">{m.n}</p>
              <p className="opacity-80 mt-1 text-sm">{m.r}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
