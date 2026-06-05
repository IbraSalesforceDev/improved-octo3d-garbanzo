import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { formatEUR } from "@/lib/precio";
import type { Producto } from "@/lib/types";
import AdminHeader from "./AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("created_at", { ascending: false });

  const productos = (data ?? []) as Producto[];

  return (
    <>
      <AdminHeader />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos ({productos.length})</h1>
        <Link
          href="/admin/nuevo"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Nuevo producto
        </Link>
      </div>

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
          {productos.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/${p.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                  {p.imagen_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imagen_url}
                      alt={p.nombre}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.nombre}</p>
                  <p className="text-sm text-neutral-500">
                    {formatEUR(Number(p.precio_base))} base
                  </p>
                </div>
                {!p.activo && (
                  <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600">
                    Oculto
                  </span>
                )}
                <span className="text-neutral-400">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
