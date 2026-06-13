import Link from "next/link";
import Brand from "@/components/Brand";
import LogoutButton from "./LogoutButton";

export default function AdminHeader() {
  return (
    <header className="mb-8 flex items-center justify-between">
      <Link href="/admin" className="flex items-center gap-2">
        <Brand />
        <span className="text-sm font-medium text-neutral-400">· Admin</span>
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/admin/estadisticas"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--morado)] px-3 py-1.5 text-sm font-semibold text-[var(--morado)] transition hover:bg-[var(--morado)] hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3v18h18M8 17V9m4 8V5m4 12v-6"
            />
          </svg>
          Reportes
        </Link>
        <Link
          href="/"
          target="_blank"
          className="text-sm text-neutral-600 hover:underline"
        >
          Ver catálogo ↗
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
