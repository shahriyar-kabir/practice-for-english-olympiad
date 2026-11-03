import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const session = { access_token: 'learner-session', refresh_token: 'refresh-session', expires_at: Date.now() + 3600000 };
const profile = { display_name: 'Explorer', birth_date: '2020-01-01', avatar: 'robot', preferences: {} };
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
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('learner registration without guardian verification', () => {
  it('registers an under-ten learner without collecting a guardian email', async () => {
    request.mockResolvedValueOnce(Response.json(true));
    request.mockResolvedValueOnce(Response.json({ access_token: 'new-session' }));
    await expect(account.registerLearner('Learner@Example.com', 'securepass99', ' Explorer ', '2020-01-01')).resolves.toMatchObject({ access_token: 'new-session' });
    expect(request.mock.calls[0][0]).toBe('https://example.supabase.co/rest/v1/rpc/wizpiko_registration_ready_v2');
    expect(request.mock.calls[1][0]).toBe('https://example.supabase.co/auth/v1/signup');
    expect(JSON.parse(request.mock.calls[1][1].body)).toEqual({ email: 'learner@example.com', password: 'securepass99', data: { display_name: 'Explorer', birth_date: '2020-01-01' } });
    expect(request.mock.calls.some(([url]) => String(url).includes('/functions/'))).toBe(false);
  });
  it.each([false, null, { ready: true }])('does not create an account against the old database release', async result => {
    request.mockResolvedValueOnce(Response.json(result));
    await expect(account.registerLearner('learner@example.com', 'securepass99', 'Explorer', '2020-01-01')).rejects.toThrow('temporarily unavailable');
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('handles a missing release migration', async () => {
    request.mockResolvedValueOnce(new Response('Not found', { status: 404 }));
    await expect(account.registerLearner('learner@example.com', 'securepass99', 'Explorer', '2020-01-01')).rejects.toThrow('temporarily unavailable');
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('keeps normal learner field validation', async () => {
    await expect(account.registerLearner('learner@example.com', 'securepass99', 'Explorer', '2999-01-01')).rejects.toThrow('valid date of birth');
    expect(request).not.toHaveBeenCalled();
  });
  it('preserves email confirmation responses', async () => {
    request.mockResolvedValueOnce(Response.json(true)).mockResolvedValueOnce(Response.json({ user: { id: 'learner-id' } }));
    await expect(account.registerLearner('learner@example.com', 'securepass99', 'Explorer', '2020-01-01')).resolves.not.toHaveProperty('access_token');
  });
  it('surfaces authentication service errors', async () => {
    request.mockResolvedValueOnce(Response.json(true)).mockResolvedValueOnce(Response.json({ message: 'Email rate limit exceeded' }, { status: 429 }));
    await expect(account.registerLearner('learner@example.com', 'securepass99', 'Explorer', '2020-01-01')).rejects.toThrow('Email rate limit exceeded');
  });
});

describe('protected learner profiles', () => {
  it.each(['2020-01-01', null])('loads the signed-in learner profile with legacy nullable birth dates', async birth_date => {
    request.mockResolvedValue(Response.json([{ ...profile, birth_date }]));
    await expect(account.profileGet(session, 'learner-id')).resolves.toMatchObject({ display_name: 'Explorer', birth_date });
    expect(request.mock.calls[0][0]).toContain('user_id=eq.learner-id');
    expect(request.mock.calls[0][0]).not.toContain('guardian_email');
    expect(request.mock.calls[0][1].headers.Authorization).toBe('Bearer learner-session');
  });
  it('surfaces database permission failures', async () => {
    request.mockResolvedValue(Response.json({ message: 'permission denied' }, { status: 403 }));
    await expect(account.profileGet(session, 'learner-id')).rejects.toThrow('Your learner profile could not be loaded.');
  });
  it.each([[], [{ ...profile, avatar: 'invalid' }], { error: 'schema unavailable' }])('rejects missing or invalid profile data', async rows => {
    request.mockResolvedValue(Response.json(rows));
    await expect(account.profileGet(session, 'learner-id')).rejects.toThrow('missing a valid protected learner profile');
  });
});
