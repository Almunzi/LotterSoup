alter table public.newsletter_issues
  alter column image_path drop not null;

alter table public.newsletter_issues
  add column if not exists content_html text,
  add column if not exists thumbnail_url text,
  add column if not exists source text not null default 'local',
  add column if not exists mailchimp_campaign_id text,
  add column if not exists mailchimp_archive_url text;

create unique index if not exists newsletter_issues_mailchimp_campaign_idx
  on public.newsletter_issues (mailchimp_campaign_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'newsletter_issues_content_check'
      and conrelid = 'public.newsletter_issues'::regclass
  ) then
    alter table public.newsletter_issues
      add constraint newsletter_issues_content_check
      check (image_path is not null or nullif(btrim(content_html), '') is not null);
  end if;
end $$;

create table if not exists public.mailchimp_member_syncs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  member_hash text,
  mailchimp_status text,
  access_status text,
  plan_id text check (plan_id in ('weekly', 'monthly', 'annual')),
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mailchimp_member_syncs enable row level security;

comment on table public.mailchimp_member_syncs is
  'Server-only Mailchimp synchronization state. No client RLS policy is intentionally granted.';

comment on column public.newsletter_issues.content_html is
  'Sanitized HTML imported from a sent Mailchimp campaign for protected subscriber viewing.';
