# Catálogo de Figuras 3D

Catálogo web para mostrar figuras de impresión 3D con **opciones que cambian el
precio** (color, tamaño, acabado...). Hecho con **Next.js + Supabase + Vercel**.

> Estado actual: **estructura mínima** — catálogo público con precio dinámico y
> conexión a Supabase. El **panel de admin** para gestionar productos e imágenes
> desde la web se añadirá en el siguiente paso.

## Cómo funciona el precio

```
precio_final = precio_base + suma de incrementos de las opciones elegidas
```

Las opciones se guardan en la columna `opciones` (jsonb). Ejemplo:

```json
{
  "color": { "blanco": 0, "negro": 3 },
  "tamano": { "S": 0, "M": 5, "L": 10 }
}
```

Si la app aún no tiene Supabase configurado (o la tabla está vacía), muestra unos
**productos de demostración** para que veas el catálogo funcionando.

## Arrancar en local

```bash
npm install
cp .env.local.example .env.local   # y rellena tus claves de Supabase
npm run dev
```

Abre http://localhost:3000

## Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com).
2. En **SQL Editor**, ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql).
   Eso crea la tabla `productos`, abre la lectura pública (RLS) y carga ejemplos.
3. En **Storage**, crea un bucket público llamado `productos` para las imágenes.
4. En **Project Settings → API** (o el botón **Connect**), copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `publishable key` (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. Pégalas en `.env.local` (local) y en las variables de entorno de Vercel.

### Añadir productos

Desde el panel de Supabase (**Table Editor → productos**) puedes añadir filas.
Para `imagen_url`, sube la imagen al bucket `productos` y pega su URL pública.

## Desplegar en Vercel

1. Sube el repo a GitHub.
2. En [Vercel](https://vercel.com), importa el repositorio.
3. Añade las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Deploy. Cada `git push` vuelve a desplegar automáticamente.

## Estructura

```
app/                 Páginas (App Router)
  page.tsx           Catálogo
  layout.tsx
components/
  ProductCard.tsx    Tarjeta con selector de opciones y precio dinámico
utils/supabase/
  server.ts          Cliente de Supabase para Server Components
  client.ts          Cliente para componentes de navegador
  middleware.ts      Helper de sesión (para el futuro panel de admin)
lib/
  productos.ts       Lectura de productos (con fallback a demo)
  precio.ts          Cálculo del precio final
  sampleData.ts      Productos de demostración
  types.ts           Tipos compartidos
supabase/
  schema.sql         Tabla, RLS y datos de ejemplo
```
