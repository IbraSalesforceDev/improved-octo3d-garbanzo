"use client";

import { useState } from "react";
import type { Producto } from "@/lib/types";
import { formatEUR } from "@/lib/precio";
import { usePedido } from "@/hooks/usePedido";
import { useCart } from "@/components/cart/CartContext";

export default function PedidoBox({ producto }: { producto: Producto }) {
  const { grupos, seleccion, elegir, precioFinal } = usePedido(producto);
  const { addItem, setOpen } = useCart();

  const [cantidad, setCantidad] = useState(1);
  const [anadido, setAnadido] = useState(false);

  function anadir() {
    addItem(
      {
        productoId: producto.id,
        nombre: producto.nombre,
        opciones: seleccion,
        precioUnitario: precioFinal,
      },
      cantidad
    );
    setAnadido(true);
    setCantidad(1);
    setTimeout(() => setAnadido(false), 1800);
  }

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

      <div className="flex items-stretch gap-2">
        {/* Cantidad */}
        <div className="flex items-center rounded-xl border border-neutral-200">
          <button
            type="button"
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            className="px-3 text-lg text-neutral-600 hover:bg-neutral-50"
            aria-label="Menos"
          >
            −
          </button>
          <span className="min-w-[2ch] text-center text-sm font-medium">
            {cantidad}
          </span>
          <button
            type="button"
            onClick={() => setCantidad((c) => c + 1)}
            className="px-3 text-lg text-neutral-600 hover:bg-neutral-50"
            aria-label="Más"
          >
            +
          </button>
        </div>

        {/* Añadir al carrito */}
        <button
          type="button"
          onClick={anadir}
          className={
            "flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] " +
            (anadido
              ? "bg-emerald-600"
              : "bg-[var(--morado)] hover:bg-[var(--morado-claro)]")
          }
        >
          {anadido ? "Añadido ✓" : "Añadir al carrito"}
        </button>
      </div>

      {anadido && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="-mt-1 text-center text-xs font-medium text-[var(--morado)] hover:underline"
        >
          Ver carrito
        </button>
      )}
    </div>
  );
}
