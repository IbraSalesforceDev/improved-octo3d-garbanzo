import ProductCard from "@/components/ProductCard";
import { getProductos } from "@/lib/productos";
import { site } from "@/lib/site";

// Releer en cada visita para que los cambios en Supabase salgan al momento.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { productos, demo } = await getProductos();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-neutral-200/70">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50" />
        <div
          className="absolute inset-0 -z-10 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #000 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/70 px-3 py-1 text-xs font-medium text-[var(--brand)] backdrop-blur">
            ✦ {site.tagline}
          </span>
          <div className="mt-5 flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--brand)] text-white shadow-lg sm:h-16 sm:w-16">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                />
              </svg>
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
              {site.name}
            </h1>
          </div>
          <p className="mt-4 max-w-xl text-base text-neutral-600 sm:text-lg">
            {site.description}
          </p>
        </div>
      </header>

      {/* Catálogo */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        {demo && (
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span aria-hidden className="text-base leading-none">
              ⚠️
            </span>
            <p>
              Mostrando productos de <strong>demostración</strong>. Añade los
              tuyos desde el panel de administración.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/70 py-8">
        <p className="text-center text-sm text-neutral-400">
          {site.name} · Hecho con cariño
        </p>
      </footer>
    </div>
  );
}
