import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const session = { access_token: 'learner-session', refresh_token: 'refresh-session', expires_at: Date.now() + 3600000 };
const profile = { display_name: 'Explorer', birth_date: '2020-01-01', avatar: 'robot', guardian_email: 'guardian@example.com', consent_status: 'pending', preferences: {} };
let account: typeof import('./cloudAccount');
let request: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'public-publishable-key');
  request = vi.fn();
  vi.stubGlobal('fetch', request);
  account = await import('./cloudAccount');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('guardian consent frontend contract', () => {
  it('sends only the request action with the signed-in learner session', async () => {
    request.mockResolvedValue(Response.json({ ok: true, message: 'Guardian email sent.' }));
    await account.guardianRequest(session);
    expect(request).toHaveBeenCalledWith('https://example.supabase.co/functions/v1/guardian-consent', {
      method: 'POST',
      headers: { apikey: 'public-publishable-key', Authorization: 'Bearer learner-session', 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request' }),
    });
  });

  it('surfaces a resend rate limit returned by the function', async () => {
    request.mockResolvedValue(Response.json({ error: 'An email was recently sent. Please try again in 10 minutes.' }, { status: 429 }));
    await expect(account.guardianRequest(session)).rejects.toThrow('An email was recently sent. Please try again in 10 minutes.');
  });

  it('shows an actionable error if the function cannot be reached', async () => {
    request.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(account.guardianRequest(session)).rejects.toThrow('Guardian verification could not connect.');
  });

  it('handles a gateway error that does not contain JSON', async () => {
    request.mockResolvedValue(new Response('Unavailable', { status: 503 }));
    await expect(account.guardianRequest(session)).rejects.toThrow('Unable to send guardian verification.');
  });
});

describe('protected learner profile requirement', () => {
  it.each(['pending', 'active', 'verified'])('loads a server-issued %s profile for the signed-in learner', async consent_status => {
    request.mockResolvedValue(Response.json([{ ...profile, consent_status }]));
    await expect(account.profileGet(session, 'learner-id')).resolves.toMatchObject({ consent_status });
    expect(request.mock.calls[0][0]).toContain('user_id=eq.learner-id');
    expect(request.mock.calls[0][1].headers.Authorization).toBe('Bearer learner-session');
  });

  it('fails closed when database permissions prevent loading the profile', async () => {
    request.mockResolvedValue(Response.json({ message: 'permission denied' }, { status: 403 }));
    await expect(account.profileGet(session, 'learner-id')).rejects.toThrow('Your learner profile could not be loaded.');
  });

  it.each([[], [{ ...profile, consent_status: 'approved' }], { error: 'schema unavailable' }])('fails closed for missing or invalid profile data', async rows => {
    request.mockResolvedValue(Response.json(rows));
    await expect(account.profileGet(session, 'learner-id')).rejects.toThrow('missing a valid protected learner profile');
  });
});
