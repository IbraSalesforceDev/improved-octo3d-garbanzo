import { getCategorias } from "@/lib/productos";
import AdminHeader from "../AdminHeader";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const categorias = await getCategorias();
  return (
    <>
      <AdminHeader />
      <h1 className="mb-6 text-2xl font-bold">Nuevo producto</h1>
      <ProductForm categorias={categorias} />
    </>
  );
}
