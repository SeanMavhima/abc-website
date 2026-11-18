-- =====================================================================
-- Migration 4: find where a media URL is used (admin only).
-- Lets the media library warn before an image that is still in use
-- is deleted.
-- =====================================================================

create or replace function public.media_usage(p_url text)
returns table (source text, label text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  needle text := '%' || replace(replace(p_url, '%', '\%'), '_', '\_') || '%';
begin
  if not public.is_admin() then
    raise exception 'permission denied';
  end if;

  return query
    select 'Homepage'::text, h.type
      from homepage_sections h where h.content::text ilike needle
    union all
    select 'Page'::text, p.title
      from pages p where p.sections::text ilike needle or coalesce(p.hero_image::text, '') ilike needle
    union all
    select 'Programme'::text, g.title
      from programmes g where coalesce(g.cover_image::text, '') ilike needle or g.description ilike needle
    union all
    select 'Story'::text, a.title
      from articles a
     where coalesce(a.featured_image::text, '') ilike needle or a.gallery::text ilike needle
        or a.content ilike needle or a.video_url ilike needle
    union all
    select 'Team member'::text, t.name
      from team_members t where coalesce(t.photo::text, '') ilike needle
    union all
    select 'Organisation'::text, o.name
      from partners o where coalesce(o.logo::text, '') ilike needle
    union all
    select 'Website settings'::text, 'Logo, favicon or sharing image'::text
      from site_settings s
     where coalesce(s.logo::text, '') ilike needle or coalesce(s.og_image::text, '') ilike needle
        or coalesce(s.favicon_url, '') ilike needle;
end;
$$;

revoke all on function public.media_usage(text) from public, anon;
grant execute on function public.media_usage(text) to authenticated;
