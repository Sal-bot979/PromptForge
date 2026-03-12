-- PromptForge Initial Schema
-- Migration: 001_initial_schema
-- Creates all core tables with RLS policies.

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fuzzy search on project names

-- ─── Enums ──────────────────────────────────────────────────────────────────

create type artifact_type as enum (
  'prd',
  'architecture',
  'design',
  'phases',
  'testing',
  'claude_md',
  'antigravity',
  'claude_code',
  'deployment',
  'changelog'
);

create type style_type as enum (
  'structured',
  'narrative',
  'terse',
  'custom'
);

-- ─── Projects ────────────────────────────────────────────────────────────────

create table projects (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  description  text not null default '',
  -- Structured extraction from Claude: concept, users, goals, constraints, techStack, deployment
  structured_spec jsonb,
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Index for fast user project listing (most recent first)
create index projects_user_id_created_at_idx on projects (user_id, created_at desc);

-- Full-text search index for project name + description
create index projects_fts_idx on projects
  using gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

-- Trigram index for fuzzy name matching (similarity detection)
create index projects_name_trgm_idx on projects using gin(name gin_trgm_ops);

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

-- RLS
alter table projects enable row level security;

create policy "Users can view their own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- ─── Artifacts ───────────────────────────────────────────────────────────────

create table artifacts (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid not null references projects(id) on delete cascade,
  type         artifact_type not null,
  content      text not null default '',
  version      integer not null default 1,
  generated_at timestamptz not null default now(),
  edited_at    timestamptz,
  -- Each project can have at most one artifact of each type (latest version)
  unique (project_id, type)
);

create index artifacts_project_id_idx on artifacts (project_id);

-- RLS: artifact access is granted if the user owns the parent project
alter table artifacts enable row level security;

create policy "Users can view artifacts for their projects"
  on artifacts for select
  using (
    exists (
      select 1 from projects
      where projects.id = artifacts.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can create artifacts for their projects"
  on artifacts for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = artifacts.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can update artifacts for their projects"
  on artifacts for update
  using (
    exists (
      select 1 from projects
      where projects.id = artifacts.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete artifacts for their projects"
  on artifacts for delete
  using (
    exists (
      select 1 from projects
      where projects.id = artifacts.project_id
        and projects.user_id = auth.uid()
    )
  );

-- ─── Style Profiles ──────────────────────────────────────────────────────────

create table style_profiles (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  name             text not null,
  style_type       style_type not null default 'structured',
  -- Array of rule strings e.g. ["Use numbered lists for all sequences"]
  rules            jsonb not null default '[]',
  -- Learned overrides: [{ pattern, replacement, frequency }]
  learned_overrides jsonb not null default '[]',
  is_default       boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index style_profiles_user_id_idx on style_profiles (user_id);

-- Enforce at most one default profile per user
create unique index style_profiles_one_default_per_user
  on style_profiles (user_id)
  where is_default = true;

create trigger style_profiles_updated_at
  before update on style_profiles
  for each row execute function update_updated_at();

alter table style_profiles enable row level security;

create policy "Users can manage their own style profiles"
  on style_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Snippets ────────────────────────────────────────────────────────────────

create table snippets (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  name             text not null,
  content          text not null,
  category         text not null default 'General',
  -- Keywords that trigger auto-injection e.g. ["REST API", "authentication"]
  trigger_keywords text[] not null default '{}',
  usage_count      integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index snippets_user_id_idx on snippets (user_id);
create index snippets_trigger_keywords_idx on snippets using gin(trigger_keywords);

create trigger snippets_updated_at
  before update on snippets
  for each row execute function update_updated_at();

alter table snippets enable row level security;

create policy "Users can manage their own snippets"
  on snippets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Generation History ───────────────────────────────────────────────────────

create table generation_history (
  id             uuid primary key default uuid_generate_v4(),
  artifact_id    uuid not null references artifacts(id) on delete cascade,
  -- The compiled prompt sent to Claude
  prompt         text not null,
  -- The raw Claude response
  response       text not null,
  -- The user's edited version (null if they accepted the generation as-is)
  edited_content text,
  created_at     timestamptz not null default now()
);

create index generation_history_artifact_id_idx on generation_history (artifact_id, created_at desc);

-- RLS: access via artifact -> project -> user ownership chain
alter table generation_history enable row level security;

create policy "Users can view history for their artifacts"
  on generation_history for select
  using (
    exists (
      select 1 from artifacts a
      join projects p on p.id = a.project_id
      where a.id = generation_history.artifact_id
        and p.user_id = auth.uid()
    )
  );

create policy "Users can create history for their artifacts"
  on generation_history for insert
  with check (
    exists (
      select 1 from artifacts a
      join projects p on p.id = a.project_id
      where a.id = generation_history.artifact_id
        and p.user_id = auth.uid()
    )
  );

-- ─── User Preferences ────────────────────────────────────────────────────────

create table user_preferences (
  id                       uuid primary key default uuid_generate_v4(),
  user_id                  uuid not null unique references auth.users(id) on delete cascade,
  active_style_profile_id  uuid references style_profiles(id) on delete set null,
  default_tool_profile     text not null default 'claude_code',
  -- Free tier: 50 generations/month
  monthly_gen_count        integer not null default 0,
  -- ISO month string e.g. "2026-03" — app resets count when this changes
  gen_count_month          text not null default to_char(now(), 'YYYY-MM'),
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create trigger user_preferences_updated_at
  before update on user_preferences
  for each row execute function update_updated_at();

alter table user_preferences enable row level security;

create policy "Users can view their own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on user_preferences for update
  using (auth.uid() = user_id);

-- Auto-create user_preferences row when a new user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into user_preferences (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
