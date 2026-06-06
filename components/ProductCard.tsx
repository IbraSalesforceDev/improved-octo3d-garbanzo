"use client";

import { useState } from "react";
import type { Producto } from "@/lib/types";
import { calcularPrecio, formatEUR } from "@/lib/precio";

export default function ProductCard({ producto }: { producto: Producto }) {
  const grupos = Object.entries(producto.opciones ?? {});

  // Selección inicial: la primera opción de cada grupo.
  const [seleccion, setSeleccion] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const [grupo, elecciones] of grupos) {
      const primera = Object.keys(elecciones)[0];
      if (primera) init[grupo] = primera;
    }
    return init;
  });

  const [copiado, setCopiado] = useState(false);

  const precioFinal = calcularPrecio(
    producto.precio_base,
    producto.opciones,
    seleccion
  );

  // Mensaje de pedido listo para copiar y pegar (p. ej. en WhatsApp).
  const lineasOpciones = grupos
    .map(([grupo]) => `${grupo}: ${seleccion[grupo]}`)
    .join(", ");
  const mensajePedido =
    `¡Hola! Quiero pedir:\n\n*${producto.nombre}*` +
    (lineasOpciones ? `\n${lineasOpciones}` : "") +
    `\nPrecio: ${formatEUR(precioFinal)}`;

  async function copiarPedido() {
    try {
      await navigator.clipboard.writeText(mensajePedido);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Algunos navegadores bloquean el portapapeles; lo ignoramos.
    }
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-neutral-200">
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200">
        {producto.imagen_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-12 w-12"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h2 className="text-lg font-semibold leading-tight">
            {producto.nombre}
          </h2>
          {producto.descripcion && (
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
              {producto.descripcion}
            </p>
          )}
        </div>

        {grupos.length > 0 && (
          <div className="flex flex-col gap-3">
            {grupos.map(([grupo, elecciones]) => (
              <div key={grupo}>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  {grupo}
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(elecciones).map(([opcion, inc]) => {
                    const activa = seleccion[grupo] === opcion;
                    return (
                      <button
                        key={opcion}
                        type="button"
                        onClick={() =>
                          setSeleccion((s) => ({ ...s, [grupo]: opcion }))
                        }
                        className={
                          "rounded-full border px-3 py-1.5 text-sm transition " +
                          (activa
                            ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50")
                        }
                      >
                        {opcion}
                        {inc > 0 && (
                          <span className="ml-1 text-xs opacity-70">
                            +{formatEUR(inc)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between border-t border-neutral-100 pt-4">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            Precio
          </span>
          <span className="text-2xl font-bold tracking-tight">
            {formatEUR(precioFinal)}
          </span>
        </div>

        <button
          type="button"
          onClick={copiarPedido}
          className={
            "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] " +
            (copiado
              ? "bg-emerald-600"
              : "bg-[var(--brand)] hover:bg-[var(--brand-dark)]")
          }
        >
          {copiado ? (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              ¡Pedido copiado!
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                />
              </svg>
              Copiar pedido
            </>
          )}
        </button>
      </div>
    </article>
  );
}
