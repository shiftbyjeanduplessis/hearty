-- HEARTY TRACKING V1
-- Run this in Supabase SQL Editor before deploying the tracking files.

create table if not exists public.hearty_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  event_name text not null,
  session_id text,
  user_id uuid,

  source text,
  campaign text,
  page text,
  referrer text,
  country text,

  metadata jsonb default '{}'::jsonb
);

create index if not exists hearty_events_created_at_idx
on public.hearty_events (created_at desc);

create index if not exists hearty_events_event_name_idx
on public.hearty_events (event_name);

create index if not exists hearty_events_source_idx
on public.hearty_events (source);

create index if not exists hearty_events_session_idx
on public.hearty_events (session_id);

alter table public.hearty_events enable row level security;

drop policy if exists "Allow anonymous event inserts" on public.hearty_events;

create policy "Allow anonymous event inserts"
on public.hearty_events
for insert
to anon
with check (true);

-- Do not add a public SELECT policy. Keep reads private in Supabase.
