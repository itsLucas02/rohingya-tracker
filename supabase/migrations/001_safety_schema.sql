-- ============================================================
-- TrackX — Dedicated `safety` schema
-- Runs on the shared Blue Sun self-hosted Supabase stack.
-- Isolated from `public` (which other projects use).
-- No global auth.users trigger — profiles are created by the app.
-- ============================================================

create extension if not exists "pgcrypto";

create schema if not exists safety;

-- Expose to Supabase roles (RLS still governs row access).
grant usage on schema safety to anon, authenticated, service_role;

-- ---------- profiles ----------
create table if not exists safety.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  district text,
  created_at timestamptz not null default now()
);

-- ---------- reports ----------
create table if not exists safety.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references safety.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 140),
  description text not null check (char_length(description) between 1 and 4000),
  category text not null check (
    category in ('theft','vandalism','suspicious','hazard','lost_found','other')
  ),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  address text,
  status text not null default 'active' check (status in ('active','resolved','flagged','hidden')),
  photo_urls text[] not null default '{}',
  thumbnail_urls text[] not null default '{}',
  upvote_count int not null default 0,
  comment_count int not null default 0,
  flag_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_created_at_idx on safety.reports (created_at desc);
create index if not exists reports_category_idx on safety.reports (category);
create index if not exists reports_status_idx on safety.reports (status);
create index if not exists reports_geo_idx on safety.reports (latitude, longitude);
create index if not exists reports_user_idx on safety.reports (user_id);

-- ---------- comments ----------
create table if not exists safety.comments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references safety.reports(id) on delete cascade,
  user_id uuid not null references safety.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists comments_report_idx on safety.comments (report_id, created_at);

-- ---------- upvotes ----------
create table if not exists safety.upvotes (
  user_id uuid not null references safety.profiles(id) on delete cascade,
  report_id uuid not null references safety.reports(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, report_id)
);

-- ---------- notifications ----------
create table if not exists safety.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references safety.profiles(id) on delete cascade,
  type text not null check (type in ('new_report_nearby','comment','upvote')),
  report_id uuid references safety.reports(id) on delete cascade,
  actor_id uuid references safety.profiles(id) on delete set null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on safety.notifications (user_id, read, created_at desc);

-- ---------- flags ----------
create table if not exists safety.flags (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references safety.reports(id) on delete cascade,
  user_id uuid not null references safety.profiles(id) on delete cascade,
  reason text not null check (reason in ('spam','harassment','false_info','targets_group','other')),
  created_at timestamptz not null default now(),
  unique (report_id, user_id)
);

-- ============================================================
-- Triggers & functions (schema-local, SECURITY DEFINER)
-- ============================================================

create or replace function safety.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reports_touch_updated_at on safety.reports;
create trigger reports_touch_updated_at
  before update on safety.reports
  for each row execute function safety.touch_updated_at();

create or replace function safety.handle_upvote_change()
returns trigger
language plpgsql
security definer set search_path = safety
as $$
declare
  owner uuid;
begin
  if tg_op = 'INSERT' then
    update safety.reports set upvote_count = upvote_count + 1 where id = new.report_id;
    select user_id into owner from safety.reports where id = new.report_id;
    if owner is not null and owner <> new.user_id then
      insert into safety.notifications (user_id, type, report_id, actor_id)
      values (owner, 'upvote', new.report_id, new.user_id);
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    update safety.reports set upvote_count = greatest(upvote_count - 1, 0) where id = old.report_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists upvotes_change on safety.upvotes;
create trigger upvotes_change
  after insert or delete on safety.upvotes
  for each row execute function safety.handle_upvote_change();

create or replace function safety.handle_comment_change()
returns trigger
language plpgsql
security definer set search_path = safety
as $$
declare
  owner uuid;
begin
  if tg_op = 'INSERT' then
    update safety.reports set comment_count = comment_count + 1 where id = new.report_id;
    select user_id into owner from safety.reports where id = new.report_id;
    if owner is not null and owner <> new.user_id then
      insert into safety.notifications (user_id, type, report_id, actor_id)
      values (owner, 'comment', new.report_id, new.user_id);
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    update safety.reports set comment_count = greatest(comment_count - 1, 0) where id = old.report_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists comments_change on safety.comments;
create trigger comments_change
  after insert or delete on safety.comments
  for each row execute function safety.handle_comment_change();

create or replace function safety.handle_flag_insert()
returns trigger
language plpgsql
security definer set search_path = safety
as $$
declare
  total int;
begin
  update safety.reports
    set flag_count = flag_count + 1
    where id = new.report_id
    returning flag_count into total;

  if total >= 3 then
    update safety.reports set status = 'hidden' where id = new.report_id and status <> 'hidden';
  end if;
  return new;
end;
$$;

drop trigger if exists flags_insert on safety.flags;
create trigger flags_insert
  after insert on safety.flags
  for each row execute function safety.handle_flag_insert();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table safety.profiles      enable row level security;
alter table safety.reports        enable row level security;
alter table safety.comments       enable row level security;
alter table safety.upvotes        enable row level security;
alter table safety.notifications  enable row level security;
alter table safety.flags          enable row level security;

drop policy if exists profiles_select_all on safety.profiles;
create policy profiles_select_all on safety.profiles for select using (true);
drop policy if exists profiles_update_self on safety.profiles;
create policy profiles_update_self on safety.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists profiles_insert_self on safety.profiles;
create policy profiles_insert_self on safety.profiles for insert with check (auth.uid() = id);

drop policy if exists reports_select_visible on safety.reports;
create policy reports_select_visible on safety.reports for select using (status <> 'hidden' or auth.uid() = user_id);
drop policy if exists reports_insert_auth on safety.reports;
create policy reports_insert_auth on safety.reports for insert with check (auth.uid() = user_id);
drop policy if exists reports_update_owner on safety.reports;
create policy reports_update_owner on safety.reports for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists reports_delete_owner on safety.reports;
create policy reports_delete_owner on safety.reports for delete using (auth.uid() = user_id);

drop policy if exists comments_select_all on safety.comments;
create policy comments_select_all on safety.comments for select using (true);
drop policy if exists comments_insert_auth on safety.comments;
create policy comments_insert_auth on safety.comments for insert with check (auth.uid() = user_id);
drop policy if exists comments_delete_owner on safety.comments;
create policy comments_delete_owner on safety.comments for delete using (auth.uid() = user_id);

drop policy if exists upvotes_select_all on safety.upvotes;
create policy upvotes_select_all on safety.upvotes for select using (true);
drop policy if exists upvotes_insert_self on safety.upvotes;
create policy upvotes_insert_self on safety.upvotes for insert with check (auth.uid() = user_id);
drop policy if exists upvotes_delete_self on safety.upvotes;
create policy upvotes_delete_self on safety.upvotes for delete using (auth.uid() = user_id);

drop policy if exists notifications_select_own on safety.notifications;
create policy notifications_select_own on safety.notifications for select using (auth.uid() = user_id);
drop policy if exists notifications_update_own on safety.notifications;
create policy notifications_update_own on safety.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists flags_select_own on safety.flags;
create policy flags_select_own on safety.flags for select using (auth.uid() = user_id);
drop policy if exists flags_insert_self on safety.flags;
create policy flags_insert_self on safety.flags for insert with check (auth.uid() = user_id);

-- ============================================================
-- Grants (PostgREST needs table/sequence privileges; RLS gates rows)
-- ============================================================

grant all on all tables in schema safety to anon, authenticated, service_role;
grant all on all sequences in schema safety to anon, authenticated, service_role;

alter default privileges in schema safety grant all on tables to anon, authenticated, service_role;
alter default privileges in schema safety grant all on sequences to anon, authenticated, service_role;

-- ============================================================
-- Realtime (notification bell subscribes to inserts)
-- ============================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'safety'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table safety.notifications;
  end if;
end
$$;
