// Tonos por defecto para nombres de color comunes (se usan como sugerencia en el
// admin; el vendedor puede ajustar el tono exacto de cada color).
const COLOR_HEX: Record<string, string> = {
  negro: "#111111",
  blanco: "#f5f5f5",
  gris: "#9ca3af",
  plata: "#c0c0c0",
  plateado: "#c0c0c0",
  dorado: "#d4af37",
  oro: "#d4af37",
  rojo: "#dc2626",
  granate: "#7f1d1d",
  rosa: "#ec4899",
  naranja: "#ea580c",
  amarillo: "#facc15",
  verde: "#16a34a",
  "verde claro": "#4ade80",
  lima: "#84cc16",
  turquesa: "#14b8a6",
  azul: "#2563eb",
  celeste: "#38bdf8",
  "azul marino": "#1e3a8a",
  morado: "#7c3aed",
  violeta: "#7c3aed",
  lila: "#c4b5fd",
  marron: "#92400e",
  "marrón": "#92400e",
  terracota: "#c65d3b",
  beige: "#e3dac9",
  crema: "#f5f5dc",
};

// Devuelve el tono sugerido para un nombre de color, o undefined si no se conoce.
export function guessHex(nombre: string): string | undefined {
  return COLOR_HEX[nombre.trim().toLowerCase()];
}
