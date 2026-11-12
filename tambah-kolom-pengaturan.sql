-- Jalankan SEKALI di Supabase: SQL Editor > New query > paste > Run.
-- Hanya MENAMBAH kolom baru. Kolom dan data yang ada tidak diubah.

alter table public.store_settings
  add column if not exists hero_image    text,
  add column if not exists about_image_1 text,
  add column if not exists about_image_2 text,
  add column if not exists about_image_3 text,
  add column if not exists ingredients   text;
