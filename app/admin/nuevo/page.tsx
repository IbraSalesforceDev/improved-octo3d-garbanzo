import AdminHeader from "../AdminHeader";
import ProductForm from "../ProductForm";

export default function NuevoProductoPage() {
  return (
    <>
      <AdminHeader />
      <h1 className="mb-6 text-2xl font-bold">Nuevo producto</h1>
      <ProductForm />
    </>
  );
}
