import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { formatEUR } from "@/lib/precio";
import type { Producto } from "@/lib/types";
import AdminHeader from "../AdminHeader";

export const dynamic = "force-dynamic";

export default async function EstadisticasPage() {
  const supabase = createClient(await cookies());

  let res = await supabase
    .from("productos")
    .select("*")
    .order("copias", { ascending: false });
  if (res.error) {
    res = await supabase.from("productos").select("*");
  }
  const productos = (res.data ?? []) as Producto[];

  const filas = productos
    .map((p) => ({
      p,
      copias: p.copias ?? 0,
      ingreso: (p.copias ?? 0) * Number(p.precio_base),
    }))
    .sort((a, b) => b.ingreso - a.ingreso);

  const maxIngreso = Math.max(1, ...filas.map((f) => f.ingreso));
  const maxCopias = Math.max(1, ...filas.map((f) => f.copias));
  const totalCopias = filas.reduce((n, f) => n + f.copias, 0);
  const totalIngreso = filas.reduce((s, f) => s + f.ingreso, 0);

  return (
    <>
      <AdminHeader />

      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Estadísticas</h1>
        <Link
          href="/admin"
          className="text-sm font-medium text-[var(--morado)] hover:underline"
        >
          ← Volver
        </Link>
      </div>
      <p className="mb-6 text-sm text-neutral-500">
        Veces que cada figura se ha incluido en un pedido copiado, e ingreso
        estimado (copias × precio actual). Es una estimación de interés, no
        ventas confirmadas.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">Veces copiado</p>
          <p className="text-2xl font-bold">{totalCopias}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">Ingreso estimado</p>
          <p className="text-2xl font-bold">{formatEUR(totalIngreso)}</p>
        </div>
      </div>

      {filas.length === 0 || totalCopias === 0 ? (
        <p className="text-neutral-600">
          Aún no hay datos. Aparecerán cuando los clientes copien pedidos desde el
          catálogo.
        </p>
      ) : (
        <>
          <div className="mb-5 flex items-center gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-[var(--morado)]" />
              Ingreso estimado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-[var(--lima)]" />
              Veces pedido
            </span>
          </div>

          <div className="flex flex-col gap-5">
            {filas.map(({ p, copias, ingreso }) => (
              <div key={p.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{p.nombre}</span>
                  <span className="shrink-0 text-neutral-500">
                    {copias}× · {formatEUR(ingreso)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-3 rounded-full bg-[var(--morado)]"
                      style={{ width: `${(ingreso / maxIngreso) * 100}%` }}
                    />
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-2 rounded-full bg-[var(--lima)]"
                      style={{ width: `${(copias / maxCopias) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
