import { getSupabaseClient } from "./supabase";
import { sampleProductos } from "./sampleData";
import type { Producto } from "./types";

export interface ProductosResult {
  productos: Producto[];
  // true cuando se están mostrando datos de demo (Supabase sin configurar o sin datos).
  demo: boolean;
}

export async function getProductos(): Promise<ProductosResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { productos: sampleProductos, demo: true };
  }

  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error leyendo productos de Supabase:", error.message);
    return { productos: sampleProductos, demo: true };
  }

  if (!data || data.length === 0) {
    return { productos: sampleProductos, demo: true };
  }

  return { productos: data as Producto[], demo: false };
}
