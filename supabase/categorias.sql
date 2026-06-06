-- Añade la columna de categoría a una tabla productos ya existente.
-- Ejecútalo en el SQL Editor de Supabase.
alter table productos add column if not exists categoria text;
