import { marquee } from "@/data/site";

/** Teks berjalan. Berhenti saat disorot; diam bila pengunjung memilih "kurangi gerakan". */
export function Marquee() {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10">
      {marquee.map((text) => (
        <li key={text} className="flex items-center gap-10 whitespace-nowrap">
          <span lang="en">{text}</span>
          <span aria-hidden="true">✳</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="label group overflow-hidden border-y border-espresso bg-espresso py-3 text-cream">
      <div className="marquee flex w-max group-hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
        {row(true)}
      </div>
    </div>
  );
}
