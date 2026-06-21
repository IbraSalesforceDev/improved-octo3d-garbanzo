"use client";

import type { Producto } from "@/lib/types";
import PedidoControls from "./PedidoControls";
import ShareButton from "./ShareButton";
import Galeria from "./Galeria";
import { usePedido } from "@/hooks/usePedido";

export default function ProductoDetalle({ producto }: { producto: Producto }) {
  const { grupos, seleccion, elegir, precioFinal, imagenColor } =
    usePedido(producto);

  // Galería = fotos base + fotos por color (sin duplicados).
  const base =
    producto.imagenes && producto.imagenes.length > 0
      ? producto.imagenes
      : producto.imagen_url
        ? [producto.imagen_url]
        : [];
  const porColor = Object.values(producto.imagenes_color ?? {});
  const imagenes = Array.from(new Set([...base, ...porColor]));

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
      <Galeria
        imagenes={imagenes}
        nombre={producto.nombre}
        principal={imagenColor ?? null}
      />

      <div className="flex flex-col gap-5">
        <div>
          {producto.categoria && (
            <span className="inline-block rounded-full bg-[var(--lima)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--tinta)]">
              {producto.categoria}
            </span>
          )}
          <h1 className="mt-2 text-[28px] font-bold leading-tight text-[var(--tinta)] sm:text-[40px]">
            {producto.nombre}
          </h1>
          {producto.descripcion && (
            <p className="mt-3 max-w-[60ch] leading-relaxed text-[var(--gris)]">
              {producto.descripcion}
            </p>
          )}
        </div>

        <PedidoControls
          producto={producto}
          grupos={grupos}
          seleccion={seleccion}
          elegir={elegir}
          precioFinal={precioFinal}
        />

        <div>
          <ShareButton title={producto.nombre} />
        </div>
      </div>
    </div>
  );
}
