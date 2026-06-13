"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registrarVenta } from "../actions";
import { formatEUR } from "@/lib/precio";

type Opc = { id: string; nombre: string; precio_base: number };

export default function RegistrarVentaForm({ productos }: { productos: Opc[] }) {
  const router = useRouter();
  const [productoId, setProductoId] = useState(productos[0]?.id ?? "");
  const [cantidad, setCantidad] = useState(1);
  const [precio, setPrecio] = useState(String(productos[0]?.precio_base ?? ""));
  const [nota, setNota] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (productos.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Crea algún producto antes de registrar ventas.
      </p>
    );
  }

  function onProducto(id: string) {
    setProductoId(id);
    const p = productos.find((x) => x.id === id);
    if (p) setPrecio(String(p.precio_base));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = productos.find((x) => x.id === productoId);
    const precioNum = Number(precio);
    if (!p) return setError("Elige un producto.");
    if (Number.isNaN(precioNum) || precioNum < 0)
      return setError("Precio no válido.");

    setSaving(true);
    setError(null);
    try {
      await registrarVenta({
        producto_id: p.id,
        nombre: p.nombre,
        cantidad,
        precio_unitario: precioNum,
        nota: nota.trim() || null,
      });
      setCantidad(1);
      setNota("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar.");
    } finally {
      setSaving(false);
    }
  }

  const total = (Number(precio) || 0) * cantidad;
  const inputCls =
    "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm";

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4"
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">
            Producto
          </label>
          <select
            value={productoId}
            onChange={(e) => onProducto(e.target.value)}
            className={inputCls}
          >
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="w-24">
          <label className="mb-1 block text-xs font-medium text-neutral-500">
            Cantidad
          </label>
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => {
              const n = Number(e.target.value);
              setCantidad(Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1);
            }}
            className={inputCls}
          />
        </div>
        <div className="w-28">
          <label className="mb-1 block text-xs font-medium text-neutral-500">
            Precio (€)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <input
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        placeholder="Nota (opcional): cliente, color elegido..."
        className={inputCls}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-500">
          Total: <b className="text-[var(--tinta)]">{formatEUR(total)}</b>
        </span>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[var(--morado)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--morado-claro)] disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Registrar venta"}
        </button>
      </div>
    </form>
  );
}
