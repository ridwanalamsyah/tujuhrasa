import { SmartLink } from "@/components/ui/SmartLink";
import { dahanLinks } from "@/lib/dahan-links";

/** Link-link Dahan (dari Linktree) sebagai baris teks sederhana. */
export function LinkList({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-6 gap-y-2 ${className}`}>
      {dahanLinks().map((link) => (
        <li key={link.label}>
          <SmartLink href={link.href} className="hover:underline hover:underline-offset-4">
            {link.label}
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}
