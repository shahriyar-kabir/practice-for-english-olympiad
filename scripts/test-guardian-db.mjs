// Disposable PostgreSQL integration environment. PGlite runs the actual SQL engine;
// only Supabase Auth's external schema/roles/UID setting are stubbed here.
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';

const database = new PGlite();
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
  for (const file of [
    'supabase/student_progress.sql',
    'supabase/learner_accounts.sql',
    'supabase/migrations/20261031000000_guardian_consent.sql',
    'supabase/tests/guardian_consent.sql',
  ]) {
    await database.exec(await readFile(new URL('../' + file, import.meta.url), 'utf8'));
    console.log('PASS ' + file);
  }
  console.log('Guardian consent SQL integration tests passed. Database discarded.');
} finally {
  await database.close();
}
