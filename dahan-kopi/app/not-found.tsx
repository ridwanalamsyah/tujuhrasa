import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";

export const metadata: Metadata = { title: "Halaman tidak ketemu" };

export default function NotFound() {
  return (
    <Container className="pt-16 lg:pt-24">
      <h1 className="display-1">Tidak ketemu</h1>
      <p className="mt-4">Halaman ini tidak ada atau sudah dipindah.</p>
      <div className="mt-4 flex gap-6">
        <TextLink href="/">Ke halaman utama</TextLink>
        <TextLink href="/menu">Lihat menu</TextLink>
      </div>
    </Container>
  );
}
