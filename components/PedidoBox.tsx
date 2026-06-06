"use client";

import type { Producto } from "@/lib/types";
import { formatEUR } from "@/lib/precio";
import { usePedido } from "@/hooks/usePedido";

export default function PedidoBox({ producto }: { producto: Producto }) {
  const { grupos, seleccion, elegir, precioFinal, copiado, copiar } =
    usePedido(producto);

  return (
    <div className="flex flex-1 flex-col gap-4">
      {grupos.length > 0 && (
        <div className="flex flex-col gap-3">
          {grupos.map(([grupo, elecciones]) => (
            <div key={grupo}>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {grupo}
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(elecciones).map(([opcion, inc]) => {
                  const activa = seleccion[grupo] === opcion;
                  return (
                    <button
                      key={opcion}
                      type="button"
                      onClick={() => elegir(grupo, opcion)}
                      className={
                        "min-h-[36px] rounded-full border px-3 py-1.5 text-sm transition " +
                        (activa
                          ? "border-[var(--morado)] bg-[var(--morado)] text-white shadow-sm"
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
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Precio
        </span>
        <span className="text-2xl font-bold tracking-tight text-[var(--tinta)]">
          {formatEUR(precioFinal)}
        </span>
      </div>

      <button
        type="button"
        onClick={copiar}
        className={
          "flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] " +
          (copiado
            ? "bg-emerald-600"
            : "bg-[var(--morado)] hover:bg-[var(--morado-claro)]")
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
  );
}
