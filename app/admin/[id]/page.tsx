import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { Producto } from "@/lib/types";
import AdminHeader from "../AdminHeader";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditarProductoPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient(await cookies());
  const { data } = await supabase
    .from("productos")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!data) notFound();

  return (
    <>
      <AdminHeader />
      <h1 className="mb-6 text-2xl font-bold">Editar producto</h1>
      <ProductForm producto={data as Producto} />
    </>
  );
}
