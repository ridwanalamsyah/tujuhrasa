import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  children?: ReactNode;
};

/** Judul section: eyebrow kecil + judul serif uppercase + teks pendek opsional. */
export function SectionHeading({
  eyebrow,
  title,
  as: Tag = "h2",
  align = "left",
  tone = "light",
  className = "",
  children,
}: Props) {
  const centered = align === "center";
  const onDark = tone === "dark";
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-2xl ${className}`}>
      {eyebrow && (
        <p className={`eyebrow mb-4 ${onDark ? "text-leaf-soft" : "text-leaf"}`}>{eyebrow}</p>
      )}
      <Tag
        className={`heading-display ${Tag === "h1" ? "text-5xl sm:text-6xl lg:text-7xl" : "text-4xl sm:text-5xl lg:text-6xl"} ${onDark ? "text-cream" : "text-espresso"}`}
      >
        {title}
      </Tag>
      {children && (
        <div
          className={`mt-5 text-base leading-relaxed sm:text-lg ${onDark ? "text-cream-muted" : "text-muted"}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
