"use client";

import { useEffect, useState } from "react";
import Brand from "@/components/Brand";
import { whatsappUrl } from "@/lib/site";

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const wa = whatsappUrl("¡Hola! Me gustaría pedirte un presupuesto.");

  return (
    <header
      className={
        "sticky top-0 z-50 bg-[var(--fondo)] transition-shadow " +
        (scrolled ? "shadow-sm" : "")
      }
    >
      <div className="mx-auto flex h-16 max-w-[1080px] items-center justify-between px-5 sm:h-[72px] sm:px-8">
        <a href="#top" aria-label={"Inicio"} className="flex items-center">
          <Brand iconSize="h-9 w-9" />
        </a>
        <a
          href={wa ?? "#contacto"}
          target={wa ? "_blank" : undefined}
          rel={wa ? "noopener noreferrer" : undefined}
          className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--morado)] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--morado-claro)] sm:px-6"
        >
          <span className="sm:hidden">Presupuesto</span>
          <span className="hidden sm:inline">Pídeme presupuesto</span>
        </a>
      </div>
    </header>
  );
}
