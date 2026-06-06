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
