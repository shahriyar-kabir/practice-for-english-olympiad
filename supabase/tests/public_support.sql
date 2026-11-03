-- Disposable PostgreSQL checks run by scripts/test-public-support.mjs only.
begin;
create function pg_temp.assert_true(value boolean,label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %',label; end if; end $$;
insert into auth.users(id,email) values
 ('00000000-0000-4000-a000-000000000001','Known@Example.com');

do $$
begin
  perform pg_temp.assert_true(not has_table_privilege('anon','auth.users','select'),'anonymous callers cannot read Auth users');
  perform pg_temp.assert_true(not has_table_privilege('authenticated','auth.users','select'),'learners cannot read Auth users');
  perform pg_temp.assert_true(not has_table_privilege('anon','public.public_support_rate_buckets','select'),'anonymous callers cannot read limiter buckets');
  perform pg_temp.assert_true(not has_table_privilege('authenticated','public.public_support_rate_buckets','insert'),'learners cannot alter limiter buckets');
  perform pg_temp.assert_true(not has_function_privilege('anon','public.wizpiko_public_account_exists(text)','execute'),'anonymous callers cannot invoke account lookup RPC');
  perform pg_temp.assert_true(not has_function_privilege('authenticated','public.wizpiko_public_account_exists(text)','execute'),'learners cannot invoke account lookup RPC');
  perform pg_temp.assert_true(not has_function_privilege('anon','public.wizpiko_public_support_take_buckets(text[],integer[],integer[])','execute'),'anonymous callers cannot reserve buckets');
  perform pg_temp.assert_true(not has_function_privilege('authenticated','public.wizpiko_public_support_take_buckets(text[],integer[],integer[])','execute'),'learners cannot reserve buckets');
  perform pg_temp.assert_true(has_function_privilege('service_role','public.wizpiko_public_account_exists(text)','execute'),'service role may perform boolean account lookup');
  perform pg_temp.assert_true(has_function_privilege('service_role','public.wizpiko_public_support_take_buckets(text[],integer[],integer[])','execute'),'service role may reserve quotas');
  perform pg_temp.assert_true((select relrowsecurity from pg_class where oid='public.public_support_rate_buckets'::regclass),'limiter table keeps RLS enabled');
end $$;

set local role service_role;
do $$
declare result jsonb;
begin
  perform pg_temp.assert_true(public.wizpiko_public_account_exists(' known@example.com '),'lookup normalizes email');
  perform pg_temp.assert_true(not public.wizpiko_public_account_exists('unknown@example.com'),'missing account is false');
  begin
    perform public.wizpiko_public_account_exists(E'person@example.com\r\nBcc: bad@example.com');
    raise exception 'FAIL: lookup accepted header-injected email';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.wizpiko_public_support_take_buckets(array['plain-email@example.com'],array[3],array[600]);
    raise exception 'FAIL: limiter stored unhashed identity';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.wizpiko_public_support_take_buckets(array[repeat('a',64),repeat('a',64)],array[3,3],array[600,600]);
    raise exception 'FAIL: duplicate quota dimensions accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.wizpiko_public_support_take_buckets(array[repeat('a',64)],array[3,3],array[600]);
    raise exception 'FAIL: malformed quota arrays accepted';
  exception when invalid_parameter_value then null; end;
  result:=public.wizpiko_public_support_take_buckets(array[repeat('a',64),repeat('b',64)],array[3,2],array[86400,86400]);
  perform pg_temp.assert_true(result->>'allowed'='true','first atomic quota reservation succeeds');
  result:=public.wizpiko_public_support_take_buckets(array[repeat('b',64),repeat('a',64)],array[2,3],array[86400,86400]);
  perform pg_temp.assert_true(result->>'allowed'='true','reversed quota order succeeds without double-counting');
  result:=public.wizpiko_public_support_take_buckets(array[repeat('a',64),repeat('b',64)],array[3,2],array[86400,86400]);
  perform pg_temp.assert_true(result->>'allowed'='false' and (result->>'retry_after')::integer between 1 and 86400,'exhausted quota reports retry interval');
  result:=public.wizpiko_public_support_take_buckets(array[repeat('c',64),repeat('b',64)],array[3,2],array[86400,86400]);
  perform pg_temp.assert_true(result->>'allowed'='false','shared email quota applies across different IP buckets');
end $$;
reset role;

do $$
begin
  perform pg_temp.assert_true((select count(*)=2 and min(attempts)=2 and max(attempts)=2 from public.public_support_rate_buckets),'blocked request neither consumes other quota nor creates unused identities');
  perform pg_temp.assert_true((select bool_and(bucket_key ~ '^[a-f0-9]{64}$') from public.public_support_rate_buckets),'stored rate identities contain hashes only');
end $$;

-- A stale bucket never blocks the next window. New rows use server time only.
insert into public.public_support_rate_buckets(bucket_key,window_seconds,window_start,attempts)
 values(repeat('d',64),600,to_timestamp(floor(extract(epoch from now())/600)*600)-interval '10 minutes',1000);
set local role service_role;
select pg_temp.assert_true(public.wizpiko_public_support_take_buckets(array[repeat('d',64)],array[1],array[600])->>'allowed'='true','expired buckets do not retain quota');
reset role;

set local role anon;
do $$
begin
  begin perform public.wizpiko_public_account_exists('known@example.com');
    raise exception 'FAIL: anonymous direct account lookup succeeded';
  exception when insufficient_privilege then null; end;
  begin perform public.wizpiko_public_support_take_buckets(array[repeat('f',64)],array[3],array[600]);
    raise exception 'FAIL: anonymous direct limiter access succeeded';
  exception when insufficient_privilege then null; end;
  begin perform * from auth.users;
    raise exception 'FAIL: anonymous Auth user read succeeded';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
