"use client";

import { useState } from "react";
import type { Producto } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function CatalogoFiltrable({
  productos,
}: {
  productos: Producto[];
}) {
  const categorias = Array.from(
    new Set(productos.map((p) => p.categoria).filter(Boolean))
  ) as string[];

  const [activa, setActiva] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const q = busqueda.trim().toLowerCase();
  const visibles = productos.filter((p) => {
    const coincideCat = activa ? p.categoria === activa : true;
    const coincideTexto = q
      ? p.nombre.toLowerCase().includes(q) ||
        (p.descripcion ?? "").toLowerCase().includes(q)
      : true;
    return coincideCat && coincideTexto;
  });

  const chip = (label: string, value: string | null) => {
    const sel = activa === value;
    return (
      <button
        key={label}
        type="button"
        onClick={() => setActiva(value)}
        className={
          "min-h-[36px] rounded-full border px-4 py-1.5 text-sm font-medium transition " +
          (sel
            ? "border-[var(--morado)] bg-[var(--morado)] text-white"
            : "border-neutral-200 bg-white text-[var(--gris)] hover:border-[var(--morado)] hover:text-[var(--morado)]")
        }
      >
        {label}
      </button>
    );
  };

  return (
    <>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {categorias.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {chip("Todas", null)}
            {categorias.map((c) => chip(c, c))}
          </div>
        ) : (
          <span />
        )}

        <div className="relative sm:w-64">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar figura..."
            className="w-full rounded-full border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--morado)]"
          />
        </div>
      </div>

      {visibles.length === 0 ? (
        <p className="mt-10 text-center text-[var(--gris)]">
          No hay figuras que coincidan con tu búsqueda.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </>
  );
}
