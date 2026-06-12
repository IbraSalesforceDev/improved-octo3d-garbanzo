"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarVenta } from "../actions";

export default function BorrarVentaButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function borrar() {
    if (!confirm("¿Borrar esta venta?")) return;
    setBusy(true);
    try {
      await eliminarVenta(id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={borrar}
      disabled={busy}
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      Borrar
    </button>
  );
}
