import { site } from "@/lib/site";

// Muestra el nombre con el sufijo "3D" en verde (lima legible).
function NombreMarca() {
  const m = site.name.match(/^(.*?)\s*(3D)\s*$/i);
  if (!m) return <>{site.name}</>;
  return (
    <>
      {m[1]} <span className="text-lime-600">{m[2]}</span>
    </>
  );
}

// Logo de la tienda: un icono de cubo en color de marca + el nombre.
// Si tienes un logo en imagen, puedes sustituir el <span> del icono por
// <img src="/logo.png" ... />.
export default function Brand({
  className = "",
  iconSize = "h-8 w-8",
}: {
  className?: string;
  iconSize?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`grid ${iconSize} place-items-center rounded-lg bg-[var(--brand)] text-white`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          className="h-[60%] w-[60%]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
          />
        </svg>
      </span>
      <span className="font-bold tracking-tight">
        <NombreMarca />
      </span>
    </span>
  );
}
