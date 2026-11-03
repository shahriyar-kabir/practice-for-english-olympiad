-- READ ONLY. Run against the project used by the actual signup build before
-- applying the migration. Contains metadata only; no learner rows or secrets.
select table_schema, table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('learner_profiles','guardian_approvals','student_progress')
order by table_name, ordinal_position;

select c.relname, c.relrowsecurity, c.relforcerowsecurity
from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('learner_profiles','guardian_approvals','student_progress');

select tablename, policyname, roles, cmd, qual, with_check
from pg_catalog.pg_policies
where schemaname='public' and tablename in ('learner_profiles','guardian_approvals','student_progress')
order by tablename, policyname;

select table_name, grantee, privilege_type
from information_schema.table_privileges
where table_schema='public' and table_name in ('learner_profiles','guardian_approvals','student_progress')
order by table_name, grantee, privilege_type;

select table_name, column_name, grantee, privilege_type
from information_schema.column_privileges
where table_schema='public' and table_name='learner_profiles'
order by column_name, grantee, privilege_type;

select p.oid::regprocedure, p.prosecdef, p.proconfig, p.proacl, pg_catalog.pg_get_functiondef(p.oid)
from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and (p.proname like 'guardian_consent_%'
  or p.proname in ('wizpiko_new_learner','wizpiko_registration_ready'));

select t.tgname, pg_catalog.pg_get_triggerdef(t.oid)
from pg_catalog.pg_trigger t
where not t.tgisinternal and t.tgrelid='auth.users'::regclass;

select tablename, indexname, indexdef from pg_catalog.pg_indexes
where schemaname='public' and tablename='guardian_approvals';
