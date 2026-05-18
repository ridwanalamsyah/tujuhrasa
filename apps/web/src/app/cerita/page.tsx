import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PLACEHOLDER_POSTS } from "@/lib/journal-placeholders";

export const dynamic = "force-dynamic";

type CardPost = {
  id: string | number;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  cover: string;
  createdAt: string;
  isPlaceholder?: boolean;
};

async function safePosts(): Promise<CardPost[]> {
  try {
    const rows = await prisma.journalPost.findMany({ orderBy: { id: "desc" } });
    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      author: p.author,
      cover: p.cover,
      createdAt: new Date(p.createdAt).toISOString(),
    }));
  } catch {
    return [];
  }
}

function isUrl(s: string): boolean {
  return /^https?:\/\//.test(s);
}

export default async function CeritaPage() {
  const real = await safePosts();
  const posts: CardPost[] =
    real.length > 0
      ? real
      : PLACEHOLDER_POSTS.map((p) => ({ ...p, isPlaceholder: true }));

  return (
    <>
      <section className="border-b-2 border-[var(--tr-ink)] bg-[var(--tr-cream)]">
        <div className="container-tr pt-12 pb-10 lg:pt-16 lg:pb-12">
          <p className="eyebrow mb-3">Cerita kedai</p>
          <h1 className="font-display font-black text-[clamp(48px,8vw,120px)] leading-[0.92] tracking-[-0.025em]">
            Jurnal
            <br />
            <span className="text-[var(--tr-brick)]">kedai.</span>
          </h1>
          <p className="font-hand text-3xl text-[var(--tr-brick-deep)] mt-4">
            cerita-cerita kecil dari dapur —
          </p>
          <p className="mt-5 text-[var(--tr-text-soft)] max-w-xl text-base sm:text-lg leading-relaxed">
            Catatan-catatan dari dapur, dari rak, dari obrolan dengan
            pelanggan dan tetangga.
          </p>
        </div>
      </section>

      <section className="container-tr pt-12 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/cerita/${p.slug}`}
              className="group card-stamp bg-[var(--tr-paper)] overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[5/3] border-b-2 border-[var(--tr-ink)] overflow-hidden">
                {isUrl(p.cover) ? (
                  <Image
                    src={p.cover}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: p.cover }}
                  />
                )}
                <p className="absolute left-3 bottom-3 z-10 font-mono text-[10px] tracking-widest uppercase text-[var(--tr-paper)] bg-[var(--tr-ink)]/70 px-2 py-0.5 rounded-sm">
                  {new Date(p.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="font-display font-bold text-xl leading-tight text-[var(--tr-ink)] group-hover:text-[var(--tr-brick)] transition-colors">
                  {p.title}
                </p>
                <p className="text-[var(--tr-text-soft)] text-sm mt-2 leading-relaxed line-clamp-3 flex-1">
                  {p.excerpt}
                </p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[var(--tr-text-muted)]">
                  — {p.author}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
