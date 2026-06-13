-- Endurecimiento de seguridad (ejecútalo en el SQL Editor sobre tu BD actual).
-- 1) El público solo ve productos ACTIVOS; el admin (autenticado) ve todos.
-- 2) Limita el incremento del contador de copias (evita inflado/overflow).

-- 1) Lectura de productos --------------------------------------------------
drop policy if exists "Lectura publica de productos" on productos;

drop policy if exists "Lectura publica productos activos" on productos;
create policy "Lectura publica productos activos"
  on productos for select to anon using (activo = true);

drop policy if exists "Lectura admin productos" on productos;
create policy "Lectura admin productos"
  on productos for select to authenticated using (true);

-- 2) Límite del contador de copias -----------------------------------------
create or replace function public.incrementar_copias(prod_id uuid, n integer)
returns void
language sql
security definer
set search_path = public
as $$
  update productos set copias = copias + least(greatest(n, 0), 100) where id = prod_id;
$$;
