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
