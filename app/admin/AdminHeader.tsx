import Link from "next/link";
import Brand from "@/components/Brand";
import LogoutButton from "./LogoutButton";

export default function AdminHeader() {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <Link href="/admin" className="flex items-center gap-2">
        <Brand />
        <span className="hidden text-sm font-medium text-neutral-400 sm:inline">
          · Admin
        </span>
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/estadisticas"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--morado)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--morado-claro)]"
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
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50"
        >
          Ver catálogo ↗
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
