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
    <article className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="aspect-square w-full bg-gradient-to-br from-neutral-100 to-neutral-200">
        {producto.imagen_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <span className="text-sm">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div>
          <h2 className="text-lg font-semibold">{producto.nombre}</h2>
          {producto.descripcion && (
            <p className="mt-1 text-sm text-neutral-600">
              {producto.descripcion}
            </p>
          )}
        </div>

        {grupos.length > 0 && (
          <div className="flex flex-col gap-3">
            {grupos.map(([grupo, elecciones]) => (
              <div key={grupo}>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">
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
                          "rounded-full border px-3 py-1 text-sm transition " +
                          (activa
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400")
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

        <div className="mt-auto flex items-baseline justify-between border-t border-neutral-100 pt-4">
          <span className="text-sm text-neutral-500">Precio</span>
          <span className="text-2xl font-bold">{formatEUR(precioFinal)}</span>
        </div>

        <button
          type="button"
          onClick={copiarPedido}
          className={
            "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition " +
            (copiado
              ? "bg-green-600"
              : "bg-neutral-900 hover:bg-neutral-800")
          }
        >
          {copiado ? "¡Pedido copiado!" : "Copiar pedido"}
        </button>
      </div>
    </article>
  );
}
