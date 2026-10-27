-- Run once in the Supabase SQL Editor.
create table if not exists public.student_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{"legacy":{},"journey":{"records":{}}}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.student_progress enable row level security;
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
