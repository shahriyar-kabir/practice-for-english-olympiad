// Optional integration check using separate PostgreSQL connections in a disposable
// Docker container. It publishes no ports and never connects to Supabase.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID, createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const execute = promisify(execFile);
const containerName = 'wizpiko-guardian-test-' + randomUUID();
const dockerEnvironment = { ...process.env };
for (const key of ['DOCKER_HOST','DOCKER_CONTEXT','DOCKER_TLS','DOCKER_TLS_VERIFY','DOCKER_CERT_PATH']) {
  delete dockerEnvironment[key];
}
const docker = async (...args) => {
  const { stdout } = await execute('docker', ['--host=unix:///var/run/docker.sock', ...args], {
    env: dockerEnvironment, maxBuffer: 2 * 1024 * 1024,
  });
  return stdout.trim();
};
const sql = async statement => docker('exec', containerName, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-A', '-t', '-c', statement);
const hash = text => createHash('sha256').update(text).digest('hex');
const result = output => JSON.parse(output.split('\n').find(line => line.startsWith('RESULT:')).slice(7));
const race = async statements => Promise.all(statements.map(async statement => result(await sql(`
  begin;
  select pg_sleep(0.15);
  select 'RESULT:' || (${statement})::text;
  select pg_sleep(0.15);
  commit;
`))));
const learner = number => '00000000-0000-4000-b000-' + String(number).padStart(12, '0');
let started = false;
try {
  await docker('info', '--format', '{{.ServerVersion}}');
  await docker('run', '--detach', '--rm', '--name', containerName, '--network', 'none',
    '--tmpfs', '/var/lib/postgresql/data:rw', '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', 'postgres:17');
  started = true;
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { await sql('select 1'); ready = true; break; }
    catch { await new Promise(resolve => setTimeout(resolve, 500)); }
  }
  assert.ok(ready, 'disposable PostgreSQL did not become ready');
  await sql(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    grant usage on schema auth, public to anon, authenticated, service_role;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as $$
      select coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),
        nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid
    $$;
  `);
  for (const file of [
    'supabase/student_progress.sql', 'supabase/learner_accounts.sql',
    'supabase/migrations/20261031000000_guardian_consent.sql',
  ]) {
    await sql(await readFile(new URL('../' + file, import.meta.url), 'utf8'));
  }
  await sql(`insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
    ('${learner(1)}','race-learner@example.test',now(),'{"birth_date":"2020-01-01","guardian_email":"race-guardian@example.test"}'),
    ('${learner(2)}','recipient-a@example.test',now(),'{"birth_date":"2020-01-01","guardian_email":"recipient-guardian@example.test"}'),
    ('${learner(3)}','recipient-b@example.test',now(),'{"birth_date":"2020-01-01","guardian_email":"recipient-guardian@example.test"}'),
    ('${learner(4)}','history@example.test',now(),'{"birth_date":"2020-01-01","guardian_email":"history-guardian@example.test"}');`);

  const tokenA = hash('reservation race A');
  const tokenB = hash('reservation race B');
  const reservations = await race([
    `public.guardian_consent_reserve('${learner(1)}','${tokenA}')`,
    `public.guardian_consent_reserve('${learner(1)}','${tokenB}')`,
  ]);
  assert.equal(reservations.filter(value => value.id).length, 1, 'only one simultaneous reservation may pass');
  assert.equal(reservations.filter(value => value.code === 'rate_limited').length, 1, 'racing resend must observe cooldown');
  assert.equal(await sql(`select count(*) from public.guardian_approvals where learner_id='${learner(1)}'`), '1');
  console.log('PASS concurrent reservations enforce learner cooldown');

  const winnerIndex = reservations.findIndex(value => value.id);
  const winningToken = winnerIndex === 0 ? tokenA : tokenB;
  await sql(`select public.guardian_consent_delivery('${reservations[winnerIndex].id}',true)`);
  const decisions = await race([
    `public.guardian_consent_decide('${winningToken}','approve')`,
    `public.guardian_consent_decide('${winningToken}','reject')`,
  ]);
  const decision = decisions.find(value => value.ok);
  assert.equal(decisions.filter(value => value.ok).length, 1, 'only one decision commits');
  assert.equal(decisions.filter(value => value.code === 'used').length, 1, 'competing decision sees consumed token');
  const state = JSON.parse(await sql(`select jsonb_build_object('consent',p.consent_status,
    'rejected',p.guardian_rejected_at is not null,'status',a.status,'consumed',a.consumed_at is not null)
    from public.learner_profiles p join public.guardian_approvals a on a.learner_id=p.user_id
    where p.user_id='${learner(1)}'`));
  assert.deepEqual(state, decision.decision === 'approve'
    ? { consent: 'verified', rejected: false, status: 'approved', consumed: true }
    : { consent: 'pending', rejected: true, status: 'rejected', consumed: true });
  console.log('PASS competing approve/reject commits exactly one matching profile transition');

  await sql(`insert into public.guardian_approvals(learner_id,token_hash,sent_to,expires_at,created_at,status)
    select '${learner(4)}',md5('recipient-history-'||n)||md5('recipient-history-'||n),
      'recipient-guardian@example.test',now()+interval '1 hour',now()-interval '1 hour','failed'
    from generate_series(1,19) n`);
  const recipientReservations = await race([
    `public.guardian_consent_reserve('${learner(2)}','${hash('recipient race A')}')`,
    `public.guardian_consent_reserve('${learner(3)}','${hash('recipient race B')}')`,
  ]);
  assert.equal(recipientReservations.filter(value => value.id).length, 1, 'only one request may take the final recipient allowance');
  assert.equal(recipientReservations.filter(value => value.code === 'rate_limited').length, 1);
  assert.equal(await sql(`select count(*) from public.guardian_approvals where sent_to='recipient-guardian@example.test'`), '20');
  console.log('PASS competing learners cannot exceed recipient daily cap');
} finally {
  if (started) await docker('rm', '--force', containerName);
}
