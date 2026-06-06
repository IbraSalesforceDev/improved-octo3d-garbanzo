import ProductCard from "@/components/ProductCard";
import SiteHeader from "@/components/SiteHeader";
import { getProductos } from "@/lib/productos";
import { site, whatsappUrl } from "@/lib/site";

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
  const wa = whatsappUrl(
    "¡Hola! Me gustaría pedirte un presupuesto para una figura 3D."
  );

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
                  href="#contacto"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-[var(--morado)] px-7 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--morado-claro)]"
                >
                  Pídeme presupuesto
                </a>
                <a
                  href="#catalogo"
                  className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-[var(--morado)] px-6 py-3 font-semibold text-[var(--morado)] transition hover:bg-[var(--morado)] hover:text-white"
                >
                  Ver catálogo
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
        <section
          id="catalogo"
          className="scroll-mt-20 py-16 sm:py-24"
        >
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

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {productos.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
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

        {/* ===== SOBRE MÍ ===== */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-[640px] px-5 text-center sm:px-8">
            <h2 className="text-[28px] font-bold text-[var(--tinta)] sm:text-[40px]">
              Sobre mí
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[var(--gris)] sm:text-lg">
              {site.sobreMi}
            </p>
          </div>
        </section>

        {/* ===== CONTACTO ===== */}
        <section id="contacto" className="scroll-mt-20 px-5 pb-16 sm:px-8 sm:pb-24">
          <div className="mx-auto max-w-[1080px]">
            <div className="rounded-3xl bg-[var(--morado)] px-6 py-14 text-center text-white sm:px-12 sm:py-16">
              <h2 className="text-[28px] font-bold sm:text-[40px]">
                ¿Hacemos tu figura?
              </h2>
              <p className="mx-auto mt-4 max-w-[55ch] leading-relaxed text-white/80">
                Cuéntame qué necesitas y te paso presupuesto sin compromiso.
              </p>

              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--lima)] px-8 py-4 text-base font-bold text-[var(--tinta)] transition hover:-translate-y-0.5"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.555-5.338 11.89-11.893 11.89a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.477-.755zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                  </svg>
                  Escríbeme por WhatsApp
                </a>
              ) : (
                <p className="mx-auto mt-8 max-w-md text-sm text-white/70">
                  Añade tu número de WhatsApp en <code>lib/site.ts</code> para
                  activar el botón de contacto directo.
                </p>
              )}
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
