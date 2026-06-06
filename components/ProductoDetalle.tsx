import type { Producto } from "@/lib/types";
import PedidoBox from "./PedidoBox";
import ShareButton from "./ShareButton";

export default function ProductoDetalle({ producto }: { producto: Producto }) {
  return (
    <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
      {/* Imagen */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-neutral-100 to-neutral-200">
        <div className="aspect-square w-full">
          {producto.imagen_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-16 w-16"
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
        </div>
      </div>

      {/* Información */}
      <div className="flex flex-col gap-5">
        <div>
          {producto.categoria && (
            <span className="inline-block rounded-full bg-[var(--lima)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--tinta)]">
              {producto.categoria}
            </span>
          )}
          <h1 className="mt-2 text-[28px] font-bold leading-tight text-[var(--tinta)] sm:text-[40px]">
            {producto.nombre}
          </h1>
          {producto.descripcion && (
            <p className="mt-3 max-w-[60ch] leading-relaxed text-[var(--gris)]">
              {producto.descripcion}
            </p>
          )}
        </div>

        <PedidoBox producto={producto} />

        <div>
          <ShareButton title={producto.nombre} />
        </div>
      </div>
    </div>
  );
}
