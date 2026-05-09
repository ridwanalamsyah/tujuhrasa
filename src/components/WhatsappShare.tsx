"use client";

export function WhatsappShare({
  text,
  url,
  className = "",
  label = "bagikan via whatsapp",
}: {
  text: string;
  url?: string;
  className?: string;
  label?: string;
}) {
  const onClick = () => {
    const fullUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
    const message = encodeURIComponent(`${text}\n${fullUrl}`);
    window.open(`https://wa.me/?text=${message}`, "_blank", "noopener,noreferrer");
  };
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex items-center gap-2 rounded-full border border-leaf text-leaf px-3 py-1.5 text-xs font-mono lowercase hover:bg-leaf hover:text-cream transition " +
        className
      }
      aria-label={label}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.5 3.5A11.6 11.6 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.5 4.1 1.6 5.9L0 24l6.5-1.7c1.7.9 3.6 1.4 5.6 1.4 6.5 0 11.8-5.3 11.8-11.8 0-3.1-1.2-6.1-3.4-8.3zm-8.4 18.2c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.7 9.7 0 0 1-1.5-5.3c0-5.4 4.4-9.8 9.8-9.8 2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.9-9.8 9.9zm5.4-7.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1s-.8 1-1 1.2c-.2.2-.4.2-.7.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.6 0 1.5 1.1 3 1.3 3.2.2.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.5.2-.7.2-1.4.2-1.5-.1-.1-.3-.2-.5-.3z" />
      </svg>
      whatsapp
    </button>
  );
}
