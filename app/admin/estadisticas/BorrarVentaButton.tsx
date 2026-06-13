"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarVenta } from "../actions";
import { formatEUR } from "@/lib/precio";

export default function BorrarVentaButton({
  id,
  nombre,
  total,
}: {
  id: string;
  nombre: string;
  total: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function anular() {
    const ok = confirm(
      `¿Anular la venta de "${nombre}" (${formatEUR(total)})?\n\nEsta acción no se puede deshacer.`
    );
    if (!ok) return;
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
      onClick={anular}
      disabled={busy}
      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {busy ? "Anulando..." : "Anular"}
    </button>
  );
}
