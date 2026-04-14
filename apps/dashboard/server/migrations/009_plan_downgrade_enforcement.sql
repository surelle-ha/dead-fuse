-- Migration 009: Plan downgrade slot enforcement
-- Run after 008_add_user_role_and_pricing_plans.sql

-- Add status column to projects
-- 'active'    → normal operation (default)
-- 'suspended' → over-slot limit after downgrade; SDK continues to run but project is read-only greyed in dashboard
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended'));

-- Index for fast filtering
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);

-- Table that records pending downgrade elections
-- When a user's new plan allows fewer slots than they have projects,
-- we create a row here until they pick which projects to retain.
CREATE TABLE IF NOT EXISTS plan_downgrade_elections (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  new_plan_id    UUID REFERENCES pricing_plans(id) ON DELETE SET NULL,
  new_plan_limit INTEGER NOT NULL,
  expires_at     TIMESTAMPTZ,        -- mirrors plan_expires_at of the old plan
  resolved_at    TIMESTAMPTZ,        -- NULL = pending
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS plan_downgrade_elections_user_idx
  ON plan_downgrade_elections(user_id)
  WHERE resolved_at IS NULL;