-- Run once in the Supabase SQL Editor.
create table if not exists public.student_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{"legacy":{},"journey":{"records":{}}}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.student_progress enable row level security;

-- Least privilege: guests receive no table access, and account owners only need
-- SELECT, INSERT and UPDATE (the application does not support direct DELETE).
revoke all privileges on table public.student_progress from anon, authenticated;
grant select, insert, update on table public.student_progress to authenticated;

drop policy if exists "read own progress" on public.student_progress;
drop policy if exists "insert own progress" on public.student_progress;
drop policy if exists "update own progress" on public.student_progress;
create policy "read own progress" on public.student_progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert own progress" on public.student_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own progress" on public.student_progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- Never disable RLS or use a service_role key in the browser.
