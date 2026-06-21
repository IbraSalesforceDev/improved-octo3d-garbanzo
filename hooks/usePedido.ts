"use client";

import { useState } from "react";
import type { Producto } from "@/lib/types";
import { calcularPrecio } from "@/lib/precio";

// Lógica compartida de selección de opciones y precio dinámico.
// La usan tanto la tarjeta del catálogo como la página de detalle.
export function usePedido(producto: Producto) {
  const grupos = Object.entries(producto.opciones ?? {});

  const [seleccion, setSeleccion] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const [grupo, elecciones] of grupos) {
      const primera = Object.keys(elecciones)[0];
      if (primera) init[grupo] = primera;
    }
    return init;
  });

  const precioFinal = calcularPrecio(
    producto.precio_base,
    producto.opciones,
    seleccion
  );

  const elegir = (grupo: string, opcion: string) =>
    setSeleccion((s) => ({ ...s, [grupo]: opcion }));

  // Imagen asociada al color elegido (si la hay).
  const grupoColor = grupos.find(([g]) => /color/i.test(g))?.[0];
  const colorElegido = grupoColor ? seleccion[grupoColor] : undefined;
  const imagenColor = colorElegido
    ? producto.imagenes_color?.[colorElegido]
    : undefined;

  return { grupos, seleccion, elegir, precioFinal, imagenColor };
}
