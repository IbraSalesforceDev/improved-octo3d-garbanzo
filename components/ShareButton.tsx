"use client";

import { useState } from "react";

export default function ShareButton({ title }: { title: string }) {
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // El usuario canceló: no hacemos nada.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Portapapeles bloqueado: lo ignoramos.
    }
  }

  return (
    <button
      type="button"
      onClick={compartir}
      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-[var(--morado)] px-5 py-2.5 text-sm font-semibold text-[var(--morado)] transition hover:bg-[var(--morado)] hover:text-white"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
        />
      </svg>
      {copiado ? "¡Enlace copiado!" : "Compartir"}
    </button>
  );
}
