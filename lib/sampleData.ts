import type { Producto } from "./types";

// Datos de demostración que se muestran cuando Supabase todavía no está
// configurado. Así puedes ver el catálogo funcionando antes de conectar la
// base de datos. En cuanto añadas las variables de entorno y productos reales,
// estos dejan de usarse automáticamente.
export const sampleProductos: Producto[] = [
  {
    id: "demo-1",
    nombre: "Dragón articulado",
    descripcion: "Figura articulada flexible, ideal para escritorio.",
    precio_base: 12,
    imagen_url: null,
    opciones: {
      color: { blanco: 0, negro: 3, dorado: 5 },
      tamano: { S: 0, M: 5, L: 10 },
    },
    categoria: "Figuras",
    activo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    nombre: "Maceta geométrica",
    descripcion: "Maceta low-poly para suculentas.",
    precio_base: 8,
    imagen_url: null,
    opciones: {
      color: { blanco: 0, terracota: 2, verde: 2 },
    },
    categoria: "Hogar",
    activo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    nombre: "Soporte para móvil",
    descripcion: "Soporte plegable compatible con la mayoría de móviles.",
    precio_base: 6,
    imagen_url: null,
    opciones: {
      color: { negro: 0, azul: 1, rojo: 1 },
      acabado: { mate: 0, brillo: 2 },
    },
    categoria: "Accesorios",
    activo: true,
    created_at: new Date().toISOString(),
  },
];
