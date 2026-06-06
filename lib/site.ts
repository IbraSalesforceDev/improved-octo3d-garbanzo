// === CONFIGURACIÓN DE MARCA Y CONTENIDOS ===
// Edita estos valores para personalizar tu tienda.
// El COLOR de marca se ajusta en app/globals.css (--morado, --lima, etc.).
export const site = {
  name: "ImpriMola 3D",
  tagline: "Impresión 3D hecha a mano",
  description:
    "Figuras y objetos de impresión 3D personalizables. Elige color, tamaño y acabado, y mira el precio al instante.",

  hero: {
    titulo: "Figuras 3D hechas a mano, a tu gusto",
    subtitulo:
      "Personaliza color, tamaño y acabado y mira el precio al instante. Cuando lo tengas, copia tu pedido y escríbeme.",
  },

  // Sección "Cómo funciona" (3 pasos)
  pasos: [
    {
      titulo: "Elige y personaliza",
      texto:
        "Explora el catálogo y ajusta color, tamaño y acabado. El precio se calcula solo.",
    },
    {
      titulo: "Copia tu pedido",
      texto:
        "Pulsa “Copiar pedido” y pégamelo por WhatsApp. Te confirmo disponibilidad y tiempos.",
    },
    {
      titulo: "Lo imprimo y te lo doy",
      texto: "Preparo tu figura con cuidado y quedamos para la entrega.",
    },
  ],

  // Sección "Sobre mí"
  sobreMi:
    "¡Hola! Imprimo figuras en 3D y ahora las comparto con amigos. Cada pieza la preparo y reviso a mano. Si quieres algo personalizado, escríbeme y lo vemos.",

  // Tu WhatsApp en formato internacional, solo dígitos (ej. 34666112233).
  // Déjalo vacío y el botón enlazará a la sección de contacto.
  whatsapp: "",
};

// Construye un enlace de WhatsApp con mensaje, o null si no hay número.
export function whatsappUrl(text: string): string | null {
  const num = site.whatsapp.replace(/\D/g, "");
  return num ? `https://wa.me/${num}?text=${encodeURIComponent(text)}` : null;
}
