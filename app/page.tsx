import ProductCard from "@/components/ProductCard";
import { getProductos } from "@/lib/productos";

// Releer en cada visita para que los cambios en Supabase salgan al momento.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { productos, demo } = await getProductos();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Figuras 3D</h1>
        <p className="mt-1 text-neutral-600">
          Elige opciones y mira el precio actualizarse al instante.
        </p>
      </header>

      {demo && (
        <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Mostrando productos de <strong>demostración</strong>. Configura las
          variables de Supabase y añade productos para ver los tuyos.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </main>
  );
}
