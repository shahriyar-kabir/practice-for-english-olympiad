-- Apply after student_progress.sql and learner_accounts.sql, as project owner.
-- Existing unconsumed links are deliberately invalidated; ask learners to resend.
-- Progress access now requires a protected active/verified learner profile.
-- Legacy test accounts without profiles must receive an administrator-reviewed
-- profile migration before cloud sync resumes. Do not invent DOB or consent.
begin;

alter table public.learner_profiles
  add column guardian_rejected_at timestamptz;

alter table public.guardian_approvals
  add column status text not null default 'superseded'
    check (status in ('reserved','sent','failed','superseded','approved','rejected')),
  add column sent_at timestamptz,
  add column consumed_at timestamptz,
  add column rejected_at timestamptz;
update public.guardian_approvals
set status = 'approved', consumed_at = approved_at
where approved_at is not null;
alter table public.guardian_approvals alter column status set default 'reserved';
create index guardian_approvals_recipient_idx
  on public.guardian_approvals (sent_to, created_at desc);

-- Hashes, recipient addresses and lifecycle metadata never belong in browser APIs.
alter table public.guardian_approvals enable row level security;
revoke all on public.guardian_approvals from public, anon, authenticated;

create or replace function public.guardian_consent_reserve(p_learner_id uuid, p_token_hash text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  profile public.learner_profiles%rowtype;
  account_email text;
  confirmed_at timestamptz;
  recipient text;
  current_time_value timestamptz := clock_timestamp();
  latest_attempt timestamptz;
  oldest_attempt timestamptz;
  attempts bigint;
  approval_id uuid;
  deadline timestamptz;
begin
  if p_token_hash is null or p_token_hash !~ '^[a-f0-9]{64}$' then
    return jsonb_build_object('code', 'invalid_token');
  end if;
  -- One writer per learner; decisions acquire this same lock before token rows.
  select * into profile from public.learner_profiles
    where user_id = p_learner_id for update;
  if not found then return jsonb_build_object('code', 'not_found'); end if;
  if profile.guardian_rejected_at is not null then return jsonb_build_object('code', 'rejected'); end if;
  if profile.consent_status <> 'pending' then return jsonb_build_object('code', 'not_pending'); end if;
  select lower(trim(email)), email_confirmed_at into account_email, confirmed_at
    from auth.users where id = p_learner_id;
  if confirmed_at is null then return jsonb_build_object('code', 'unconfirmed'); end if;
  recipient := lower(trim(profile.guardian_email));
  if recipient is null or length(recipient) > 254
    or recipient !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or recipient = account_email then
    return jsonb_build_object('code', 'invalid_guardian');
  end if;
  -- Serialize recipient-wide limits even when many separate learners target it.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(recipient, 827163));
  current_time_value := clock_timestamp();
  select count(*), min(created_at), max(created_at) into attempts, oldest_attempt, latest_attempt
    from public.guardian_approvals
    where learner_id = p_learner_id and created_at > current_time_value - interval '24 hours';
  if latest_attempt > current_time_value - interval '10 minutes' then
    return jsonb_build_object('code', 'rate_limited', 'retry_after', greatest(1,
      ceil(extract(epoch from latest_attempt + interval '10 minutes' - current_time_value))::integer));
  end if;
  if attempts >= 5 then
    return jsonb_build_object('code', 'rate_limited', 'retry_after', greatest(1,
      ceil(extract(epoch from oldest_attempt + interval '24 hours' - current_time_value))::integer));
  end if;
  select count(*), min(created_at) into attempts, oldest_attempt from public.guardian_approvals
    where sent_to = recipient and created_at > current_time_value - interval '24 hours';
  if attempts >= 20 then
    return jsonb_build_object('code', 'rate_limited', 'retry_after', greatest(1,
      ceil(extract(epoch from oldest_attempt + interval '24 hours' - current_time_value))::integer));
  end if;
  -- A resend rotates the capability immediately. Failed deliveries never create
  -- usable tokens, but still count toward abuse limits.
  update public.guardian_approvals set status = 'superseded'
    where learner_id = p_learner_id and status in ('reserved', 'sent');
  deadline := current_time_value + interval '24 hours';
  insert into public.guardian_approvals(learner_id,token_hash,sent_to,expires_at,created_at,status)
    values(p_learner_id,p_token_hash,recipient,deadline,current_time_value,'reserved')
    returning id into approval_id;
  return jsonb_build_object('id',approval_id,'display_name',profile.display_name,
    'guardian_email',recipient,'expires_at',deadline);
end;
$$;

create or replace function public.guardian_consent_delivery(p_id uuid, p_sent boolean)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  approval public.guardian_approvals%rowtype;
  profile public.learner_profiles%rowtype;
  learner uuid;
  current_time_value timestamptz := clock_timestamp();
begin
  select learner_id into learner from public.guardian_approvals where id = p_id;
  if not found then return jsonb_build_object('code','not_found'); end if;
  select * into profile from public.learner_profiles where user_id = learner for update;
  select * into approval from public.guardian_approvals where id = p_id for update;
  current_time_value := clock_timestamp();
  if approval.status <> 'reserved' then return jsonb_build_object('code','used'); end if;
  if profile.user_id is null or profile.consent_status <> 'pending'
    or profile.guardian_rejected_at is not null
    or lower(trim(profile.guardian_email)) is distinct from approval.sent_to then
    update public.guardian_approvals set status = 'superseded' where id = p_id;
    return jsonb_build_object('code','not_pending');
  end if;
  if approval.expires_at <= current_time_value then
    update public.guardian_approvals set status = 'failed' where id = p_id;
    return jsonb_build_object('code','expired');
  end if;
  update public.guardian_approvals
    set status = case when p_sent is true then 'sent' else 'failed' end,
      sent_at = case when p_sent is true then current_time_value else null end
    where id = p_id;
  return jsonb_build_object('ok',true);
end;
$$;

create or replace function public.guardian_consent_inspect(p_token_hash text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare approval public.guardian_approvals%rowtype; profile public.learner_profiles%rowtype;
begin
  if p_token_hash is null or p_token_hash !~ '^[a-f0-9]{64}$' then
    return jsonb_build_object('code','invalid_token');
  end if;
  select * into approval from public.guardian_approvals where token_hash = p_token_hash;
  if not found then return jsonb_build_object('code','invalid_token'); end if;
  if approval.consumed_at is not null or approval.status in ('approved','rejected') then
    return jsonb_build_object('code','used');
  end if;
  if approval.status in ('failed','superseded') then return jsonb_build_object('code','invalid_token'); end if;
  if approval.expires_at <= clock_timestamp() then return jsonb_build_object('code','expired'); end if;
  if approval.status = 'reserved' then return jsonb_build_object('code','delivery_pending'); end if;
  select * into profile from public.learner_profiles where user_id = approval.learner_id;
  if not found then return jsonb_build_object('code','invalid_token'); end if;
  if lower(trim(profile.guardian_email)) is distinct from approval.sent_to then
    return jsonb_build_object('code','guardian_changed');
  end if;
  if profile.guardian_rejected_at is not null then return jsonb_build_object('code','rejected'); end if;
  if profile.consent_status <> 'pending' then return jsonb_build_object('code','not_pending'); end if;
  return jsonb_build_object('display_name',profile.display_name,'expires_at',approval.expires_at);
end;
$$;

create or replace function public.guardian_consent_decide(p_token_hash text, p_decision text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  approval public.guardian_approvals%rowtype;
  profile public.learner_profiles%rowtype;
  learner uuid;
  current_time_value timestamptz := clock_timestamp();
begin
  if p_decision is null or p_decision not in ('approve','reject') then
    return jsonb_build_object('code','invalid_decision');
  end if;
  if p_token_hash is null or p_token_hash !~ '^[a-f0-9]{64}$' then
    return jsonb_build_object('code','invalid_token');
  end if;
  select learner_id into learner from public.guardian_approvals where token_hash = p_token_hash;
  if not found then return jsonb_build_object('code','invalid_token'); end if;
  select * into profile from public.learner_profiles where user_id = learner for update;
  select * into approval from public.guardian_approvals where token_hash = p_token_hash for update;
  current_time_value := clock_timestamp();
  if approval.consumed_at is not null or approval.status in ('approved','rejected') then
    return jsonb_build_object('code','used');
  end if;
  if approval.status in ('failed','superseded') then return jsonb_build_object('code','invalid_token'); end if;
  if approval.expires_at <= current_time_value then return jsonb_build_object('code','expired'); end if;
  if approval.status = 'reserved' then return jsonb_build_object('code','delivery_pending'); end if;
  if profile.user_id is null then return jsonb_build_object('code','invalid_token'); end if;
  if lower(trim(profile.guardian_email)) is distinct from approval.sent_to then
    return jsonb_build_object('code','guardian_changed');
  end if;
  if profile.guardian_rejected_at is not null then return jsonb_build_object('code','rejected'); end if;
  if profile.consent_status <> 'pending' then return jsonb_build_object('code','not_pending'); end if;
  -- Profile transition and capability consumption commit together. A competing
  -- approve/reject/resend must wait for the profile lock and cannot reuse it.
  if p_decision = 'approve' then
    update public.learner_profiles set consent_status = 'verified', consent_at = current_time_value
      where user_id = learner;
    update public.guardian_approvals set status = 'approved', consumed_at = current_time_value,
      approved_at = current_time_value where id = approval.id;
  else
    -- Preserve pending so the existing frontend and progress RLS stay blocked.
    update public.learner_profiles set guardian_rejected_at = current_time_value
      where user_id = learner;
    update public.guardian_approvals set status = 'rejected', consumed_at = current_time_value,
      rejected_at = current_time_value where id = approval.id;
  end if;
  update public.guardian_approvals set status = 'superseded'
    where learner_id = learner and id <> approval.id and status in ('reserved','sent');
  return jsonb_build_object('ok',true,'decision',p_decision);
end;
$$;

revoke all on function public.guardian_consent_reserve(uuid,text) from public, anon, authenticated;
revoke all on function public.guardian_consent_delivery(uuid,boolean) from public, anon, authenticated;
revoke all on function public.guardian_consent_inspect(text) from public, anon, authenticated;
revoke all on function public.guardian_consent_decide(text,text) from public, anon, authenticated;
grant execute on function public.guardian_consent_reserve(uuid,text) to service_role;
grant execute on function public.guardian_consent_delivery(uuid,boolean) to service_role;
grant execute on function public.guardian_consent_inspect(text) to service_role;
grant execute on function public.guardian_consent_decide(text,text) to service_role;
-- Close the legacy missing-profile exception. A missing protected profile must
-- fail closed even when a client calls PostgREST directly.
drop policy if exists "read own progress" on public.student_progress;
drop policy if exists "insert own progress" on public.student_progress;
drop policy if exists "update own progress" on public.student_progress;
create policy "read own progress" on public.student_progress for select to authenticated
  using (user_id = (select auth.uid()) and exists (
    select 1 from public.learner_profiles where user_id = (select auth.uid())
      and consent_status in ('active','verified')
  ));
create policy "insert own progress" on public.student_progress for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.learner_profiles where user_id = (select auth.uid())
      and consent_status in ('active','verified')
  ));
create policy "update own progress" on public.student_progress for update to authenticated
  using (user_id = (select auth.uid()) and exists (
    select 1 from public.learner_profiles where user_id = (select auth.uid())
      and consent_status in ('active','verified')
  ))
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.learner_profiles where user_id = (select auth.uid())
      and consent_status in ('active','verified')
  ));

commit;
