"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { comprimirImagen } from "@/lib/comprimirImagen";
import { guessHex } from "@/lib/colores";
import { saveProducto, deleteProducto } from "./actions";
import type { Opciones, Producto } from "@/lib/types";

// --- Estructura interna del editor de opciones -----------------------------
type Choice = { key: string; opcion: string; inc: string };
type Grupo = { key: string; nombre: string; choices: Choice[] };

let idCounter = 0;
const newKey = () => `k${idCounter++}`;

function opcionesToGrupos(opciones: Opciones): Grupo[] {
  return Object.entries(opciones ?? {}).map(([nombre, choices]) => ({
    key: newKey(),
    nombre,
    choices: Object.entries(choices).map(([opcion, inc]) => ({
      key: newKey(),
      opcion,
      inc: String(inc),
    })),
  }));
}

function gruposToOpciones(grupos: Grupo[]): Opciones {
  const out: Opciones = {};
  for (const g of grupos) {
    const nombre = g.nombre.trim();
    if (!nombre) continue;
    const choices: Record<string, number> = {};
    for (const c of g.choices) {
      const opcion = c.opcion.trim();
      if (!opcion) continue;
      choices[opcion] = Number(c.inc) || 0;
    }
    out[nombre] = choices;
  }
  return out;
}

export default function ProductForm({
  producto,
  categorias = [],
}: {
  producto?: Producto;
  categorias?: string[];
}) {
  const router = useRouter();
  const editando = Boolean(producto);

  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? "");
  const [categoria, setCategoria] = useState(producto?.categoria ?? "");
  const [precioBase, setPrecioBase] = useState(
    producto ? String(producto.precio_base) : ""
  );
  const [activo, setActivo] = useState(producto?.activo ?? true);
  const [destacado, setDestacado] = useState(producto?.destacado ?? false);
  const [imagenes, setImagenes] = useState<string[]>(() => {
    if (producto?.imagenes?.length) return producto.imagenes;
    if (producto?.imagen_url) return [producto.imagen_url];
    return [];
  });
  const [subiendo, setSubiendo] = useState(false);
  const [imagenesColor, setImagenesColor] = useState<Record<string, string>>(
    producto?.imagenes_color ?? {}
  );
  const [coloresHex, setColoresHex] = useState<Record<string, string>>(
    producto?.colores_hex ?? {}
  );
  const [grupos, setGrupos] = useState<Grupo[]>(
    producto ? opcionesToGrupos(producto.opciones) : []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Imágenes -------------------------------------------------------------
  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setSubiendo(true);
    setError(null);
    try {
      const supabase = createClient();
      const nuevas: string[] = [];
      for (const file of files) {
        const optimizada = await comprimirImagen(file);
        const path = `${crypto.randomUUID()}.webp`;
        const { error: upErr } = await supabase.storage
          .from("productos")
          .upload(path, optimizada, {
            cacheControl: "3600",
            upsert: false,
            contentType: optimizada.type,
          });
        if (upErr) throw new Error(`Subiendo imagen: ${upErr.message}`);
        nuevas.push(
          supabase.storage.from("productos").getPublicUrl(path).data.publicUrl
        );
      }
      setImagenes((prev) => [...prev, ...nuevas]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imágenes.");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }

  async function subirImagenColor(color: string, file: File) {
    setSubiendo(true);
    setError(null);
    try {
      const supabase = createClient();
      const optimizada = await comprimirImagen(file);
      const path = `${crypto.randomUUID()}.webp`;
      const { error: upErr } = await supabase.storage
        .from("productos")
        .upload(path, optimizada, {
          cacheControl: "3600",
          upsert: false,
          contentType: optimizada.type,
        });
      if (upErr) throw new Error(`Subiendo imagen: ${upErr.message}`);
      const url = supabase.storage.from("productos").getPublicUrl(path).data
        .publicUrl;
      setImagenesColor((prev) => ({ ...prev, [color]: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen.");
    } finally {
      setSubiendo(false);
    }
  }

  const quitarImagen = (url: string) =>
    setImagenes((prev) => prev.filter((u) => u !== url));
  const hacerPortada = (i: number) =>
    setImagenes((prev) => {
      const copia = [...prev];
      const [img] = copia.splice(i, 1);
      copia.unshift(img);
      return copia;
    });

  // --- Editor de opciones ---------------------------------------------------
  const addGrupo = () =>
    setGrupos((g) => [...g, { key: newKey(), nombre: "", choices: [] }]);
  const removeGrupo = (key: string) =>
    setGrupos((g) => g.filter((x) => x.key !== key));
  const setGrupoNombre = (key: string, nombre: string) =>
    setGrupos((g) => g.map((x) => (x.key === key ? { ...x, nombre } : x)));
  const addChoice = (key: string) =>
    setGrupos((g) =>
      g.map((x) =>
        x.key === key
          ? {
              ...x,
              choices: [...x.choices, { key: newKey(), opcion: "", inc: "0" }],
            }
          : x
      )
    );
  const setChoice = (
    gKey: string,
    cKey: string,
    field: "opcion" | "inc",
    value: string
  ) =>
    setGrupos((g) =>
      g.map((x) =>
        x.key === gKey
          ? {
              ...x,
              choices: x.choices.map((c) =>
                c.key === cKey ? { ...c, [field]: value } : c
              ),
            }
          : x
      )
    );
  const removeChoice = (gKey: string, cKey: string) =>
    setGrupos((g) =>
      g.map((x) =>
        x.key === gKey
          ? { ...x, choices: x.choices.filter((c) => c.key !== cKey) }
          : x
      )
    );

  // Colores definidos en el grupo "color" (para asignarles foto).
  const grupoColor = grupos.find((g) => /color/i.test(g.nombre));
  const coloresChoices = grupoColor
    ? Array.from(
        new Set(grupoColor.choices.map((c) => c.opcion.trim()).filter(Boolean))
      )
    : [];

  // --- Guardar --------------------------------------------------------------
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const precio = Number(precioBase);
    if (!nombre.trim()) return setError("El nombre es obligatorio.");
    if (!precioBase || Number.isNaN(precio) || precio < 0)
      return setError("El precio base debe ser un número válido.");

    setSaving(true);
    try {
      const coloresSet = new Set(coloresChoices);
      const imagenesColorLimpio = Object.fromEntries(
        Object.entries(imagenesColor).filter(([k]) => coloresSet.has(k))
      );
      const coloresHexLimpio: Record<string, string> = {};
      for (const c of coloresChoices) {
        const hex = coloresHex[c] ?? guessHex(c);
        if (hex) coloresHexLimpio[c] = hex;
      }

      await saveProducto({
        id: producto?.id,
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        precio_base: precio,
        imagenes,
        imagenes_color: imagenesColorLimpio,
        colores_hex: coloresHexLimpio,
        opciones: gruposToOpciones(grupos),
        categoria: categoria.trim() || null,
        destacado,
        activo,
      });

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!producto) return;
    if (!confirm(`¿Borrar "${producto.nombre}"?`)) return;
    setSaving(true);
    try {
      await deleteProducto(producto.id);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al borrar.");
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Nombre *</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className={inputCls}
        />
      </div>

      <div className="w-full sm:w-72">
        <label className="mb-1 block text-sm font-medium">Categoría</label>
        <input
          list="categorias-list"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Ej. Llaveros, Figuras, Hogar"
          className={inputCls}
        />
        <datalist id="categorias-list">
          {categorias.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-wrap items-end gap-6">
        <div className="w-40">
          <label className="mb-1 block text-sm font-medium">
            Precio base (€) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={precioBase}
            onChange={(e) => setPrecioBase(e.target.value)}
            className={inputCls}
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="h-4 w-4"
          />
          Visible en el catálogo
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={destacado}
            onChange={(e) => setDestacado(e.target.checked)}
            className="h-4 w-4"
          />
          Destacado
        </label>
      </div>

      {/* Imágenes (galería) */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Imágenes{" "}
          <span className="font-normal text-neutral-400">
            (la primera es la portada)
          </span>
        </label>

        {imagenes.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {imagenes.map((url, i) => (
              <div
                key={url}
                className="relative h-24 w-24 overflow-hidden rounded-lg border border-neutral-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => quitarImagen(url)}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
                  aria-label="Quitar"
                >
                  ✕
                </button>
                {i === 0 ? (
                  <span className="absolute bottom-1 left-1 rounded bg-[var(--morado)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Portada
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => hacerPortada(i)}
                    className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700 hover:bg-white"
                  >
                    Hacer portada
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onFiles}
          disabled={subiendo}
          className="text-sm"
        />
        {subiendo && (
          <p className="mt-1 text-xs text-neutral-500">Subiendo imágenes...</p>
        )}
      </div>

      {/* Editor de opciones */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium">
            Opciones (cambian el precio)
          </label>
          <button
            type="button"
            onClick={addGrupo}
            className="text-sm text-[var(--morado)] hover:underline"
          >
            + Añadir grupo
          </button>
        </div>

        {grupos.length === 0 && (
          <p className="text-sm text-neutral-500">
            Sin opciones. Ejemplo de grupo: “color” con elecciones “blanco (+0)”,
            “negro (+3)”.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {grupos.map((g) => (
            <div
              key={g.key}
              className="rounded-lg border border-neutral-200 p-3"
            >
              <div className="mb-3 flex items-center gap-2">
                <input
                  placeholder="Nombre del grupo (ej. color)"
                  value={g.nombre}
                  onChange={(e) => setGrupoNombre(g.key, e.target.value)}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeGrupo(g.key)}
                  className="shrink-0 rounded-lg border border-neutral-300 px-2 py-2 text-xs text-neutral-600 hover:bg-neutral-100"
                >
                  Eliminar
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {g.choices.map((c) => (
                  <div key={c.key} className="flex items-center gap-2">
                    <input
                      placeholder="Elección (ej. negro)"
                      value={c.opcion}
                      onChange={(e) =>
                        setChoice(g.key, c.key, "opcion", e.target.value)
                      }
                      className={inputCls}
                    />
                    <div className="flex w-32 shrink-0 items-center gap-1">
                      <span className="text-sm text-neutral-500">+€</span>
                      <input
                        type="number"
                        step="0.01"
                        value={c.inc}
                        onChange={(e) =>
                          setChoice(g.key, c.key, "inc", e.target.value)
                        }
                        className={inputCls}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeChoice(g.key, c.key)}
                      className="shrink-0 px-2 text-neutral-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addChoice(g.key)}
                  className="self-start text-sm text-[var(--morado)] hover:underline"
                >
                  + Añadir elección
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Foto por color */}
      {coloresChoices.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium">
            Color: tono y foto{" "}
            <span className="font-normal text-neutral-400">(opcional)</span>
          </label>
          <p className="mb-2 text-xs text-neutral-400">
            Al elegir un color en la tienda: si subes una <b>foto</b>, se muestra
            esa foto; si no, se recolorea la foto base con el <b>tono</b> elegido.
          </p>
          <div className="flex flex-col gap-2">
            {coloresChoices.map((color) => (
              <div key={color} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-sm capitalize">{color}</span>
                <input
                  type="color"
                  value={coloresHex[color] ?? guessHex(color) ?? "#cccccc"}
                  onChange={(e) =>
                    setColoresHex((prev) => ({
                      ...prev,
                      [color]: e.target.value,
                    }))
                  }
                  title="Tono (se usa si no subes foto)"
                  className="h-8 w-9 shrink-0 cursor-pointer rounded border border-neutral-300 bg-white p-0.5"
                />
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                  {imagenesColor[color] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imagenesColor[color]}
                      alt={color}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  disabled={subiendo}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) subirImagenColor(color, f);
                    e.target.value = "";
                  }}
                  className="text-sm"
                />
                {imagenesColor[color] && (
                  <button
                    type="button"
                    onClick={() =>
                      setImagenesColor((prev) => {
                        const n = { ...prev };
                        delete n[color];
                        return n;
                      })
                    }
                    className="text-xs text-red-600 hover:underline"
                  >
                    Quitar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
        <button
          type="submit"
          disabled={saving || subiendo}
          className="rounded-xl bg-[var(--morado)] px-5 py-2.5 font-semibold text-white transition hover:bg-[var(--morado-claro)] disabled:opacity-50"
        >
          {saving ? "Guardando..." : editando ? "Guardar cambios" : "Crear producto"}
        </button>

        {editando && (
          <button
            type="button"
            onClick={onDelete}
            disabled={saving}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Borrar
          </button>
        )}
      </div>
    </form>
  );
}
