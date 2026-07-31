"use client";

import Link from "next/link";
import Image from "next/image";
import type { Producto } from "@/lib/types";
import PedidoControls from "./PedidoControls";
import { usePedido } from "@/hooks/usePedido";

export default function ProductCard({ producto }: { producto: Producto }) {
  const { grupos, seleccion, elegir, precioFinal, imagenColor, tintColor } =
    usePedido(producto);

  const href = `/producto/${producto.id}`;
  const portada = producto.imagenes?.[0] ?? producto.imagen_url;
  const imagen = imagenColor ?? portada;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-neutral-200">
      <Link
        href={href}
        className="relative block aspect-square w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 [isolation:isolate]"
      >
        {imagen ? (
          <Image
            src={imagen}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-12 w-12"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
          </div>
        )}
        {tintColor && imagen && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: tintColor, mixBlendMode: "color" }}
          />
        )}
        {producto.categoria && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-[var(--lima)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--tinta)]">
            {producto.categoria}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <Link href={href}>
            <h3 className="text-lg font-bold leading-tight transition-colors hover:text-[var(--morado)]">
              {producto.nombre}
            </h3>
          </Link>
          {producto.descripcion && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--gris)]">
              {producto.descripcion}
            </p>
          )}
        </div>

        <PedidoControls
          producto={producto}
          grupos={grupos}
          seleccion={seleccion}
          elegir={elegir}
          precioFinal={precioFinal}
        />
      </div>
    </article>
  );
}
