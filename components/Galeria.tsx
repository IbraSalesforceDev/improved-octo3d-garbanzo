"use client";

import { useState } from "react";
import Image from "next/image";

export default function Galeria({
  imagenes,
  nombre,
}: {
  imagenes: string[];
  nombre: string;
}) {
  const [activa, setActiva] = useState(0);

  if (imagenes.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-neutral-100 to-neutral-200">
        <div className="flex aspect-square w-full items-center justify-center text-neutral-300">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-16 w-16"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
            />
          </svg>
        </div>
      </div>
    );
  }

  const principal = imagenes[Math.min(activa, imagenes.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100">
        <div className="relative aspect-square w-full">
          <Image
            src={principal}
            alt={nombre}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>

      {imagenes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {imagenes.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiva(i)}
              className={
                "h-16 w-16 overflow-hidden rounded-lg border-2 transition " +
                (i === activa
                  ? "border-[var(--morado)]"
                  : "border-transparent opacity-70 hover:opacity-100")
              }
            >
              <Image
                src={url}
                alt={`${nombre} ${i + 1}`}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
