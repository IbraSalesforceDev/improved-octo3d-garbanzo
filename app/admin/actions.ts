"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { ProductoInput } from "@/lib/types";

async function getAuthedClient() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");
  return supabase;
}

function revalidar() {
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function saveProducto(input: ProductoInput) {
  const supabase = await getAuthedClient();

  const fila = {
    nombre: input.nombre,
    descripcion: input.descripcion,
    precio_base: input.precio_base,
    // La portada del catálogo es la primera imagen de la galería.
    imagen_url: input.imagenes[0] ?? null,
    imagenes: input.imagenes,
    imagenes_color: input.imagenes_color,
    opciones: input.opciones,
    categoria: input.categoria,
    destacado: input.destacado,
    activo: input.activo,
  };

  if (input.id) {
    const { error } = await supabase
      .from("productos")
      .update(fila)
      .eq("id", input.id);
    if (error) throw new Error(error.message);
  } else {
    // Los productos nuevos van al final del orden.
    const { data: ultimo } = await supabase
      .from("productos")
      .select("orden")
      .order("orden", { ascending: false })
      .limit(1);
    const orden =
      ultimo && ultimo.length ? (ultimo[0].orden as number) + 1 : 0;

    const { error } = await supabase
      .from("productos")
      .insert({ ...fila, orden });
    if (error) throw new Error(error.message);
  }

  revalidar();
}

export async function deleteProducto(id: string) {
  const supabase = await getAuthedClient();
  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidar();
}

export async function toggleDestacado(id: string, destacado: boolean) {
  const supabase = await getAuthedClient();
  const { error } = await supabase
    .from("productos")
    .update({ destacado })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidar();
}

// --- Ventas reales (registro manual) ---------------------------------------
export async function registrarVenta(input: {
  producto_id: string | null;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  nota: string | null;
}) {
  const supabase = await getAuthedClient();
  const cantidad =
    Number.isFinite(input.cantidad) && input.cantidad >= 1
      ? Math.round(input.cantidad)
      : 1;
  const precio = Number(input.precio_unitario);
  if (!Number.isFinite(precio) || precio < 0) {
    throw new Error("Precio no válido.");
  }
  const total = Number((precio * cantidad).toFixed(2));

  const { error } = await supabase.from("ventas").insert({
    producto_id: input.producto_id,
    nombre: input.nombre,
    cantidad,
    precio_unitario: precio,
    total,
    nota: input.nota ? input.nota.slice(0, 300) : null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/estadisticas");
}

export async function eliminarVenta(id: string) {
  const supabase = await getAuthedClient();
  const { error } = await supabase.from("ventas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/estadisticas");
}

// Guarda el nuevo orden de los productos (orden = posición en la lista).
export async function reordenar(ids: string[]) {
  const supabase = await getAuthedClient();
  await Promise.all(
    ids.map((id, idx) =>
      supabase.from("productos").update({ orden: idx }).eq("id", id)
    )
  );
  revalidar();
}
