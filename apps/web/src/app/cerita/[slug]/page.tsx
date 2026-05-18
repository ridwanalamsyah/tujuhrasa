import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PLACEHOLDER_POSTS } from "@/lib/journal-placeholders";

export const dynamic = "force-dynamic";

const PLACEHOLDER_BODY: Record<string, string> = {
  "kopi-pagi-bandung": `Setiap pagi sebelum matahari sampai jendela, ada ritual kecil di dapur kami: timbang biji, panaskan air, tunggu sampai suhu pas. Kami bukan kafe besar, jadi tiap takarannya kami catat tangan supaya konsisten.\n\nRatio yang kami pakai untuk batch botol: 1:15 (biji : air), grind medium-fine, brew 4 menit. Hasilnya body-nya cukup penuh tapi tidak pahit di tegukan kedua. Cocok diminum dingin atau langsung dari kulkas.\n\nKenapa repot? Karena botol-botol ini akan ada di tangan kamu — di kelas, di kantor, di kos — dan kami ingin tiap teguknya nostalgia ke pagi yang sama.`,
  "matcha-cerita-daun": `Matcha bukan sekadar bubuk hijau. Yang kami pakai adalah culinary grade dari Uji, Jepang — bukan supermarket-level. Setiap pengiriman kami tes warna, aroma, dan kelarutan dulu sebelum naik produksi.\n\nKomposisi botol matcha kami: 1 sendok teh matcha, susu segar full-cream, sedikit pemanis aren cair. Tanpa krim buatan. Tanpa rasa "vanila" buatan.\n\nKalau kamu cinta matcha tapi tidak suka manis berlebihan, ini buat kamu.`,
  "halal-jujur-takarannya": `Sertifikat halal kami terbit Januari 2026. Tapi sebelum itu pun, kami sudah jalan dengan prinsip yang sama: bahan jelas, sumber jelas, proses jelas.\n\nDi halaman /transparansi kamu bisa lihat semua: supplier susu, supplier biji kopi, supplier botol, jadwal sterilisasi, dan log sanitasi mingguan. Kalau ada yang mau bertamu ke dapur, boleh — DM kami.\n\nJujur takarannya, jujur prosesnya, jujur juga harganya.`,
  "anak-kos-anak-kelas": `"Kak, kopi botolan paling murah berapa?" — itu pertanyaan paling sering masuk ke WA kami.\n\nJawabannya: 10 ribu. Bukan karena obral, tapi karena memang kami niat dari awal: kopi enak buat anak kos & anak kelas pagi, jangan sampai dompet jadi pertimbangan utama.\n\nGimana caranya? Botol PET kecil (250ml), produksi batch besar, distribusi langsung ke kampus & kos sekitar Bandung. Marginnya tipis tapi cukup.`,
  "botol-balik-program": `Tukar 5 botol kosong = 1 botol gratis (rasa apa saja). Botol kaca kami dibersihkan, disterilkan, dan diisi ulang.\n\nKenapa? Karena (1) botol kaca bagus untuk produk pasteurisasi flash, (2) lebih sedikit sampah, (3) deposit Rp 2rb yang kamu bayar di awal akan balik penuh ke poin loyalti.\n\nJadi gak ada alasan buat buang botol. Bawa ke booth kami atau titipkan ke kurir saat order berikutnya.`,
  "weekend-meja-sebelah": `Sabtu pagi di booth kami biasanya rame. Mahasiswa lewat, beli, terus duduk sebentar di meja sebelah. Dari obrolan-obrolan kecil itu, kami tahu rasa apa yang sedang dicari, kapan stok kurang, kapan rasanya kemanisan.\n\nMinggu lalu ada cerita lucu: pelanggan yang biasa beli matcha tiba-tiba minta kopi susu, "buat skripsi yang macet". Seminggu kemudian dia balik bawa pacarnya. Tahu-tahu sudah seminar proposal. Ya begitulah kafe — bukan cuma soal botolnya.`,
};

type ViewPost = {
  id: string | number;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  cover: string;
  createdAt: string;
  body: string;
  isPlaceholder: boolean;
};

async function safePost(slug: string): Promise<ViewPost | null> {
  try {
    const p = await prisma.journalPost.findUnique({ where: { slug } });
    if (!p) return null;
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      author: p.author,
      cover: p.cover,
      createdAt: new Date(p.createdAt).toISOString(),
      body: p.body,
      isPlaceholder: false,
    };
  } catch {
    return null;
  }
}

async function relatedPosts(slug: string, isPlaceholder: boolean): Promise<ViewPost[]> {
  if (isPlaceholder) {
    return PLACEHOLDER_POSTS.filter((p) => p.slug !== slug)
      .slice(0, 2)
      .map((p) => ({ ...p, body: "", isPlaceholder: true }));
  }
  try {
    const rows = await prisma.journalPost.findMany({
      where: { slug: { not: slug } },
      take: 2,
    });
    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      author: p.author,
      cover: p.cover,
      createdAt: new Date(p.createdAt).toISOString(),
      body: p.body,
      isPlaceholder: false,
    }));
  } catch {
    return [];
  }
}

function isUrl(s: string): boolean {
  return /^https?:\/\//.test(s);
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const real = await safePost(params.slug);
  let post: ViewPost | null = real;
  if (!post) {
    const ph = PLACEHOLDER_POSTS.find((p) => p.slug === params.slug);
    if (ph) {
      post = {
        ...ph,
        body: PLACEHOLDER_BODY[ph.slug] ?? ph.excerpt,
        isPlaceholder: true,
      };
    }
  }
  if (!post) notFound();
  const related = await relatedPosts(post.slug, post.isPlaceholder);

  return (
    <article className="pt-32 pb-20">
      <div className="container-tr max-w-3xl">
        <Link
          href="/cerita"
          className="font-mono text-xs opacity-70 hover:opacity-100"
        >
          ← semua cerita
        </Link>
        <p className="eyebrow mt-6 mb-3">
          / jurnal · {new Date(post.createdAt).toLocaleDateString("id-ID")}
        </p>
        <h1 className="font-display font-black text-[clamp(36px,6vw,72px)] leading-[1.05] tracking-tight">
          {post.title}
        </h1>
        <p className="mt-4 font-mono text-xs opacity-60">— {post.author}</p>
      </div>

      <div className="container-tr max-w-3xl mt-10">
        <div className="relative aspect-[16/7] rounded-3xl mb-8 overflow-hidden border-2 border-[var(--tr-ink)]">
          {isUrl(post.cover) ? (
            <Image
              src={post.cover}
              alt=""
              fill
              sizes="(min-width:1024px) 768px, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: post.cover }}
            />
          )}
        </div>
        <div className="prose prose-stone max-w-none text-base leading-relaxed whitespace-pre-line">
          {post.body}
        </div>
      </div>

      <div className="container-tr max-w-3xl mt-16">
        <p className="eyebrow mb-3">/ baca juga</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {related.map((p) => (
            <Link
              key={p.id}
              href={`/cerita/${p.slug}`}
              className="rounded-2xl border-2 border-[var(--tr-ink)] p-5 bg-[var(--tr-paper)] hover:-translate-y-1 transition"
            >
              <p className="font-display font-bold italic text-xl">{p.title}</p>
              <p className="opacity-70 text-sm mt-1 line-clamp-2">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
