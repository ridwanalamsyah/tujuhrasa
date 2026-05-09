import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CeritaPage() {
  const posts = await prisma.journalPost.findMany({ orderBy: { id: "desc" } });
  return (
    <div className="container-tr pt-32 pb-20">
      <p className="eyebrow mb-3">/ cerita</p>
      <h1 className="h-display text-[clamp(40px,6vw,84px)] leading-[1.02] mb-2">
        Jurnal kedai.
      </h1>
      <p className="opacity-80 max-w-xl mb-12">
        Catatan-catatan kecil dari dapur, dari rak, dari obrolan dengan pelanggan dan tetangga.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/cerita/${p.slug}`}
            className="group rounded-3xl border border-ink/15 overflow-hidden bg-paper hover:-translate-y-1 transition card-shadow"
          >
            <div className="aspect-[4/3] flex items-end p-6" style={{ background: p.cover }}>
              <p className="font-mono text-xs text-cream/90">{new Date(p.createdAt).toLocaleDateString("id-ID")}</p>
            </div>
            <div className="p-6">
              <p className="font-serif italic text-2xl leading-tight">{p.title}</p>
              <p className="opacity-70 text-sm mt-2 line-clamp-3">{p.excerpt}</p>
              <p className="mt-4 font-mono text-xs opacity-60">— {p.author}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
