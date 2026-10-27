-- Portfolio Supabase backend
-- Tables for skills, projects, work experience, EmailJS settings and
-- Contact-form messages. Public visitors read published portfolio content;
-- only the authenticated owner account can write.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ── Tables ───────────────────────────────────────────────────
create table if not exists public.site_settings (
  id smallint primary key check (id = 1),
  emailjs_service_id text not null check (char_length(btrim(emailjs_service_id)) between 1 and 200),
  emailjs_template_id text not null check (char_length(btrim(emailjs_template_id)) between 1 and 200),
  emailjs_public_key text not null check (char_length(btrim(emailjs_public_key)) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_skill_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null unique check (char_length(btrim(title)) between 1 and 120),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_skills (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.portfolio_skill_groups(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  level smallint not null default 70 check (level between 0 and 100),
  color text not null default '#2b9e7a' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  icon_key text not null default 'code' check (char_length(btrim(icon_key)) between 1 and 80),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 1 and 240),
  short_description text not null default '',
  overview text not null default '',
  features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  cover_url text,
  gallery_urls jsonb not null default '[]'::jsonb check (jsonb_typeof(gallery_urls) = 'array'),
  structure_url text,
  stack jsonb not null default '[]'::jsonb check (jsonb_typeof(stack) = 'array'),
  category text not null default 'Full-Stack' check (category in ('Full-Stack', 'Frontend', 'Mobile')),
  tags jsonb not null default '[]'::jsonb check (jsonb_typeof(tags) = 'array'),
  project_year integer not null default extract(year from now())::integer check (project_year between 1990 and 2100),
  display_date text not null default '',
  role text not null default 'Design & Development',
  live_url text,
  repo_url text,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_experience (
  id uuid primary key default gen_random_uuid(),
  period text not null check (char_length(btrim(period)) between 1 and 160),
  title text not null check (char_length(btrim(title)) between 1 and 240),
  org text not null check (char_length(btrim(org)) between 1 and 300),
  points jsonb not null default '[]'::jsonb check (jsonb_typeof(points) = 'array'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 160),
  email text not null check (
    char_length(btrim(email)) between 5 and 320
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'
  ),
  subject text not null default '' check (char_length(subject) <= 240),
  message text not null check (char_length(btrim(message)) between 10 and 10000),
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  source text not null default 'portfolio-contact-form' check (char_length(source) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_skill_groups_sort_idx
  on public.portfolio_skill_groups (sort_order, title);
create index if not exists portfolio_skills_group_sort_idx
  on public.portfolio_skills (group_id, sort_order, name);
create index if not exists portfolio_projects_sort_idx
  on public.portfolio_projects (sort_order, project_year desc);
create index if not exists portfolio_projects_published_idx
  on public.portfolio_projects (published, sort_order);
create index if not exists portfolio_experience_sort_idx
  on public.portfolio_experience (sort_order);
create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);
create index if not exists contact_messages_status_idx
  on public.contact_messages (status, created_at desc);

-- ── Helpers ──────────────────────────────────────────────────
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function private.set_updated_at();

drop trigger if exists portfolio_skill_groups_set_updated_at on public.portfolio_skill_groups;
create trigger portfolio_skill_groups_set_updated_at
before update on public.portfolio_skill_groups
for each row execute function private.set_updated_at();

drop trigger if exists portfolio_skills_set_updated_at on public.portfolio_skills;
create trigger portfolio_skills_set_updated_at
before update on public.portfolio_skills
for each row execute function private.set_updated_at();

drop trigger if exists portfolio_projects_set_updated_at on public.portfolio_projects;
create trigger portfolio_projects_set_updated_at
before update on public.portfolio_projects
for each row execute function private.set_updated_at();

drop trigger if exists portfolio_experience_set_updated_at on public.portfolio_experience;
create trigger portfolio_experience_set_updated_at
before update on public.portfolio_experience
for each row execute function private.set_updated_at();

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
before update on public.contact_messages
for each row execute function private.set_updated_at();

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'arabihamzaaa@gmail.com'
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin',
    false
  );
$$;

revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to anon, authenticated, service_role;

create or replace function private.uuid_or_md5(value text, seed text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case
    when coalesce(value, '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then value::uuid
    else md5(seed)::uuid
  end;
$$;

create or replace function private.replace_portfolio_experience(p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  item jsonb;
  item_index integer := 0;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Experience payload must be a JSON array.';
  end if;

  delete from public.portfolio_experience;

  for item in select value from jsonb_array_elements(p_items) loop
    if btrim(coalesce(item ->> 'period', '')) <> ''
       or btrim(coalesce(item ->> 'title', '')) <> ''
       or btrim(coalesce(item ->> 'org', '')) <> '' then
      insert into public.portfolio_experience (id, period, title, org, points, sort_order)
      values (
        private.uuid_or_md5(
          item ->> 'id',
          'experience:' || item_index::text || ':' || coalesce(item ->> 'period', '') || ':' || coalesce(item ->> 'title', '') || ':' || coalesce(item ->> 'org', '')
        ),
        btrim(coalesce(item ->> 'period', '')),
        btrim(coalesce(item ->> 'title', '')),
        btrim(coalesce(item ->> 'org', '')),
        case when jsonb_typeof(item -> 'points') = 'array' then item -> 'points' else '[]'::jsonb end,
        coalesce(nullif(item ->> 'sortOrder', '')::integer, nullif(item ->> 'sort_order', '')::integer, item_index)
      );
    end if;
    item_index := item_index + 1;
  end loop;
end;
$$;

create or replace function private.replace_portfolio_content(p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  group_entry record;
  skill_entry record;
  project_item jsonb;
  project_index integer := 0;
  v_group_id uuid;
  v_group_title text;
  email_config jsonb;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Portfolio content payload must be a JSON object.';
  end if;

  delete from public.portfolio_skills;
  delete from public.portfolio_skill_groups;
  delete from public.portfolio_projects;

  for group_entry in
    select value as data, (ordinality - 1)::integer as idx
    from jsonb_array_elements(coalesce(p_payload -> 'skillGroups', '[]'::jsonb)) with ordinality as entries(value, ordinality)
  loop
    v_group_title := btrim(coalesce(group_entry.data ->> 'title', 'Tools & Business'));
    if v_group_title = '' then
      v_group_title := 'Tools & Business';
    end if;

    select id into v_group_id
    from public.portfolio_skill_groups
    where lower(title) = lower(v_group_title)
    limit 1;

    if v_group_id is null then
      insert into public.portfolio_skill_groups (id, title, sort_order)
      values (
        private.uuid_or_md5(group_entry.data ->> 'id', 'skill-group:' || lower(v_group_title)),
        v_group_title,
        coalesce(nullif(group_entry.data ->> 'sortOrder', '')::integer, nullif(group_entry.data ->> 'sort_order', '')::integer, group_entry.idx)
      )
      returning id into v_group_id;
    end if;

    for skill_entry in
      select value as data, (ordinality - 1)::integer as idx
      from jsonb_array_elements(coalesce(group_entry.data -> 'skills', '[]'::jsonb)) with ordinality as entries(value, ordinality)
    loop
      if btrim(coalesce(skill_entry.data ->> 'name', '')) <> '' then
        insert into public.portfolio_skills (id, group_id, name, level, color, icon_key, sort_order)
        values (
          private.uuid_or_md5(
            skill_entry.data ->> 'id',
            'skill:' || lower(v_group_title) || ':' || lower(btrim(skill_entry.data ->> 'name'))
          ),
          v_group_id,
          btrim(skill_entry.data ->> 'name'),
          greatest(0, least(100, coalesce(nullif(skill_entry.data ->> 'level', '')::integer, 70))),
          case
            when coalesce(skill_entry.data ->> 'color', '') ~ '^#[0-9A-Fa-f]{6}$' then skill_entry.data ->> 'color'
            else '#2b9e7a'
          end,
          coalesce(nullif(btrim(skill_entry.data ->> 'iconKey'), ''), nullif(btrim(skill_entry.data ->> 'icon_key'), ''), 'code'),
          coalesce(nullif(skill_entry.data ->> 'sortOrder', '')::integer, nullif(skill_entry.data ->> 'sort_order', '')::integer, skill_entry.idx)
        );
      end if;
    end loop;
  end loop;

  for project_item in select value from jsonb_array_elements(coalesce(p_payload -> 'projects', '[]'::jsonb)) loop
    if btrim(coalesce(project_item ->> 'title', '')) <> '' then
      insert into public.portfolio_projects (
        id, slug, title, short_description, overview, features, cover_url, gallery_urls,
        structure_url, stack, category, tags, project_year, display_date, role,
        live_url, repo_url, featured, published, sort_order
      )
      values (
        private.uuid_or_md5(
          project_item ->> 'id',
          'project:' || coalesce(nullif(btrim(project_item ->> 'slug'), ''), lower(btrim(project_item ->> 'title')))
        ),
        coalesce(nullif(btrim(project_item ->> 'slug'), ''), 'project-' || project_index::text),
        btrim(project_item ->> 'title'),
        coalesce(project_item ->> 'short', project_item ->> 'short_description', ''),
        coalesce(project_item ->> 'overview', project_item ->> 'short', project_item ->> 'short_description', ''),
        case when jsonb_typeof(project_item -> 'features') = 'array' then project_item -> 'features' else '[]'::jsonb end,
        nullif(coalesce(project_item ->> 'cover', project_item ->> 'cover_url'), ''),
        case
          when jsonb_typeof(project_item -> 'gallery') = 'array' then project_item -> 'gallery'
          when jsonb_typeof(project_item -> 'gallery_urls') = 'array' then project_item -> 'gallery_urls'
          else '[]'::jsonb
        end,
        nullif(coalesce(project_item ->> 'structure', project_item ->> 'structure_url'), ''),
        case when jsonb_typeof(project_item -> 'stack') = 'array' then project_item -> 'stack' else '[]'::jsonb end,
        case
          when project_item ->> 'category' in ('Full-Stack', 'Frontend', 'Mobile') then project_item ->> 'category'
          else 'Full-Stack'
        end,
        case when jsonb_typeof(project_item -> 'tags') = 'array' then project_item -> 'tags' else '[]'::jsonb end,
        greatest(1990, least(2100, coalesce(nullif(project_item ->> 'year', '')::integer, nullif(project_item ->> 'project_year', '')::integer, extract(year from now())::integer))),
        coalesce(project_item ->> 'date', project_item ->> 'display_date', ''),
        coalesce(nullif(btrim(project_item ->> 'role'), ''), 'Design & Development'),
        nullif(coalesce(project_item ->> 'live', project_item ->> 'live_url'), ''),
        nullif(coalesce(project_item ->> 'repo', project_item ->> 'repo_url'), ''),
        coalesce(nullif(project_item ->> 'featured', '')::boolean, false),
        coalesce(nullif(project_item ->> 'published', '')::boolean, true),
        coalesce(nullif(project_item ->> 'sortOrder', '')::integer, nullif(project_item ->> 'sort_order', '')::integer, project_index)
      )
      on conflict (slug) do nothing;
    end if;
    project_index := project_index + 1;
  end loop;

  perform private.replace_portfolio_experience(coalesce(p_payload -> 'experience', '[]'::jsonb));

  email_config := coalesce(p_payload -> 'emailConfig', '{}'::jsonb);
  insert into public.site_settings (id, emailjs_service_id, emailjs_template_id, emailjs_public_key)
  values (
    1,
    coalesce(nullif(btrim(email_config ->> 'serviceId'), ''), 'service_515wdme'),
    coalesce(nullif(btrim(email_config ->> 'templateId'), ''), 'template_mmzghiq'),
    coalesce(nullif(btrim(email_config ->> 'publicKey'), ''), 'AgiXKpwtjZv_5nBNa')
  )
  on conflict (id) do update
  set
    emailjs_service_id = excluded.emailjs_service_id,
    emailjs_template_id = excluded.emailjs_template_id,
    emailjs_public_key = excluded.emailjs_public_key;
end;
$$;

create or replace function public.replace_portfolio_content(p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  if not public.is_portfolio_admin() then
    raise exception 'Only the portfolio admin can replace portfolio content.';
  end if;
  perform private.replace_portfolio_content(p_payload);
end;
$$;

create or replace function public.replace_portfolio_experience(p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  if not public.is_portfolio_admin() then
    raise exception 'Only the portfolio admin can replace work experience.';
  end if;
  perform private.replace_portfolio_experience(p_items);
end;
$$;

revoke all on function private.uuid_or_md5(text, text) from public, anon, authenticated;
revoke all on function private.replace_portfolio_experience(jsonb) from public, anon, authenticated;
revoke all on function private.replace_portfolio_content(jsonb) from public, anon, authenticated;
revoke all on function public.replace_portfolio_content(jsonb) from public, anon;
revoke all on function public.replace_portfolio_experience(jsonb) from public, anon;
grant execute on function public.replace_portfolio_content(jsonb) to authenticated;
grant execute on function public.replace_portfolio_experience(jsonb) to authenticated;

-- ── Row Level Security & grants ─────────────────────────────
alter table public.site_settings enable row level security;
alter table public.portfolio_skill_groups enable row level security;
alter table public.portfolio_skills enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_experience enable row level security;
alter table public.contact_messages enable row level security;

revoke all on table public.site_settings from anon, authenticated;
revoke all on table public.portfolio_skill_groups from anon, authenticated;
revoke all on table public.portfolio_skills from anon, authenticated;
revoke all on table public.portfolio_projects from anon, authenticated;
revoke all on table public.portfolio_experience from anon, authenticated;
revoke all on table public.contact_messages from anon, authenticated;

grant select on table public.site_settings to anon, authenticated;
grant insert, update, delete on table public.site_settings to authenticated;
grant select, insert, update, delete on table public.site_settings to service_role;

grant select on table public.portfolio_skill_groups to anon, authenticated;
grant insert, update, delete on table public.portfolio_skill_groups to authenticated;
grant select, insert, update, delete on table public.portfolio_skill_groups to service_role;

grant select on table public.portfolio_skills to anon, authenticated;
grant insert, update, delete on table public.portfolio_skills to authenticated;
grant select, insert, update, delete on table public.portfolio_skills to service_role;

grant select on table public.portfolio_projects to anon, authenticated;
grant insert, update, delete on table public.portfolio_projects to authenticated;
grant select, insert, update, delete on table public.portfolio_projects to service_role;

grant select on table public.portfolio_experience to anon, authenticated;
grant insert, update, delete on table public.portfolio_experience to authenticated;
grant select, insert, update, delete on table public.portfolio_experience to service_role;

grant insert on table public.contact_messages to anon, authenticated;
grant select, update, delete on table public.contact_messages to authenticated;
grant select, insert, update, delete on table public.contact_messages to service_role;

-- site_settings
create policy "Site settings are public"
on public.site_settings for select to anon, authenticated using (true);
create policy "Admin can insert site settings"
on public.site_settings for insert to authenticated with check (public.is_portfolio_admin());
create policy "Admin can update site settings"
on public.site_settings for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "Admin can delete site settings"
on public.site_settings for delete to authenticated using (public.is_portfolio_admin());

-- skill groups
create policy "Skill groups are public"
on public.portfolio_skill_groups for select to anon, authenticated using (true);
create policy "Admin can insert skill groups"
on public.portfolio_skill_groups for insert to authenticated with check (public.is_portfolio_admin());
create policy "Admin can update skill groups"
on public.portfolio_skill_groups for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "Admin can delete skill groups"
on public.portfolio_skill_groups for delete to authenticated using (public.is_portfolio_admin());

-- skills
create policy "Skills are public"
on public.portfolio_skills for select to anon, authenticated using (true);
create policy "Admin can insert skills"
on public.portfolio_skills for insert to authenticated with check (public.is_portfolio_admin());
create policy "Admin can update skills"
on public.portfolio_skills for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "Admin can delete skills"
on public.portfolio_skills for delete to authenticated using (public.is_portfolio_admin());

-- projects: visitors see published projects; admin also sees drafts.
create policy "Published projects are public"
on public.portfolio_projects for select to anon, authenticated
using (published or public.is_portfolio_admin());
create policy "Admin can insert projects"
on public.portfolio_projects for insert to authenticated with check (public.is_portfolio_admin());
create policy "Admin can update projects"
on public.portfolio_projects for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "Admin can delete projects"
on public.portfolio_projects for delete to authenticated using (public.is_portfolio_admin());

-- experience
create policy "Experience is public"
on public.portfolio_experience for select to anon, authenticated using (true);
create policy "Admin can insert experience"
on public.portfolio_experience for insert to authenticated with check (public.is_portfolio_admin());
create policy "Admin can update experience"
on public.portfolio_experience for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "Admin can delete experience"
on public.portfolio_experience for delete to authenticated using (public.is_portfolio_admin());

-- contact messages: public insert only, admin-only inbox.
create policy "Visitors can send contact messages"
on public.contact_messages for insert to anon, authenticated
with check (
  status = 'new'
  and char_length(btrim(name)) between 2 and 160
  and char_length(btrim(message)) between 10 and 10000
);
create policy "Admin can read contact messages"
on public.contact_messages for select to authenticated using (public.is_portfolio_admin());
create policy "Admin can update contact messages"
on public.contact_messages for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "Admin can delete contact messages"
on public.contact_messages for delete to authenticated using (public.is_portfolio_admin());

-- ── Storage: public project media, admin uploads ───────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Portfolio media is public"
on storage.objects for select to public
using (bucket_id = 'portfolio-media');

create policy "Admin can upload portfolio media"
on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio-media' and public.is_portfolio_admin());

create policy "Admin can update portfolio media"
on storage.objects for update to authenticated
using (bucket_id = 'portfolio-media' and public.is_portfolio_admin())
with check (bucket_id = 'portfolio-media' and public.is_portfolio_admin());

create policy "Admin can delete portfolio media"
on storage.objects for delete to authenticated
using (bucket_id = 'portfolio-media' and public.is_portfolio_admin());

-- ── Seed the current published portfolio once ───────────────
do $seed_block$
begin
  if not exists (select 1 from public.site_settings)
     and not exists (select 1 from public.portfolio_projects) then
    perform private.replace_portfolio_content($portfolio_seed${
  "skillGroups": [
    {
      "title": "Front-End",
      "sortOrder": 0,
      "skills": [
        {
          "name": "HTML5",
          "level": 98,
          "color": "#e34c26",
          "iconKey": "html5",
          "sortOrder": 0
        },
        {
          "name": "CSS3",
          "level": 95,
          "color": "#264ce4",
          "iconKey": "css3",
          "sortOrder": 1
        },
        {
          "name": "React",
          "level": 80,
          "color": "#61dafb",
          "iconKey": "react",
          "sortOrder": 2
        },
        {
          "name": "JavaScript",
          "level": 70,
          "color": "#f7df1e",
          "iconKey": "javascript",
          "sortOrder": 3
        },
        {
          "name": "Bootstrap",
          "level": 85,
          "color": "#7952b3",
          "iconKey": "bootstrap",
          "sortOrder": 4
        },
        {
          "name": "jQuery",
          "level": 85,
          "color": "#0868ac",
          "iconKey": "jquery",
          "sortOrder": 5
        }
      ]
    },
    {
      "title": "Back-End & Data",
      "sortOrder": 1,
      "skills": [
        {
          "name": "Laravel",
          "level": 75,
          "color": "#ff2d20",
          "iconKey": "laravel",
          "sortOrder": 0
        },
        {
          "name": "Symfony",
          "level": 70,
          "color": "#9ca3af",
          "iconKey": "symfony",
          "sortOrder": 1
        },
        {
          "name": "PHP",
          "level": 75,
          "color": "#777bb4",
          "iconKey": "php",
          "sortOrder": 2
        },
        {
          "name": "MySQL",
          "level": 75,
          "color": "#f29111",
          "iconKey": "mysql",
          "sortOrder": 3
        },
        {
          "name": "SQL Server",
          "level": 72,
          "color": "#cc292b",
          "iconKey": "sqlserver",
          "sortOrder": 4
        },
        {
          "name": "MongoDB",
          "level": 85,
          "color": "#47a248",
          "iconKey": "mongodb",
          "sortOrder": 5
        },
        {
          "name": "Python",
          "level": 40,
          "color": "#ffd343",
          "iconKey": "python",
          "sortOrder": 6
        }
      ]
    },
    {
      "title": "Tools & Business",
      "sortOrder": 2,
      "skills": [
        {
          "name": "Sage ERP",
          "level": 68,
          "color": "#00d639",
          "iconKey": "code",
          "sortOrder": 0
        },
        {
          "name": "Git & GitHub",
          "level": 85,
          "color": "#f05032",
          "iconKey": "git",
          "sortOrder": 1
        },
        {
          "name": "WordPress",
          "level": 65,
          "color": "#21759b",
          "iconKey": "wordpress",
          "sortOrder": 2
        },
        {
          "name": "REST APIs",
          "level": 80,
          "color": "#2b9e7a",
          "iconKey": "server",
          "sortOrder": 3
        },
        {
          "name": "Figma",
          "level": 55,
          "color": "#f24e1e",
          "iconKey": "figma",
          "sortOrder": 4
        },
        {
          "name": "Azure Cloud",
          "level": 50,
          "color": "#0078d4",
          "iconKey": "azure",
          "sortOrder": 5
        },
        {
          "name": "Capacitor",
          "level": 65,
          "color": "#119eff",
          "iconKey": "capacitor",
          "sortOrder": 6
        }
      ]
    }
  ],
  "projects": [
    {
      "slug": "chefood-restaurant",
      "title": "Chefood — Restaurant Website",
      "short": "A responsive restaurant platform designed in Figma and built as a React front end powered by a Laravel REST API and MySQL.",
      "overview": "Chefood is a full-stack restaurant website created as my end-of-studies project. The experience was designed first in Figma, then implemented as a fast React SPA talking to a Laravel REST API backed by MySQL. Visitors can explore the menu and offers and move smoothly towards booking — all wrapped in a bold, appetite-driven visual identity that stays fully responsive from phone to desktop.",
      "features": [
        "Figma-first design process, translated pixel-faithfully into React components",
        "Laravel REST API with a structured MySQL database behind the front end",
        "Menu, offers and booking calls-to-action designed to convert visitors",
        "Fully responsive layout built with Bootstrap grid and custom CSS"
      ],
      "cover": "",
      "gallery": [],
      "structure": null,
      "stack": [
        "React",
        "Laravel",
        "MySQL",
        "REST API",
        "Bootstrap",
        "Figma"
      ],
      "category": "Full-Stack",
      "tags": [
        "Restaurant",
        "React",
        "Laravel",
        "REST API"
      ],
      "year": 2023,
      "date": "May 2023",
      "role": "Design & Full-Stack Development",
      "live": "",
      "repo": "https://github.com/Hamzaarabi",
      "featured": true,
      "published": true,
      "sortOrder": 0
    },
    {
      "slug": "voip-it-ltd",
      "title": "VoIP IT Ltd — Corporate Website",
      "short": "A live, mobile-first corporate website for a VoIP company, hand-built with HTML, CSS and JavaScript for speed and clarity.",
      "overview": "A production corporate website for Voipitltds, a VoIP services company. Built mobile-first with semantic HTML, modern CSS and vanilla JavaScript, it prioritises fast loading, smooth in-page navigation and a pleasant interface on every device. This project sharpened my eye for clean, dependency-free front-end craftsmanship — the site is live and in daily use by the company.",
      "features": [
        "Live in production at voipitltds.com",
        "Mobile-first development, then progressively enhanced for desktop",
        "Smooth scrolling navigation between sections",
        "Zero-framework build — minimal weight, maximum compatibility"
      ],
      "cover": "",
      "gallery": [],
      "structure": null,
      "stack": [
        "HTML5",
        "CSS3",
        "JavaScript"
      ],
      "category": "Frontend",
      "tags": [
        "Corporate",
        "Responsive",
        "Live Site"
      ],
      "year": 2023,
      "date": "Nov 2023",
      "role": "Front-End Development",
      "live": "https://voipitltds.com/",
      "repo": "",
      "featured": true,
      "published": true,
      "sortOrder": 1
    },
    {
      "slug": "previssime-insurance",
      "title": "Previssime — Swiss Insurance Platform",
      "short": "A Laravel-powered website for a Swiss insurance agency, built with Blade templates, Bootstrap and JavaScript.",
      "overview": "Previssime is a web platform built for a Swiss insurance agency using Laravel. Server-rendered with Blade for reliability and SEO, styled with Bootstrap and custom CSS, and enhanced with JavaScript interactions. Working for an international client in a regulated industry taught me to value clarity, trust and precision in every screen.",
      "features": [
        "Laravel back end with clean Blade templating",
        "Trust-focused insurance UX for an international (Swiss) client",
        "Responsive Bootstrap layout refined with custom CSS",
        "Structured, maintainable codebase ready to evolve"
      ],
      "cover": "",
      "gallery": [],
      "structure": null,
      "stack": [
        "Laravel",
        "PHP",
        "Blade",
        "Bootstrap",
        "JavaScript"
      ],
      "category": "Full-Stack",
      "tags": [
        "Insurance",
        "Laravel",
        "International Client"
      ],
      "year": 2023,
      "date": "Dec 2023",
      "role": "Full-Stack Development",
      "live": "",
      "repo": "https://github.com/Hamzaarabi",
      "featured": true,
      "published": true,
      "sortOrder": 2
    },
    {
      "slug": "insurance-mobile-app",
      "title": "Insurance Mobile App — Capacitor",
      "short": "A cross-platform mobile companion app for the Swiss insurance agency, built with CapacitorJS on web technologies.",
      "overview": "Following the Previssime web platform, I built a mobile application for the same Swiss insurance agency using CapacitorJS. One web codebase (HTML, CSS, JavaScript) packaged into a native-feeling app — an efficient route to mobile for the client, and a great lesson for me in hybrid app architecture and mobile UX patterns.",
      "features": [
        "Single codebase shipped as a mobile app via CapacitorJS",
        "Mobile-optimised insurance flows and navigation",
        "Consistent experience with the companion web platform",
        "Built entirely with web technologies — fast to iterate and maintain"
      ],
      "cover": "",
      "gallery": [],
      "structure": null,
      "stack": [
        "Capacitor",
        "JavaScript",
        "HTML5",
        "CSS3"
      ],
      "category": "Mobile",
      "tags": [
        "Mobile App",
        "Capacitor",
        "Insurance"
      ],
      "year": 2024,
      "date": "Jan 2024",
      "role": "Mobile Development",
      "live": "",
      "repo": "https://github.com/Hamzaarabi",
      "featured": false,
      "published": true,
      "sortOrder": 3
    },
    {
      "slug": "personal-portfolio",
      "title": "Personal Portfolio — This Website",
      "short": "My own corner of the web: originally built with React, now rebuilt on Vite with a custom design system, dark/light themes and WebP-optimised imagery.",
      "overview": "This very website. I first built my portfolio with Create React App and Bootstrap; the current version is a ground-up rebuild on Vite + React with a hand-crafted CSS design system — dark/light themes, scroll-reveal animations, a ⌘K command palette, filterable project case studies with lightbox galleries, and images optimised from ~22 MB of PNG down to ~2.6 MB of WebP. It is both my showcase and my playground for modern front-end practice.",
      "features": [
        "Rebuilt on Vite + React with route-level code splitting",
        "Custom design system with persistent dark / light themes",
        "⌘K command palette, animated stats and scroll-reveal sections",
        "Full SEO setup: Open Graph, JSON-LD, sitemap and semantic HTML"
      ],
      "cover": "",
      "gallery": [],
      "structure": null,
      "stack": [
        "React",
        "Vite",
        "CSS",
        "Figma"
      ],
      "category": "Frontend",
      "tags": [
        "Portfolio",
        "React",
        "Design System"
      ],
      "year": 2024,
      "date": "Jan 2024",
      "role": "Design & Development",
      "live": "",
      "repo": "https://github.com/hamzaarabi/portfolio",
      "featured": false,
      "published": true,
      "sortOrder": 4
    },
    {
      "slug": "firstcode-ecommerce",
      "title": "FirstCode — E-Commerce Storefront",
      "short": "Where it all began: my very first web app — a clothing e-commerce storefront for men, women and kids, built with HTML, CSS, JavaScript and jQuery.",
      "overview": "FirstCode is the first real web application I ever built, back in 2021: an online clothing shop for men, women and kids, hand-coded with HTML, CSS, JavaScript and jQuery. It taught me the fundamentals — layout, DOM manipulation, product grids and cart-style interactions — and sparked the career that followed. I keep it here as a reminder of how far the journey has come.",
      "features": [
        "My first complete web application (2021)",
        "Category browsing for men, women and kids clothing",
        "Interactive product listings powered by JavaScript & jQuery",
        "Hand-written HTML/CSS — the fundamentals, learned properly"
      ],
      "cover": "",
      "gallery": [],
      "structure": null,
      "stack": [
        "HTML5",
        "CSS3",
        "JavaScript",
        "jQuery"
      ],
      "category": "Frontend",
      "tags": [
        "E-Commerce",
        "First Project"
      ],
      "year": 2021,
      "date": "Nov 2021",
      "role": "Front-End Development",
      "live": "",
      "repo": "https://github.com/Hamzaarabi",
      "featured": false,
      "published": true,
      "sortOrder": 5
    }
  ],
  "experience": [
    {
      "period": "2024 — Present",
      "title": "Full-Stack Web Developer",
      "org": "Delta Holding · Skhirat, Rabat",
      "points": [
        "Design, build and ship new company websites and internal web pages",
        "Maintain and evolve existing sites — features, fixes and content updates",
        "Manage business data and provide day-to-day technical support to teams"
      ],
      "sortOrder": 0
    },
    {
      "period": "2023 — 2024",
      "title": "Full-Stack Web Developer",
      "org": "Marketing Support Services · Settat",
      "points": [
        "Created and modified client websites end to end",
        "Improved visibility with technical and on-page SEO",
        "Automated data collection with web scraping and managed company data"
      ],
      "sortOrder": 1
    },
    {
      "period": "Mar 2023",
      "title": "Internship",
      "org": "Court of First Instance · Settat",
      "points": [
        "Strengthened communication, problem-solving and teamwork skills in a formal administrative environment"
      ],
      "sortOrder": 2
    }
  ],
  "emailConfig": {
    "serviceId": "service_515wdme",
    "templateId": "template_mmzghiq",
    "publicKey": "AgiXKpwtjZv_5nBNa"
  }
}$portfolio_seed$::jsonb);
  end if;
end;
$seed_block$;

-- ── Realtime ─────────────────────────────────────────────────
alter publication supabase_realtime add table
  public.site_settings,
  public.portfolio_skill_groups,
  public.portfolio_skills,
  public.portfolio_projects,
  public.portfolio_experience;

comment on table public.portfolio_projects is 'Portfolio projects managed from the Supabase-backed Admin area.';
comment on table public.contact_messages is 'Contact form submissions. Public insert only; admin-only reads through RLS.';

notify pgrst, 'reload schema';
