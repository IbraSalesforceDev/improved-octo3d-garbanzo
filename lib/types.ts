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
  imagenes: string[];
  opciones: Opciones;
  categoria: string | null;
  orden: number;
  destacado: boolean;
  copias: number;
  activo: boolean;
  created_at: string;
}

// Venta REAL registrada a mano por el admin (pedido confirmado).
export interface Venta {
  id: string;
  producto_id: string | null;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  nota: string | null;
  created_at: string;
}
export interface ProductoInput {
  id?: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagenes: string[];
  opciones: Opciones;
  categoria: string | null;
  destacado: boolean;
  activo: boolean;
}
