"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { moverProducto, toggleDestacado } from "./actions";
import { formatEUR } from "@/lib/precio";
import type { Producto } from "@/lib/types";

export default function ProductoRow({
  producto,
  isFirst,
  isLast,
}: {
  producto: Producto;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function mover(dir: "subir" | "bajar") {
    setBusy(true);
    try {
      await moverProducto(producto.id, dir);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function destacar() {
    setBusy(true);
    try {
      await toggleDestacado(producto.id, !producto.destacado);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const portada = producto.imagenes?.[0] ?? producto.imagen_url;

  return (
    <li className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4">
      <div className="flex flex-col text-neutral-400">
        <button
          type="button"
          onClick={() => mover("subir")}
          disabled={busy || isFirst}
          className="px-1 leading-none hover:text-[var(--morado)] disabled:opacity-30"
          aria-label="Subir"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => mover("bajar")}
          disabled={busy || isLast}
          className="px-1 leading-none hover:text-[var(--morado)] disabled:opacity-30"
          aria-label="Bajar"
        >
          ▼
        </button>
      </div>

      <Link
        href={`/admin/${producto.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1 hover:bg-neutral-50"
      >
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-100">
          {portada && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portada}
              alt={producto.nombre}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{producto.nombre}</p>
          <p className="text-sm text-neutral-500">
            {formatEUR(Number(producto.precio_base))} base
            {producto.categoria ? ` · ${producto.categoria}` : ""}
          </p>
        </div>
      </Link>

      {!producto.activo && (
        <span className="hidden rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600 sm:inline">
          Oculto
        </span>
      )}

      <button
        type="button"
        onClick={destacar}
        disabled={busy}
        title={producto.destacado ? "Quitar destacado" : "Destacar"}
        className={
          "px-2 text-xl leading-none transition disabled:opacity-40 " +
          (producto.destacado
            ? "text-amber-500"
            : "text-neutral-300 hover:text-amber-500")
        }
        aria-label="Destacar"
      >
        {producto.destacado ? "★" : "☆"}
      </button>
    </li>
  );
}
