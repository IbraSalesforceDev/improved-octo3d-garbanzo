"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reordenar, toggleDestacado } from "./actions";
import { formatEUR } from "@/lib/precio";
import type { Producto } from "@/lib/types";

function Fila({
  producto,
  onToggle,
}: {
  producto: Producto;
  onToggle: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: producto.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const portada = producto.imagenes?.[0] ?? producto.imagen_url;

  const [verStats, setVerStats] = useState(false);
  const copias = producto.copias ?? 0;
  const ingreso = copias * Number(producto.precio_base);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={
        "bg-white px-3 py-3 sm:px-4 " +
        (isDragging ? "relative z-10 shadow-lg" : "")
      }
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none px-1 text-lg leading-none text-neutral-300 hover:text-[var(--morado)] active:cursor-grabbing"
          aria-label="Arrastrar para ordenar"
        >
          ⠿
        </button>

        <Link
          href={`/admin/${producto.id}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 hover:bg-neutral-50"
        >
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-100">
            {portada && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portada}
                alt={producto.nombre}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{producto.nombre}</p>
            <p className="text-sm text-neutral-500">
              {formatEUR(Number(producto.precio_base))} base
              {producto.categoria ? ` · ${producto.categoria}` : ""}
            </p>
          </div>
        </Link>

        {!producto.activo && (
          <span className="hidden rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600 sm:inline">
            Oculto
          </span>
        )}

        <button
          type="button"
          onClick={onToggle}
          title={producto.destacado ? "Quitar destacado" : "Destacar"}
          className={
            "px-2 text-xl leading-none transition " +
            (producto.destacado
              ? "text-amber-500"
              : "text-neutral-300 hover:text-amber-500")
          }
          aria-label="Destacar"
        >
          {producto.destacado ? "★" : "☆"}
        </button>

        <button
          type="button"
          onClick={() => setVerStats((v) => !v)}
          title="Estadísticas"
          aria-label="Estadísticas"
          className={
            "px-1.5 transition " +
            (verStats
              ? "text-[var(--morado)]"
              : "text-neutral-300 hover:text-[var(--morado)]")
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3v18h18M8 17V9m4 8V5m4 12v-6"
            />
          </svg>
        </button>
      </div>

      {verStats && (
        <div className="ml-8 mt-2 flex flex-wrap gap-x-6 gap-y-1 rounded-lg bg-neutral-50 px-3 py-2 text-sm">
          <span className="text-neutral-600">
            Copiado <b className="text-[var(--tinta)]">{copias}×</b>
          </span>
          <span className="text-neutral-600">
            Ingreso estimado{" "}
            <b className="text-[var(--tinta)]">{formatEUR(ingreso)}</b>{" "}
            <span className="text-neutral-400">
              ({copias} × {formatEUR(Number(producto.precio_base))})
            </span>
          </span>
        </div>
      )}
    </li>
  );
}

export default function ProductosAdminList({
  productos,
}: {
  productos: Producto[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(productos);

  useEffect(() => {
    setItems(productos);
  }, [productos]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    })
  );

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const nuevo = arrayMove(items, oldIndex, newIndex);
    setItems(nuevo);
    await reordenar(nuevo.map((i) => i.id));
    router.refresh();
  }

  async function toggle(p: Producto) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === p.id ? { ...i, destacado: !i.destacado } : i
      )
    );
    await toggleDestacado(p.id, !p.destacado);
    router.refresh();
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {items.map((p) => (
            <Fila key={p.id} producto={p} onToggle={() => toggle(p)} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
