/** Menyisipkan data terstruktur schema.org (JSON-LD) ke halaman. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" agar isi JSON tidak bisa menutup tag <script>.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
