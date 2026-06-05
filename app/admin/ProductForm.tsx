"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
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

export default function ProductForm({ producto }: { producto?: Producto }) {
  const router = useRouter();
  const editando = Boolean(producto);

  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? "");
  const [precioBase, setPrecioBase] = useState(
    producto ? String(producto.precio_base) : ""
  );
  const [activo, setActivo] = useState(producto?.activo ?? true);
  const [imagenUrl, setImagenUrl] = useState<string | null>(
    producto?.imagen_url ?? null
  );
  const [file, setFile] = useState<File | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>(
    producto ? opcionesToGrupos(producto.opciones) : []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      let finalImagenUrl = imagenUrl;

      if (file) {
        const supabase = createClient();
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("productos")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw new Error(`Subiendo imagen: ${upErr.message}`);
        finalImagenUrl = supabase.storage.from("productos").getPublicUrl(path)
          .data.publicUrl;
      }

      await saveProducto({
        id: producto?.id,
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        precio_base: precio,
        imagen_url: finalImagenUrl,
        opciones: gruposToOpciones(grupos),
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
      </div>

      {/* Imagen */}
      <div>
        <label className="mb-1 block text-sm font-medium">Imagen</label>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
            {(file || imagenUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={file ? URL.createObjectURL(file) : (imagenUrl as string)}
                alt="Vista previa"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            {imagenUrl && !file && (
              <button
                type="button"
                onClick={() => setImagenUrl(null)}
                className="self-start text-xs text-red-600 hover:underline"
              >
                Quitar imagen actual
              </button>
            )}
          </div>
        </div>
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
            className="text-sm text-blue-600 hover:underline"
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
                  className="self-start text-sm text-blue-600 hover:underline"
                >
                  + Añadir elección
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
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
