begin;

create schema if not exists schedsnap_creator;
revoke all on schema schedsnap_creator from public, anon, authenticated;

create table schedsnap_creator.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  verified_email text,
  provider text not null default 'google' check (provider = 'google'),
  first_seen_at timestamptz not null default now(),
  last_sign_in_at timestamptz
);

create table schedsnap_creator.artwork (
  id uuid primary key,
  owner_id uuid not null,
  created_at timestamptz not null default now(),
  delete_after timestamptz default (now() + interval '10 minutes'),
  deleted_at timestamptz
);
create index creator_artwork_owner_created on schedsnap_creator.artwork (owner_id, created_at desc);

create table schedsnap_creator.submissions (
  id uuid primary key,
  owner_id uuid not null,
  artwork_id uuid not null unique references schedsnap_creator.artwork(id),
  title text not null check (char_length(title) between 1 and 80),
  artist text not null check (char_length(artist) between 1 and 60),
  status text not null default 'in_review'
    check (status in ('in_review', 'needs_changes', 'published', 'declined')),
  revision uuid not null,
  review_note text,
  rights_accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index creator_submissions_owner_updated on schedsnap_creator.submissions (owner_id, updated_at desc);

alter table schedsnap_creator.profiles enable row level security;
alter table schedsnap_creator.artwork enable row level security;
alter table schedsnap_creator.submissions enable row level security;
revoke all on all tables in schema schedsnap_creator from public, anon, authenticated;

commit;
