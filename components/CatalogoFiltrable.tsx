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
  const visibles = activa
    ? productos.filter((p) => p.categoria === activa)
    : productos;

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
      {categorias.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {chip("Todas", null)}
          {categorias.map((c) => chip(c, c))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </>
  );
}
