-- Tono real de cada color, para recolorear la foto cuando no hay foto por color.
-- Ejecútalo en el SQL Editor de Supabase.
alter table productos add column if not exists colores_hex jsonb not null default '{}'::jsonb;
