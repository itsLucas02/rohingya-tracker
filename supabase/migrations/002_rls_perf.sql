-- ============================================================
-- TrackX — Performance migration
-- 1. Wrap auth.uid() in (select ...) so Postgres evaluates it
--    once per query instead of once per row (Supabase-documented
--    100x speedup on RLS-filtered scans).
-- 2. Add composite + partial indexes matching the app's hottest
--    query patterns: board (status,created_at) / trending, and
--    unread-notification counts.
-- 3. ANALYZE the touched tables so the planner picks the new
--    indexes immediately.
-- ============================================================

-- ---------------- RLS: reports ----------------
drop policy if exists reports_select_visible on safety.reports;
create policy reports_select_visible on safety.reports
  for select using (status <> 'hidden' or (select auth.uid()) = user_id);

drop policy if exists reports_insert_auth on safety.reports;
create policy reports_insert_auth on safety.reports
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists reports_update_owner on safety.reports;
create policy reports_update_owner on safety.reports
  for update using ((select auth.uid()) = user_id)
             with check ((select auth.uid()) = user_id);

drop policy if exists reports_delete_owner on safety.reports;
create policy reports_delete_owner on safety.reports
  for delete using ((select auth.uid()) = user_id);

-- ---------------- RLS: profiles ----------------
drop policy if exists profiles_update_self on safety.profiles;
create policy profiles_update_self on safety.profiles
  for update using ((select auth.uid()) = id)
             with check ((select auth.uid()) = id);

drop policy if exists profiles_insert_self on safety.profiles;
create policy profiles_insert_self on safety.profiles
  for insert with check ((select auth.uid()) = id);

-- ---------------- RLS: comments ----------------
drop policy if exists comments_insert_auth on safety.comments;
create policy comments_insert_auth on safety.comments
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists comments_delete_owner on safety.comments;
create policy comments_delete_owner on safety.comments
  for delete using ((select auth.uid()) = user_id);

-- ---------------- RLS: upvotes ----------------
drop policy if exists upvotes_insert_self on safety.upvotes;
create policy upvotes_insert_self on safety.upvotes
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists upvotes_delete_self on safety.upvotes;
create policy upvotes_delete_self on safety.upvotes
  for delete using ((select auth.uid()) = user_id);

-- ---------------- RLS: notifications ----------------
drop policy if exists notifications_select_own on safety.notifications;
create policy notifications_select_own on safety.notifications
  for select using ((select auth.uid()) = user_id);

drop policy if exists notifications_update_own on safety.notifications;
create policy notifications_update_own on safety.notifications
  for update using ((select auth.uid()) = user_id)
             with check ((select auth.uid()) = user_id);

-- ---------------- RLS: flags ----------------
drop policy if exists flags_select_own on safety.flags;
create policy flags_select_own on safety.flags
  for select using ((select auth.uid()) = user_id);

drop policy if exists flags_insert_self on safety.flags;
create policy flags_insert_self on safety.flags
  for insert with check ((select auth.uid()) = user_id);

-- ============================================================
-- Indexes
-- ============================================================

-- Board default: eq(status,'active').order(created_at desc) limit 20
create index if not exists reports_status_created_idx
  on safety.reports (status, created_at desc);

-- Board trending: eq(status,'active').order(upvote_count desc).order(created_at desc)
create index if not exists reports_status_trending_idx
  on safety.reports (status, upvote_count desc, created_at desc);

-- Category filter + newest
create index if not exists reports_status_category_created_idx
  on safety.reports (status, category, created_at desc);

-- Unread notification count (used on every layout render for authed users)
create index if not exists notifications_unread_partial_idx
  on safety.notifications (user_id) where read = false;

-- The old single-column status_idx and created_at_idx are now redundant with
-- the composite (status, created_at desc). Drop them to reduce write overhead.
drop index if exists safety.reports_status_idx;
drop index if exists safety.reports_created_at_idx;

-- Refresh planner stats so the new indexes are picked immediately.
analyze safety.reports;
analyze safety.notifications;
analyze safety.comments;
analyze safety.upvotes;
