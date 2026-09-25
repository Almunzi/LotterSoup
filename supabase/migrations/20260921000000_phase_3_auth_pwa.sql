-- A subscriber can have more than one Stripe Customer record when Checkout
-- happened before account creation. Keep every payment identity attached to the
-- same verified Supabase user rather than discarding duplicate Stripe history.
create extension if not exists pgcrypto;

alter table public.stripe_customers
  drop constraint if exists stripe_customers_user_id_key;

create index if not exists stripe_customers_user_id_idx
  on public.stripe_customers (user_id);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

comment on table public.profiles is
  'Subscriber profile data. Authentication credentials remain managed by Supabase Auth.';

create table if not exists public.newsletter_issues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  excerpt text not null,
  image_path text not null,
  image_width integer not null default 1080 check (image_width > 0),
  image_height integer not null default 2410 check (image_height > 0),
  published_at timestamptz not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists newsletter_issues_published_idx
  on public.newsletter_issues (is_published, published_at desc);

alter table public.newsletter_issues enable row level security;

insert into public.newsletter_issues (
  slug, title, excerpt, image_path, image_width, image_height, published_at, is_published
) values (
  'weekly-lottery-update',
  'Your Weekly Lottery Update',
  'Powerball, Mega Millions, number trends, lottery news, and the weekly AI number generator.',
  '/weekly-newsletter.png',
  1080,
  2410,
  '2026-09-21 00:00:00+00',
  true
)
on conflict (slug) do nothing;

comment on table public.newsletter_issues is
  'Server-read subscriber issue archive. New published editions automatically appear in the PWA.';
