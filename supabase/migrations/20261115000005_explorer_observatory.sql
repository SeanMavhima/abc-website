-- =====================================================================
-- Migration 5: Biodiversity Explorer, Nature Labs, projects, impact
-- observatory, moderated observations and audit history.
--
-- Safe to re-run. Run after migrations 1 to 4.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Ecosystems (the "Living Atlas" transect)
-- ---------------------------------------------------------------------
create table if not exists public.ecosystems (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  -- Position on the west-to-east atlas illustration
  zone text not null default 'hills' check (zone in ('lake', 'montane_forest', 'hills', 'wetland', 'savanna')),
  elevation text not null default '',
  summary text not null default '',
  description text not null default '',
  processes text not null default '',
  example_places text not null default '',
  photo jsonb,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ecosystems_order_idx on public.ecosystems (is_published, sort_order);

-- ---------------------------------------------------------------------
-- Biodiversity categories and species entries
-- ---------------------------------------------------------------------
create table if not exists public.biodiversity_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  icon text not null default 'leaf',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.species (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  common_name text not null,
  scientific_name text not null default '',
  local_name text not null default '',
  category_id uuid references public.biodiversity_categories (id) on delete set null,
  ecosystem_id uuid references public.ecosystems (id) on delete set null,
  -- 'reference' = educational information; 'abc_observation' = recorded by ABC participants
  entry_type text not null default 'reference' check (entry_type in ('reference', 'abc_observation')),
  photo jsonb,
  summary text not null default '',
  description text not null default '',
  habitat text not null default '',
  ecological_role text not null default '',
  conservation_status text not null default '',
  conservation_notes text not null default '',
  sources jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists species_status_idx on public.species (status, sort_order);
create index if not exists species_category_idx on public.species (category_id);
create index if not exists species_ecosystem_idx on public.species (ecosystem_id);

-- ---------------------------------------------------------------------
-- Nature Labs
-- ---------------------------------------------------------------------
create table if not exists public.nature_labs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  summary text not null default '',
  description text not null default '',
  status text not null default 'proposed' check (status in ('proposed', 'establishing', 'active', 'paused')),
  host text not null default '',
  -- Deliberately general (district or province), never a precise location
  region text not null default '',
  focus text not null default '',
  cover_image jsonb,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists nature_labs_order_idx on public.nature_labs (is_published, sort_order);

-- ---------------------------------------------------------------------
-- Citizen science projects and research projects (same shape)
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['citizen_science_projects', 'research_projects'] loop
    execute format($f$
      create table if not exists public.%1$I (
        id uuid primary key default gen_random_uuid(),
        slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
        title text not null,
        summary text not null default '',
        description text not null default '',
        research_question text not null default '',
        methods text not null default '',
        participation text not null default '',
        findings text not null default '',
        status text not null default 'proposed' check (status in ('proposed', 'planned', 'active', 'completed')),
        lab_id uuid references public.nature_labs (id) on delete set null,
        cover_image jsonb,
        starts_on date,
        ends_on date,
        sort_order integer not null default 0,
        is_published boolean not null default false,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        check (ends_on is null or starts_on is null or ends_on >= starts_on)
      )$f$, t);
    execute format('create index if not exists %1$s_order_idx on public.%1$I (is_published, sort_order)', t);
    execute format('create index if not exists %1$s_lab_idx on public.%1$I (lab_id)', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- Milestones (impact observatory timeline)
-- ---------------------------------------------------------------------
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  period text not null default '',
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'done')),
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Impact statistics: verified status, progress target, date and source
-- ---------------------------------------------------------------------
alter table public.impact_statistics add column if not exists target_value numeric;
alter table public.impact_statistics add column if not exists as_of date;
alter table public.impact_statistics add column if not exists source_note text not null default '';
alter table public.impact_statistics drop constraint if exists impact_statistics_status_check;
alter table public.impact_statistics
  add constraint impact_statistics_status_check check (status in ('target', 'ongoing', 'achieved', 'verified'));

-- ---------------------------------------------------------------------
-- Observations: community submissions, moderated before publication
-- ---------------------------------------------------------------------
alter table public.site_settings add column if not exists observations_open boolean not null default false;

create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'other' check (category in ('bird', 'plant', 'insect', 'mammal', 'amphibian_reptile', 'fungus', 'habitat', 'other')),
  what text not null check (char_length(what) between 1 and 200),
  notes text not null default '' check (char_length(notes) <= 3000),
  -- General area only (for example a district). Precise locations are never collected.
  general_area text not null default '' check (char_length(general_area) <= 120),
  observed_on date,
  observer_name text not null default '' check (char_length(observer_name) <= 120),
  observer_email text not null default '' check (char_length(observer_email) <= 320),
  credit_name boolean not null default false,
  consent boolean not null default false,
  is_minor boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderator_note text not null default '',
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists observations_status_idx on public.observations (status, created_at desc);

-- Public, privacy-safe view: approved + consented rows only, no contact
-- details, and the observer's name only when they asked to be credited
-- and are not a minor.
create or replace view public.public_observations as
  select
    id, category, what, notes, general_area, observed_on,
    case when credit_name and not is_minor then observer_name else '' end as observer,
    created_at
  from public.observations
  where status = 'approved' and consent;

-- ---------------------------------------------------------------------
-- Form entry point: adds the 'observation' kind
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
  v_open boolean;
begin
  if p_kind not in ('contact', 'volunteer', 'newsletter', 'observation') then
    raise exception 'invalid form type';
  end if;

  if p_kind = 'observation' then
    select observations_open into v_open from site_settings where id = 1;
    if not coalesce(v_open, false) then
      return 'closed';
    end if;
    if coalesce((p_data->>'consent')::boolean, false) is not true then
      raise exception 'consent is required';
    end if;
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
  elsif p_kind = 'observation' then
    insert into observations (category, what, notes, general_area, observed_on, observer_name, observer_email, credit_name, consent, is_minor, ip_hash)
    values (
      coalesce(nullif(trim(p_data->>'category'), ''), 'other'),
      trim(p_data->>'what'),
      coalesce(trim(p_data->>'notes'), ''),
      coalesce(trim(p_data->>'general_area'), ''),
      nullif(p_data->>'observed_on', '')::date,
      coalesce(trim(p_data->>'observer_name'), ''),
      lower(coalesce(trim(p_data->>'observer_email'), '')),
      coalesce((p_data->>'credit_name')::boolean, false),
      true,
      coalesce((p_data->>'is_minor')::boolean, false),
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

-- ---------------------------------------------------------------------
-- Audit history (written by triggers, so nothing can bypass it)
-- ---------------------------------------------------------------------
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  row_id text not null default '',
  action text not null check (action in ('insert', 'update', 'delete')),
  label text not null default '',
  actor_id uuid,
  actor_email text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists audit_log_time_idx on public.audit_log (created_at desc);

create or replace function public.audit_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row jsonb;
  v_email text;
begin
  if tg_op = 'DELETE' then
    v_row := to_jsonb(old);
  else
    v_row := to_jsonb(new);
    -- Ignore saves that changed nothing except the timestamp or position.
    if tg_op = 'UPDATE'
       and (v_row - 'updated_at' - 'sort_order') = (to_jsonb(old) - 'updated_at' - 'sort_order') then
      return new;
    end if;
  end if;

  select email into v_email from profiles where id = auth.uid();

  insert into audit_log (table_name, row_id, action, label, actor_id, actor_email)
  values (
    tg_table_name,
    coalesce(v_row->>'id', ''),
    lower(tg_op),
    left(coalesce(
      v_row->>'title', v_row->>'name', v_row->>'common_name', v_row->>'label',
      v_row->>'org_name', v_row->>'what', v_row->>'file_name', v_row->>'type', ''
    ), 200),
    auth.uid(),
    coalesce(v_email, case when auth.uid() is null then 'system' else '' end)
  );

  -- Keep the log small on the free tier.
  if random() < 0.02 then
    delete from audit_log where created_at < now() - interval '365 days';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'ecosystems', 'biodiversity_categories', 'species', 'nature_labs',
    'citizen_science_projects', 'research_projects', 'milestones', 'observations'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;

  foreach t in array array[
    'site_settings', 'homepage_sections', 'pages', 'programmes', 'article_categories',
    'articles', 'team_members', 'partners', 'impact_statistics', 'media_assets',
    'navigation_items', 'ecosystems', 'biodiversity_categories', 'species', 'nature_labs',
    'citizen_science_projects', 'research_projects', 'milestones', 'observations'
  ] loop
    execute format('drop trigger if exists audit_row on public.%I', t);
    execute format('create trigger audit_row after insert or update or delete on public.%I for each row execute function public.audit_row()', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- Grants and Row Level Security
-- ---------------------------------------------------------------------
grant select on
  public.ecosystems, public.biodiversity_categories, public.species, public.nature_labs,
  public.citizen_science_projects, public.research_projects, public.milestones,
  public.public_observations
to anon, authenticated;

grant select, insert, update, delete on
  public.ecosystems, public.biodiversity_categories, public.species, public.nature_labs,
  public.citizen_science_projects, public.research_projects, public.milestones, public.observations
to authenticated;

-- Observations hold contact details: no direct access for visitors.
revoke all on public.observations from anon;

-- The audit log is read-only for administrators and written only by triggers.
revoke all on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;

alter table public.ecosystems enable row level security;
alter table public.biodiversity_categories enable row level security;
alter table public.species enable row level security;
alter table public.nature_labs enable row level security;
alter table public.citizen_science_projects enable row level security;
alter table public.research_projects enable row level security;
alter table public.milestones enable row level security;
alter table public.observations enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists "Public read published ecosystems" on public.ecosystems;
create policy "Public read published ecosystems" on public.ecosystems
  for select using (is_published);

drop policy if exists "Public read biodiversity categories" on public.biodiversity_categories;
create policy "Public read biodiversity categories" on public.biodiversity_categories
  for select using (true);

drop policy if exists "Public read published species" on public.species;
create policy "Public read published species" on public.species
  for select using (status = 'published');

drop policy if exists "Public read published labs" on public.nature_labs;
create policy "Public read published labs" on public.nature_labs
  for select using (is_published);

drop policy if exists "Public read published citizen science" on public.citizen_science_projects;
create policy "Public read published citizen science" on public.citizen_science_projects
  for select using (is_published);

drop policy if exists "Public read published research" on public.research_projects;
create policy "Public read published research" on public.research_projects
  for select using (is_published);

drop policy if exists "Public read visible milestones" on public.milestones;
create policy "Public read visible milestones" on public.milestones
  for select using (is_visible);

do $$
declare t text;
begin
  foreach t in array array[
    'ecosystems', 'biodiversity_categories', 'species', 'nature_labs',
    'citizen_science_projects', 'research_projects', 'milestones', 'observations'
  ] loop
    execute format('drop policy if exists "Admins manage %1$s" on public.%1$I', t);
    execute format(
      'create policy "Admins manage %1$s" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t
    );
  end loop;
end;
$$;

drop policy if exists "Admins read audit log" on public.audit_log;
create policy "Admins read audit log" on public.audit_log
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- "Where is this image used?" now also looks in the new tables
-- ---------------------------------------------------------------------
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
    select 'Atlas habitat'::text, e.name
      from ecosystems e where coalesce(e.photo::text, '') ilike needle or e.description ilike needle
    union all
    select 'Species'::text, sp.common_name
      from species sp where coalesce(sp.photo::text, '') ilike needle or sp.description ilike needle
    union all
    select 'Nature Lab'::text, l.name
      from nature_labs l where coalesce(l.cover_image::text, '') ilike needle or l.description ilike needle
    union all
    select 'Citizen science project'::text, c.title
      from citizen_science_projects c where coalesce(c.cover_image::text, '') ilike needle or c.description ilike needle or c.findings ilike needle
    union all
    select 'Research project'::text, r.title
      from research_projects r where coalesce(r.cover_image::text, '') ilike needle or r.description ilike needle or r.findings ilike needle
    union all
    select 'Website settings'::text, 'Logo, favicon or sharing image'::text
      from site_settings s
     where coalesce(s.logo::text, '') ilike needle or coalesce(s.og_image::text, '') ilike needle
        or coalesce(s.favicon_url, '') ilike needle;
end;
$$;

revoke all on function public.media_usage(text) from public, anon;
grant execute on function public.media_usage(text) to authenticated;

-- Ask PostgREST to pick up the new tables straight away.
notify pgrst, 'reload schema';
