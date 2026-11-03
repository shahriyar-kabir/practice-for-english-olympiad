-- Retire the optional guardian verification feature without changing Auth identity,
-- profile ownership, saved progress, or restricted guardian audit history.
-- Apply after student_progress.sql and learner_accounts.sql. This migration also
-- supports installations that applied the 20261031 guardian repair. Safe to rerun.
begin;

create or replace function public.wizpiko_new_learner_v2()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  birth date;
  birth_text text := new.raw_user_meta_data->>'birth_date';
  learner_name text;
  learner_avatar text := new.raw_user_meta_data->>'avatar';
begin
  -- Preserve a real supplied date; never invent a legacy learner's birthday.
  if birth_text ~ '^\d{4}-\d{2}-\d{2}$' then
    begin birth := birth_text::date;
    exception when others then birth := null; end;
  end if;
  if birth > current_date then birth := null; end if;
  learner_name := left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), 'Learner'), 40);
  if char_length(learner_name) < 2 then learner_name := 'Learner'; end if;
  if learner_avatar is null or learner_avatar not in ('girl','boy','robot','panda','cat') then
    learner_avatar := 'robot';
  end if;
  insert into public.learner_profiles(user_id,display_name,birth_date,avatar,guardian_email,consent_status)
    values(new.id,learner_name,birth,learner_avatar,null,'active')
    on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function public.wizpiko_new_learner_v2() from public, anon, authenticated;

drop trigger if exists on_wizpiko_auth_created on auth.users;
create trigger on_wizpiko_auth_created after insert on auth.users
for each row execute function public.wizpiko_new_learner_v2();

-- Activation is an account policy change, not a claim of guardian approval.
-- Do not fabricate consent_at or change stored guardian/rejection audit details.
alter table public.learner_profiles alter column consent_status set default 'active';
update public.learner_profiles set consent_status = 'active' where consent_status = 'pending';

-- Older accounts may predate the profile trigger. Preserve recorded metadata where
-- valid and leave unavailable DOB values NULL. Existing profile rows are untouched.
do $$
declare
  account record;
  birth date;
  birth_text text;
  learner_name text;
  learner_avatar text;
begin
  for account in select u.id, u.raw_user_meta_data from auth.users u
    where not exists(select 1 from public.learner_profiles p where p.user_id = u.id)
  loop
    birth := null;
    birth_text := account.raw_user_meta_data->>'birth_date';
    if birth_text ~ '^\d{4}-\d{2}-\d{2}$' then
      begin birth := birth_text::date;
      exception when others then birth := null; end;
    end if;
    if birth > current_date then birth := null; end if;
    learner_name := left(coalesce(nullif(trim(account.raw_user_meta_data->>'display_name'), ''), 'Learner'), 40);
    if char_length(learner_name) < 2 then learner_name := 'Learner'; end if;
    learner_avatar := account.raw_user_meta_data->>'avatar';
    if learner_avatar is null or learner_avatar not in ('girl','boy','robot','panda','cat') then
      learner_avatar := 'robot';
    end if;
    insert into public.learner_profiles(user_id,display_name,birth_date,avatar,guardian_email,consent_status)
      values(account.id,learner_name,birth,learner_avatar,null,'active')
      on conflict (user_id) do nothing;
  end loop;
end;
$$;

-- Retain exactly the original browser-editable profile fields and ownership RLS.
alter table public.learner_profiles enable row level security;
revoke all privileges on table public.learner_profiles from public, anon, authenticated;
grant select on public.learner_profiles to authenticated;
grant update (display_name,avatar,preferences) on public.learner_profiles to authenticated;
drop policy if exists "learners read own profile" on public.learner_profiles;
drop policy if exists "learners edit safe profile fields" on public.learner_profiles;
create policy "learners read own profile" on public.learner_profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy "learners edit safe profile fields" on public.learner_profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- No guardian-status gate remains. Every caller still needs its own protected
-- profile; neither anonymous callers nor another account can read/write progress.
alter table public.student_progress enable row level security;
revoke all privileges on table public.student_progress from public, anon, authenticated;
grant select,insert,update on public.student_progress to authenticated;
drop policy if exists "read own progress" on public.student_progress;
drop policy if exists "insert own progress" on public.student_progress;
drop policy if exists "update own progress" on public.student_progress;
create policy "read own progress" on public.student_progress for select to authenticated
  using (user_id = (select auth.uid()) and exists (
    select 1 from public.learner_profiles where user_id = (select auth.uid())
  ));
create policy "insert own progress" on public.student_progress for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.learner_profiles where user_id = (select auth.uid())
  ));
create policy "update own progress" on public.student_progress for update to authenticated
  using (user_id = (select auth.uid()) and exists (
    select 1 from public.learner_profiles where user_id = (select auth.uid())
  )) with check (user_id = (select auth.uid()) and exists (
    select 1 from public.learner_profiles where user_id = (select auth.uid())
  ));

-- The old probe only checked for any trigger. This version verifies the exact
-- release trigger and its implementation, and reveals no account/profile data.
-- Reinstalling an old trigger or changing the release function makes it false.
create or replace function public.wizpiko_registration_ready_v2()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists(
    select 1 from pg_catalog.pg_trigger t
      join pg_catalog.pg_proc p on p.oid = t.tgfoid
    where t.tgname = 'on_wizpiko_auth_created'
      and t.tgrelid = 'auth.users'::regclass
      and not t.tgisinternal and t.tgenabled in ('O','A')
      and t.tgtype = 5
      and t.tgfoid = 'public.wizpiko_new_learner_v2()'::regprocedure
      and p.prosecdef
      and p.proconfig = array['search_path=""']::text[]
      and pg_catalog.md5(p.prosrc) = 'ac63860fa4d8d4ccadcdb69b7af40762'
  );
$$;
revoke all on function public.wizpiko_registration_ready_v2() from public;
grant execute on function public.wizpiko_registration_ready_v2() to anon, authenticated;

commit;
