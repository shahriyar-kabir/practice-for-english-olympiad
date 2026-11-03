-- Run through scripts/test-account-release.mjs, never against production. The
-- harness installs legacy fixtures before applying the release migration twice.
begin;
create function pg_temp.assert_true(value boolean,label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %',label; end if; end $$;

do $$
begin
  perform pg_temp.assert_true(public.wizpiko_registration_ready_v2(),'new account policy is ready');
  perform pg_temp.assert_true((select count(*)=7 from public.learner_profiles),'all legacy accounts have protected profiles');
  perform pg_temp.assert_true((select consent_status='active' and consent_at is null from public.learner_profiles
    where user_id='00000000-0000-4000-a000-000000000001'),'pending account activated without inventing consent');
  perform pg_temp.assert_true((select consent_status='verified' from public.learner_profiles
    where user_id='00000000-0000-4000-a000-000000000002'),'verified history retained');
  perform pg_temp.assert_true(not exists(select 1 from release_before_profiles b
    join public.learner_profiles p using(user_id) where b.fields is distinct from to_jsonb(p)-'consent_status'),
    'existing profile values, dates, preferences and guardian history unchanged');
  perform pg_temp.assert_true(not exists(
    (select fields from release_before_progress except select to_jsonb(p) from public.student_progress p)
    union all (select to_jsonb(p) from public.student_progress p except select fields from release_before_progress)),
    'saved progress payloads and timestamps retained');
  perform pg_temp.assert_true(not exists(
    (select fields from release_before_audits except select to_jsonb(a) from public.guardian_approvals a)
    union all (select to_jsonb(a) from public.guardian_approvals a except select fields from release_before_audits)),
    'guardian audit rows retained unchanged');
  perform pg_temp.assert_true((select display_name='Legacy nickname' and birth_date is null and avatar='cat'
    and consent_status='active' and guardian_email is null from public.learner_profiles
    where user_id='00000000-0000-4000-a000-000000000004'),'missing DOB is not invented');
  perform pg_temp.assert_true((select birth_date is null from public.learner_profiles
    where user_id='00000000-0000-4000-a000-000000000005'),'malformed legacy DOB remains unavailable');
  perform pg_temp.assert_true((select birth_date='2015-08-09'::date and avatar='panda' and display_name='Valid legacy'
    from public.learner_profiles where user_id='00000000-0000-4000-a000-000000000006'),'valid legacy metadata retained');
  perform pg_temp.assert_true((select birth_date is null and display_name='Learner' from public.learner_profiles
    where user_id='00000000-0000-4000-a000-000000000007'),'future DOB discarded and short nickname safely defaulted');
  perform pg_temp.assert_true(not has_table_privilege('anon','public.learner_profiles','select'),'anonymous profile access denied');
  perform pg_temp.assert_true(not has_table_privilege('anon','public.student_progress','select'),'anonymous progress access denied');
  perform pg_temp.assert_true(not has_table_privilege('authenticated','public.guardian_approvals','select'),'guardian audits remain restricted');
  perform pg_temp.assert_true(not has_column_privilege('authenticated','public.learner_profiles','birth_date','update'),'DOB remains server managed');
  perform pg_temp.assert_true(not has_column_privilege('authenticated','public.learner_profiles','consent_status','update'),'account status remains server managed');
  perform pg_temp.assert_true(not has_column_privilege('authenticated','public.learner_profiles','guardian_email','update'),'guardian history remains server managed');
  perform pg_temp.assert_true(not has_column_privilege('authenticated','public.learner_profiles','user_id','update'),'profile ownership cannot be reassigned');
  perform pg_temp.assert_true(has_column_privilege('authenticated','public.learner_profiles','display_name','update')
    and has_column_privilege('authenticated','public.learner_profiles','avatar','update')
    and has_column_privilege('authenticated','public.learner_profiles','preferences','update'),'safe profile editing retained');
end $$;

-- The server never trusts supplied guardian/consent metadata for new accounts.
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
 ('00000000-0000-4000-a000-000000000011','young@example.test',now(),'{"display_name":"Young learner","birth_date":"2020-01-01","guardian_email":"unused@example.test","consent_status":"verified"}'),
 ('00000000-0000-4000-a000-000000000012','new-adult@example.test',now(),'{"display_name":"New adult","birth_date":"1990-01-01"}'),
 ('00000000-0000-4000-a000-000000000013','missing-profile@example.test',now(),'{"display_name":"Missing profile","birth_date":"2020-01-01"}');
select pg_temp.assert_true((select bool_and(consent_status='active' and guardian_email is null and consent_at is null)
  from public.learner_profiles where user_id in ('00000000-0000-4000-a000-000000000011','00000000-0000-4000-a000-000000000012')),
  'new accounts of every age are active without guardian collection or fabricated consent');

-- A residual legacy status is no longer an authorization gate. Identity and the
-- presence of an owned protected profile still are.
update public.learner_profiles set consent_status='pending' where user_id='00000000-0000-4000-a000-000000000011';
insert into public.student_progress(user_id) values
 ('00000000-0000-4000-a000-000000000012'),('00000000-0000-4000-a000-000000000013');
delete from public.learner_profiles where user_id='00000000-0000-4000-a000-000000000013';
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000011',true);
set local role authenticated;
do $$
declare changed integer;
begin
  perform pg_temp.assert_true((select count(*)=1 from public.learner_profiles),'profile reads limited to caller');
  insert into public.student_progress(user_id,payload) values
    ('00000000-0000-4000-a000-000000000011','{"journey":{"records":{"vocabulary":{"xp":10}}}}');
  insert into public.student_progress(user_id,payload) values
    ('00000000-0000-4000-a000-000000000011','{"journey":{"records":{"vocabulary":{"xp":20}}}}')
    on conflict(user_id) do update set payload=excluded.payload;
  perform pg_temp.assert_true((select count(*)=1 and bool_and(payload#>>'{journey,records,vocabulary,xp}'='20')
    from public.student_progress),'under-10 learner reads and upserts only own progress without guardian status');
  begin
    insert into public.student_progress(user_id) values('00000000-0000-4000-a000-000000000003');
    raise exception 'FAIL: inserted another learners progress';
  exception when insufficient_privilege then null; end;
  update public.student_progress set payload='{}' where user_id='00000000-0000-4000-a000-000000000012';
  get diagnostics changed=row_count;
  perform pg_temp.assert_true(changed=0,'cross-account progress updates blocked');
  update public.learner_profiles set display_name='Updated nickname',avatar='panda',preferences='{"sound":false}'
    where user_id='00000000-0000-4000-a000-000000000011';
  get diagnostics changed=row_count;
  perform pg_temp.assert_true(changed=1,'safe own-profile updates succeed');
  update public.learner_profiles set display_name='Wrong learner' where user_id='00000000-0000-4000-a000-000000000012';
  get diagnostics changed=row_count;
  perform pg_temp.assert_true(changed=0,'cross-account profile updates blocked');
  begin
    update public.learner_profiles set birth_date='1990-01-01' where user_id='00000000-0000-4000-a000-000000000011';
    raise exception 'FAIL: changed protected DOB';
  exception when insufficient_privilege then null; end;
  begin
    update public.learner_profiles set consent_status='verified' where user_id='00000000-0000-4000-a000-000000000011';
    raise exception 'FAIL: changed protected status';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000013',true);
set local role authenticated;
do $$
declare changed integer;
begin
  perform pg_temp.assert_true((select count(*)=0 from public.student_progress),'missing profile cannot read progress');
  update public.student_progress set payload='{}' where user_id='00000000-0000-4000-a000-000000000013';
  get diagnostics changed=row_count;
  perform pg_temp.assert_true(changed=0,'missing profile cannot update progress');
  begin
    insert into public.student_progress(user_id) values('00000000-0000-4000-a000-000000000013')
      on conflict(user_id) do update set payload='{}';
    raise exception 'FAIL: missing-profile learner saved progress';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

set local role anon;
do $$
begin
  perform pg_temp.assert_true(public.wizpiko_registration_ready_v2(),'anonymous registration probe exposes only readiness');
  begin perform * from public.student_progress;
    raise exception 'FAIL: anonymous caller read progress';
  exception when insufficient_privilege then null; end;
  begin insert into public.student_progress(user_id) values('00000000-0000-4000-a000-000000000011');
    raise exception 'FAIL: anonymous caller wrote progress';
  exception when insufficient_privilege then null; end;
  begin perform * from public.guardian_approvals;
    raise exception 'FAIL: anonymous caller read guardian audits';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Regression: an old/disabled/replaced trigger must not advertise release readiness.
savepoint release_trigger;
drop trigger on_wizpiko_auth_created on auth.users;
create trigger on_wizpiko_auth_created after insert on auth.users
for each row execute function public.wizpiko_new_learner();
select pg_temp.assert_true(not public.wizpiko_registration_ready_v2(),'old guardian-based trigger is not release-ready');
rollback to savepoint release_trigger;
alter table auth.users disable trigger on_wizpiko_auth_created;
select pg_temp.assert_true(not public.wizpiko_registration_ready_v2(),'disabled trigger is not release-ready');
rollback to savepoint release_trigger;
create or replace function public.wizpiko_new_learner_v2()
returns trigger language plpgsql security definer set search_path = '' as $$ begin return new; end; $$;
select pg_temp.assert_true(not public.wizpiko_registration_ready_v2(),'modified trigger implementation is not release-ready');
rollback to savepoint release_trigger;
select pg_temp.assert_true(public.wizpiko_registration_ready_v2(),'correct release trigger remains ready');
rollback;
