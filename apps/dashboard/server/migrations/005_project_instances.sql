-- Migration 005: Project instances
-- Run in Supabase SQL Editor after 004_github_oauth.sql

create table if not exists project_instances (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  env          text not null default 'dev'
                 check (env in ('dev','qa','staging','prod','custom')),
  label        text not null,
  token        text not null unique,
  deployed     boolean not null default false,
  uptime_ping  boolean not null default false,
  sdk_ping     boolean not null default false,
  alert        boolean not null default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists project_instances_project_id_idx
  on project_instances(project_id);

-- Reuse the existing updated_at trigger function
drop trigger if exists update_project_instances_updated_at on project_instances;
create trigger update_project_instances_updated_at
  before update on project_instances
  for each row execute function update_updated_at_column();

alter table project_instances enable row level security;

-- Only the project owner can see/manage instances
create policy "Owner manages instances"
  on project_instances for all
  using (
    exists (
      select 1 from projects p
      where p.id = project_instances.project_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from projects p
      where p.id = project_instances.project_id
        and p.user_id = auth.uid()
    )
  );