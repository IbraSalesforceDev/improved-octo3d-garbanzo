import type { Opciones } from "./types";

export function formatEUR(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

// Precio final = precio_base + suma de los incrementos de las opciones elegidas.
export function calcularPrecio(
  precioBase: number,
  opciones: Opciones,
  seleccion: Record<string, string>
): number {
  const incremento = Object.entries(opciones ?? {}).reduce(
    (suma, [grupo, elecciones]) => {
      const elegido = seleccion[grupo];
      if (!elegido) return suma;
      return suma + (elecciones[elegido] ?? 0);
    },
    0
  );
  return Number(precioBase) + incremento;
}
