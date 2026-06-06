"use client";

import { useState } from "react";
import type { Producto } from "@/lib/types";
import { calcularPrecio, formatEUR } from "@/lib/precio";

// Lógica compartida de selección de opciones, precio dinámico y copiar pedido.
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

  const [copiado, setCopiado] = useState(false);

  const precioFinal = calcularPrecio(
    producto.precio_base,
    producto.opciones,
    seleccion
  );

  const lineasOpciones = grupos
    .map(([grupo]) => `${grupo}: ${seleccion[grupo]}`)
    .join(", ");
  const mensajePedido =
    `¡Hola! Quiero pedir:\n\n*${producto.nombre}*` +
    (lineasOpciones ? `\n${lineasOpciones}` : "") +
    `\nPrecio: ${formatEUR(precioFinal)}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensajePedido);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Algunos navegadores bloquean el portapapeles; lo ignoramos.
    }
  }

  const elegir = (grupo: string, opcion: string) =>
    setSeleccion((s) => ({ ...s, [grupo]: opcion }));

  return { grupos, seleccion, elegir, precioFinal, copiado, copiar };
}
