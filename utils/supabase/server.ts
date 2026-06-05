import { createServerClient } from "@supabase/ssr";
import { type cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Soporta la clave nueva (publishable) y la antigua (anon) por compatibilidad.
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (
  cookieStore: Awaited<ReturnType<typeof cookies>>
) => {
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Llamado desde un Server Component: se puede ignorar si hay
          // middleware refrescando las sesiones de usuario.
        }
      },
    },
  });
};
