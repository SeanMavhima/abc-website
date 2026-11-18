-- =====================================================================
-- ABC — Alliance for Biodiversity and Conservation
-- Migration 1: core schema
-- =====================================================================

-- gen_random_uuid() is built into PostgreSQL 13+, so no extension is required.

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Profiles (one row per auth user; role 'admin' grants CMS access)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  role text check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- New auth users get a profile WITHOUT a role. Access must be granted
-- explicitly (see README: "Provision the first administrator").
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------
-- Site settings (single row, id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  org_name text not null default '',
  short_name text not null default '',
  tagline text not null default '',
  description text not null default '',
  logo jsonb,
  favicon_url text,
  brand_colors jsonb not null default '{}'::jsonb,
  seo_title text not null default '',
  seo_description text not null default '',
  og_image jsonb,
  contact_email text not null default '',
  contact_phone text not null default '',
  address text not null default '',
  location_note text not null default '',
  social_links jsonb not null default '[]'::jsonb,
  footer_description text not null default '',
  copyright_text text not null default '',
  newsletter_enabled boolean not null default true,
  newsletter_heading text not null default '',
  newsletter_text text not null default '',
  header_cta_label text not null default '',
  header_cta_href text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Homepage sections (ordered blocks)
-- ---------------------------------------------------------------------
create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  content jsonb not null default '{}'::jsonb,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists homepage_sections_order_idx on public.homepage_sections (sort_order);

-- ---------------------------------------------------------------------
-- Pages (each page holds an ordered array of blocks in `sections`)
-- ---------------------------------------------------------------------
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  description text not null default '',
  hero_eyebrow text not null default '',
  hero_image jsonb,
  sections jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  is_system boolean not null default false,
  seo_title text not null default '',
  seo_description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pages_status_idx on public.pages (status);

-- ---------------------------------------------------------------------
-- Programmes
-- ---------------------------------------------------------------------
create table if not exists public.programmes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text not null default '',
  description text not null default '',
  icon text not null default 'leaf',
  cover_image jsonb,
  status text not null default 'proposed' check (status in ('proposed', 'pilot', 'active', 'completed')),
  category text not null default '',
  sort_order integer not null default 0,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  seo_title text not null default '',
  seo_description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists programmes_order_idx on public.programmes (is_published, sort_order);

-- ---------------------------------------------------------------------
-- Stories & insights
-- ---------------------------------------------------------------------
create table if not exists public.article_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  featured_image jsonb,
  gallery jsonb not null default '[]'::jsonb,
  video_url text not null default '',
  category_id uuid references public.article_categories (id) on delete set null,
  author_name text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  is_featured boolean not null default false,
  seo_title text not null default '',
  seo_description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists articles_published_idx on public.articles (status, published_at desc);
create index if not exists articles_category_idx on public.articles (category_id);

-- ---------------------------------------------------------------------
-- Team, partners, statistics
-- ---------------------------------------------------------------------
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  bio text not null default '',
  photo jsonb,
  social_links jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  logo jsonb,
  website_url text not null default '',
  relationship text not null default 'prospective' check (relationship in ('prospective', 'confirmed', 'supporting')),
  is_visible boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.impact_statistics (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value numeric not null default 0,
  prefix text not null default '',
  suffix text not null default '',
  description text not null default '',
  icon text not null default 'target',
  status text not null default 'target' check (status in ('target', 'achieved', 'ongoing')),
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Media library
-- ---------------------------------------------------------------------
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  storage_path text unique,
  file_name text not null default '',
  mime_type text not null default '',
  size_bytes bigint not null default 0,
  width integer,
  height integer,
  alt_text text not null default '',
  caption text not null default '',
  credit text not null default '',
  source_url text not null default '',
  folder text not null default 'General',
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists media_assets_folder_idx on public.media_assets (folder, created_at desc);

-- ---------------------------------------------------------------------
-- Navigation (header + footer; children reference parent_id)
-- ---------------------------------------------------------------------
create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  location text not null check (location in ('header', 'footer')),
  label text not null,
  href text not null default '',
  parent_id uuid references public.navigation_items (id) on delete cascade,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  open_in_new_tab boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists navigation_items_idx on public.navigation_items (location, parent_id, sort_order);

-- ---------------------------------------------------------------------
-- Private form submissions
-- ---------------------------------------------------------------------
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) <= 320 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  organisation text not null default '' check (char_length(organisation) <= 200),
  subject text not null default '' check (char_length(subject) <= 200),
  message text not null check (char_length(message) between 1 and 5000),
  status text not null default 'new' check (status in ('new', 'reviewed', 'resolved')),
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contact_submissions_idx on public.contact_submissions (status, created_at desc);

create table if not exists public.volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) <= 320 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text not null default '' check (char_length(phone) <= 50),
  location text not null default '' check (char_length(location) <= 200),
  interest text not null default '' check (char_length(interest) <= 100),
  organisation text not null default '' check (char_length(organisation) <= 200),
  availability text not null default '' check (char_length(availability) <= 500),
  experience text not null default '' check (char_length(experience) <= 3000),
  message text not null default '' check (char_length(message) <= 5000),
  status text not null default 'new' check (status in ('new', 'reviewed', 'resolved')),
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists volunteer_applications_idx on public.volunteer_applications (status, created_at desc);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) <= 320 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Short-lived anonymised records used for form rate limiting
create table if not exists public.form_rate_limits (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  kind text not null,
  created_at timestamptz not null default now()
);
create index if not exists form_rate_limits_idx on public.form_rate_limits (ip_hash, created_at desc);
create index if not exists form_rate_limits_time_idx on public.form_rate_limits (created_at);

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'site_settings', 'homepage_sections', 'pages', 'programmes',
    'article_categories', 'articles', 'team_members', 'partners',
    'impact_statistics', 'media_assets', 'navigation_items',
    'contact_submissions', 'volunteer_applications', 'newsletter_subscribers'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- Form submission entry point (rate limited, the ONLY way anonymous
-- visitors can write data). Returns 'ok' or 'rate_limited'.
-- ---------------------------------------------------------------------
create or replace function public.submit_form(p_kind text, p_data jsonb, p_ip_hash text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recent integer;
  v_total integer;
  v_hash text := left(coalesce(nullif(p_ip_hash, ''), 'unknown'), 128);
begin
  if p_kind not in ('contact', 'volunteer', 'newsletter') then
    raise exception 'invalid form type';
  end if;

  delete from form_rate_limits where created_at < now() - interval '1 day';

  select count(*) into v_recent
    from form_rate_limits
   where ip_hash = v_hash and created_at > now() - interval '15 minutes';
  if v_recent >= 5 then
    return 'rate_limited';
  end if;

  select count(*) into v_total
    from form_rate_limits
   where created_at > now() - interval '1 minute';
  if v_total >= 30 then
    return 'rate_limited';
  end if;

  insert into form_rate_limits (ip_hash, kind) values (v_hash, p_kind);

  if p_kind = 'contact' then
    insert into contact_submissions (name, email, organisation, subject, message, ip_hash)
    values (
      trim(p_data->>'name'),
      lower(trim(p_data->>'email')),
      coalesce(trim(p_data->>'organisation'), ''),
      coalesce(trim(p_data->>'subject'), ''),
      trim(p_data->>'message'),
      v_hash
    );
  elsif p_kind = 'volunteer' then
    insert into volunteer_applications (name, email, phone, location, interest, organisation, availability, experience, message, ip_hash)
    values (
      trim(p_data->>'name'),
      lower(trim(p_data->>'email')),
      coalesce(trim(p_data->>'phone'), ''),
      coalesce(trim(p_data->>'location'), ''),
      coalesce(trim(p_data->>'interest'), ''),
      coalesce(trim(p_data->>'organisation'), ''),
      coalesce(trim(p_data->>'availability'), ''),
      coalesce(trim(p_data->>'experience'), ''),
      coalesce(trim(p_data->>'message'), ''),
      v_hash
    );
  else
    insert into newsletter_subscribers (email, ip_hash)
    values (lower(trim(p_data->>'email')), v_hash)
    on conflict (email) do update set status = 'subscribed';
  end if;

  return 'ok';
end;
$$;

revoke all on function public.submit_form(text, jsonb, text) from public;
grant execute on function public.submit_form(text, jsonb, text) to anon, authenticated;
