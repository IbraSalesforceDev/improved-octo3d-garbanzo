import SiteHeader from "@/components/SiteHeader";
import CatalogoFiltrable from "@/components/CatalogoFiltrable";
import { getProductos } from "@/lib/productos";
import { site } from "@/lib/site";

// Releer en cada visita para que los cambios en Supabase salgan al momento.
export const dynamic = "force-dynamic";

function CubeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
      />
    </svg>
  );
}

export default async function Home() {
  const { productos, demo } = await getProductos();

  return (
    <>
      <SiteHeader />

      <main id="top">
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-300/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />

          <div className="relative mx-auto grid max-w-[1080px] items-center gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-24">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--lima)] px-3 py-1 text-xs font-bold text-[var(--tinta)]">
                ✦ {site.tagline}
              </span>
              <h1 className="mt-5 text-[40px] font-bold leading-[1.1] text-[var(--tinta)] sm:text-[64px]">
                {site.hero.titulo}
              </h1>
              <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-[var(--gris)] sm:text-lg">
                {site.hero.subtitulo}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#catalogo"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-[var(--morado)] px-7 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--morado-claro)]"
                >
                  Ver catálogo
                </a>
                <a
                  href="#como"
                  className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-[var(--morado)] px-6 py-3 font-semibold text-[var(--morado)] transition hover:bg-[var(--morado)] hover:text-white"
                >
                  Cómo funciona
                </a>
              </div>
            </div>

            {/* Mockup decorativo */}
            <div className="relative mx-auto aspect-square w-full max-w-sm">
              <div className="absolute inset-0 rotate-3 rounded-[2rem] bg-gradient-to-br from-[var(--morado)] to-violet-400" />
              <div className="absolute inset-0 flex -rotate-3 items-center justify-center rounded-[2rem] bg-white shadow-xl">
                <CubeIcon className="h-28 w-28 text-[var(--morado)]" />
              </div>
              <span className="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-[var(--lima)]" />
              <span className="absolute -bottom-2 left-6 h-6 w-6 rounded-full bg-[var(--morado)]" />
            </div>
          </div>
        </section>

        {/* ===== CATÁLOGO ===== */}
        <section id="catalogo" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
            <h2 className="text-[28px] font-bold text-[var(--tinta)] sm:text-[40px]">
              Catálogo
            </h2>
            <p className="mt-2 max-w-[60ch] text-[var(--gris)]">
              Elige una figura, personalízala y copia tu pedido.
            </p>

            {demo && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <span aria-hidden>⚠️</span>
                <p>
                  Mostrando productos de <strong>demostración</strong>. Añade los
                  tuyos desde el panel de administración.
                </p>
              </div>
            )}

            <CatalogoFiltrable productos={productos} />
          </div>
        </section>

        {/* ===== CÓMO FUNCIONA ===== */}
        <section id="como" className="scroll-mt-20 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
            <h2 className="text-center text-[28px] font-bold text-[var(--tinta)] sm:text-[40px]">
              Cómo funciona
            </h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {site.pasos.map((paso, i) => (
                <div key={paso.titulo} className="text-center md:text-left">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--morado)] text-xl font-bold text-white md:mx-0">
                    {i + 1}
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-[var(--tinta)] sm:text-[22px]">
                    {paso.titulo}
                  </h3>
                  <p className="mt-2 leading-relaxed text-[var(--gris)]">
                    {paso.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CIERRE ===== */}
        <section className="px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-[1080px]">
            <div className="rounded-3xl bg-[var(--morado)] px-6 py-14 text-center text-white sm:px-12 sm:py-16">
              <h2 className="text-[28px] font-bold sm:text-[40px]">
                ¿Listo para tu figura?
              </h2>
              <p className="mx-auto mt-4 max-w-[55ch] leading-relaxed text-white/80">
                Personaliza tu figura en el catálogo y copia tu pedido para
                enviarlo por donde prefieras.
              </p>
              <a
                href="#catalogo"
                className="mt-8 inline-flex min-h-[44px] items-center rounded-full bg-[var(--lima)] px-8 py-4 text-base font-bold text-[var(--tinta)] transition hover:-translate-y-0.5"
              >
                Ver catálogo
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200/70 py-8">
        <p className="text-center text-sm text-neutral-400">
          {site.name} · Hecho con cariño
        </p>
      </footer>
    </>
  );
}
