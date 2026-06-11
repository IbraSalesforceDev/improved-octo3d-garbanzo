import { createClient } from "@/utils/supabase/client";

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

// Suma al contador de "copias" de cada producto cuando un cliente copia su
// pedido. Falla en silencio (no debe molestar al usuario).
export async function registrarCopias(
  items: { productoId: string; cantidad: number }[]
) {
  if (!configured || items.length === 0) return;
  try {
    const supabase = createClient();
    await Promise.all(
      items.map((i) =>
        supabase.rpc("incrementar_copias", {
          prod_id: i.productoId,
          n: i.cantidad,
        })
      )
    );
  } catch {
    // ignore
  }
}
