import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createGuardianHandler, hashToken } from './handler.ts';
import type { Backend, Config, RpcResult } from './handler.ts';

// Exercise the real handler and PostgreSQL RPCs together. Only external Auth
// validation and the email provider are replaced; all token and RLS decisions
// execute against the production migration in a disposable PostgreSQL engine.
const database = new PGlite();
const appOrigin = 'https://wizpiko.com';
const endpoint = 'https://project.supabase.co/functions/v1/guardian-consent';
const config: Config = {
  appOrigin, supabaseUrl: 'https://project.supabase.co', serviceRoleKey: 'test-service-secret',
  resendApiKey: 'test-resend-secret', fromEmail: 'Wizpiko <guardian@wizpiko.com>',
};
let nextId = 1;

beforeAll(async () => {
  await database.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    grant usage on schema auth, public to anon, authenticated, service_role;
    create table auth.users (
      id uuid primary key, email text, email_confirmed_at timestamptz,
      raw_user_meta_data jsonb
    );
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
  `);
  for (const relative of ['../../student_progress.sql', '../../learner_accounts.sql', '../../migrations/20261031000000_guardian_consent.sql']) {
    await database.exec(await readFile(new URL(relative, import.meta.url), 'utf8'));
  }
}, 30_000);
afterAll(async () => database.close());

async function seedLearner() {
  const suffix = String(nextId++).padStart(12, '0');
  const id = '00000000-0000-4000-8000-' + suffix;
  await database.query(`insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data)
    values($1,$2,clock_timestamp(),$3::jsonb)`, [id, 'learner' + suffix + '@example.com', JSON.stringify({
    display_name: 'Explorer ' + suffix, birth_date: '2020-02-10', guardian_email: 'guardian' + suffix + '@example.com',
  })]);
  return id;
}
async function profile(id: string) {
  return (await database.query<{ consent_status: string; consent_at: string | null; guardian_rejected_at: string | null }>(
    'select consent_status,consent_at,guardian_rejected_at from public.learner_profiles where user_id=$1', [id],
  )).rows[0];
}
async function progressAsLearner(id: string, write = false) {
  return database.transaction(async transaction => {
    await transaction.exec('set local role authenticated');
    await transaction.query("select set_config('request.jwt.claim.sub',$1,true)", [id]);
    if (write) await transaction.query(`insert into public.student_progress(user_id,payload) values($1,'{"approved":true}')
      on conflict(user_id) do update set payload=excluded.payload`, [id]);
    return (await transaction.query<{ user_id: string }>('select user_id from public.student_progress')).rows;
  });
}
async function approval(id: string) {
  return (await database.query<{ id: string; status: string; token_hash: string; consumed_at: string | null; approved_at: string | null }>(
    'select id,status,token_hash,consumed_at,approved_at from public.guardian_approvals where learner_id=$1 order by created_at desc limit 1', [id],
  )).rows[0];
}
function scenario(learnerId: string, failMail = false) {
  const messages: { html: string; text: string; to: string[] }[] = [];
  const rpc: Backend['rpc'] = async (name, args) => {
    const statements: Record<string, [string, unknown[]]> = {
      guardian_consent_reserve: ['select public.guardian_consent_reserve($1::uuid,$2::text) as result', [args.p_learner_id, args.p_token_hash]],
      guardian_consent_delivery: ['select public.guardian_consent_delivery($1::uuid,$2::boolean) as result', [args.p_id, args.p_sent]],
      guardian_consent_inspect: ['select public.guardian_consent_inspect($1::text) as result', [args.p_token_hash]],
      guardian_consent_decide: ['select public.guardian_consent_decide($1::text,$2::text) as result', [args.p_token_hash, args.p_decision]],
    };
    const statement = statements[name];
    if (!statement) throw new Error('Unexpected RPC');
    return database.transaction(async transaction => {
      await transaction.exec('set local role service_role');
      return (await transaction.query<{ result: RpcResult }>(statement[0], statement[1])).rows[0].result;
    });
  };
  const authenticate = vi.fn<Backend['authenticate']>().mockImplementation(async jwt => jwt === 'confirmed-learner-session' ? { id: learnerId } : null);
  const mail = vi.fn<typeof fetch>().mockImplementation(async (_url, options) => {
    messages.push(JSON.parse(String(options?.body)));
    return Response.json(failMail ? { message: 'provider failure' } : { id: crypto.randomUUID() }, { status: failMail ? 500 : 200 });
  });
  const handler = createGuardianHandler(config, { authenticate, rpc, fetch: mail });
  const post = (body: Record<string, unknown>) => handler(new Request(endpoint, {
    method: 'POST', headers: {
      Origin: appOrigin, apikey: 'public-browser-key', 'Content-Type': 'application/json',
      ...(body.action === 'request' ? { Authorization: 'Bearer confirmed-learner-session' } : {}),
    }, body: JSON.stringify(body),
  }));
  const latestToken = () => {
    const match = /https:\/\/wizpiko\.com\/#guardian-consent\?token=([a-f0-9]{64})/.exec(messages.at(-1)?.html || '');
    expect(match, 'email must contain the frontend fragment review link').not.toBeNull();
    return match![1];
  };
  return { post, messages, latestToken, authenticate };
}

describe('guardian handler with production SQL and RLS', () => {
  it('sends, reviews without consent, explicitly approves once, then permits only the learner’s own progress', async () => {
    const learnerId = await seedLearner();
    const otherId = await seedLearner();
    await database.query('insert into public.student_progress(user_id) values($1),($2)', [learnerId, otherId]);
    const flow = scenario(learnerId);
    expect((await profile(learnerId)).consent_status).toBe('pending');
    expect(await progressAsLearner(learnerId)).toEqual([]);
    await expect(progressAsLearner(learnerId, true)).rejects.toThrow(/row-level security/);

    expect((await flow.post({ action: 'request' })).status).toBe(200);
    const rawToken = flow.latestToken();
    const row = await approval(learnerId);
    expect(row.status).toBe('sent'); expect(row.consumed_at).toBeNull();
    expect(row.token_hash).toBe(await hashToken(rawToken)); expect(row.token_hash).not.toBe(rawToken);
    expect(flow.messages).toHaveLength(1);

    const review = await flow.post({ action: 'inspect', token: rawToken });
    expect(review.status).toBe(200);
    expect(await review.json()).toMatchObject({ ok: true, display_name: expect.stringContaining('Explorer'), expires_at: expect.any(String) });
    expect((await profile(learnerId)).consent_status).toBe('pending');
    expect((await approval(learnerId)).consumed_at).toBeNull();
    expect((await flow.post({ action: 'request' })).status).toBe(429);
    expect(flow.messages).toHaveLength(1);

    const accepted = await flow.post({ action: 'approve', token: rawToken });
    expect(accepted.status).toBe(200); expect(await accepted.json()).toEqual({ ok: true, decision: 'approve' });
    expect(await profile(learnerId)).toMatchObject({ consent_status: 'verified', consent_at: expect.anything(), guardian_rejected_at: null });
    expect(await approval(learnerId)).toMatchObject({ status: 'approved', consumed_at: expect.anything(), approved_at: expect.anything() });
    expect(await progressAsLearner(learnerId, true)).toEqual([{ user_id: learnerId }]);
    const replay = await flow.post({ action: 'approve', token: rawToken });
    expect(replay.status).toBe(409); expect(await replay.json()).toMatchObject({ code: 'used' });
  });

  it('resends after the cooldown, invalidating the previous token before issuing the replacement', async () => {
    const learnerId = await seedLearner();
    const flow = scenario(learnerId);
    expect((await flow.post({ action: 'request' })).status).toBe(200);
    const originalToken = flow.latestToken();
    await database.query("update public.guardian_approvals set created_at=clock_timestamp()-interval '11 minutes' where learner_id=$1", [learnerId]);
    expect((await flow.post({ action: 'request' })).status).toBe(200);
    const replacementToken = flow.latestToken();
    expect(replacementToken).not.toBe(originalToken); expect(flow.messages).toHaveLength(2);
    const oldReview = await flow.post({ action: 'inspect', token: originalToken });
    expect(oldReview.status).toBe(400); expect(await oldReview.json()).toMatchObject({ code: 'invalid_token' });
    expect((await flow.post({ action: 'approve', token: originalToken })).status).toBe(400);
    expect((await profile(learnerId)).consent_status).toBe('pending');
    expect((await flow.post({ action: 'inspect', token: replacementToken })).status).toBe(200);
    expect((await flow.post({ action: 'approve', token: replacementToken })).status).toBe(200);
    expect((await profile(learnerId)).consent_status).toBe('verified');
  });

  it('blocks expired inspection and approval, and permits a fresh request after the cooldown', async () => {
    const learnerId = await seedLearner();
    const flow = scenario(learnerId);
    expect((await flow.post({ action: 'request' })).status).toBe(200);
    const expiredToken = flow.latestToken();
    await database.query("update public.guardian_approvals set expires_at=clock_timestamp()-interval '1 second',created_at=clock_timestamp()-interval '11 minutes' where learner_id=$1", [learnerId]);
    for (const action of ['inspect', 'approve']) {
      const expired = await flow.post({ action, token: expiredToken });
      expect(expired.status).toBe(410); expect(await expired.json()).toMatchObject({ code: 'expired' });
    }
    expect((await profile(learnerId)).consent_status).toBe('pending');
    await expect(progressAsLearner(learnerId, true)).rejects.toThrow(/row-level security/);
    expect((await flow.post({ action: 'request' })).status).toBe(200);
    expect(flow.latestToken()).not.toBe(expiredToken);
    expect((await flow.post({ action: 'inspect', token: flow.latestToken() })).status).toBe(200);
  });

  it('records rejection atomically, keeps progress blocked and prevents both replay and resend', async () => {
    const learnerId = await seedLearner();
    const flow = scenario(learnerId);
    expect((await flow.post({ action: 'request' })).status).toBe(200);
    const rawToken = flow.latestToken();
    const rejected = await flow.post({ action: 'reject', token: rawToken });
    expect(rejected.status).toBe(200); expect(await rejected.json()).toEqual({ ok: true, decision: 'reject' });
    expect(await profile(learnerId)).toMatchObject({ consent_status: 'pending', consent_at: null, guardian_rejected_at: expect.anything() });
    expect(await approval(learnerId)).toMatchObject({ status: 'rejected', consumed_at: expect.anything(), approved_at: null });
    await expect(progressAsLearner(learnerId, true)).rejects.toThrow(/row-level security/);
    const replay = await flow.post({ action: 'approve', token: rawToken });
    expect(replay.status).toBe(409); expect(await replay.json()).toMatchObject({ code: 'used' });
    const resend = await flow.post({ action: 'request' });
    expect(resend.status).toBe(409); expect(await resend.json()).toMatchObject({ code: 'rejected' });
    expect(flow.messages).toHaveLength(1);
  });

  it('leaves failed email capabilities unusable while retaining the abuse cooldown', async () => {
    const learnerId = await seedLearner();
    const flow = scenario(learnerId, true);
    const response = await flow.post({ action: 'request' });
    expect(response.status).toBe(502); expect(await response.json()).toMatchObject({ code: 'email_delivery_failed' });
    expect((await approval(learnerId)).status).toBe('failed');
    const rawToken = flow.latestToken();
    expect((await flow.post({ action: 'approve', token: rawToken })).status).toBe(400);
    expect((await flow.post({ action: 'request' })).status).toBe(429);
    expect((await profile(learnerId)).consent_status).toBe('pending');
    expect(flow.messages).toHaveLength(1);
  });
});
