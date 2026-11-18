-- =====================================================================
-- Migration 3: Supabase Storage bucket for website media
--
-- Public bucket "media": anyone can view files by URL; only
-- administrators can upload, replace or delete. File type and size are
-- enforced by Supabase Storage itself (not only in the browser).
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800, -- 50 MB (Supabase free-tier maximum per file). Images are limited to 10 MB in the CMS.
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins read media objects" on storage.objects;
create policy "Admins read media objects" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and public.is_admin());

drop policy if exists "Admins upload media objects" on storage.objects;
create policy "Admins upload media objects" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "Admins update media objects" on storage.objects;
create policy "Admins update media objects" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "Admins delete media objects" on storage.objects;
create policy "Admins delete media objects" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
