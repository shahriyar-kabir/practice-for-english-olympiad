-- Wizpiko learner accounts and guardian email approval.
-- Run after student_progress.sql. Execute once in Supabase SQL Editor as a project administrator.
-- Protects PII and blocks under-10 learners from cloud progress access until approved.
create table if not exists public.learner_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Learner' check (char_length(display_name) between 2 and 40),
  birth_date date,
  avatar text not null default 'robot' check (avatar in ('girl','boy','robot','panda','cat')),
  guardian_email text,
  consent_status text not null default 'pending' check (consent_status in ('active','pending','verified')),
  consent_at timestamptz,
  preferences jsonb not null default '{"sound":true,"animation":true,"learning_tips":true}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.learner_profiles enable row level security;
revoke all on public.learner_profiles from anon, authenticated;
grant select on public.learner_profiles to authenticated;
grant update (display_name, avatar, preferences) on public.learner_profiles to authenticated;
drop policy if exists "learners read own profile" on public.learner_profiles;
drop policy if exists "learners edit safe profile fields" on public.learner_profiles;
create policy "learners read own profile" on public.learner_profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy "learners edit safe profile fields" on public.learner_profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- A new Supabase Auth account always receives a server-created profile. Never
-- allow the browser to set guardian consent status.
create or replace function public.wizpiko_new_learner()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare birth date; guardian text; learner_age integer; name text;
begin
  begin birth := (new.raw_user_meta_data->>'birth_date')::date;
  exception when others then birth := null; end;
  guardian := nullif(lower(trim(new.raw_user_meta_data->>'guardian_email')), '');
  name := left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), 'Learner'),40);
  if char_length(name)<2 then name:='Learner';end if;
  learner_age := case when birth is not null and birth <= current_date then
    extract(year from age(current_date, birth))::integer else null end;
  insert into public.learner_profiles(user_id,display_name,birth_date,guardian_email,consent_status)
  values(new.id, name, birth, guardian,
    case when learner_age is not null and learner_age >= 10 then 'active' else 'pending' end)
  on conflict (user_id) do nothing;
  return new;
end $$;
drop trigger if exists on_wizpiko_auth_created on auth.users;
create trigger on_wizpiko_auth_created after insert on auth.users
for each row execute function public.wizpiko_new_learner();

create table if not exists public.guardian_approvals (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  sent_to text not null,
  expires_at timestamptz not null,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists guardian_approvals_learner_idx on public.guardian_approvals (learner_id, created_at desc);
alter table public.guardian_approvals enable row level security;
revoke all on public.guardian_approvals from anon, authenticated;
-- Only the Supabase service role in the Edge Function may access tokens.

-- Prevent pending learner accounts from reading or writing cloud progress, even
-- when callers bypass the frontend. Legacy test accounts with no profile remain
-- usable until migrated; new accounts always have a server-created profile.
drop policy if exists "read own progress" on public.student_progress;
drop policy if exists "insert own progress" on public.student_progress;
drop policy if exists "update own progress" on public.student_progress;
create policy "read own progress" on public.student_progress for select to authenticated
  using (user_id=(select auth.uid()) and (
    not exists(select 1 from public.learner_profiles where user_id=(select auth.uid())) or
    exists(select 1 from public.learner_profiles where user_id=(select auth.uid()) and consent_status in ('active','verified'))
  ));
create policy "insert own progress" on public.student_progress for insert to authenticated
  with check (user_id=(select auth.uid()) and (
    not exists(select 1 from public.learner_profiles where user_id=(select auth.uid())) or
    exists(select 1 from public.learner_profiles where user_id=(select auth.uid()) and consent_status in ('active','verified'))
  ));
create policy "update own progress" on public.student_progress for update to authenticated
  using (user_id=(select auth.uid()) and (
    not exists(select 1 from public.learner_profiles where user_id=(select auth.uid())) or
    exists(select 1 from public.learner_profiles where user_id=(select auth.uid()) and consent_status in ('active','verified'))
  ))
  with check (user_id=(select auth.uid()) and (
    not exists(select 1 from public.learner_profiles where user_id=(select auth.uid())) or
    exists(select 1 from public.learner_profiles where user_id=(select auth.uid()) and consent_status in ('active','verified'))
  ));
-- After migrating all original test accounts, remove the 'not exists' legacy exception.
-- Before inviting real children, obtain qualified privacy/legal review for all
-- target markets; guardian email ownership alone may be insufficient consent.

-- Anonymous registration readiness probe. Discloses only whether the protected
-- profile trigger is installed; never exposes learner rows or emails.
create or replace function public.wizpiko_registration_ready()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists(select 1 from pg_catalog.pg_class where oid='public.learner_profiles'::regclass)
    and exists(select 1 from pg_catalog.pg_trigger
      where tgname='on_wizpiko_auth_created' and not tgisinternal);
$$;
revoke all on function public.wizpiko_registration_ready() from public;
grant execute on function public.wizpiko_registration_ready() to anon, authenticated;
