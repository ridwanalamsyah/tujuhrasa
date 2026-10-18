import { Photo } from "@/components/ui/Photo";
import { contact, gallery } from "@/data/site";

/** Tiga foto tepi-ke-tepi + tautan Instagram. */
export function Strip() {
  return (
    <section aria-label="Foto dari Instagram">
      <ul className="grid grid-cols-3 gap-0.5">
        {gallery.images.slice(0, 3).map((image) => (
          <li key={image.src}>
            <Photo image={image} ratio="aspect-square" sizes="33vw" />
          </li>
        ))}
      </ul>
      <div className="label flex justify-center py-6">
        <a
          href={contact.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          {gallery.instagramLabel}
        </a>
      </div>
    </section>
  );
}
