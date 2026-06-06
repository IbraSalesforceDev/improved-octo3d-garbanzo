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

export async function saveProducto(input: ProductoInput) {
  const supabase = await getAuthedClient();

  const fila = {
    nombre: input.nombre,
    descripcion: input.descripcion,
    precio_base: input.precio_base,
    imagen_url: input.imagen_url,
    opciones: input.opciones,
    categoria: input.categoria,
    activo: input.activo,
  };

  if (input.id) {
    const { error } = await supabase
      .from("productos")
      .update(fila)
      .eq("id", input.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("productos").insert(fila);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteProducto(id: string) {
  const supabase = await getAuthedClient();
  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
}
