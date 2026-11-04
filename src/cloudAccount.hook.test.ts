import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Capture hook effects and state so callback/session behavior can run without a
// browser renderer. Network and browser storage remain real production paths.
const hooks = vi.hoisted(() => ({ effects: [] as Array<() => unknown>, states: [] as unknown[] }));
vi.mock('react', () => ({
  useState(initial: unknown) {
    const index = hooks.states.push(initial) - 1;
    return [initial, (next: unknown) => {
      hooks.states[index] = typeof next === 'function' ? next(hooks.states[index]) : next;
    }];
  },
  useRef: (current: unknown) => ({ current }),
  useEffect: (effect: () => unknown) => { hooks.effects.push(effect); },
}));

let account: typeof import('./cloudAccount');
let request: ReturnType<typeof vi.fn>;
const profile = { display_name: 'Explorer', birth_date: '2020-01-01', avatar: 'robot', preferences: {} };
const credentials = { access_token: 'access-token', refresh_token: 'refresh-token', expires_in: 3600 };
function storage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() { return items.size; }, clear: () => items.clear(),
    getItem: key => items.get(key) ?? null, key: index => [...items.keys()][index] ?? null,
    setItem: (key, value) => { items.set(key, value); }, removeItem: key => { items.delete(key); },
  };
}
beforeEach(async () => {
  vi.resetModules();
  hooks.effects = []; hooks.states = [];
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'public-publishable-key');
  vi.stubGlobal('localStorage', storage()); vi.stubGlobal('sessionStorage', storage());
  vi.stubGlobal('window', {
    location: { origin: 'https://wizpiko.com', pathname: '/', search: '', hash: '', assign: vi.fn() },
    history: { replaceState: vi.fn() }, setTimeout, clearTimeout,
  });
  request = vi.fn(); vi.stubGlobal('fetch', request);
  account = await import('./cloudAccount');
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

function mount(snapshot: import('./cloudAccount').Snapshot = { legacy: {}, journey: { records: {} } }) {
  const restore = vi.fn();
  const api = account.useWizpikoAccount(snapshot, restore);
  return { api, restore, bootstrap: () => { hooks.effects[0](); } };
}
function successfulBootstrap() {
  request.mockResolvedValueOnce(Response.json({ id: 'learner-id', email: 'learner@example.com' }))
    .mockResolvedValueOnce(Response.json([profile]))
    .mockResolvedValueOnce(Response.json([]))
    .mockResolvedValueOnce(new Response(null, { status: 201 }));
}

describe('account hook session lifecycle', () => {
  it.each([true, false])('signs in with remember=%s in the appropriate store', async remember => {
    request.mockResolvedValueOnce(Response.json(credentials));
    const { api } = mount();
    await api.signIn('learner@example.com', 'password', remember);
    expect(account.readStoredSession()).toMatchObject({ access_token: credentials.access_token, refresh_token: credentials.refresh_token, remember });
    expect((remember ? localStorage : sessionStorage).getItem(account.SESSION_STORAGE_KEY)).not.toBeNull();
    expect((remember ? sessionStorage : localStorage).getItem(account.SESSION_STORAGE_KEY)).toBeNull();
    expect(window.location.assign).toHaveBeenCalledWith('https://wizpiko.com' + import.meta.env.BASE_URL.replace(/\/+$/, '') + '/home');
  });
  it('returns an unauthenticated deep-link visitor to the requested learner page', async () => {
    const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
    window.location.pathname = base + '/my-progress';
    request.mockResolvedValueOnce(Response.json(credentials));
    await mount().api.signIn('learner@example.com', 'password');
    expect(window.location.assign).toHaveBeenCalledWith('https://wizpiko.com' + base + '/my-progress');
  });
  it('defaults sign-in to a remembered session', async () => {
    request.mockResolvedValueOnce(Response.json(credentials));
    await mount().api.signIn('learner@example.com', 'password');
    expect(account.readStoredSession()?.remember).toBe(true);
  });
  it.each([true, false])('preserves remember=%s when refreshing a stored session', async remember => {
    account.persistSession({ access_token: 'expired', refresh_token: 'previous-refresh', expires_at: 1 }, remember);
    request.mockResolvedValueOnce(Response.json(credentials));
    successfulBootstrap();
    mount().bootstrap();
    await vi.waitFor(() => expect(hooks.states[0]).toMatchObject({ status: 'Cloud progress connected.' }));
    expect(request.mock.calls[0][0]).toContain('grant_type=refresh_token');
    expect(account.readStoredSession()).toMatchObject({ access_token: 'access-token', refresh_token: 'refresh-token', remember });
    expect((remember ? sessionStorage : localStorage).getItem(account.SESSION_STORAGE_KEY)).toBeNull();
  });
  it('discards signup callback tokens and remains signed out with the explicit confirmation status', async () => {
    account.persistSession({ access_token: 'old', refresh_token: 'old-refresh', expires_at: Date.now() + 3600000 });
    window.location.hash = '#access_token=signup-token&refresh_token=signup-refresh&type=signup';
    mount().bootstrap();
    await vi.waitFor(() => expect(hooks.states[0]).toMatchObject({
      user: null, loading: false, status: 'Email confirmed. Sign in with your password.',
    }));
    expect(account.readStoredSession()).toBeNull();
    expect(request).not.toHaveBeenCalled();
    expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/');
  });
  it('retains recovery callback credentials and enables the reset flow', async () => {
    window.location.hash = '#access_token=recovery-token&refresh_token=recovery-refresh&type=recovery&expires_in=3600';
    successfulBootstrap();
    mount().bootstrap();
    await vi.waitFor(() => expect(hooks.states[0]).toMatchObject({ recovery: true, user: { id: 'learner-id' }, status: 'Cloud progress connected.' }));
    expect(account.readStoredSession()).toMatchObject({ access_token: 'recovery-token', refresh_token: 'recovery-refresh' });
    expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/');
  });
  it('clears visible progress on sign-out and keeps unsynced work with its previous owner', async () => {
    const previous = account.prepareLocalProgressForUser('account-a', {
      legacy: { puzzle: { solved: ['answer'], hints: { answer: [1] } } },
      journey: { records: { unsynced: { unlocked: 2, completed: 1, bestScore: 100, xp: 30 } } },
    });
    const { api, restore } = mount(previous);
    await api.signOut();
    const cleared = restore.mock.calls[0][0];
    expect(cleared).toEqual({ legacy: {}, journey: { records: {} } });
    const nextUser = account.prepareLocalProgressForUser('account-b', cleared);
    expect(nextUser.journey.records).toEqual({});
    const originalUser = account.prepareLocalProgressForUser('account-a', nextUser);
    expect(originalUser.journey.records.unsynced.xp).toBe(30);
    expect(originalUser.legacy.puzzle.solved).toEqual(['answer']);
  });
});
