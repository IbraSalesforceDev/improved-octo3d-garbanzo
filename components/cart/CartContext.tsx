"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { formatEUR } from "@/lib/precio";
import { site } from "@/lib/site";
import CartDrawer from "./CartDrawer";

export interface CartItem {
  key: string; // productoId + opciones, identifica una línea
  productoId: string;
  nombre: string;
  opciones: Record<string, string>;
  precioUnitario: number;
  cantidad: number;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  total: number;
  open: boolean;
  mounted: boolean;
  setOpen: (o: boolean) => void;
  addItem: (
    item: Omit<CartItem, "key" | "cantidad">,
    cantidad: number
  ) => void;
  updateQty: (key: string, cantidad: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  mensaje: () => string;
}

const CartContext = createContext<CartCtx | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}

function claveLinea(productoId: string, opciones: Record<string, string>) {
  const ordenadas = Object.keys(opciones)
    .sort()
    .map((k) => `${k}:${opciones[k]}`)
    .join("|");
  return `${productoId}#${ordenadas}`;
}

const STORAGE_KEY = "carrito";

// Valida cada línea del carrito leída de localStorage (puede estar corrupta
// o venir de una versión antigua de la app).
function esItemValido(x: unknown): x is CartItem {
  if (!x || typeof x !== "object") return false;
  const i = x as Record<string, unknown>;
  return (
    typeof i.key === "string" &&
    typeof i.productoId === "string" &&
    typeof i.nombre === "string" &&
    typeof i.opciones === "object" &&
    i.opciones !== null &&
    Number.isFinite(i.precioUnitario) &&
    Number.isInteger(i.cantidad) &&
    (i.cantidad as number) > 0
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cargar el carrito guardado al montar.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed.filter(esItemValido));
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  // Guardar en cada cambio (solo tras montar).
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, mounted]);

  const addItem: CartCtx["addItem"] = (item, cantidad) => {
    const key = claveLinea(item.productoId, item.opciones);
    setItems((prev) => {
      const existe = prev.find((i) => i.key === key);
      if (existe) {
        return prev.map((i) =>
          i.key === key ? { ...i, cantidad: i.cantidad + cantidad } : i
        );
      }
      return [...prev, { ...item, key, cantidad }];
    });
  };

  const updateQty: CartCtx["updateQty"] = (key, cantidad) =>
    setItems((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, cantidad } : i))
        .filter((i) => i.cantidad > 0)
    );

  const removeItem: CartCtx["removeItem"] = (key) =>
    setItems((prev) => prev.filter((i) => i.key !== key));

  const clear = () => setItems([]);

  const count = items.reduce((n, i) => n + i.cantidad, 0);
  const total = items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);

  const mensaje = () => {
    const lineas = items.map((i) => {
      const ops = Object.entries(i.opciones)
        .map(([g, v]) => `${g}: ${v}`)
        .join(", ");
      const detalle = ops ? ` (${ops})` : "";
      return `• ${i.nombre}${detalle} x${i.cantidad} — ${formatEUR(
        i.precioUnitario * i.cantidad
      )}`;
    });
    return (
      `¡Hola! Quiero pedir en ${site.name}:\n\n` +
      lineas.join("\n") +
      `\n\nTotal: ${formatEUR(total)}`
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        total,
        open,
        mounted,
        setOpen,
        addItem,
        updateQty,
        removeItem,
        clear,
        mensaje,
      }}
    >
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}
