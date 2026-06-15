-- HEARTY 010 — Soft Login + Grandfathered Customer Access
-- Step 2B scope:
-- - Keep existing users safe.
-- - Add grandfathered customer list.
-- - Auto-claim lifetime access when auth email matches grandfathered email.
-- - Add access recovery requests for mismatched emails.
-- - Does not force login.
-- - Does not enforce payment access yet.
-- - Does not add Meals, themes or Coach Dashboard.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  user_name text,
  account_email text,
  height_cm numeric,
  starting_weight_kg numeric,
  current_weight_kg numeric,
  target_weight_kg numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'clean_blue',
  units_system text not null default 'metric',
  hydration_auto boolean not null default true,
  hydration_target_litres numeric not null default 3.0,
  social_enabled boolean not null default true,
  photo_privacy text not null default 'local_only',
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('client','coach','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_key text not null default 'hearty_lifetime',
  status text not null default 'active' check (status in ('active','pending','revoked','expired')),
  source text,
  purchase_reference text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, entitlement_key)
);

create table if not exists public.grandfathered_customers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text generated always as (lower(trim(email))) stored,
  source text default 'manual',
  entitlement_key text not null default 'hearty_lifetime',
  status text not null default 'active' check (status in ('active','used','revoked')),
  purchase_reference text,
  notes text,
  claimed_by_user_id uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(email_normalized, entitlement_key)
);

create table if not exists public.access_recovery_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  purchase_email text,
  account_email text,
  user_id uuid references auth.users(id) on delete set null,
  reason text,
  status text not null default 'open' check (status in ('open','resolved','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.hearty_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['profiles','user_settings','user_roles','user_entitlements','grandfathered_customers','access_recovery_requests'] loop
    execute format('drop trigger if exists hearty_set_%I_updated_at on public.%I', t, t);
    execute format('create trigger hearty_set_%I_updated_at before update on public.%I for each row execute function public.hearty_set_updated_at()', t, t);
  end loop;
end $$;

create or replace function public.hearty_create_auth_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, account_email, user_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (user_id) do update set
    account_email = excluded.account_email,
    user_name = coalesce(public.profiles.user_name, excluded.user_name),
    updated_at = now();

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'client')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists hearty_on_auth_user_created on auth.users;
create trigger hearty_on_auth_user_created
after insert on auth.users
for each row execute function public.hearty_create_auth_profile();

create or replace function public.hearty_claim_grandfathered_access()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_customer public.grandfathered_customers%rowtype;
begin
  if v_user_id is null then
    return jsonb_build_object('claimed', false, 'reason', 'not_authenticated');
  end if;

  select lower(trim(email)) into v_email
  from auth.users
  where id = v_user_id;

  if v_email is null or length(v_email) = 0 then
    return jsonb_build_object('claimed', false, 'reason', 'no_email');
  end if;

  select *
  into v_customer
  from public.grandfathered_customers
  where email_normalized = v_email
    and status in ('active','used')
    and entitlement_key = 'hearty_lifetime'
  order by created_at asc
  limit 1;

  if not found then
    return jsonb_build_object('claimed', false, 'reason', 'no_match', 'email', v_email);
  end if;

  insert into public.user_entitlements (
    user_id,
    entitlement_key,
    status,
    source,
    purchase_reference,
    starts_at
  )
  values (
    v_user_id,
    v_customer.entitlement_key,
    'active',
    coalesce(v_customer.source, 'grandfathered'),
    v_customer.purchase_reference,
    now()
  )
  on conflict (user_id, entitlement_key)
  do update set
    status = 'active',
    source = coalesce(public.user_entitlements.source, excluded.source),
    purchase_reference = coalesce(public.user_entitlements.purchase_reference, excluded.purchase_reference),
    updated_at = now();

  update public.grandfathered_customers
  set status = 'used',
      claimed_by_user_id = v_user_id,
      claimed_at = coalesce(claimed_at, now()),
      updated_at = now()
  where id = v_customer.id;

  return jsonb_build_object(
    'claimed', true,
    'reason', 'matched_purchase_email',
    'email', v_email,
    'entitlement_key', v_customer.entitlement_key,
    'source', v_customer.source
  );
end;
$$;

grant execute on function public.hearty_claim_grandfathered_access() to authenticated;

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_entitlements enable row level security;
alter table public.grandfathered_customers enable row level security;
alter table public.access_recovery_requests enable row level security;

drop policy if exists "profiles_own_select" on public.profiles;
drop policy if exists "profiles_own_insert" on public.profiles;
drop policy if exists "profiles_own_update" on public.profiles;
create policy "profiles_own_select" on public.profiles for select to authenticated using (auth.uid() = user_id);
create policy "profiles_own_insert" on public.profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "profiles_own_update" on public.profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user_settings_own_select" on public.user_settings;
drop policy if exists "user_settings_own_insert" on public.user_settings;
drop policy if exists "user_settings_own_update" on public.user_settings;
create policy "user_settings_own_select" on public.user_settings for select to authenticated using (auth.uid() = user_id);
create policy "user_settings_own_insert" on public.user_settings for insert to authenticated with check (auth.uid() = user_id);
create policy "user_settings_own_update" on public.user_settings for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user_roles_own_select" on public.user_roles;
create policy "user_roles_own_select" on public.user_roles for select to authenticated using (auth.uid() = user_id);

drop policy if exists "user_entitlements_own_select" on public.user_entitlements;
create policy "user_entitlements_own_select" on public.user_entitlements for select to authenticated using (auth.uid() = user_id);

-- Do not expose the grandfather list to normal users.
drop policy if exists "grandfather_no_direct_user_select" on public.grandfathered_customers;

drop policy if exists "access_recovery_insert_anyone" on public.access_recovery_requests;
create policy "access_recovery_insert_anyone" on public.access_recovery_requests for insert to anon, authenticated with check (true);

drop policy if exists "access_recovery_own_select" on public.access_recovery_requests;
create policy "access_recovery_own_select" on public.access_recovery_requests for select to authenticated using (auth.uid() = user_id);

create index if not exists grandfathered_customers_email_idx on public.grandfathered_customers(email_normalized, entitlement_key, status);
create index if not exists user_entitlements_user_status_idx on public.user_entitlements(user_id, entitlement_key, status);
create index if not exists access_recovery_purchase_email_idx on public.access_recovery_requests(lower(purchase_email));
create index if not exists access_recovery_account_email_idx on public.access_recovery_requests(lower(account_email));

comment on table public.grandfathered_customers is
'Previous Hearty buyers who should keep lifetime access. Match by purchase email after account creation.';

comment on function public.hearty_claim_grandfathered_access() is
'Authenticated user claims lifetime access when auth.users.email matches grandfathered_customers.email_normalized.';

comment on table public.access_recovery_requests is
'Fallback for users whose purchase email and account email do not match.';
