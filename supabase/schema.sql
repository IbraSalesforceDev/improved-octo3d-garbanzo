-- Ejecuta este script en el SQL Editor de Supabase.
-- Crea la tabla de productos, abre la lectura pública y carga datos de ejemplo.

-- 1) Tabla de productos -------------------------------------------------------
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  precio_base numeric(10, 2) not null,
  imagen_url text,
  imagenes text[] not null default '{}',
  opciones jsonb not null default '{}'::jsonb,
  categoria text,
  orden integer not null default 0,
  destacado boolean not null default false,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2) Row Level Security: lectura pública de productos activos -----------------
-- La app usa la clave anon, así que necesitamos una política que permita SELECT.
alter table productos enable row level security;

drop policy if exists "Lectura publica de productos" on productos;
create policy "Lectura publica de productos"
  on productos
  for select
  using (true);

-- NOTA: No creamos políticas de INSERT/UPDATE/DELETE a propósito. Con la clave
-- anon nadie podrá modificar el catálogo. La gestión la harás desde el panel de
-- Supabase o, más adelante, desde el panel de admin con la service_role key.

-- 3) Datos de ejemplo ---------------------------------------------------------
insert into productos (nombre, descripcion, precio_base, opciones)
values
  (
    'Dragón articulado',
    'Figura articulada flexible, ideal para escritorio.',
    12,
    '{"color": {"blanco": 0, "negro": 3, "dorado": 5}, "tamano": {"S": 0, "M": 5, "L": 10}}'::jsonb
  ),
  (
    'Maceta geométrica',
    'Maceta low-poly para suculentas.',
    8,
    '{"color": {"blanco": 0, "terracota": 2, "verde": 2}}'::jsonb
  ),
  (
    'Soporte para móvil',
    'Soporte plegable compatible con la mayoría de móviles.',
    6,
    '{"color": {"negro": 0, "azul": 1, "rojo": 1}, "acabado": {"mate": 0, "brillo": 2}}'::jsonb
  );
