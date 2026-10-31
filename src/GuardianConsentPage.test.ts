import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const token = 'a'.repeat(64);
const details = { ok: true, display_name: 'Explorer', expires_at: '2026-11-01T12:00:00Z' };
let guardian: typeof import('./GuardianConsentPage');
let request: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'public-publishable-key');
  request = vi.fn();
  vi.stubGlobal('fetch', request);
  guardian = await import('./GuardianConsentPage');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('guardian approval page API', () => {
  it('inspects without a learner session, URL token, credentials, or referrer', async () => {
    request.mockResolvedValue(Response.json(details));
    await expect(guardian.guardianAction('inspect', token)).resolves.toEqual(details);
    expect(request).toHaveBeenCalledWith('https://example.supabase.co/functions/v1/guardian-consent', {
      method: 'POST', headers: { apikey: 'public-publishable-key', 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'inspect', token }), credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store', signal: undefined,
    });
  });

  it.each(['approve', 'reject'] as const)('sends an explicit %s decision', async decision => {
    request.mockResolvedValue(Response.json({ ok: true, decision }));
    await expect(guardian.guardianAction(decision, token)).resolves.toEqual({ ok: true, decision });
    expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ action: decision, token });
  });

  it.each(['expired', 'used', 'rejected'])('shows meaningful %s link errors', async reason => {
    request.mockResolvedValue(Response.json({ error: `This link is ${reason}.`, code: 'invalid_token' }, { status: 410 }));
    await expect(guardian.guardianAction('inspect', token)).rejects.toThrow(`This link is ${reason}.`);
  });

  it('does not send malformed tokens to the server', async () => {
    await expect(guardian.guardianAction('inspect', 'invalid')).rejects.toThrow('link is invalid');
    expect(request).not.toHaveBeenCalled();
  });

  it('rejects a success response with a different decision', async () => {
    request.mockResolvedValue(Response.json({ ok: true, decision: 'reject' }));
    await expect(guardian.guardianAction('approve', token)).rejects.toThrow('unexpected response');
  });

  it('handles connection failures without claiming the decision was saved', async () => {
    request.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(guardian.guardianAction('approve', token)).rejects.toThrow('could not connect');
  });
});

describe('guardian fragment token handling', () => {
  it('removes the token from browser history before the first request', () => {
    const replaceState = vi.fn();
    const meta = { name: '', content: '', parentNode: null };
    const appendChild = vi.fn();
    const document = { querySelector: vi.fn(() => null), createElement: vi.fn(() => meta), head: { appendChild }, title: '' };
    vi.stubGlobal('window', { location: { hash: '#guardian-consent?token=' + token, pathname: '/', search: '' }, history: { replaceState } });
    vi.stubGlobal('document', document);
    expect(guardian.consumeGuardianLink()).toEqual({ token });
    expect(replaceState).toHaveBeenCalledWith(null, '', '/');
    expect(meta).toMatchObject({ name: 'referrer', content: 'no-referrer' });
    expect(appendChild).toHaveBeenCalledWith(meta);
    expect(request).not.toHaveBeenCalled();
  });

  it('leaves ordinary app and auth callback fragments untouched', () => {
    const replaceState = vi.fn();
    vi.stubGlobal('window', { location: { hash: '#access_token=learner-auth' }, history: { replaceState } });
    expect(guardian.consumeGuardianLink()).toBeNull();
    expect(replaceState).not.toHaveBeenCalled();
  });
});
