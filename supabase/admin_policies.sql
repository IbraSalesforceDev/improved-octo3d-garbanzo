-- Permisos para el PANEL DE ADMIN.
-- Ejecuta este script en el SQL Editor DESPUÉS de schema.sql.
-- Da a los usuarios autenticados (los que entran con email + contraseña)
-- permiso para crear/editar/borrar productos y subir imágenes.

-- 0) Bucket de imágenes -------------------------------------------------------
-- Crea el bucket "productos" como público (idempotente).
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do update set public = true;

-- 1) Escritura de productos para usuarios autenticados -----------------------
drop policy if exists "Admin inserta productos" on productos;
create policy "Admin inserta productos"
  on productos for insert
  to authenticated
  with check (true);

drop policy if exists "Admin actualiza productos" on productos;
create policy "Admin actualiza productos"
  on productos for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin borra productos" on productos;
create policy "Admin borra productos"
  on productos for delete
  to authenticated
  using (true);

-- 2) Storage: imágenes del bucket "productos" --------------------------------
-- Lectura pública (por si el bucket no estuviera marcado como público).
drop policy if exists "Imagenes lectura publica" on storage.objects;
create policy "Imagenes lectura publica"
  on storage.objects for select
  using (bucket_id = 'productos');

-- Subida y actualización solo para usuarios autenticados.
drop policy if exists "Imagenes subida admin" on storage.objects;
create policy "Imagenes subida admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'productos');

drop policy if exists "Imagenes actualiza admin" on storage.objects;
create policy "Imagenes actualiza admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'productos');

drop policy if exists "Imagenes borra admin" on storage.objects;
create policy "Imagenes borra admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'productos');
