import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGuardianHandler, hashToken } from './handler.ts';
import type { Backend, Config } from './handler.ts';
import { createSupabaseBackend } from './supabase.ts';

const endpoint = 'https://project.supabase.co/functions/v1/guardian-consent';
const appOrigin = 'https://wizpiko.com';
const previewOrigin = 'https://preview--wizpiko.netlify.app';
const token = 'a'.repeat(64);
const config: Config = {
  supabaseUrl: 'https://project.supabase.co', serviceRoleKey: 'server-service-key',
  resendApiKey: 'server-resend-key', fromEmail: 'Wizpiko <guardian@wizpiko.com>',
  appOrigin, allowedOrigins: previewOrigin,
};
const reservation = {
  id: 'approval-id', guardian_email: 'guardian@example.com',
  display_name: 'Explorer <script>alert(1)</script>', expires_at: '2026-11-01T10:00:00.000Z',
};
function setup(overrides: Partial<Config> = {}) {
  const authenticate = vi.fn<Backend['authenticate']>().mockResolvedValue({ id: 'authenticated-learner' });
  const rpc = vi.fn<Backend['rpc']>().mockImplementation(async (name, args) => {
    if (name === 'guardian_consent_reserve') return reservation;
    if (name === 'guardian_consent_inspect') return { ok: true, display_name: reservation.display_name, expires_at: reservation.expires_at };
    if (name === 'guardian_consent_decide') return { ok: true, decision: String(args.p_decision) };
    return { ok: true };
  });
  const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => Response.json({ id: 'resend-email-id' }));
  const backend: Backend = { authenticate, rpc, fetch: fetcher };
  const handler = createGuardianHandler({ ...config, ...overrides }, backend);
  return { handler, authenticate, rpc, fetcher };
}
function sendRequest(body: unknown = { action: 'request' }, headers: Record<string, string> = {}) {
  return new Request(endpoint, {
    method: 'POST', headers: {
      Origin: appOrigin, apikey: 'public-browser-key', Authorization: 'Bearer learner-session',
      'Content-Type': 'application/json', ...headers,
    }, body: JSON.stringify(body),
  });
}
function decision(action: string, value = token, extra: Record<string, string> = {}) {
  return new Request(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://project.supabase.co' },
    body: new URLSearchParams({ action, token: value, ...extra }),
  });
}
afterEach(() => vi.restoreAllMocks());

describe('guardian-consent browser and authentication boundary', () => {
  it.each([appOrigin, previewOrigin])('allows explicit preflight origin %s without authentication or configured mail secrets', async allowedOrigin => {
    const { handler, rpc, authenticate, fetcher } = setup({ resendApiKey: '', serviceRoleKey: '' });
    const response = await handler(new Request(endpoint, {
      method: 'OPTIONS', headers: { Origin: allowedOrigin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization,apikey,content-type' },
    }));
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('authorization');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('apikey');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('content-type');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    expect(response.headers.get('Access-Control-Allow-Credentials')).toBeNull();
    expect(response.headers.get('Vary')).toContain('Origin');
    expect(await response.text()).toBe('');
    expect(rpc).not.toHaveBeenCalled(); expect(authenticate).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
  });
  it.each(['https://evil.example', 'https://wizpiko.com.evil.example', 'null'])('rejects hostile origin %s before database access', async hostileOrigin => {
    const { handler, rpc, authenticate } = setup();
    const response = await handler(sendRequest(undefined, { Origin: hostileOrigin }));
    expect(response.status).toBe(403);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
    expect(rpc).not.toHaveBeenCalled(); expect(authenticate).not.toHaveBeenCalled();
  });
  it('does not treat a wildcard preview setting as permission', async () => {
    const { handler } = setup({ allowedOrigins: '*' });
    const response = await handler(sendRequest(undefined, { Origin: previewOrigin }));
    expect(response.status).toBe(403);
  });
  it.each(['', 'Basic learner-session', 'Bearer one two'])('rejects malformed authorization %s', async authorization => {
    const { handler, authenticate, rpc } = setup();
    const response = await handler(sendRequest(undefined, { Authorization: authorization }));
    expect(response.status).toBe(401);
    expect(authenticate).not.toHaveBeenCalled(); expect(rpc).not.toHaveBeenCalled();
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(appOrigin);
  });
  it('rejects invalid, revoked or unconfirmed sessions without generating requests', async () => {
    const { handler, authenticate, rpc, fetcher } = setup();
    authenticate.mockResolvedValue(null);
    const response = await handler(sendRequest());
    expect(response.status).toBe(401);
    expect(authenticate).toHaveBeenCalledWith('learner-session');
    expect(rpc).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
  });
  it('pauses guardian requests when Supabase email confirmation is disabled', async () => {
    const { handler, authenticate, rpc, fetcher } = setup();
    authenticate.mockRejectedValue(new Error('email_confirmation_disabled'));
    const response = await handler(sendRequest());
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'email_confirmation_disabled', error: expect.any(String) });
    expect(rpc).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([
    { learner_id: 'someone-else' }, { guardian_email: 'attacker@example.com' },
    { consent_status: 'verified' }, { redirect_url: 'https://evil.example' },
  ])('rejects client authorization field %j', async injected => {
    const { handler, rpc } = setup();
    const response = await handler(sendRequest({ action: 'request', ...injected }));
    expect(response.status).toBe(400); expect(rpc).not.toHaveBeenCalled();
  });
  it('fails closed if server configuration is missing', async () => {
    const { handler, rpc } = setup({ serviceRoleKey: '' });
    const response = await handler(sendRequest());
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'not_configured' });
    expect(rpc).not.toHaveBeenCalled();
  });
  it.each([{ resendApiKey: '' }, { fromEmail: '' }])('does not reserve a token without mail configuration %j', async settings => {
    const { handler, rpc } = setup(settings);
    const response = await handler(sendRequest());
    expect(response.status).toBe(503); expect(rpc).not.toHaveBeenCalled();
  });
});

describe('sending and resending', () => {
  it('honors the live contract, derives the learner from Auth, hashes the token and sends only to the database recipient', async () => {
    const { handler, authenticate, rpc, fetcher } = setup();
    const response = await handler(sendRequest());
    expect(response.status).toBe(200);
    expect(authenticate).toHaveBeenCalledWith('learner-session');
    expect(await response.json()).toEqual({ ok: true, message: 'Guardian email sent.', expires_at: reservation.expires_at });
    expect(rpc.mock.calls[0][0]).toBe('guardian_consent_reserve');
    const args = rpc.mock.calls[0][1];
    expect(args.p_learner_id).toBe('authenticated-learner');
    expect(args.p_token_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, options] = fetcher.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(options?.headers).toMatchObject({ Authorization: 'Bearer server-resend-key', 'Idempotency-Key': 'guardian-consent/approval-id' });
    const mail = JSON.parse(String(options?.body));
    expect(mail.to).toEqual(['guardian@example.com']);
    expect(mail.from).toBe(config.fromEmail);
    const rawToken = /token=([a-f0-9]{64})/.exec(mail.html)?.[1];
    expect(rawToken).toHaveLength(64);
    expect(rawToken).not.toBe(args.p_token_hash);
    expect(await hashToken(rawToken!)).toBe(args.p_token_hash);
    expect(mail.html).toContain('Explorer &lt;script&gt;alert(1)&lt;/script&gt;');
    expect(mail.html).not.toContain('<script>');
    expect(mail.text).toContain('expires in 24 hours');
    expect(mail.html).toContain(appOrigin + '/#guardian-consent?token=' + rawToken);
    expect(mail.html).not.toContain(config.supabaseUrl);
    expect(JSON.stringify(mail)).not.toContain(config.resendApiKey);
    expect(JSON.stringify(rpc.mock.calls)).not.toContain(rawToken);
    expect(rpc).toHaveBeenLastCalledWith('guardian_consent_delivery', { p_id: reservation.id, p_sent: true });
  });
  it('creates distinct random tokens for separate allowed reservations', async () => {
    const { handler, fetcher } = setup();
    await handler(sendRequest()); await handler(sendRequest());
    const tokens = fetcher.mock.calls.map(([, options]) => /token=([a-f0-9]{64})/.exec(String(options?.body))?.[1]);
    expect(tokens.every(Boolean)).toBe(true); expect(tokens[0]).not.toBe(tokens[1]);
  });
  it.each([
    ['rate_limited', 429], ['rejected', 409], ['not_pending', 409], ['not_found', 403],
    ['invalid_guardian', 409], ['unconfirmed', 403],
  ])('returns meaningful %s rejection and never sends mail', async (code, status) => {
    const { handler, rpc, fetcher } = setup();
    rpc.mockResolvedValue({ code: String(code), retry_after: 321 });
    const response = await handler(sendRequest());
    expect(response.status).toBe(status);
    const body = await response.json();
    expect(body).toMatchObject({ code, error: expect.any(String), request_id: expect.any(String) });
    expect(fetcher).not.toHaveBeenCalled();
    expect(response.headers.get('Retry-After')).toBe(code === 'rate_limited' ? '321' : null);
  });
  it.each(['http', 'network', 'invalid_success'])('marks a failed %s delivery invalid and reports an actionable error', async failure => {
    const { handler, rpc, fetcher } = setup();
    if (failure === 'http') fetcher.mockResolvedValue(Response.json({ message: 'private provider error' }, { status: 429 }));
    if (failure === 'network') fetcher.mockRejectedValue(new Error('private network details'));
    if (failure === 'invalid_success') fetcher.mockResolvedValue(Response.json({}));
    const response = await handler(sendRequest());
    expect(response.status).toBe(502);
    expect(rpc).toHaveBeenLastCalledWith('guardian_consent_delivery', { p_id: reservation.id, p_sent: false });
    const body = await response.json();
    expect(body.code).toBe('email_delivery_failed'); expect(body.error).toContain('10 minutes');
    expect(JSON.stringify(body)).not.toContain('private');
  });
  it('does not claim delivery succeeded when persistence fails after Resend accepts', async () => {
    const { handler, rpc } = setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    rpc.mockImplementation(async name => { if (name === 'guardian_consent_reserve') return reservation; throw new Error('private DB detail'); });
    const response = await handler(sendRequest());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('private DB detail');
  });
});

describe('guardian review and decisions', () => {
  it('inspects a token through the public JSON API without authenticating or consuming it', async () => {
    const { handler, rpc, authenticate, fetcher } = setup();
    const response = await handler(sendRequest({ action: 'inspect', token }, { Authorization: '' }));
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(await response.json()).toEqual({ ok: true, display_name: reservation.display_name, expires_at: reservation.expires_at });
    expect(rpc).toHaveBeenCalledExactlyOnceWith('guardian_consent_inspect', { p_token_hash: await hashToken(token) });
    expect(authenticate).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
  });
  it.each(['approve', 'reject'])('supports explicit JSON %s decisions with the token as authority', async action => {
    const { handler, rpc, authenticate } = setup();
    const response = await handler(sendRequest({ action, token }, { Authorization: '' }));
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(await response.json()).toEqual({ ok: true, decision: action });
    expect(rpc).toHaveBeenCalledExactlyOnceWith('guardian_consent_decide', { p_token_hash: await hashToken(token), p_decision: action });
    expect(authenticate).not.toHaveBeenCalled();
  });
  it.each(['inspect', 'approve', 'reject'])('returns JSON errors for invalid %s JSON tokens', async action => {
    const { handler, rpc } = setup();
    const response = await handler(sendRequest({ action, token: 'bad' }, { Authorization: '' }));
    expect(response.status).toBe(400);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(await response.json()).toMatchObject({ error: expect.any(String), code: 'invalid_token' });
    expect(rpc).not.toHaveBeenCalled();
  });
  it.each(['inspect', 'approve', 'reject'])('returns JSON errors for expired %s JSON tokens', async action => {
    const { handler, rpc } = setup();
    rpc.mockResolvedValue({ code: 'expired' });
    const response = await handler(sendRequest({ action, token }, { Authorization: '' }));
    expect(response.status).toBe(410);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(await response.json()).toMatchObject({ error: expect.any(String), code: 'expired' });
  });
  it('GET only inspects a hash and requires a separate explicit approve or decline action', async () => {
    const { handler, rpc, authenticate, fetcher } = setup();
    const response = await handler(new Request(endpoint + '?token=' + token));
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledExactlyOnceWith('guardian_consent_inspect', { p_token_hash: await hashToken(token) });
    const page = await response.text();
    expect(page).toContain('value="approve"'); expect(page).toContain('value="reject"');
    expect(page).toContain('method="POST"'); expect(page).toContain('action="' + endpoint + '"');
    expect(page).toContain('Explorer &lt;script&gt;alert(1)&lt;/script&gt;');
    expect(page).not.toContain('<script>');
    expect(authenticate).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
    expect(response.headers.get('Content-Security-Policy')).toContain("form-action 'self'");
    expect(response.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  });
  it.each(['approve', 'reject'])('submits an explicit %s with the hashed token and no learner session', async action => {
    const { handler, rpc, authenticate } = setup();
    const response = await handler(decision(action));
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledExactlyOnceWith('guardian_consent_decide', { p_token_hash: await hashToken(token), p_decision: action });
    expect(authenticate).not.toHaveBeenCalled();
    expect(await response.text()).toContain(action === 'approve' ? 'Approval recorded' : 'learner account remains blocked');
  });
  it.each(['', 'short', 'A'.repeat(64), 'g'.repeat(64)])('rejects malformed token %s without database access', async invalid => {
    const { handler, rpc } = setup();
    const response = await handler(decision('approve', invalid));
    expect(response.status).toBe(400); expect(rpc).not.toHaveBeenCalled();
  });
  it.each([
    ['expired', 410], ['used', 409], ['guardian_changed', 409], ['rejected', 409],
    ['invalid_token', 400], ['delivery_pending', 409], ['not_pending', 409],
  ])('does not show approval success for %s tokens', async (code, status) => {
    const { handler, rpc } = setup();
    rpc.mockResolvedValue({ code: String(code) });
    const response = await handler(decision('approve'));
    expect(response.status).toBe(status);
    const page = await response.text();
    expect(page).not.toContain('Approval recorded'); expect(page).not.toContain('value="approve"');
  });
  it('does not expose a decision form for expired links', async () => {
    const { handler, rpc } = setup();
    rpc.mockResolvedValue({ code: 'expired' });
    const response = await handler(new Request(endpoint + '?token=' + token));
    expect(response.status).toBe(410); expect(await response.text()).not.toContain('<form');
  });
  it('rejects approval fields that attempt to select another learner', async () => {
    const { handler, rpc } = setup();
    const response = await handler(decision('approve', token, { learner_id: 'someone-else' }));
    expect(response.status).toBe(400); expect(rpc).not.toHaveBeenCalled();
  });
});

describe('unexpected database response shapes fail closed', () => {
  it.each([
    {}, { ok: true }, { ok: true, display_name: 42, expires_at: reservation.expires_at },
    { ok: true, display_name: 'Explorer', expires_at: 'invalid date' },
  ])('does not render or expose inspect data for malformed response %j', async result => {
    const { handler, rpc } = setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    rpc.mockResolvedValue(result as never);
    const response = await handler(sendRequest({ action: 'inspect', token }, { Authorization: '' }));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'temporarily_unavailable' });
  });
  it.each([{}, { ok: false, decision: 'approve' }, { ok: true }, { ok: true, decision: 'reject' }])('does not claim approval for malformed decision response %j', async result => {
    const { handler, rpc } = setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    rpc.mockResolvedValue(result);
    const response = await handler(sendRequest({ action: 'approve', token }, { Authorization: '' }));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'temporarily_unavailable' });
  });
  it.each([
    {}, { ...reservation, id: null }, { ...reservation, guardian_email: '' },
    { ...reservation, display_name: 42 }, { ...reservation, expires_at: 'invalid date' },
  ])('does not send email for malformed reservation %j', async result => {
    const { handler, rpc, fetcher } = setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    rpc.mockResolvedValue(result as never);
    const response = await handler(sendRequest());
    expect(response.status).toBe(503); expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([{}, { ok: false }])('does not claim delivery success for malformed delivery response %j', async result => {
    const { handler, rpc } = setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    rpc.mockImplementation(async name => name === 'guardian_consent_reserve' ? reservation : result);
    const response = await handler(sendRequest());
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'temporarily_unavailable' });
  });
});

describe('malformed input and sanitized failures', () => {
  it.each([
    ['{', 'application/json', 400], ['[]', 'application/json', 400],
    ['null', 'application/json', 400], ['action=request', 'text/plain', 415],
    ['action=approve&action=reject&token=' + token, 'application/x-www-form-urlencoded', 400],
    ['x'.repeat(4097), 'application/json', 413],
  ])('rejects malformed body type %s', async (body, contentType, status) => {
    const { handler, rpc } = setup();
    const response = await handler(new Request(endpoint, { method: 'POST', headers: { Origin: appOrigin, 'Content-Type': String(contentType) }, body: String(body) }));
    expect(response.status).toBe(status); expect(rpc).not.toHaveBeenCalled();
  });
  it('rejects unsupported methods with Allow header', async () => {
    const { handler, rpc } = setup();
    const response = await handler(new Request(endpoint, { method: 'DELETE' }));
    expect(response.status).toBe(405); expect(response.headers.get('Allow')).toContain('POST'); expect(rpc).not.toHaveBeenCalled();
  });
  it('sanitizes backend failures and logs only an opaque request ID', async () => {
    const { handler, rpc } = setup();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    rpc.mockRejectedValue(new Error('server-service-key guardian@example.com learner-session raw-token'));
    const response = await handler(sendRequest());
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toMatchObject({ code: 'temporarily_unavailable', request_id: response.headers.get('X-Request-Id') });
    const output = JSON.stringify([body, log.mock.calls]);
    for (const secret of ['server-service-key', 'guardian@example.com', 'learner-session', 'raw-token']) expect(output).not.toContain(secret);
  });
});

describe('server Supabase adapter', () => {
  it.each([
    [401, {}], [403, {}], [200, { id: 'learner', email_confirmed_at: null }],
    [200, { id: 'learner', email_confirmed_at: '2026-10-31', is_anonymous: true }],
  ])('rejects untrusted user responses %j %j', async (status, body) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(body, { status: Number(status) }));
    const adapter = createSupabaseBackend(config, fetcher);
    expect(await adapter.authenticate('forged-or-unconfirmed-jwt')).toBeNull();
    expect(fetcher).toHaveBeenCalledWith(config.supabaseUrl + '/auth/v1/user', expect.objectContaining({ headers: { apikey: config.serviceRoleKey, Authorization: 'Bearer forged-or-unconfirmed-jwt' } }));
    expect(fetcher).toHaveBeenCalledOnce();
  });
  it('uses the verified Auth user ID instead of decoding claims locally', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async url => Response.json(String(url).endsWith('/auth/v1/settings')
      ? { mailer_autoconfirm: false }
      : { id: 'auth-verified-user', email_confirmed_at: '2026-10-31' }));
    expect(await createSupabaseBackend(config, fetcher).authenticate('opaque-session')).toEqual({ id: 'auth-verified-user' });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenCalledWith(config.supabaseUrl + '/auth/v1/settings', expect.any(Object));
  });
  it.each([true, undefined])('rejects auto-confirmed or unknown email policy %s even if the user has confirmed_at', async autoconfirm => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async url => Response.json(String(url).endsWith('/auth/v1/settings')
      ? { mailer_autoconfirm: autoconfirm }
      : { id: 'auth-verified-user', email_confirmed_at: '2026-10-31' }));
    const adapter = createSupabaseBackend(config, fetcher);
    await expect(adapter.authenticate('opaque-session')).rejects.toThrow('email_confirmation_disabled');
    expect(fetcher.mock.calls.every(([url]) => !String(url).includes('/rest/'))).toBe(true);
  });
  it.each([true, undefined])('does not reserve or send when the live adapter observes autoconfirm %s', async autoconfirm => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async url => Response.json(String(url).endsWith('/auth/v1/settings')
      ? { mailer_autoconfirm: autoconfirm }
      : { id: 'auth-verified-user', email_confirmed_at: '2026-10-31' }));
    const response = await createGuardianHandler(config, createSupabaseBackend(config, fetcher))(sendRequest());
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'email_confirmation_disabled' });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls.every(([url]) => String(url).startsWith(config.supabaseUrl + '/auth/v1/'))).toBe(true);
  });
  it('uses service credentials only on server RPC requests', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ ok: true }));
    const adapter = createSupabaseBackend(config, fetcher);
    await adapter.rpc('guardian_consent_decide', { p_token_hash: await hashToken(token), p_decision: 'reject' });
    const [url, options] = fetcher.mock.calls[0];
    expect(url).toBe(config.supabaseUrl + '/rest/v1/rpc/guardian_consent_decide');
    expect(options?.headers).toMatchObject({ apikey: config.serviceRoleKey, Authorization: 'Bearer ' + config.serviceRoleKey });
    expect(JSON.parse(String(options?.body))).toEqual({ p_token_hash: await hashToken(token), p_decision: 'reject' });
  });
  it.each(['authenticate', 'rpc'] as const)('surfaces %s outages for sanitized handler errors', async operation => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ message: 'private SQL stack' }, { status: 500 }));
    const adapter = createSupabaseBackend(config, fetcher);
    const call = operation === 'authenticate' ? adapter.authenticate('session') : adapter.rpc('guardian_consent_inspect', {});
    await expect(call).rejects.toThrow(operation === 'authenticate' ? 'auth_unavailable' : 'database_unavailable');
  });
});
