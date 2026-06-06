-- Galería de imágenes, orden y destacados.
-- Ejecútalo en el SQL Editor de Supabase (después de schema.sql).
alter table productos add column if not exists imagenes text[] not null default '{}';
alter table productos add column if not exists orden integer not null default 0;
alter table productos add column if not exists destacado boolean not null default false;
