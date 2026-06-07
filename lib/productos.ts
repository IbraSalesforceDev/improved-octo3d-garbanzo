import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { sampleProductos } from "./sampleData";
import type { Producto } from "./types";

// La app arranca con datos de demo si todavía no hay claves de Supabase.
const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

export interface ProductosResult {
  productos: Producto[];
  // true cuando se muestran datos de demo (Supabase sin configurar o sin datos).
  demo: boolean;
}

export async function getProductos(): Promise<ProductosResult> {
  if (!isSupabaseConfigured) {
    return { productos: sampleProductos, demo: true };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Intento completo: destacados primero y orden manual.
  let res = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("destacado", { ascending: false })
    .order("orden", { ascending: true })
    .order("created_at", { ascending: false });

  // Si fallan columnas nuevas (migración pendiente), reintenta sin ellas
  // para no perder los productos reales.
  if (res.error) {
    console.error("getProductos:", res.error.message);
    res = await supabase
      .from("productos")
      .select("*")
      .eq("activo", true)
      .order("created_at", { ascending: false });
  }

  if (res.error) {
    console.error("getProductos (fallback):", res.error.message);
    return { productos: sampleProductos, demo: true };
  }

  if (!res.data || res.data.length === 0) {
    return { productos: sampleProductos, demo: true };
  }

  return { productos: res.data as Producto[], demo: false };
}

// Lista de categorías existentes (para sugerencias en el panel de admin).
export async function getCategorias(): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase.from("productos").select("categoria");
  if (!data) return [];
  const set = new Set(
    data
      .map((r) => (r as { categoria: string | null }).categoria)
      .filter((c): c is string => Boolean(c))
  );
  return Array.from(set).sort();
}
