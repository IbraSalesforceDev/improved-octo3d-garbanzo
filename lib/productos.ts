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
