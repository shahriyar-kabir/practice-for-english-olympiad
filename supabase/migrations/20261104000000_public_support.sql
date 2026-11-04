-- Public-support RPCs are callable only by the server-side service role.
-- The frontend receives a boolean account-status result, never Auth user rows.
-- Safe to rerun. Does not alter learner profiles, progress, or Auth settings.
begin;

create table if not exists public.public_support_rate_buckets (
  bucket_key text not null check (bucket_key ~ '^[a-f0-9]{64}$'),
  window_seconds integer not null check (window_seconds between 60 and 86400),
  window_start timestamptz not null,
  attempts integer not null default 0 check (attempts >= 0),
  primary key (bucket_key, window_seconds, window_start)
);
create index if not exists public_support_rate_buckets_expiry_idx
  on public.public_support_rate_buckets(window_start);
alter table public.public_support_rate_buckets enable row level security;
revoke all on public.public_support_rate_buckets from public, anon, authenticated, service_role;

create or replace function public.wizpiko_public_account_exists(p_email text)
returns boolean language plpgsql stable security definer set search_path = ''
as $$
declare normalized text := lower(trim(p_email));
begin
  if normalized is null or length(normalized) > 254
    or normalized !~ '^[^[:space:]@<>(),;:"\\]+@[^[:space:]@<>(),;:"\\]+\.[^[:space:]@<>(),;:"\\]+$' then
    raise exception 'Invalid email' using errcode = '22023';
  end if;
  return exists(select 1 from auth.users u where lower(u.email) = normalized);
end;
$$;
revoke all on function public.wizpiko_public_account_exists(text) from public, anon, authenticated;
grant execute on function public.wizpiko_public_account_exists(text) to service_role;

-- All quota dimensions are reserved together. Advisory locks serialize requests
-- even when their bucket rows do not exist yet. Locks use a consistent numeric
-- order so requests sharing several quota dimensions cannot deadlock.
create or replace function public.wizpiko_public_support_take_buckets(
  p_keys text[], p_limits integer[], p_windows integer[]
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  size integer := cardinality(p_keys);
  position integer;
  lock_id bigint;
  current_time_value timestamptz;
  starts timestamptz[] := '{}';
  used integer;
  retry_seconds integer := 0;
  bucket_deadline timestamptz;
begin
  if size is null or size not between 1 and 4
    or cardinality(p_limits) is distinct from size
    or cardinality(p_windows) is distinct from size then
    raise exception 'Invalid rate limit buckets' using errcode = '22023';
  end if;
  for position in 1..size loop
    if p_keys[position] is null or p_keys[position] !~ '^[a-f0-9]{64}$'
      or p_limits[position] is null or p_limits[position] not between 1 and 1000
      or p_windows[position] is null or p_windows[position] not between 60 and 86400 then
      raise exception 'Invalid rate limit buckets' using errcode = '22023';
    end if;
  end loop;
  if (select count(distinct (p_keys[n],p_windows[n])) from generate_series(1,size) n) <> size then
    raise exception 'Duplicate rate limit buckets' using errcode = '22023';
  end if;
  for lock_id in
    select distinct pg_catalog.hashtextextended(p_keys[n] || ':' || p_windows[n]::text, 523617)
      from generate_series(1,size) n order by 1
  loop
    perform pg_catalog.pg_advisory_xact_lock(lock_id);
  end loop;
  current_time_value := clock_timestamp();
  for position in 1..size loop
    starts[position] := to_timestamp(floor(extract(epoch from current_time_value) / p_windows[position]) * p_windows[position]);
    select attempts into used from public.public_support_rate_buckets
      where bucket_key = p_keys[position] and window_seconds = p_windows[position]
        and window_start = starts[position];
    if coalesce(used,0) >= p_limits[position] then
      bucket_deadline := starts[position] + make_interval(secs => p_windows[position]);
      retry_seconds := greatest(retry_seconds,
        greatest(1,ceil(extract(epoch from bucket_deadline-current_time_value))::integer));
    end if;
  end loop;
  if retry_seconds > 0 then
    return jsonb_build_object('allowed',false,'retry_after',retry_seconds);
  end if;
  -- Nothing is written until every quota dimension passes. A blocked IP cannot
  -- create arbitrary email bucket rows or partially consume another quota.
  for position in 1..size loop
    insert into public.public_support_rate_buckets(bucket_key,window_seconds,window_start,attempts)
      values(p_keys[position],p_windows[position],starts[position],1)
      on conflict (bucket_key,window_seconds,window_start) do update
        set attempts=public.public_support_rate_buckets.attempts+1;
  end loop;
  return jsonb_build_object('allowed',true,'retry_after',0);
end;
$$;
revoke all on function public.wizpiko_public_support_take_buckets(text[],integer[],integer[]) from public, anon, authenticated;
grant execute on function public.wizpiko_public_support_take_buckets(text[],integer[],integer[]) to service_role;

commit;
