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
    <div className="container-tr pt-32 pb-20">
      <p className="eyebrow mb-3">/ transparansi & FAQ</p>
      <h1 className="h-display text-[clamp(36px,6vw,72px)] leading-[1.02] mb-4">
        Buka semuanya.
      </h1>
      <p className="max-w-2xl opacity-80 mb-12">
        Sertifikat, petani mitra, footprint karbon, program botol balik — semua
        kami jelaskan sedetail mungkin di sini. Kalau ada yang belum jelas,
        WA kami langsung.
      </p>

      <section className="mb-14">
        <p className="eyebrow mb-3">/ sertifikat</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {SERTS.map((s) => (
            <article key={s.name} className="rounded-2xl border border-ink/20 bg-paper p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-serif italic text-xl leading-tight">{s.name}</p>
                <span className="rounded-full px-2 py-0.5 text-[10px] bg-leaf/15 text-leaf font-mono">aktif</span>
              </div>
              <p className="font-mono text-xs opacity-60 mt-2">{s.body}</p>
              <p className="font-mono text-sm mt-1">{s.id}</p>
              <p className="text-xs opacity-70 mt-1">berlaku sampai: {s.expires}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <p className="eyebrow mb-3">/ petani & supplier mitra</p>
        <div className="rounded-3xl border border-ink/20 bg-paper overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink text-cream">
              <tr>
                <th className="px-5 py-3 text-left font-mono text-xs lowercase">koperasi/grup</th>
                <th className="px-5 py-3 text-left font-mono text-xs lowercase">wilayah</th>
                <th className="px-5 py-3 text-right font-mono text-xs lowercase">petani</th>
                <th className="px-5 py-3 text-right font-mono text-xs lowercase">luas (ha)</th>
                <th className="px-5 py-3 text-right font-mono text-xs lowercase">sejak</th>
              </tr>
            </thead>
            <tbody>
              {PETANI.map((p) => (
                <tr key={p.name} className="border-t border-ink/10">
                  <td className="px-5 py-4 font-serif italic">{p.name}</td>
                  <td className="px-5 py-4 opacity-80">{p.region}</td>
                  <td className="px-5 py-4 text-right font-mono">{p.farmers}</td>
                  <td className="px-5 py-4 text-right font-mono">{p.ha}</td>
                  <td className="px-5 py-4 text-right font-mono opacity-70">{p.since}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-14">
        <p className="eyebrow mb-3">/ jejak karbon</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CARBON_ITEMS.map((c) => (
            <article key={c.metric} className="rounded-2xl border border-leaf/30 bg-leaf/5 p-5">
              <p className="font-mono text-xs opacity-60 lowercase">{c.metric}</p>
              <p className="font-display text-3xl text-leaf mt-2">{c.value}</p>
              <p className="text-xs mt-2 opacity-80">{c.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <p className="eyebrow mb-3">/ program botol kembali</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BOTTLE_PROGRAM.map((s) => (
            <article key={s.step} className="rounded-2xl border border-ink/20 bg-paper p-5">
              <p className="font-mono text-xs opacity-60">{s.step}</p>
              <p className="font-serif italic text-lg mt-1">{s.title}</p>
              <p className="text-sm mt-2 opacity-80">{s.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <p className="eyebrow mb-3">/ pertanyaan yang sering ditanya</p>
        <div className="rounded-3xl border border-ink/20 bg-paper p-2">
          {FAQ.map((f, i) => (
            <details key={i} className="group border-b border-ink/10 last:border-0">
              <summary className="cursor-pointer px-5 py-4 flex items-center justify-between gap-3 font-serif italic text-lg group-open:text-orange transition">
                <span>{f.q}</span>
                <span className="text-xl opacity-60 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="px-5 pb-5 opacity-80 text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <p className="eyebrow mb-3">/ newsletter — cerita kafe per minggu</p>
        <div className="rounded-3xl border border-orange/40 bg-orange/5 p-6">
          <p className="font-serif italic text-2xl mb-2">
            Kirim cerita seminggu sekali ke email kamu.
          </p>
          <p className="text-sm opacity-80 mb-4 max-w-xl">
            Tiap Jumat sore: 1 origin yang lagi musim panen, 1 resep brewing,
            1 surprise kode promo khusus pelanggan newsletter.
          </p>
          <NewsletterForm />
        </div>
      </section>

      <p className="text-sm opacity-70">
        Mau cek hal lain? <Link href="/cerita" className="tr-link">/cerita</Link>{" "}
        ·{" "}
        <Link href="/jelajah" className="tr-link">/jelajah</Link>{" "}
        ·{" "}
        <Link href="/poin" className="tr-link">/poin</Link>
      </p>
    </div>
  );
}
