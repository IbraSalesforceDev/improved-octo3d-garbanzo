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

// Columnas añadidas en migraciones posteriores: si alguna todavía no existe en
// la base de datos, se guarda sin ella en vez de fallar.
const COLUMNAS_OPCIONALES = [
  "colores_hex",
  "imagenes_color",
  "imagenes",
  "categoria",
  "destacado",
];

// Reintenta la escritura quitando la columna que la base de datos no reconoce.
async function escribirTolerante(
  fila: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  escribir: (f: Record<string, unknown>) => PromiseLike<{ error: any }>
) {
  let actual = { ...fila };
  for (let intento = 0; intento <= COLUMNAS_OPCIONALES.length; intento++) {
    const { error } = await escribir(actual);
    if (!error) return;

    const falta = COLUMNAS_OPCIONALES.find(
      (c) => c in actual && error.message.includes(c)
    );
    if (!falta) throw new Error(error.message);

    console.warn(
      `Columna "${falta}" no existe todavía; guardando sin ella. Ejecuta las migraciones de supabase/.`
    );
    delete actual[falta];
  }
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
    colores_hex: input.colores_hex,
    opciones: input.opciones,
    categoria: input.categoria,
    destacado: input.destacado,
    activo: input.activo,
  };

  if (input.id) {
    await escribirTolerante(fila, (f) =>
      supabase.from("productos").update(f).eq("id", input.id as string)
    );
  } else {
    // Los productos nuevos van al final del orden.
    const { data: ultimo } = await supabase
      .from("productos")
      .select("orden")
      .order("orden", { ascending: false })
      .limit(1);
    const orden =
      ultimo && ultimo.length ? (ultimo[0].orden as number) + 1 : 0;

    await escribirTolerante({ ...fila, orden }, (f) =>
      supabase.from("productos").insert(f)
    );
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
