"use client";

import type { Venta } from "@/lib/types";

export default function ExportarCSVButton({ ventas }: { ventas: Venta[] }) {
  function exportar() {
    const cabecera = [
      "Fecha",
      "Producto",
      "Cantidad",
      "Precio unitario",
      "Total",
      "Nota",
    ];
    const filas = ventas.map((v) => [
      new Date(v.created_at).toLocaleDateString("es-ES"),
      v.nombre,
      String(v.cantidad),
      Number(v.precio_unitario).toFixed(2),
      Number(v.total).toFixed(2),
      v.nota ?? "",
    ]);

    // Antepone un apóstrofo a celdas que empiezan por caracteres de fórmula
    // para evitar inyección de fórmulas al abrir el CSV en Excel/Sheets.
    const escapar = (c: string) => {
      const seguro = /^[=+\-@\t\r]/.test(c) ? `'${c}` : c;
      return `"${seguro.replace(/"/g, '""')}"`;
    };
    const csv = [cabecera, ...filas]
      .map((f) => f.map(escapar).join(","))
      .join("\n");

    // BOM para que Excel lea bien los acentos.
    const blob = new Blob(["﻿" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ventas.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportar}
      disabled={ventas.length === 0}
      className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
    >
      Exportar CSV
    </button>
  );
}
