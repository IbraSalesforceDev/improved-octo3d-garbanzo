import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import type { Producto } from "@/lib/types";
import SiteHeader from "@/components/SiteHeader";
import ProductoDetalle from "@/components/ProductoDetalle";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

async function getProducto(id: string): Promise<Producto | null> {
  const supabase = createClient(await cookies());
  const { data } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Producto) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const producto = await getProducto(params.id);
  if (!producto) return { title: "Producto no encontrado" };
  return {
    title: producto.nombre,
    description: producto.descripcion ?? site.description,
    openGraph: {
      title: producto.nombre,
      description: producto.descripcion ?? site.description,
      images: producto.imagen_url ? [producto.imagen_url] : undefined,
    },
  };
}

export default async function ProductoPage({
  params,
}: {
  params: { id: string };
}) {
  const producto = await getProducto(params.id);
  if (!producto || !producto.activo) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1080px] px-5 py-8 sm:px-8 sm:py-12">
        <Link
          href="/#catalogo"
          className="text-sm font-medium text-[var(--morado)] hover:underline"
        >
          ← Volver al catálogo
        </Link>
        <ProductoDetalle producto={producto} />
      </main>
      <footer className="border-t border-neutral-200/70 py-8">
        <p className="text-center text-sm text-neutral-400">
          {site.name} · Hecho con cariño
        </p>
      </footer>
    </>
  );
}
