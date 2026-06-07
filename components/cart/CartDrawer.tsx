"use client";

import { useState } from "react";
import { useCart } from "./CartContext";
import { formatEUR } from "@/lib/precio";

export default function CartDrawer() {
  const { items, open, setOpen, updateQty, removeItem, clear, total, mensaje } =
    useCart();
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensaje());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // ignore
    }
  }

  return (
    <>
      {/* Fondo oscuro */}
      <div
        onClick={() => setOpen(false)}
        className={
          "fixed inset-0 z-[60] bg-black/40 transition-opacity " +
          (open ? "opacity-100" : "pointer-events-none opacity-0")
        }
        aria-hidden
      />

      {/* Panel */}
      <aside
        className={
          "fixed right-0 top-0 z-[70] flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform " +
          (open ? "translate-x-0" : "translate-x-full")
        }
        role="dialog"
        aria-label="Carrito"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-bold">Tu pedido</h2>
          <button
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-[var(--gris)]">
            Tu carrito está vacío. Añade figuras desde el catálogo.
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="flex flex-col gap-4">
                {items.map((i) => {
                  const ops = Object.entries(i.opciones)
                    .map(([g, v]) => `${g}: ${v}`)
                    .join(", ");
                  return (
                    <li
                      key={i.key}
                      className="flex gap-3 border-b border-neutral-100 pb-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-tight">
                          {i.nombre}
                        </p>
                        {ops && (
                          <p className="mt-0.5 text-xs text-[var(--gris)]">
                            {ops}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center rounded-lg border border-neutral-200">
                            <button
                              onClick={() =>
                                updateQty(i.key, i.cantidad - 1)
                              }
                              className="px-2.5 py-1 text-neutral-600 hover:bg-neutral-50"
                              aria-label="Menos"
                            >
                              −
                            </button>
                            <span className="min-w-[2ch] text-center text-sm">
                              {i.cantidad}
                            </span>
                            <button
                              onClick={() =>
                                updateQty(i.key, i.cantidad + 1)
                              }
                              className="px-2.5 py-1 text-neutral-600 hover:bg-neutral-50"
                              aria-label="Más"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(i.key)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                      <span className="shrink-0 font-bold">
                        {formatEUR(i.precioUnitario * i.cantidad)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-neutral-200 px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-[var(--gris)]">Total</span>
                <span className="text-xl font-bold">{formatEUR(total)}</span>
              </div>

              <button
                onClick={copiar}
                className={
                  "flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition " +
                  (copiado
                    ? "bg-emerald-600"
                    : "bg-[var(--morado)] hover:bg-[var(--morado-claro)]")
                }
              >
                {copiado ? "¡Pedido copiado!" : "Copiar pedido"}
              </button>
              <p className="mt-2 text-center text-xs text-[var(--gris)]">
                Cópialo y pégalo en WhatsApp o donde prefieras.
              </p>
              <button
                onClick={clear}
                className="mt-3 w-full text-center text-xs text-neutral-400 hover:text-red-600"
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
