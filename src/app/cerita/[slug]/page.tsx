import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.journalPost.findUnique({ where: { slug: params.slug } });
  if (!post) notFound();
  const related = await prisma.journalPost.findMany({ where: { slug: { not: post.slug } }, take: 2 });

  return (
    <article className="pt-32 pb-20">
      <div className="container-tr max-w-3xl">
        <Link href="/cerita" className="font-mono text-xs opacity-70 hover:opacity-100">← semua cerita</Link>
        <p className="eyebrow mt-6 mb-3">/ jurnal · {new Date(post.createdAt).toLocaleDateString("id-ID")}</p>
        <h1 className="h-display text-[clamp(36px,6vw,72px)] leading-[1.05]">{post.title}</h1>
        <p className="mt-4 font-mono text-xs opacity-60">— {post.author}</p>
      </div>

      <div className="container-tr max-w-3xl mt-10">
        <div className="aspect-[16/7] rounded-3xl mb-8" style={{ background: post.cover }} />
        <div className="prose prose-stone max-w-none text-base leading-relaxed whitespace-pre-line">
          {post.body}
        </div>
      </div>

      <div className="container-tr max-w-3xl mt-16">
        <p className="eyebrow mb-3">/ baca juga</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {related.map((p) => (
            <Link key={p.id} href={`/cerita/${p.slug}`} className="rounded-2xl border border-ink/15 p-5 bg-paper hover:-translate-y-1 transition">
              <p className="font-serif italic text-xl">{p.title}</p>
              <p className="opacity-70 text-sm mt-1 line-clamp-2">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
