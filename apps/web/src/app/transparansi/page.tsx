export const dynamic = "force-dynamic";

export const metadata = {
  title: "Transparansi — Tujuh Rasa",
  description:
    "Sertifikat halal, daftar petani mitra, footprint karbon, dan program botol kembali.",
};

const SERTS = [
  { name: "Halal MUI", id: "ID-MUI-2024-08-2156", body: "Majelis Ulama Indonesia", expires: "Agustus 2027" },
  { name: "BPOM", id: "MD 145523128001", body: "Badan POM RI", expires: "permanen, batch tested" },
  { name: "PIRT", id: "P-IRT 215327101789", body: "Dinas Kesehatan Jakarta", expires: "Mei 2027" },
  { name: "Organic by control union (kopi)", id: "CU-851523", body: "Control Union Indonesia", expires: "Juni 2026" },
];

const PETANI = [
  { name: "Koperasi Tani Gayo Mega", region: "Takengon, Aceh", since: "2019", farmers: 124, ha: 280 },
  { name: "Wisata Tani Sulawesi", region: "Tana Toraja, Sulsel", since: "2018", farmers: 68, ha: 142 },
  { name: "Petani Bali Kintamani", region: "Bangli, Bali", since: "2021", farmers: 41, ha: 96 },
  { name: "Asosiasi Pandan Bogor", region: "Cikampek, Jabar", since: "2023", farmers: 22, ha: 18 },
  { name: "Susu Sapi Lembang", region: "Bandung Barat, Jabar", since: "2020", farmers: 8, ha: 75 },
];

const CARBON_ITEMS = [
  { metric: "Emisi per botol (cradle-to-customer)", value: "0,38 kg CO₂e", note: "termasuk biji, susu, listrik kafe, kurir Jabodetabek" },
  { metric: "Reduksi tahun ini vs 2024", value: "−18%", note: "ganti motor kurir ke listrik untuk Jaksel + listrik kafe pakai PLTS atap" },
  { metric: "Botol kaca return rate", value: "67%", note: "67% pelanggan mengembalikan botol kaca, sisanya dikompensasi reforestasi" },
  { metric: "Pohon ditanam (kompensasi)", value: "1.247 pohon", note: "via Trees4Trees Jawa Tengah" },
];

const BOTTLE_PROGRAM = [
  { step: "01", title: "Beli botol", desc: "harga botol Rp 10rb sudah termasuk Rp 2rb deposit botol kaca." },
  { step: "02", title: "Habiskan kopinya 😊", desc: "boleh disimpan di kulkas sampai 5 hari setelah botol dibuka." },
  { step: "03", title: "Cuci & kembalikan", desc: "ke kafe Tebet, atau kurir kami akan jemput saat order berikutnya." },
  { step: "04", title: "Dapat Rp 2rb balik", desc: "auto-credit ke poin loyalti kamu (2 poin = Rp 2rb diskon order berikutnya)." },
];

const FAQ = [
  { q: "Berapa lama botol bisa disimpan?", a: "Sebelum dibuka: 21 hari di kulkas (4°C). Setelah dibuka: 3-5 hari." },
  { q: "Pengantarannya gimana?", a: "Jabodetabek pakai kurir motor sendiri, di luar Jabodetabek pakai JNE COD/Yes / Sicepat — semua botol pakai cooler box es gel selama transit." },
  { q: "Berapa lama dari pesan sampai sampai?", a: "Jabodetabek: 2-4 jam (order sebelum jam 14:00). Luar Jabodetabek: 1-2 hari kerja." },
  { q: "Bisa custom rasa untuk acara?", a: "Bisa, minimum 100 botol. Kontak via /grosir atau WA langsung." },
  { q: "Kalau botolnya pecah pas sampai?", a: "Foto botol pecah, kirim ke WA kami — kami ganti botol baru atau refund 100%." },
  { q: "Pakai pengawet?", a: "Tidak. Hanya pasteurisasi flash (95°C 30 detik) lalu langsung disimpan di 4°C." },
  { q: "Halal?", a: "Iya, kopi & susu sapi sudah bersertifikat MUI 2024-2027. Kafein dalam batas aman puasa." },
  { q: "Bisa langganan?", a: "Bisa. Cek halaman /langganan untuk paket weekly / biweekly / monthly." },
  { q: "Apa beda dengan kopi botolan lain?", a: "Kami pakai biji kopi single-origin Indonesia, bukan kopi instan / robusta murah. Botol kaca, bukan plastik. Diantar dingin, bukan suhu ruang." },
  { q: "Ada cabangnya di luar Jakarta?", a: "Belum. Kafe baru ada di Tebet. Tapi kami antar ke seluruh Indonesia via kurir cold-chain." },
];
import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";

export default function TransparansiPage() {
  return (
    <>
      <section className="bg-[var(--tr-paper)] border-b-2 border-[var(--tr-ink)]">
        <div className="container-tr py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="stamp">Transparansi &amp; FAQ</span>
            <span className="font-hand text-2xl text-[var(--tr-brick-deep)]">
              semuanya boleh diintip —
            </span>
          </div>
          <h1 className="font-display font-black text-[clamp(36px,6vw,72px)] leading-[0.98] tracking-[-0.02em] mb-4">
            Buka{" "}
            <em className="text-[var(--tr-brick)]">semuanya.</em>
          </h1>
          <p className="max-w-2xl text-[var(--tr-text-soft)] leading-relaxed">
            Sertifikat, petani mitra, footprint karbon, program botol balik —
            semua kami jelaskan sedetail mungkin di sini. Kalau ada yang belum
            jelas, WA kami langsung.
          </p>
        </div>
      </section>

      <div className="container-tr py-12 sm:py-16 space-y-14">
        <section>
          <p className="eyebrow mb-3">Sertifikat</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {SERTS.map((s) => (
              <article key={s.name} className="card-stamp p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display font-bold text-xl leading-tight">{s.name}</p>
                  <span className="stamp bg-[var(--tr-leaf)] text-[var(--tr-paper)]">aktif</span>
                </div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--tr-text-muted)] mt-2">
                  {s.body}
                </p>
                <p className="font-mono text-sm mt-1">{s.id}</p>
                <p className="text-xs text-[var(--tr-text-muted)] mt-1">
                  berlaku sampai: {s.expires}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <p className="eyebrow mb-3">Petani &amp; supplier mitra</p>
          <div className="rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] overflow-hidden shadow-stamp-sm">
            <table className="w-full text-sm">
              <thead className="bg-[var(--tr-ink)] text-[var(--tr-paper)]">
                <tr>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Koperasi/grup</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Wilayah</th>
                  <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Petani</th>
                  <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Luas (ha)</th>
                  <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Sejak</th>
                </tr>
              </thead>
              <tbody>
                {PETANI.map((p) => (
                  <tr key={p.name} className="border-t-2 border-[var(--tr-ink)]/15">
                    <td className="px-5 py-4 font-display font-bold">{p.name}</td>
                    <td className="px-5 py-4 text-[var(--tr-text-soft)]">{p.region}</td>
                    <td className="px-5 py-4 text-right font-mono tabular-nums">{p.farmers}</td>
                    <td className="px-5 py-4 text-right font-mono tabular-nums">{p.ha}</td>
                    <td className="px-5 py-4 text-right font-mono tabular-nums text-[var(--tr-text-muted)]">{p.since}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <p className="eyebrow mb-3">Jejak karbon</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CARBON_ITEMS.map((c) => (
              <article
                key={c.metric}
                className="card-stamp p-5 bg-[var(--tr-paper-2)]"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--tr-text-muted)]">
                  {c.metric}
                </p>
                <p className="font-display font-black text-3xl text-[var(--tr-leaf)] mt-2 leading-none">
                  {c.value}
                </p>
                <p className="text-xs mt-2 text-[var(--tr-text-soft)] leading-relaxed">
                  {c.note}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <p className="eyebrow mb-3">Program botol kembali</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BOTTLE_PROGRAM.map((s) => (
              <article key={s.step} className="card-stamp p-5">
                <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--tr-brick)] font-bold">
                  {s.step}
                </p>
                <p className="font-display font-bold text-lg mt-1">{s.title}</p>
                <p className="text-sm mt-2 text-[var(--tr-text-soft)] leading-relaxed">
                  {s.desc}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <p className="eyebrow mb-3">Pertanyaan yang sering ditanya</p>
          <div className="rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] divide-y-2 divide-[var(--tr-ink)] overflow-hidden">
            {FAQ.map((f, i) => (
              <details key={i} className="group">
                <summary className="cursor-pointer px-5 py-4 flex items-center justify-between gap-3 font-display font-semibold text-base sm:text-lg hover:bg-[var(--tr-paper-2)] transition list-none">
                  <span>{f.q}</span>
                  <span className="w-7 h-7 grid place-items-center rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] group-open:bg-[var(--tr-brick)] group-open:text-[var(--tr-paper)] group-open:rotate-45 transition font-mono text-base shrink-0">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-[var(--tr-text-soft)] text-sm leading-relaxed bg-[var(--tr-paper-2)]">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section>
          <p className="eyebrow mb-3">Newsletter — cerita kafe per minggu</p>
          <div className="rounded-md border-2 border-[var(--tr-ink)] shadow-stamp bg-[var(--tr-mustard-soft)]/35 p-6 sm:p-7">
            <p className="font-display font-black text-2xl mb-2">
              Kirim cerita seminggu sekali ke email kamu.
            </p>
            <p className="text-sm text-[var(--tr-text-soft)] mb-4 max-w-xl">
              Tiap Jumat sore: 1 origin yang lagi musim panen, 1 resep brewing,
              1 surprise kode promo khusus pelanggan newsletter.
            </p>
            <NewsletterForm />
          </div>
        </section>

        <p className="text-sm text-[var(--tr-text-muted)]">
          Mau cek hal lain? <Link href="/cerita" className="tr-link">/cerita</Link>{" "}
          · <Link href="/jelajah" className="tr-link">/jelajah</Link>{" "}
          · <Link href="/poin" className="tr-link">/poin</Link>
        </p>
      </div>
    </>
  );
}
