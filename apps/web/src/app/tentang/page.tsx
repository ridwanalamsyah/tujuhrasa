export default function TentangPage() {
  return (
    <>
      <section className="border-b-2 border-[var(--tr-ink)] bg-[var(--tr-cream)]">
        <div className="container-tr pt-12 pb-10 lg:pt-16 lg:pb-12">
          <p className="eyebrow mb-3">Tentang kami</p>
          <h1 className="font-display font-black text-[clamp(48px,8vw,120px)] leading-[0.92] tracking-[-0.025em]">
            Halal-first,<br />
            <span className="text-[var(--tr-brick)]">student-made.</span>
          </h1>
          <p className="font-hand text-3xl text-[var(--tr-brick-deep)] mt-4">
            taste the vibe, feel the rasa —
          </p>
        </div>
      </section>

      <section className="container-tr pt-14 pb-20 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8 mb-14">
          <p className="text-lg sm:text-xl leading-relaxed">
            Tujuh Rasa lahir Mei 2025 dari dapur kecil di Bandung. Berangkat
            dari pertanyaan sederhana: kenapa minuman kekinian harus mahal,
            sulit dicari halalnya, dan jauh dari kantong mahasiswa?
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-[var(--tr-text-soft)]">
            Kami racik tujuh rasa kekinian — kopi susu gula aren, matcha,
            cokelat, taro, susu kurma — dengan bahan halal &amp;{" "}
            <span className="tr-highlight">thayyib</span>, harga 10–13 ribu,
            antar GoSend / GrabExpress sekitar Bandung. Sesuai prinsip
            muamalah: jujur, adil, transparan.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 my-12">
          {[
            { n: "7", l: "varian rasa kekinian" },
            { n: "100%", l: "halal & thayyib" },
            { n: "0", l: "bahan pengawet" },
          ].map((s) => (
            <div key={s.l} className="card-stamp p-6">
              <p className="font-display font-black text-7xl leading-none text-[var(--tr-brick)] tabular-nums">
                {s.n}
              </p>
              <p className="mt-3 text-[var(--tr-text-soft)] text-sm sm:text-base leading-snug">
                {s.l}
              </p>
            </div>
          ))}
        </div>

        <h2 className="font-display font-black text-3xl sm:text-4xl mb-6 mt-16">
          Janji kami.
        </h2>
        <ul className="space-y-0 border-t-2 border-[var(--tr-ink)]">
          {[
            "Diracik segar setiap hari — PET 250ml steril, tidak ada stok lama.",
            "Bahan baku bersertifikat halal & thayyib, ditelusuri sumbernya.",
            "Harga 10–13 ribu — ramah kantong mahasiswa, transparan tanpa hidden fee.",
            "Mahasiswa-run, mahasiswa-untuk-mahasiswa: 100% tim kampus.",
            "Antar Bandung pakai GoSend / GrabExpress — 1–3 jam ke kos atau kelas.",
          ].map((p, i) => (
            <li
              key={i}
              className="flex gap-5 sm:gap-7 border-b-2 border-[var(--tr-ink)] py-5"
            >
              <span className="font-mono text-[11px] opacity-50 tracking-widest w-10 mt-1.5">
                0{i + 1}
              </span>
              <p className="text-base sm:text-lg leading-relaxed flex-1">{p}</p>
            </li>
          ))}
        </ul>

        <h2 className="font-display font-black text-3xl sm:text-4xl mb-6 mt-16">
          Tim kecil kami.
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { n: "Rara", r: "Co-founder & operations", c: "var(--tr-brick)" },
            { n: "Bayu", r: "Brewer & R&D rasa", c: "var(--tr-leaf)" },
            { n: "Yudha", r: "Logistik kampus", c: "var(--tr-cocoa)" },
          ].map((m) => (
            <div
              key={m.n}
              className="rounded-md border-2 border-[var(--tr-ink)] shadow-stamp p-6 text-[var(--tr-paper)]"
              style={{ background: m.c }}
            >
              <p className="font-display font-black text-3xl">{m.n}</p>
              <p className="opacity-80 mt-1 text-sm">{m.r}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
