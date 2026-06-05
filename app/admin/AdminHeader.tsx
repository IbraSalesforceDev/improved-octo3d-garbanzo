import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminHeader() {
  return (
    <header className="mb-8 flex items-center justify-between">
      <Link href="/admin" className="text-xl font-bold">
        Admin · Figuras 3D
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
