import { Container } from "@/components/ui/Container";
import { stores } from "@/data/site";

const channels = [
  { name: "GoFood", note: "Pesan antar", href: stores.gofood },
  { name: "Tokopedia", note: "Toko resmi", href: stores.tokopedia },
  { name: "Shopee", note: "Toko resmi", href: stores.shopee },
].filter((c) => c.href);

/** Pesan Dahan dari rumah. */
export function Order() {
  return (
    <Container className="py-20 lg:py-28">
      <h2 className="display-1">Pesan dari rumah</h2>
      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {channels.map((c) => (
          <li key={c.name}>
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-36 flex-col justify-between bg-paper p-6 transition-colors hover:bg-espresso hover:text-white"
            >
              <span className="text-small text-muted transition-colors group-hover:text-white/70">
                {c.note}
              </span>
              <span className="flex items-end justify-between text-[1.75rem] font-medium tracking-[-0.02em]">
                {c.name}
                <span aria-hidden="true" className="text-[1.25rem]">
                  ↗
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Container>
  );
}
