-- Migration 8: Add roles and pricing plans support

-- Create pricing plans catalog
create table if not exists pricing_plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  project_limit integer not null default 2,
  default_expiry_days integer,
  created_at timestamptz default now()
);

-- Add role and plan tracking to users
alter table users
  add column if not exists role text not null default 'user',
  add column if not exists plan_id uuid references pricing_plans(id) on delete set null,
  add column if not exists plan_expires_at timestamptz;

update users set role = 'user' where role is null;

-- Seed default pricing plans if missing
insert into pricing_plans (slug, name, description, project_limit, default_expiry_days)
select 'free', 'Free', 'Basic free plan', 2, null
where not exists (select 1 from pricing_plans where slug = 'free');

insert into pricing_plans (slug, name, description, project_limit, default_expiry_days)
select 'pro', 'Pro', 'Standard paid plan', 25, 30
where not exists (select 1 from pricing_plans where slug = 'pro');

insert into pricing_plans (slug, name, description, project_limit, default_expiry_days)
select 'agency', 'Agency', 'Unlimited plan', 9999, 30
where not exists (select 1 from pricing_plans where slug = 'agency');
