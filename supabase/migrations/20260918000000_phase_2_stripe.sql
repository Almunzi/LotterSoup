create extension if not exists pgcrypto;

create table if not exists public.stripe_customers (
  stripe_customer_id text primary key,
  user_id uuid unique references auth.users(id) on delete set null,
  email text,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stripe_customers_email_idx
  on public.stripe_customers (lower(email));

create table if not exists public.stripe_checkout_sessions (
  stripe_checkout_session_id text primary key,
  stripe_customer_id text references public.stripe_customers(stripe_customer_id) on delete set null,
  stripe_subscription_id text,
  customer_email text,
  plan_id text check (plan_id in ('weekly', 'monthly', 'annual')),
  status text not null check (status in ('complete', 'expired')),
  payment_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stripe_subscriptions (
  stripe_subscription_id text primary key,
  stripe_customer_id text not null references public.stripe_customers(stripe_customer_id) on delete cascade,
  stripe_price_id text,
  plan_id text check (plan_id in ('weekly', 'monthly', 'annual')),
  stripe_status text not null,
  access_status text not null check (access_status in ('active', 'cancelled', 'expired', 'failed')),
  last_payment_status text check (last_payment_status in ('paid', 'failed')),
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  canceled_at timestamptz,
  ended_at timestamptz,
  latest_invoice_id text,
  livemode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stripe_subscriptions_customer_idx
  on public.stripe_subscriptions (stripe_customer_id);

create index if not exists stripe_subscriptions_access_idx
  on public.stripe_subscriptions (access_status, current_period_end);

create table if not exists public.stripe_invoices (
  stripe_invoice_id text primary key,
  stripe_customer_id text references public.stripe_customers(stripe_customer_id) on delete set null,
  stripe_subscription_id text references public.stripe_subscriptions(stripe_subscription_id) on delete set null,
  stripe_status text,
  payment_status text not null check (payment_status in ('paid', 'failed')),
  amount_due bigint not null default 0,
  amount_paid bigint not null default 0,
  currency text not null,
  hosted_invoice_url text,
  invoice_pdf text,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stripe_invoices_subscription_idx
  on public.stripe_invoices (stripe_subscription_id);

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  livemode boolean not null default false,
  processed_at timestamptz not null default now()
);

alter table public.stripe_customers enable row level security;
alter table public.stripe_checkout_sessions enable row level security;
alter table public.stripe_subscriptions enable row level security;
alter table public.stripe_invoices enable row level security;
alter table public.stripe_webhook_events enable row level security;

comment on table public.stripe_customers is
  'Server-managed Stripe customer identities. Phase 3 links user_id after account creation.';
comment on table public.stripe_subscriptions is
  'Authoritative subscription and normalized access state synchronized from Stripe webhooks.';
comment on table public.stripe_webhook_events is
  'Processed Stripe events used for idempotent webhook delivery.';
