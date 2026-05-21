-- FINAL Supabase setup for the Hearty free 7-day meal plan lead magnet.
-- Run in Supabase SQL Editor.
-- Then paste your public SUPABASE_URL and SUPABASE_ANON_KEY into free-meal-plan.html.

create table if not exists public.meal_plan_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  first_name text,
  email text not null,
  whatsapp text,
  medication text,

  country text,
  market text,
  checkout_url text,

  proteins jsonb default '[]'::jsonb,
  breakfasts jsonb default '[]'::jsonb,
  starches jsonb default '[]'::jsonb,
  vegetables jsonb default '[]'::jsonb,
  fruits jsonb default '[]'::jsonb,
  snacks jsonb default '[]'::jsonb,

  generated_plan text,

  ref text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,

  downloaded_plan boolean default false,
  copied_plan boolean default false,
  printed_plan boolean default false,
  clicked_hearty boolean default false,

  downloaded_at timestamptz,
  copied_at timestamptz,
  printed_at timestamptz,
  clicked_hearty_at timestamptz,

  lead_status text not null default 'New',
  notes text
);

alter table public.meal_plan_leads enable row level security;

drop policy if exists "Allow public lead insert" on public.meal_plan_leads;
create policy "Allow public lead insert"
on public.meal_plan_leads
for insert
to anon
with check (true);

drop policy if exists "Allow public lead event update" on public.meal_plan_leads;
create policy "Allow public lead event update"
on public.meal_plan_leads
for update
to anon
using (true)
with check (true);

create index if not exists meal_plan_leads_created_at_idx on public.meal_plan_leads (created_at desc);
create index if not exists meal_plan_leads_ref_idx on public.meal_plan_leads (ref);
create index if not exists meal_plan_leads_utm_source_idx on public.meal_plan_leads (utm_source);
create index if not exists meal_plan_leads_market_idx on public.meal_plan_leads (market);
