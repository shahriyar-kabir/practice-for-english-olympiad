-- Integration tests. Run only against a disposable database after the two
-- existing schema scripts and the guardian consent migration. All fixtures roll back.
begin;
create function pg_temp.assert_true(value boolean, label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %', label; end if; end $$;

insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
 ('00000000-0000-4000-a000-000000000001','learner-approve@example.test',now(),'{"display_name":"Approve Learner","birth_date":"2020-01-01","guardian_email":"guardian-approve@example.test"}'),
 ('00000000-0000-4000-a000-000000000002','learner-reject@example.test',now(),'{"display_name":"Reject Learner","birth_date":"2020-01-01","guardian_email":"guardian-reject@example.test"}'),
 ('00000000-0000-4000-a000-000000000003','learner-unconfirmed@example.test',null,'{"birth_date":"2020-01-01","guardian_email":"guardian-unconfirmed@example.test"}'),
 ('00000000-0000-4000-a000-000000000004','adult@example.test',now(),'{"birth_date":"1990-01-01"}'),
 ('00000000-0000-4000-a000-000000000005','same@example.test',now(),'{"birth_date":"2020-01-01","guardian_email":"same@example.test"}'),
 ('00000000-0000-4000-a000-000000000006','missing@example.test',now(),'{"birth_date":"2020-01-01","guardian_email":"guardian-missing@example.test"}'),
 ('00000000-0000-4000-a000-000000000007','expiry@example.test',now(),'{"birth_date":"2020-01-01","guardian_email":"guardian-expiry@example.test"}'),
 ('00000000-0000-4000-a000-000000000008','cap@example.test',now(),'{"birth_date":"2020-01-01","guardian_email":"guardian-cap@example.test"}'),
 ('00000000-0000-4000-a000-000000000009','recipient@example.test',now(),'{"birth_date":"2020-01-01","guardian_email":"recipient-cap@example.test"}');
delete from public.learner_profiles where user_id = '00000000-0000-4000-a000-000000000006';
-- Existing data must remain inaccessible before consent, including legacy rows.
insert into public.student_progress(user_id) values
 ('00000000-0000-4000-a000-000000000002'),
 ('00000000-0000-4000-a000-000000000006');

do $$
declare
  result jsonb;
  request_id uuid;
  token_one text := repeat('1',64);
  token_two text := repeat('2',64);
  token_three text := repeat('3',64);
  learner uuid := '00000000-0000-4000-a000-000000000001';
begin
  perform pg_temp.assert_true(public.guardian_consent_reserve(learner,'bad')->>'code'='invalid_token','malformed hash rejected');
  perform pg_temp.assert_true(public.guardian_consent_inspect(repeat('f',64))->>'code'='invalid_token','unknown token rejected');
  perform pg_temp.assert_true(public.guardian_consent_reserve('00000000-0000-4000-a000-000000000003',token_one)->>'code'='unconfirmed','unconfirmed learner cannot send');
  perform pg_temp.assert_true(public.guardian_consent_reserve('00000000-0000-4000-a000-000000000004',token_one)->>'code'='not_pending','adult cannot request');
  perform pg_temp.assert_true(public.guardian_consent_reserve('00000000-0000-4000-a000-000000000005',token_one)->>'code'='invalid_guardian','learner cannot self-approve');
  perform pg_temp.assert_true(public.guardian_consent_reserve('00000000-0000-4000-a000-000000000006',token_one)->>'code'='not_found','missing profile fails closed');

  result := public.guardian_consent_reserve(learner,token_one);
  request_id := (result->>'id')::uuid;
  perform pg_temp.assert_true(result->>'guardian_email'='guardian-approve@example.test','uses authoritative guardian email');
  perform pg_temp.assert_true((result->>'expires_at')::timestamptz between now()+interval '23 hours 59 minutes' and now()+interval '24 hours 1 minute','24 hour expiry');
  perform pg_temp.assert_true(public.guardian_consent_inspect(token_one)->>'code'='delivery_pending','reserved token unusable');
  perform pg_temp.assert_true(public.guardian_consent_decide(token_one,'approve')->>'code'='delivery_pending','unsent token cannot approve');
  perform pg_temp.assert_true(public.guardian_consent_delivery(request_id,false)->>'ok'='true','delivery failure recorded');
  perform pg_temp.assert_true(public.guardian_consent_inspect(token_one)->>'code'='invalid_token','failed delivery token unusable');
  result := public.guardian_consent_reserve(learner,token_two);
  perform pg_temp.assert_true(result->>'code'='rate_limited' and (result->>'retry_after')::integer between 1 and 600,'failed attempt counts against cooldown');
  update public.guardian_approvals set created_at=now()-interval '11 minutes' where id=request_id;
  result := public.guardian_consent_reserve(learner,token_two);
  request_id := (result->>'id')::uuid;
  perform pg_temp.assert_true(public.guardian_consent_delivery(request_id,true)->>'ok'='true','successful send recorded');
  perform pg_temp.assert_true(public.guardian_consent_inspect(token_two)->>'display_name'='Approve Learner','read-only guardian review');
  perform pg_temp.assert_true((select consent_status='pending' and consent_at is null from public.learner_profiles where user_id=learner),'review never approves');
  perform pg_temp.assert_true(public.guardian_consent_decide(token_two,'approve')->>'ok'='true','explicit approval succeeds');
  perform pg_temp.assert_true((select consent_status='verified' and consent_at is not null from public.learner_profiles where user_id=learner),'approval transitions profile');
  perform pg_temp.assert_true((select status='approved' and consumed_at is not null and approved_at is not null from public.guardian_approvals where id=request_id),'approval consumes token atomically');
  perform pg_temp.assert_true(public.guardian_consent_decide(token_two,'approve')->>'code'='used','approval replay blocked');
  perform pg_temp.assert_true(public.guardian_consent_decide(token_two,'reject')->>'code'='used','approve/reject race loser blocked');
  perform pg_temp.assert_true(public.guardian_consent_reserve(learner,token_three)->>'code'='not_pending','verified account cannot resend');

  learner := '00000000-0000-4000-a000-000000000002';
  result := public.guardian_consent_reserve(learner,token_three);
  request_id := (result->>'id')::uuid;
  perform public.guardian_consent_delivery(request_id,true);
  update public.guardian_approvals set created_at=now()-interval '11 minutes' where id=request_id;
  result := public.guardian_consent_reserve(learner,repeat('4',64));
  request_id := (result->>'id')::uuid;
  perform pg_temp.assert_true(public.guardian_consent_decide(token_three,'approve')->>'code'='invalid_token','resend invalidates old token');
  perform public.guardian_consent_delivery(request_id,true);
  perform pg_temp.assert_true(public.guardian_consent_decide(repeat('4',64),'reject')->>'ok'='true','guardian rejection succeeds');
  perform pg_temp.assert_true((select consent_status='pending' and consent_at is null and guardian_rejected_at is not null from public.learner_profiles where user_id=learner),'rejected learner stays blocked');
  perform pg_temp.assert_true((select status='rejected' and rejected_at is not null and consumed_at is not null from public.guardian_approvals where id=request_id),'rejection consumes token');
  perform pg_temp.assert_true(public.guardian_consent_reserve(learner,repeat('5',64))->>'code'='rejected','rejection cannot be undone by resend');
  perform pg_temp.assert_true(public.guardian_consent_decide(repeat('4',64),'approve')->>'code'='used','rejected token cannot approve');

  learner := '00000000-0000-4000-a000-000000000007';
  result := public.guardian_consent_reserve(learner,repeat('6',64));
  request_id := (result->>'id')::uuid;
  perform public.guardian_consent_delivery(request_id,true);
  update public.guardian_approvals set expires_at=now()-interval '1 second' where id=request_id;
  perform pg_temp.assert_true(public.guardian_consent_inspect(repeat('6',64))->>'code'='expired','expired review rejected');
  perform pg_temp.assert_true(public.guardian_consent_decide(repeat('6',64),'approve')->>'code'='expired','expired approval rejected');
  update public.guardian_approvals set expires_at=now()+interval '1 hour' where id=request_id;
  update public.learner_profiles set guardian_email='changed@example.test' where user_id=learner;
  perform pg_temp.assert_true(public.guardian_consent_decide(repeat('6',64),'approve')->>'code'='guardian_changed','changed guardian binding rejected');
  perform pg_temp.assert_true((select consent_status='pending' from public.learner_profiles where user_id=learner),'expiry and wrong email never approve');

  learner := '00000000-0000-4000-a000-000000000008';
  insert into public.guardian_approvals(learner_id,token_hash,sent_to,expires_at,created_at,status)
    select learner,md5(n::text)||md5(n::text),'guardian-cap@example.test',now()+interval '1 hour',now()-interval '1 hour','failed'
    from generate_series(1,5) n;
  perform pg_temp.assert_true(public.guardian_consent_reserve(learner,repeat('7',64))->>'code'='rate_limited','learner daily cap');
  insert into public.guardian_approvals(learner_id,token_hash,sent_to,expires_at,created_at,status)
    select learner,md5(('recipient'||n)::text)||md5(('recipient'||n)::text),'recipient-cap@example.test',now()+interval '1 hour',now()-interval '1 hour','failed'
    from generate_series(1,20) n;
  perform pg_temp.assert_true(public.guardian_consent_reserve('00000000-0000-4000-a000-000000000009',repeat('8',64))->>'code'='rate_limited','recipient daily cap across learners');

  perform pg_temp.assert_true(not has_table_privilege('authenticated','public.guardian_approvals','select'),'authenticated cannot read token hashes');
  perform pg_temp.assert_true(not has_table_privilege('anon','public.guardian_approvals','select'),'anonymous cannot read tokens');
  perform pg_temp.assert_true(not has_column_privilege('authenticated','public.learner_profiles','consent_status','update'),'learner cannot set consent');
  perform pg_temp.assert_true(not has_column_privilege('authenticated','public.learner_profiles','guardian_rejected_at','update'),'learner cannot clear rejection');
  perform pg_temp.assert_true(not has_column_privilege('authenticated','public.learner_profiles','guardian_email','update'),'learner cannot rebind guardian');
  perform pg_temp.assert_true(not has_column_privilege('authenticated','public.learner_profiles','birth_date','update'),'learner cannot edit age to bypass gate');
  perform pg_temp.assert_true((select bool_and(token_hash ~ '^[a-f0-9]{64}$') from public.guardian_approvals),'stored token identifiers have SHA-256 hex format');
  perform pg_temp.assert_true(not has_function_privilege('authenticated','public.guardian_consent_decide(text,text)','execute'),'authenticated cannot invoke privileged decision RPC');
  perform pg_temp.assert_true(not has_function_privilege('anon','public.guardian_consent_reserve(uuid,text)','execute'),'anonymous cannot invoke privileged request RPC');
  perform pg_temp.assert_true(has_function_privilege('service_role','public.guardian_consent_decide(text,text)','execute'),'service role may invoke decision');
end $$;

-- Exercise the actual existing progress RLS as a pending/rejected learner.
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000002',true);
set local role authenticated;
do $$
begin
  perform pg_temp.assert_true((select count(*)=1 from public.learner_profiles),'profile RLS isolates learner');
  perform pg_temp.assert_true((select count(*)=0 from public.student_progress),'pending learner cannot read progress');
  begin
    insert into public.student_progress(user_id) values('00000000-0000-4000-a000-000000000002');
    raise exception 'FAIL: rejected learner inserted progress';
  exception when insufficient_privilege then null; end;
  begin
    perform public.guardian_consent_decide(repeat('4',64),'approve');
    raise exception 'FAIL: authenticated invoked decision RPC';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000001',true);
set local role authenticated;
do $$
begin
  insert into public.student_progress(user_id) values('00000000-0000-4000-a000-000000000001');
  perform pg_temp.assert_true((select count(*)=1 from public.student_progress),'approved learner progress enabled');
  begin
    insert into public.student_progress(user_id) values('00000000-0000-4000-a000-000000000004');
    raise exception 'FAIL: approved learner accessed another account';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000006',true);
set local role authenticated;
do $$
declare changed integer;
begin
  perform pg_temp.assert_true((select count(*)=0 from public.student_progress),'missing profile cannot read legacy progress');
  update public.student_progress set payload='{}' where user_id='00000000-0000-4000-a000-000000000006';
  get diagnostics changed = row_count;
  perform pg_temp.assert_true(changed=0,'missing profile cannot update legacy progress');
  begin
    insert into public.student_progress(user_id) values('00000000-0000-4000-a000-000000000006');
    raise exception 'FAIL: missing-profile learner inserted progress';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
