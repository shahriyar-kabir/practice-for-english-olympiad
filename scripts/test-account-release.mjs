// Exercise the release SQL against real PostgreSQL in isolated, disposable
// PGlite databases. Auth roles/UID are the only Supabase-specific stubs.
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';

const migration = 'supabase/migrations/20261103000000_retire_guardian_verification.sql';
const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');

for (const repaired of [false, true]) {
  const database = new PGlite();
  const scenario = repaired ? 'guardian repair already installed' : 'baseline learner schema';
  try {
    await database.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      grant usage on schema auth, public to anon, authenticated, service_role;
      create table auth.users (
        id uuid primary key,
        email text,
        email_confirmed_at timestamptz,
        raw_user_meta_data jsonb
      );
      create function auth.uid() returns uuid language sql stable as $$
        select coalesce(
          nullif(current_setting('request.jwt.claim.sub', true), ''),
          (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
        )::uuid
      $$;
    `);
    await database.exec(await read('supabase/student_progress.sql'));
    await database.exec(await read('supabase/learner_accounts.sql'));
    if (repaired) await database.exec(await read('supabase/migrations/20261031000000_guardian_consent.sql'));
    await database.exec(`
      insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
        ('00000000-0000-4000-a000-000000000001','pending@example.test',now(),'{"display_name":"Pending learner","birth_date":"2020-01-01","guardian_email":"guardian@example.test"}'),
        ('00000000-0000-4000-a000-000000000002','verified@example.test',now(),'{"display_name":"Verified learner","birth_date":"2019-01-01"}'),
        ('00000000-0000-4000-a000-000000000003','adult@example.test',now(),'{"display_name":"Adult learner","birth_date":"1990-05-06"}'),
        ('00000000-0000-4000-a000-000000000004','legacy-missing@example.test',now(),'{"display_name":"Legacy nickname","avatar":"cat"}'),
        ('00000000-0000-4000-a000-000000000005','legacy-bad-date@example.test',now(),'{"display_name":"Malformed date","birth_date":"2020-02-30"}'),
        ('00000000-0000-4000-a000-000000000006','legacy-valid@example.test',now(),'{"display_name":"Valid legacy","birth_date":"2015-08-09","avatar":"panda"}'),
        ('00000000-0000-4000-a000-000000000007','legacy-future@example.test',now(),'{"display_name":"X","birth_date":"2999-01-01"}');
      update public.learner_profiles set consent_status='verified',consent_at='2026-10-01T12:00:00Z',
        avatar='girl',preferences='{"sound":false,"animation":true}'
        where user_id='00000000-0000-4000-a000-000000000002';
      delete from public.learner_profiles where user_id in (
        '00000000-0000-4000-a000-000000000004',
        '00000000-0000-4000-a000-000000000005',
        '00000000-0000-4000-a000-000000000006',
        '00000000-0000-4000-a000-000000000007');
      insert into public.student_progress(user_id,payload,updated_at) values
        ('00000000-0000-4000-a000-000000000001','{"legacy":{"animals":{"solved":["cat"],"hints":{}}},"journey":{"records":{"words":{"xp":12}}}}','2026-10-20T12:00:00Z'),
        ('00000000-0000-4000-a000-000000000004','{"legacy":{},"journey":{"records":{"spelling":{"xp":24}}}}','2026-10-21T12:00:00Z');
      insert into public.guardian_approvals(id,learner_id,token_hash,sent_to,expires_at,approved_at)
        values('00000000-0000-4000-b000-000000000001','00000000-0000-4000-a000-000000000001',repeat('a',64),'guardian@example.test','2026-11-05T12:00:00Z',null);
    `);
    if (repaired) await database.exec(`
      update public.learner_profiles set guardian_rejected_at='2026-10-25T12:00:00Z'
        where user_id='00000000-0000-4000-a000-000000000001';
    `);
    await database.exec(`
      create temporary table release_before_profiles as
        select user_id,to_jsonb(p)-'consent_status' as fields from public.learner_profiles p;
      create temporary table release_before_progress as select to_jsonb(p) as fields from public.student_progress p;
      create temporary table release_before_audits as select to_jsonb(a) as fields from public.guardian_approvals a;
    `);
    // A rerun must preserve the same profiles, progress, audits and grants.
    await database.exec(await read(migration));
    await database.exec(await read(migration));
    await database.exec(await read('supabase/tests/retire_guardian_verification.sql'));
    console.log('PASS account release: ' + scenario + ' (including migration rerun)');
  } finally {
    await database.close();
  }
}
console.log('Account release SQL/RLS tests passed. Disposable databases discarded.');
