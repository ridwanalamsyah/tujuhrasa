"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function AdminLogout() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const logout = () => {
    startTransition(async () => {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    });
  };
  return (
    <button
      onClick={logout}
      disabled={pending}
      className="font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-sm border-2 border-[var(--tr-ink)] hover:bg-[var(--tr-ink)] hover:text-[var(--tr-paper)] transition disabled:opacity-50"
    >
      {pending ? "Keluar…" : "Keluar"}
    </button>
  );
}
