-- Migration 7: Add project limit to users

alter table users
  add column if not exists project_limit integer default 2 not null;

-- Ensure the default project limit is set for existing users
update users set project_limit = 2 where project_limit is null;
