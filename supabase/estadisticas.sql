-- Estadísticas: contador de "copias" por producto.
-- Ejecútalo en el SQL Editor de Supabase.

-- 1) Contador de veces copiado (en unidades).
alter table productos add column if not exists copias integer not null default 0;

-- 2) Función para incrementar el contador desde el cliente (clave pública).
-- SECURITY DEFINER permite sumar al contador sin dar permiso de escritura
-- general sobre la tabla. Solo puede sumar al campo copias.
create or replace function public.incrementar_copias(prod_id uuid, n integer)
returns void
language sql
security definer
set search_path = public
as $$
  update productos set copias = copias + greatest(n, 0) where id = prod_id;
$$;

grant execute on function public.incrementar_copias(uuid, integer) to anon, authenticated;
