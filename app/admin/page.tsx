import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { Producto } from "@/lib/types";
import AdminHeader from "./AdminHeader";
import ProductoRow from "./ProductoRow";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("orden", { ascending: true })
    .order("created_at", { ascending: false });

  const productos = (data ?? []) as Producto[];

  return (
    <>
      <AdminHeader />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos ({productos.length})</h1>
        <Link
          href="/admin/nuevo"
          className="rounded-xl bg-[var(--morado)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--morado-claro)]"
        >
          + Nuevo producto
        </Link>
      </div>

      <p className="mb-4 text-sm text-neutral-500">
        Usa ▲▼ para ordenar y ★ para destacar. El orden se refleja en el
        catálogo (los destacados salen primero).
      </p>

      {error && (
        <p className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error al leer productos: {error.message}
        </p>
      )}

      {productos.length === 0 ? (
        <p className="text-neutral-600">
          Todavía no hay productos. Crea el primero con “+ Nuevo producto”.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
          {productos.map((p, i) => (
            <ProductoRow
              key={p.id}
              producto={p}
              isFirst={i === 0}
              isLast={i === productos.length - 1}
            />
          ))}
        </ul>
      )}
    </>
  );
}
