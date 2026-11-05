-- Private, server-graded skill results and opt-in public certificates.
-- The browser never supplies a trusted score or writes these tables directly.
create schema if not exists wizpiko_learning;
revoke all on schema wizpiko_learning from public, anon, authenticated;
grant usage on schema wizpiko_learning to service_role;

create table if not exists wizpiko_learning.programs (
  subject text not null,
  level text not null,
  version integer not null check (version > 0),
  skills text[] not null check (cardinality(skills) between 1 and 30),
  questions_per_skill integer not null default 20 check (questions_per_skill = 20),
  pass_mark integer not null default 80 check (pass_mark = 80),
  primary key (subject, level, version)
);
create table if not exists wizpiko_learning.skill_results (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  level text not null,
  version integer not null,
  skill text not null,
  best_correct integer not null check (best_correct between 0 and 20),
  question_count integer not null default 20 check (question_count = 20),
  completed_at timestamptz not null default now(),
  primary key (user_id, subject, level, version, skill),
  foreign key (subject, level, version) references wizpiko_learning.programs(subject, level, version)
);
create table if not exists wizpiko_learning.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  level text not null,
  version integer not null,
  full_name text not null check (char_length(full_name) between 1 and 100 and full_name !~ '[[:cntrl:]<>]'),
  issued_at timestamptz not null default now(),
  skill_count integer not null check (skill_count > 0),
  question_count integer not null check (question_count > 0),
  pass_mark integer not null check (pass_mark = 80),
  public_token uuid unique,
  unique (user_id, subject, level, version),
  foreign key (subject, level, version) references wizpiko_learning.programs(subject, level, version)
);
alter table wizpiko_learning.programs enable row level security;
alter table wizpiko_learning.skill_results enable row level security;
alter table wizpiko_learning.certificates enable row level security;
revoke all on all tables in schema wizpiko_learning from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema wizpiko_learning to service_role;

insert into wizpiko_learning.programs(subject,level,version,skills)
select subject,level,2,case when subject='english'
  then array['sounds','vocabulary','grammar','reading','listening','writing']
  else array['numbers','fractions','algebra','geometry','data','reasoning'] end
from unnest(array['english','maths']) subject cross join unnest(array['starter','beginner','intermediate','advanced']) level
on conflict (subject,level,version) do nothing;

create or replace function public.wizpiko_learning_save_result(
  p_user uuid, p_subject text, p_level text, p_version integer, p_skill text, p_correct integer
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare programme wizpiko_learning.programs%rowtype; result wizpiko_learning.skill_results%rowtype;
begin
  select * into programme from wizpiko_learning.programs where subject=p_subject and level=p_level and version=p_version;
  if not found or not (p_skill=any(programme.skills)) or p_correct is null or p_correct<0 or p_correct>20 or p_user is null then
    raise exception 'invalid_skill_submission' using errcode='22023';
  end if;
  insert into wizpiko_learning.skill_results(user_id,subject,level,version,skill,best_correct)
  values(p_user,p_subject,p_level,p_version,p_skill,p_correct)
  on conflict(user_id,subject,level,version,skill) do update
    set best_correct=greatest(wizpiko_learning.skill_results.best_correct,excluded.best_correct),
        completed_at=case when excluded.best_correct>wizpiko_learning.skill_results.best_correct then now() else wizpiko_learning.skill_results.completed_at end
  returning * into result;
  return jsonb_build_object('subject',result.subject,'level',result.level,'version',result.version,'skill',result.skill,
    'correct',result.best_correct,'total',result.question_count,'score',result.best_correct*5,'completedAt',result.completed_at);
end;
$$;

create or replace function public.wizpiko_learning_list(p_user uuid)
returns jsonb language sql stable security invoker set search_path = '' as $$
select jsonb_build_object(
  'certificates',coalesce((select jsonb_agg(to_jsonb(c)-'user_id' order by c.issued_at desc) from wizpiko_learning.certificates c where c.user_id=p_user),'[]'::jsonb),
  'results',coalesce((select jsonb_agg(jsonb_build_object('subject',r.subject,'level',r.level,'version',r.version,'skill',r.skill,'correct',r.best_correct,'total',r.question_count,'score',r.best_correct*5,'completedAt',r.completed_at)) from wizpiko_learning.skill_results r where r.user_id=p_user),'[]'::jsonb),
  'qualifications',coalesce((select jsonb_agg(jsonb_build_object('subject',p.subject,'level',p.level,'version',p.version,
    'skillsPassed',q.passed,'skillCount',cardinality(p.skills),'eligible',q.passed=cardinality(p.skills)))
    from wizpiko_learning.programs p cross join lateral (
      select count(*)::integer passed from wizpiko_learning.skill_results r where r.user_id=p_user and r.subject=p.subject and r.level=p.level and r.version=p.version
        and r.skill=any(p.skills) and r.question_count=p.questions_per_skill and r.best_correct*100>=p.pass_mark*r.question_count
    ) q),'[]'::jsonb)
);
$$;

create or replace function public.wizpiko_learning_claim_certificate(
  p_user uuid, p_subject text, p_level text, p_version integer, p_full_name text
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare programme wizpiko_learning.programs%rowtype; passed integer; result wizpiko_learning.certificates%rowtype; certificate_name text;
begin
  certificate_name=trim(regexp_replace(p_full_name,'[[:space:]]+',' ','g'));
  if certificate_name is null or char_length(certificate_name) not between 1 and 100 or p_full_name ~ '[[:cntrl:]<>]' then
    raise exception 'full_name_required' using errcode='22023';
  end if;
  select * into programme from wizpiko_learning.programs where subject=p_subject and level=p_level and version=p_version;
  if not found then raise exception 'programme_not_found' using errcode='22023'; end if;
  select count(*) into passed from wizpiko_learning.skill_results where user_id=p_user and subject=p_subject and level=p_level and version=p_version
    and skill=any(programme.skills) and question_count=programme.questions_per_skill and best_correct*100>=programme.pass_mark*question_count;
  if passed<>cardinality(programme.skills) then raise exception 'level_not_qualified' using errcode='22023'; end if;
  insert into wizpiko_learning.certificates(user_id,subject,level,version,full_name,skill_count,question_count,pass_mark)
    values(p_user,p_subject,p_level,p_version,certificate_name,cardinality(programme.skills),cardinality(programme.skills)*programme.questions_per_skill,programme.pass_mark)
    on conflict(user_id,subject,level,version) do nothing;
  select * into result from wizpiko_learning.certificates where user_id=p_user and subject=p_subject and level=p_level and version=p_version;
  return to_jsonb(result)-'user_id';
end;
$$;

create or replace function public.wizpiko_learning_share_certificate(p_user uuid,p_certificate uuid,p_enabled boolean)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare result wizpiko_learning.certificates%rowtype;
begin
  if p_enabled is null then raise exception 'invalid_sharing_choice' using errcode='22023'; end if;
  update wizpiko_learning.certificates set public_token=case when p_enabled then coalesce(public_token,gen_random_uuid()) else null end
    where id=p_certificate and user_id=p_user returning * into result;
  if not found then raise exception 'certificate_not_found' using errcode='22023'; end if;
  return to_jsonb(result)-'user_id';
end;
$$;

-- Called only by the narrow, anonymous verification Edge Function. The browser
-- receives this explicit projection, never an account UUID, email or birth date.
create or replace function public.wizpiko_learning_public_certificate(p_token uuid)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object('id',id,'subject',subject,'level',level,'version',version,'full_name',full_name,'issued_at',issued_at,
    'skill_count',skill_count,'question_count',question_count,'pass_mark',pass_mark,'public_token',public_token)
  from wizpiko_learning.certificates where public_token=p_token and public_token is not null limit 1;
$$;

revoke all on function public.wizpiko_learning_save_result(uuid,text,text,integer,text,integer) from public,anon,authenticated;
revoke all on function public.wizpiko_learning_list(uuid) from public,anon,authenticated;
revoke all on function public.wizpiko_learning_claim_certificate(uuid,text,text,integer,text) from public,anon,authenticated;
revoke all on function public.wizpiko_learning_share_certificate(uuid,uuid,boolean) from public,anon,authenticated;
revoke all on function public.wizpiko_learning_public_certificate(uuid) from public,anon,authenticated;
grant execute on function public.wizpiko_learning_save_result(uuid,text,text,integer,text,integer) to service_role;
grant execute on function public.wizpiko_learning_list(uuid) to service_role;
grant execute on function public.wizpiko_learning_claim_certificate(uuid,text,text,integer,text) to service_role;
grant execute on function public.wizpiko_learning_share_certificate(uuid,uuid,boolean) to service_role;
grant execute on function public.wizpiko_learning_public_certificate(uuid) to service_role;
