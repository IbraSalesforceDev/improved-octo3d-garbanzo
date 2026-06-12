import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { formatEUR } from "@/lib/precio";
import type { Producto, Venta } from "@/lib/types";
import AdminHeader from "../AdminHeader";
import RegistrarVentaForm from "./RegistrarVentaForm";
import BorrarVentaButton from "./BorrarVentaButton";
import ExportarCSVButton from "./ExportarCSVButton";

export const dynamic = "force-dynamic";

function Barra({
  valor,
  max,
  color,
}: {
  valor: number;
  max: number;
  color: string;
}) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100">
      <div
        className="h-3 rounded-full"
        style={{ width: `${(valor / max) * 100}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default async function EstadisticasPage({
  searchParams,
}: {
  searchParams: { desde?: string; hasta?: string };
}) {
  const desde = searchParams.desde || "";
  const hasta = searchParams.hasta || "";
  const supabase = createClient(await cookies());

  // Productos (para previsión y para el formulario de ventas).
  let pres = await supabase
    .from("productos")
    .select("*")
    .order("copias", { ascending: false });
  if (pres.error) pres = await supabase.from("productos").select("*");
  const productos = (pres.data ?? []) as Producto[];

  // Ventas reales (puede que la tabla aún no exista).
  const vres = await supabase
    .from("ventas")
    .select("*")
    .order("created_at", { ascending: false });
  const ventasFaltaMigracion = Boolean(vres.error);
  const ventasTodas = (vres.data ?? []) as Venta[];

  const enRango = (iso: string) => {
    const d = iso.slice(0, 10);
    if (desde && d < desde) return false;
    if (hasta && d > hasta) return false;
    return true;
  };
  const ventas = ventasTodas.filter((v) => enRango(v.created_at));

  // Total del mes en curso (independiente del filtro de fechas).
  const ahora = new Date();
  const ym = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
  const ingresoMes = ventasTodas
    .filter((v) => v.created_at.slice(0, 7) === ym)
    .reduce((s, v) => s + Number(v.total), 0);

  // --- Realidad (ventas, ya filtradas por fecha) ---
  const mapaReal = new Map<
    string,
    { nombre: string; unidades: number; ingreso: number }
  >();
  for (const v of ventas) {
    const key = v.producto_id ?? `n:${v.nombre}`;
    const cur = mapaReal.get(key) ?? {
      nombre: v.nombre,
      unidades: 0,
      ingreso: 0,
    };
    cur.unidades += v.cantidad;
    cur.ingreso += Number(v.total);
    mapaReal.set(key, cur);
  }
  const realRows = [...mapaReal.values()].sort((a, b) => b.ingreso - a.ingreso);
  const maxReal = Math.max(1, ...realRows.map((r) => r.ingreso));
  const unidadesReales = ventas.reduce((n, v) => n + v.cantidad, 0);
  const ingresoReal = ventas.reduce((s, v) => s + Number(v.total), 0);

  // --- Previsión (interés / copias) ---
  const prevRows = productos
    .map((p) => ({
      nombre: p.nombre,
      copias: p.copias ?? 0,
      ingreso: (p.copias ?? 0) * Number(p.precio_base),
    }))
    .filter((r) => r.copias > 0)
    .sort((a, b) => b.ingreso - a.ingreso);
  const maxPrev = Math.max(1, ...prevRows.map((r) => r.ingreso));
  const totalCopias = prevRows.reduce((n, r) => n + r.copias, 0);
  const ingresoPrev = prevRows.reduce((s, r) => s + r.ingreso, 0);

  const opcionesForm = productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    precio_base: Number(p.precio_base),
  }));

  return (
    <>
      <AdminHeader />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Estadísticas</h1>
        <Link
          href="/admin"
          className="text-sm font-medium text-[var(--morado)] hover:underline"
        >
          ← Volver
        </Link>
      </div>

      {/* ============ VENTAS REALES ============ */}
      <section className="mb-12">
        <h2 className="text-lg font-bold">Ventas reales</h2>
        <p className="mb-4 text-sm text-neutral-500">
          Pedidos confirmados que registras tú. Estos ingresos son reales.
        </p>

        {ventasFaltaMigracion ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Para activar el registro de ventas, ejecuta{" "}
            <code>supabase/ventas.sql</code> en el SQL Editor de Supabase.
          </div>
        ) : (
          <>
            {/* Filtro por fechas */}
            <form className="mb-5 flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  Desde
                </label>
                <input
                  type="date"
                  name="desde"
                  defaultValue={desde}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  Hasta
                </label>
                <input
                  type="date"
                  name="hasta"
                  defaultValue={hasta}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-[var(--morado)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--morado-claro)]"
              >
                Filtrar
              </button>
              {(desde || hasta) && (
                <Link
                  href="/admin/estadisticas"
                  className="text-sm text-neutral-500 hover:underline"
                >
                  Limpiar
                </Link>
              )}
            </form>

            <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <p className="text-sm text-neutral-500">
                  Ingreso real{desde || hasta ? " (rango)" : ""}
                </p>
                <p className="text-2xl font-bold">{formatEUR(ingresoReal)}</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <p className="text-sm text-neutral-500">Unidades vendidas</p>
                <p className="text-2xl font-bold">{unidadesReales}</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <p className="text-sm text-neutral-500">Este mes</p>
                <p className="text-2xl font-bold">{formatEUR(ingresoMes)}</p>
              </div>
            </div>

            <div className="mb-6">
              <RegistrarVentaForm productos={opcionesForm} />
            </div>

            {realRows.length > 0 && (
              <div className="mb-6 flex flex-col gap-4">
                {realRows.map((r) => (
                  <div key={r.nombre}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-medium">{r.nombre}</span>
                      <span className="shrink-0 text-neutral-500">
                        {r.unidades} ud · {formatEUR(r.ingreso)}
                      </span>
                    </div>
                    <Barra valor={r.ingreso} max={maxReal} color="#6d28d9" />
                  </div>
                ))}
              </div>
            )}

            {ventas.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-600">
                    Últimas ventas
                  </h3>
                  <ExportarCSVButton ventas={ventas} />
                </div>
                <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
                  {ventas.slice(0, 20).map((v) => (
                    <li
                      key={v.id}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                    >
                      <div className="min-w-0">
                        <span className="font-medium">{v.nombre}</span>{" "}
                        <span className="text-neutral-500">
                          ×{v.cantidad}
                          {v.nota ? ` · ${v.nota}` : ""}
                        </span>
                        <span className="ml-2 text-xs text-neutral-400">
                          {new Date(v.created_at).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="font-semibold">
                          {formatEUR(Number(v.total))}
                        </span>
                        <BorrarVentaButton id={v.id} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>

      {/* ============ PREVISIÓN (INTERÉS) ============ */}
      <section>
        <h2 className="text-lg font-bold">Previsión (interés)</h2>
        <p className="mb-4 text-sm text-neutral-500">
          Veces que cada figura se ha incluido en un pedido copiado, e ingreso
          estimado. Es intención de compra, no ventas confirmadas.
        </p>

        <div className="mb-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-500">Veces pedido</p>
            <p className="text-2xl font-bold">{totalCopias}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-500">Ingreso estimado</p>
            <p className="text-2xl font-bold">{formatEUR(ingresoPrev)}</p>
          </div>
        </div>

        {prevRows.length === 0 ? (
          <p className="text-neutral-600">
            Aún no hay datos. Aparecerán cuando los clientes copien pedidos.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {prevRows.map((r) => (
              <div key={r.nombre}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{r.nombre}</span>
                  <span className="shrink-0 text-neutral-500">
                    {r.copias}× · {formatEUR(r.ingreso)}
                  </span>
                </div>
                <Barra valor={r.ingreso} max={maxPrev} color="#b6f23a" />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
