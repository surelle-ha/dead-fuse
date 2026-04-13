-- Migration 6: Support tickets table
-- Run this after the existing project and user migrations

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists update_support_tickets_updated_at on support_tickets;

create trigger update_support_tickets_updated_at
  before update on support_tickets
  for each row execute function update_updated_at_column();

alter table support_tickets enable row level security;

create policy "Users can manage their own support tickets"
  on support_tickets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
