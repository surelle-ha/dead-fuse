-- Migration 1: Initial projects table setup
-- Run this once in the Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  project_key text unique not null,
  public_token text not null,
  state text not null default 'ACTIVE',
  message text default '',
  grace_period integer default 3,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function update_updated_at_column()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language 'plpgsql';

drop trigger if exists update_projects_updated_at on projects;
create trigger update_projects_updated_at
  before update on projects
  for each row execute function update_updated_at_column();

alter table projects enable row level security;

create policy "Users manage own projects"
  on projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);