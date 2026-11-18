-- =====================================================================
-- Migration 2: Row Level Security
--
-- Visitors (anon) can only READ published, visible public content.
-- Only users whose profile has role = 'admin' can create, update or
-- delete content, manage media, or read private form submissions.
-- Anonymous writes happen exclusively through public.submit_form().
-- =====================================================================

-- Explicit grants (RLS below restricts what each role can actually do)
grant usage on schema public to anon, authenticated;

grant select on
  public.site_settings, public.homepage_sections, public.pages, public.programmes,
  public.article_categories, public.articles, public.team_members, public.partners,
  public.impact_statistics, public.media_assets, public.navigation_items
to anon, authenticated;

grant select, insert, update, delete on
  public.profiles, public.site_settings, public.homepage_sections, public.pages,
  public.programmes, public.article_categories, public.articles, public.team_members,
  public.partners, public.impact_statistics, public.media_assets, public.navigation_items,
  public.contact_submissions, public.volunteer_applications, public.newsletter_subscribers
to authenticated;

-- Never let API roles touch the rate-limit table directly
revoke all on public.form_rate_limits from anon, authenticated;

-- Enable RLS everywhere
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.pages enable row level security;
alter table public.programmes enable row level security;
alter table public.article_categories enable row level security;
alter table public.articles enable row level security;
alter table public.team_members enable row level security;
alter table public.partners enable row level security;
alter table public.impact_statistics enable row level security;
alter table public.media_assets enable row level security;
alter table public.navigation_items enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.volunteer_applications enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.form_rate_limits enable row level security;

-- ---------------------------------------------------------------------
-- Public read policies
-- ---------------------------------------------------------------------
drop policy if exists "Public read settings" on public.site_settings;
create policy "Public read settings" on public.site_settings
  for select using (true);

drop policy if exists "Public read visible homepage sections" on public.homepage_sections;
create policy "Public read visible homepage sections" on public.homepage_sections
  for select using (is_visible);

drop policy if exists "Public read published pages" on public.pages;
create policy "Public read published pages" on public.pages
  for select using (status = 'published');

drop policy if exists "Public read published programmes" on public.programmes;
create policy "Public read published programmes" on public.programmes
  for select using (is_published);

drop policy if exists "Public read categories" on public.article_categories;
create policy "Public read categories" on public.article_categories
  for select using (true);

drop policy if exists "Public read published articles" on public.articles;
create policy "Public read published articles" on public.articles
  for select using (status = 'published' and published_at is not null and published_at <= now());

drop policy if exists "Public read visible team" on public.team_members;
create policy "Public read visible team" on public.team_members
  for select using (is_visible);

drop policy if exists "Public read visible partners" on public.partners;
create policy "Public read visible partners" on public.partners
  for select using (is_visible);

drop policy if exists "Public read visible statistics" on public.impact_statistics;
create policy "Public read visible statistics" on public.impact_statistics
  for select using (is_visible);

drop policy if exists "Public read media metadata" on public.media_assets;
create policy "Public read media metadata" on public.media_assets
  for select using (true);

drop policy if exists "Public read visible navigation" on public.navigation_items;
create policy "Public read visible navigation" on public.navigation_items
  for select using (is_visible);

-- ---------------------------------------------------------------------
-- Administrator full access
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'site_settings', 'homepage_sections', 'pages', 'programmes',
    'article_categories', 'articles', 'team_members', 'partners',
    'impact_statistics', 'media_assets', 'navigation_items',
    'contact_submissions', 'volunteer_applications', 'newsletter_subscribers'
  ] loop
    execute format('drop policy if exists "Admins manage %1$s" on public.%1$I', t);
    execute format(
      'create policy "Admins manage %1$s" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- Profiles: users can read their own profile; admins can read and
-- update all profiles. Nobody can insert directly (trigger does it).
-- ---------------------------------------------------------------------
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists "Admins update profiles" on public.profiles;
create policy "Admins update profiles" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
