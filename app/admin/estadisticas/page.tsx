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

  // Ingresos reales por mes (últimos 6 meses).
  const meses = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - idx), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      label: d.toLocaleDateString("es-ES", { month: "short" }),
      ingreso: ventasTodas
        .filter((v) => v.created_at.slice(0, 7) === key)
        .reduce((s, v) => s + Number(v.total), 0),
    };
  });
  const maxMes = Math.max(1, ...meses.map((m) => m.ingreso));

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
  const realRows = [...mapaReal.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.ingreso - a.ingreso);
  const maxReal = Math.max(1, ...realRows.map((r) => r.ingreso));
  const unidadesReales = ventas.reduce((n, v) => n + v.cantidad, 0);
  const ingresoReal = ventas.reduce((s, v) => s + Number(v.total), 0);

  // Ventas reales por categoría (usa la categoría actual del producto).
  const catProducto = new Map(
    productos.map((p) => [p.id, p.categoria ?? "Sin categoría"])
  );
  const mapaCat = new Map<string, number>();
  for (const v of ventas) {
    const cat =
      (v.producto_id && catProducto.get(v.producto_id)) || "Sin categoría";
    mapaCat.set(cat, (mapaCat.get(cat) ?? 0) + Number(v.total));
  }
  const catRows = [...mapaCat.entries()]
    .map(([cat, ingreso]) => ({ cat, ingreso }))
    .sort((a, b) => b.ingreso - a.ingreso);
  const maxCat = Math.max(1, ...catRows.map((r) => r.ingreso));

  // Comparativa interés (copias) vs ventas reales (unidades), por producto.
  const unidadesPorProd = new Map<string, number>();
  for (const v of ventasTodas) {
    if (v.producto_id)
      unidadesPorProd.set(
        v.producto_id,
        (unidadesPorProd.get(v.producto_id) ?? 0) + v.cantidad
      );
  }
  const compRows = productos
    .map((p) => ({
      id: p.id,
      nombre: p.nombre,
      copias: p.copias ?? 0,
      unidades: unidadesPorProd.get(p.id) ?? 0,
    }))
    .filter((r) => r.copias > 0 || r.unidades > 0)
    .sort((a, b) => b.copias + b.unidades - (a.copias + a.unidades))
    .slice(0, 8);
  const maxComp = Math.max(
    1,
    ...compRows.map((r) => Math.max(r.copias, r.unidades))
  );

  // Reparto de ingresos reales (% por producto, según el filtro de fechas).
  const colores = [
    "#6d28d9",
    "#8b5cf6",
    "#a78bfa",
    "#c4b5fd",
    "#84cc16",
    "#22c55e",
    "#f59e0b",
    "#ec4899",
  ];
  const repRows = realRows.map((r, i) => ({
    ...r,
    pct: ingresoReal > 0 ? (r.ingreso / ingresoReal) * 100 : 0,
    color: colores[i % colores.length],
  }));

  // Mejores ventas del mes en curso.
  const mapaMes = new Map<string, { nombre: string; ingreso: number }>();
  for (const v of ventasTodas) {
    if (v.created_at.slice(0, 7) !== ym) continue;
    const key = v.producto_id ?? `n:${v.nombre}`;
    const cur = mapaMes.get(key) ?? { nombre: v.nombre, ingreso: 0 };
    cur.ingreso += Number(v.total);
    mapaMes.set(key, cur);
  }
  const mesRows = [...mapaMes.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.ingreso - a.ingreso)
    .slice(0, 5);
  const maxMesProd = Math.max(1, ...mesRows.map((r) => r.ingreso));

  // --- Previsión (interés / copias) ---
  const prevRows = productos
    .map((p) => ({
      id: p.id,
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
        <h1 className="text-2xl font-bold">Reportes</h1>
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
                  <div key={r.key}>
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
              <div className="mb-8 grid gap-8 md:grid-cols-2">
                {/* Ingresos por mes */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-neutral-600">
                    Ingresos por mes
                  </h3>
                  <div className="flex h-40 items-end gap-2">
                    {meses.map((m) => (
                      <div
                        key={m.label}
                        className="flex flex-1 flex-col items-center gap-1"
                      >
                        <div className="flex w-full flex-1 items-end">
                          <div
                            className="w-full rounded-t bg-[var(--morado)]"
                            style={{
                              height: `${(m.ingreso / maxMes) * 100}%`,
                            }}
                            title={formatEUR(m.ingreso)}
                          />
                        </div>
                        <span className="text-[11px] capitalize text-neutral-400">
                          {m.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ingresos por categoría */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-neutral-600">
                    Ingresos por categoría
                  </h3>
                  {catRows.length === 0 ? (
                    <p className="text-sm text-neutral-400">Sin datos.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {catRows.map((r) => (
                        <div key={r.cat}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="truncate font-medium">
                              {r.cat}
                            </span>
                            <span className="shrink-0 text-neutral-500">
                              {formatEUR(r.ingreso)}
                            </span>
                          </div>
                          <Barra valor={r.ingreso} max={maxCat} color="#6d28d9" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

      {/* ============ ANÁLISIS ============ */}
      {(compRows.length > 0 || mesRows.length > 0) && (
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-bold">Análisis</h2>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Interés vs ventas */}
            {compRows.length > 0 && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-neutral-600">
                  Interés vs ventas (unidades)
                </h3>
                <div className="mb-3 flex items-center gap-4 text-xs text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-[var(--lima)]" />
                    Veces pedido
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-[var(--morado)]" />
                    Vendidas
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {compRows.map((r) => (
                    <div key={r.id}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="truncate font-medium">{r.nombre}</span>
                        <span className="shrink-0 text-neutral-500">
                          {r.copias}× · {r.unidades} ud
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Barra valor={r.copias} max={maxComp} color="#b6f23a" />
                        <Barra
                          valor={r.unidades}
                          max={maxComp}
                          color="#6d28d9"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mejores ventas del mes */}
            {mesRows.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-neutral-600">
                  Mejores ventas del mes
                </h3>
                <div className="flex flex-col gap-3">
                  {mesRows.map((r) => (
                    <div key={r.key}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="truncate font-medium">{r.nombre}</span>
                        <span className="shrink-0 text-neutral-500">
                          {formatEUR(r.ingreso)}
                        </span>
                      </div>
                      <Barra valor={r.ingreso} max={maxMesProd} color="#6d28d9" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reparto de ingresos */}
          {repRows.length > 0 && ingresoReal > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-sm font-semibold text-neutral-600">
                Reparto de ingresos{desde || hasta ? " (rango)" : ""}
              </h3>
              <div className="flex h-5 w-full overflow-hidden rounded-full bg-neutral-100">
                {repRows.map((r) => (
                  <div
                    key={r.key}
                    style={{ width: `${r.pct}%`, backgroundColor: r.color }}
                    title={`${r.nombre}: ${r.pct.toFixed(0)}%`}
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
                {repRows.map((r) => (
                  <span key={r.key} className="flex items-center gap-1.5">
                    <span
                      className="h-3 w-3 rounded"
                      style={{ backgroundColor: r.color }}
                    />
                    {r.nombre}{" "}
                    <b className="text-[var(--tinta)]">{r.pct.toFixed(0)}%</b>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

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
              <div key={r.id}>
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
