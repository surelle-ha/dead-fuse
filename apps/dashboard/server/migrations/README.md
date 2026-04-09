# Database Migrations

This directory contains SQL migration files for setting up the DeadFuse database schema in Supabase.

## Migration Files

### 001_initial_projects.sql
- Creates the initial `projects` table with basic fields
- Sets up Row Level Security (RLS) policies
- Adds updated_at trigger function
- References `auth.users` table

### 002_custom_users_table.sql
- Creates a custom `users` table for password hashing
- Updates the `projects` table to reference the custom `users` table instead of `auth.users`
- Sets up RLS policies for the users table

### 003_project_metadata.sql
- Adds metadata columns to the projects table:
  - `client_name` (TEXT)
  - `target_completion` (DATE)
  - `description` (TEXT)
  - `budget` (TEXT)
  - `priority` (TEXT with CHECK constraint)

## How to Run Migrations

### Option 1: Manual Execution (Recommended for Production)

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Run each migration file in order:
   - First: `001_initial_projects.sql`
   - Second: `002_custom_users_table.sql`
   - Third: `003_project_metadata.sql`

### Option 2: Using the Migration Script

The migration script can be updated to run these files programmatically. For now, manual execution is recommended.

## Important Notes

- **Order matters**: Always run migrations in numerical order
- **Idempotent**: All migrations use `IF NOT EXISTS` or `IF EXISTS` to be safe to run multiple times
- **RLS**: Row Level Security is enabled on all tables
- **Triggers**: The `updated_at` trigger automatically updates timestamps on row changes
- **Constraints**: The `priority` column has a CHECK constraint limiting values to: 'low', 'medium', 'high', 'urgent'

## Redeployment

When redeploying to a new Supabase instance:

1. Create a new Supabase project
2. Run the migrations in order (001 → 002 → 003)
3. Update your environment variables with the new Supabase URL and keys
4. Deploy your application

## Schema Overview

After running all migrations, your database will have:

- `users` table: Custom user data with password hashes
- `projects` table: Project data with comprehensive metadata
- Proper foreign key relationships
- Row Level Security policies
- Automatic timestamp updates