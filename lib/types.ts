// Tipos compartidos del catálogo.

// Cada grupo de opciones (p. ej. "color") mapea cada elección a su incremento
// de precio en euros. Ejemplo:
//   { color: { blanco: 0, negro: 3 }, tamano: { S: 0, M: 5, L: 10 } }
export type Opciones = Record<string, Record<string, number>>;

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  opciones: Opciones;
  categoria: string | null;
  activo: boolean;
  created_at: string;
}

// Datos que envía el formulario de admin al crear/editar un producto.
export interface ProductoInput {
  id?: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  opciones: Opciones;
  categoria: string | null;
  activo: boolean;
}
