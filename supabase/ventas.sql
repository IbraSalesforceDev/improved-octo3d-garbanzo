-- Ventas REALES registradas a mano por el admin (pedidos confirmados).
-- Ejecútalo en el SQL Editor de Supabase.

create table if not exists ventas (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references productos(id) on delete set null,
  nombre text not null,                 -- nombre del producto en el momento de la venta
  cantidad integer not null default 1,
  precio_unitario numeric(10, 2) not null,
  total numeric(10, 2) not null,
  nota text,
  created_at timestamptz not null default now()
);

-- Las ventas son datos privados de negocio: solo el admin (autenticado) accede.
alter table ventas enable row level security;

drop policy if exists "Admin lee ventas" on ventas;
create policy "Admin lee ventas" on ventas
  for select to authenticated using (true);

drop policy if exists "Admin inserta ventas" on ventas;
create policy "Admin inserta ventas" on ventas
  for insert to authenticated with check (true);

drop policy if exists "Admin borra ventas" on ventas;
create policy "Admin borra ventas" on ventas
  for delete to authenticated using (true);
