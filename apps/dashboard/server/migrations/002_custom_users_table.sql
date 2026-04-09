-- Migration 2: Custom users table and project references update
-- Run this after Migration 1

-- Create custom users table (in addition to auth.users for password hashing)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

alter table users enable row level security;

create policy "Users can only read their own data"
  on users for select
  using (auth.uid() = id);

-- Update projects table to reference the users table
alter table projects drop constraint if exists projects_user_id_fkey;
alter table projects add constraint projects_user_id_fkey
  foreign key (user_id) references users(id) on delete cascade;