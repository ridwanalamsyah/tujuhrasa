import { OpenStatus, TodayHours } from "@/components/home/LiveHours";
import { Container } from "@/components/ui/Container";
import { address } from "@/data/site";
import { mapsDirectionsUrl } from "@/lib/links";

export function InfoStrip() {
  return (
    <section aria-label="Info kunjungan" className="border-b border-line bg-white">
      <Container className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="py-6 sm:py-8 sm:pr-8">
          <TodayHours />
        </div>
        <div className="py-6 sm:px-8 sm:py-8">
          <OpenStatus />
        </div>
        <div className="py-6 sm:py-8 sm:pl-8">
          <span className="block text-sm text-muted">Alamat</span>
          <a
            href={mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block font-medium underline decoration-line underline-offset-4 transition-colors hover:decoration-espresso"
          >
            {address.short}
          </a>
        </div>
      </Container>
    </section>
  );
}
