import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NotFound() {
  return (
    <div className="pb-32">
      <PageHeader
        eyebrow="404"
        title="Halaman tidak ditemukan"
        actions={
          <>
            <ButtonLink href="/">Kembali ke Home</ButtonLink>
            <ButtonLink href="/menu" variant="outline">
              Lihat Menu
            </ButtonLink>
          </>
        }
      >
        <p>Mungkin tautannya sudah berubah. Yuk kembali ke halaman utama.</p>
      </PageHeader>
    </div>
  );
}
