import type { Producto } from "@/lib/types";
import PedidoBox from "./PedidoBox";
import ShareButton from "./ShareButton";
import Galeria from "./Galeria";

export default function ProductoDetalle({ producto }: { producto: Producto }) {
  // Usa la galería si existe; si no, recurre a la imagen de portada.
  const imagenes =
    producto.imagenes && producto.imagenes.length > 0
      ? producto.imagenes
      : producto.imagen_url
        ? [producto.imagen_url]
        : [];

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
      {/* Galería */}
      <Galeria imagenes={imagenes} nombre={producto.nombre} />

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
