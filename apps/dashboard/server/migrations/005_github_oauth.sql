-- Migration 5: Add GitHub OAuth support for custom users
-- This migration makes password_hash nullable and adds provider metadata for OAuth users.

alter table users alter column password_hash drop not null;

alter table users add column if not exists provider text;
alter table users add column if not exists provider_id text;

create unique index if not exists users_provider_idx on users(provider, provider_id);
