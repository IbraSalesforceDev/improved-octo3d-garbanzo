"use client";

import { useCart } from "./CartContext";

export default function CartButton() {
  const { count, setOpen, mounted } = useCart();

  return (
    <button
      onClick={() => setOpen(true)}
      className="relative grid h-11 w-11 place-items-center rounded-full text-[var(--tinta)] transition hover:bg-neutral-100"
      aria-label="Abrir carrito"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
      {mounted && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-[var(--morado)] px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
