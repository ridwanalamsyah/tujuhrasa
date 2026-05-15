import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CeritaPage() {
  const posts = await prisma.journalPost.findMany({ orderBy: { id: "desc" } });
  return (
    <>
      <section className="border-b-2 border-[var(--tr-ink)] bg-[var(--tr-cream)]">
        <div className="container-tr pt-12 pb-10 lg:pt-16 lg:pb-12">
          <p className="eyebrow mb-3">Cerita kedai</p>
          <h1 className="font-display font-black text-[clamp(48px,8vw,120px)] leading-[0.92] tracking-[-0.025em]">
            Jurnal<br />
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
        {posts.length === 0 ? (
          <div className="card-stamp p-10 text-center">
            <p className="font-display-italic text-2xl">Belum ada cerita.</p>
            <p className="text-[var(--tr-text-muted)] mt-2 text-sm">
              Tim kami sedang nulis batch baru. Cek lagi besok pagi.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/cerita/${p.slug}`}
                className="group card-stamp bg-[var(--tr-paper)] overflow-hidden flex flex-col"
              >
                <div
                  className="aspect-[5/3] flex items-end p-4 border-b-2 border-[var(--tr-ink)]"
                  style={{ background: p.cover }}
                >
                  <p className="font-mono text-[10px] tracking-widest uppercase text-[var(--tr-paper)]/95 bg-[var(--tr-ink)]/40 px-2 py-0.5 rounded-sm">
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
        )}
      </section>
    </>
  );
}
