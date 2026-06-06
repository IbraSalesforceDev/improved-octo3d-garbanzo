import Link from "next/link";
import type { Producto } from "@/lib/types";
import PedidoBox from "./PedidoBox";

export default function ProductCard({ producto }: { producto: Producto }) {
  const href = `/producto/${producto.id}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-neutral-200">
      <Link
        href={href}
        className="relative block aspect-square w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200"
      >
        {producto.imagen_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
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
        {producto.categoria && (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--lima)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--tinta)]">
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

        <PedidoBox producto={producto} />
      </div>
    </article>
  );
}
