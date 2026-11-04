import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const session = { access_token: 'learner-session', refresh_token: 'refresh-session', expires_at: Date.now() + 3600000 };
const profile = { display_name: 'Explorer', birth_date: '2020-01-01', avatar: 'robot', preferences: {} };
let account: typeof import('./cloudAccount');
let request: ReturnType<typeof vi.fn>;
function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: key => values.get(key) ?? null,
    key: index => [...values.keys()][index] ?? null,
    removeItem: key => { values.delete(key); },
    setItem: (key, value) => { values.set(key, String(value)); },
  };
}

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'public-publishable-key');
  request = vi.fn();
  vi.stubGlobal('fetch', request);
  vi.stubGlobal('localStorage', memoryStorage());
  vi.stubGlobal('sessionStorage', memoryStorage());
  vi.stubGlobal('window', {
    location: { origin: 'https://wizpiko.com', pathname: '/', search: '?return=learn', hash: '', assign: vi.fn() },
    history: { replaceState: vi.fn() },
  });
  account = await import('./cloudAccount');
});

describe('authoritative sign-in and recovery errors', () => {
  const invalidCredentials = () => Response.json({ error_code: 'invalid_credentials', msg: 'Invalid login credentials' }, { status: 400 });
  it('authenticates first and skips account enumeration on successful sign-in', async () => {
    request.mockResolvedValueOnce(Response.json(session));
    await expect(account.authenticateLearner(' Learner@Example.com ', 'password')).resolves.toMatchObject(session);
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toContain('/auth/v1/token?grant_type=password');
    expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ email: 'learner@example.com', password: 'password' });
  });
  it('uses the exact account-not-found error only after a negative lookup', async () => {
    request.mockResolvedValueOnce(invalidCredentials()).mockResolvedValueOnce(Response.json({ exists: false }));
    await expect(account.authenticateLearner('missing@example.com', 'password')).rejects.toMatchObject({
      name: 'AccountActionError', code: 'account_not_found', message: 'No account found with this email. Please sign up.',
    });
    expect(request.mock.calls[1][0]).toContain('/functions/v1/public-support');
  });
  it('keeps a known account with a wrong password distinct', async () => {
    request.mockResolvedValueOnce(invalidCredentials()).mockResolvedValueOnce(Response.json({ exists: true }));
    await expect(account.authenticateLearner('known@example.com', 'incorrect')).rejects.toMatchObject({ code: 'invalid_credentials' });
  });
  it.each([
    [429, { code: 'rate_limited' }, 'rate_limited'],
    [404, {}, 'service_unavailable'],
    [503, { code: 'service_unavailable' }, 'service_unavailable'],
    [200, { exists: null }, 'service_unavailable'],
  ])('does not infer a missing account from failed lookup HTTP %s', async (status, body, code) => {
    request.mockResolvedValueOnce(invalidCredentials()).mockResolvedValueOnce(Response.json(body, { status }));
    await expect(account.authenticateLearner('known@example.com', 'password')).rejects.toMatchObject({ code });
  });
  it('does not infer a missing account when the lookup network request fails', async () => {
    request.mockResolvedValueOnce(invalidCredentials()).mockRejectedValueOnce(new TypeError('Network failed'));
    await expect(account.authenticateLearner('known@example.com', 'password')).rejects.toMatchObject({ code: 'network_error' });
  });
  it.each([
    [429, { error_code: 'over_request_rate_limit' }, 'rate_limited'],
    [400, { error_code: 'email_not_confirmed' }, 'email_not_confirmed'],
  ])('does not enumerate after a different Auth error HTTP %s', async (status, body, code) => {
    request.mockResolvedValueOnce(Response.json(body, { status }));
    await expect(account.authenticateLearner('known@example.com', 'password')).rejects.toMatchObject({ code });
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('does not enumerate on an Auth network failure', async () => {
    request.mockRejectedValueOnce(new TypeError('Network failed'));
    await expect(account.authenticateLearner('known@example.com', 'password')).rejects.toMatchObject({ code: 'network_error' });
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('looks up recovery before sending any reset email', async () => {
    request.mockResolvedValueOnce(Response.json({ exists: false }));
    await expect(account.requestPasswordReset('missing@example.com')).rejects.toMatchObject({
      code: 'account_not_found', message: 'No account found with this email. Please sign up.',
    });
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('sends recovery only for a confirmed existing address', async () => {
    request.mockResolvedValueOnce(Response.json({ exists: true })).mockResolvedValueOnce(Response.json({}));
    await expect(account.requestPasswordReset(' Learner@Example.com ')).resolves.toContain('password-reset');
    expect(request.mock.calls[0][0]).toContain('/functions/v1/public-support');
    expect(request.mock.calls[1][0]).toContain('/auth/v1/recover?redirect_to=');
    expect(JSON.parse(request.mock.calls[1][1].body)).toEqual({ email: 'learner@example.com' });
  });
  it('does not attempt recovery after unavailable lookup', async () => {
    request.mockResolvedValueOnce(new Response('Not found', { status: 404 }));
    await expect(account.requestPasswordReset('learner@example.com')).rejects.toMatchObject({ code: 'service_unavailable' });
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('returns confirmation text and discards unexpected signup credentials', async () => {
    request.mockResolvedValueOnce(Response.json(true)).mockResolvedValueOnce(Response.json(session));
    await expect(account.signupWithConfirmation('learner@example.com', 'securepass99', 'Explorer', '2020-01-01')).resolves.toBe(account.SIGNUP_CONFIRMATION_MESSAGE);
    expect(account.readStoredSession()).toBeNull();
    expect(window.location.assign).not.toHaveBeenCalled();
  });
  it('supports resending a signup confirmation without creating a session', async () => {
    request.mockResolvedValueOnce(Response.json({}));
    await expect(account.resendSignupConfirmation(' Learner@Example.com ')).resolves.toBe(account.SIGNUP_CONFIRMATION_MESSAGE);
    expect(request.mock.calls[0][0]).toContain('/auth/v1/resend?redirect_to=');
    expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ type: 'signup', email: 'learner@example.com' });
    expect(account.readStoredSession()).toBeNull();
  });
});

describe('browser sessions and confirmation callbacks', () => {
  it.each([true, false])('keeps remember=%s in the selected browser store', remember => {
    expect(account.persistSession(session, remember)).toBe(true);
    expect(account.readStoredSession()).toEqual({ ...session, remember });
    expect((remember ? localStorage : sessionStorage).getItem(account.SESSION_STORAGE_KEY)).not.toBeNull();
    expect((remember ? sessionStorage : localStorage).getItem(account.SESSION_STORAGE_KEY)).toBeNull();
  });
  it('migrates a legacy local-storage session as remembered and removes old storage when switching', () => {
    localStorage.setItem(account.SESSION_STORAGE_KEY, JSON.stringify(session));
    expect(account.readStoredSession()).toEqual({ ...session, remember: true });
    account.persistSession(session, false);
    expect(localStorage.getItem(account.SESSION_STORAGE_KEY)).toBeNull();
    account.persistSession(null);
    expect(account.readStoredSession()).toBeNull();
  });
  it('clears signup tokens and any existing session without accepting credentials', () => {
    account.persistSession(session);
    window.location.hash = '#access_token=signup-token&refresh_token=signup-refresh&type=signup';
    expect(account.consumeSignupConfirmation()).toBe(true);
    expect(account.readStoredSession()).toBeNull();
    expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/?return=learn');
    expect(request).not.toHaveBeenCalled();
  });
  it('leaves recovery credentials for the dedicated reset flow', () => {
    window.location.hash = '#access_token=recovery-token&refresh_token=recovery-refresh&type=recovery';
    expect(account.consumeSignupConfirmation()).toBe(false);
    expect(window.history.replaceState).not.toHaveBeenCalled();
  });
});

describe('progress merging and account ownership', () => {
  it('retains lifetime learning days beyond a year when syncing devices', () => {
    const days = Array.from({ length: 500 }, (_, index) => new Date(Date.UTC(2024, 0, index + 1)).toISOString().slice(0, 10));
    const merged = account.mergeJourney({ records: {}, activityDates: days.slice(0, 300) }, { records: {}, activityDates: days.slice(200) });
    expect(merged.activityDates).toEqual(days);
  });
  const lesson = (score: number, xp: number, completedAt: string) => ({ score, xp, completedAt, correct: score / 10, total: 10 });
  const record = (completed: number, xp = 10) => ({ unlocked: completed + 1, completed, bestScore: completed * 10, xp });
  const snapshot = (id: string): import('./cloudAccount').Snapshot => ({
    legacy: { [id]: { solved: [id], hints: { [id]: [1] } } }, journey: { records: { [id]: record(1) } },
  });
  it('keeps the best score, maximum XP and latest completion per lesson', () => {
    const merged = account.mergeJourney(
      { records: {}, academy: { results: { lesson: lesson(90, 20, '2026-01-01') }, lastLessonId: 'lesson' } },
      { records: {}, academy: { results: { lesson: lesson(80, 30, '2026-02-01'), other: lesson(50, 10, '2026-03-01') }, lastLessonId: 'other' } },
    );
    expect(merged.academy?.results.lesson).toEqual({ ...lesson(90, 30, '2026-02-01') });
    expect(merged.academy?.results.other.score).toBe(50);
    expect(merged.academy?.lastLessonId).toBe('other');
  });
  it('unions completions and badges, keeps earliest awards and maximum streaks', () => {
    const merged = account.mergeJourney(
      { records: { a: record(1, 90) }, earnedBadges: { same: '2026-02-01', local: '2026-03-01' }, streakRecord: 5, completionIds: ['a', 'b'] },
      { records: { a: record(3, 50) }, earnedBadges: { same: '2026-01-01', cloud: '2026-04-01' }, streakRecord: 9, completionIds: ['b', 'c'] },
    );
    expect(merged.records.a).toEqual({ ...record(3), xp: 90 });
    expect(merged.earnedBadges).toEqual({ same: '2026-01-01', local: '2026-03-01', cloud: '2026-04-01' });
    expect(merged.streakRecord).toBe(9);
    expect(merged.completionIds?.sort()).toEqual(['a', 'b', 'c']);
  });
  it('deduplicates bounded activity while retaining its highest XP and latest metadata', () => {
    const events = Array.from({ length: 510 }, (_, index) => ({ id: 'event-' + index, title: 'Lesson', kind: 'lesson' as const, completedAt: new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(), xp: 10 }));
    const merged = account.mergeJourney({ records: {}, activityLog: events }, {
      records: {}, activityLog: [{ ...events[509], title: 'Cloud title', completedAt: '2026-02-01', xp: 20 }],
    });
    expect(merged.activityLog).toHaveLength(500);
    expect(merged.activityLog?.[0]).toMatchObject({ id: 'event-509', title: 'Cloud title', xp: 20 });
    expect(new Set(merged.activityLog?.map(event => event.id)).size).toBe(500);
    expect(merged.completionIds).toHaveLength(510);
    expect(merged.completionIds).toContain('event-0');
  });
  it('merges solved answers and hints without discarding a live game session', () => {
    const active = { key: 'active', endsAt: Date.now() + 100000, startedAt: Date.now(), index: 1, answers: { 1: 'a' }, solved: ['x'], hints: { x: [1] } };
    const expired = { ...active, key: 'expired', endsAt: Date.now() - 1 };
    const merged = account.mergeSnapshots({ legacy: { a: { solved: ['a'], hints: { word: [0, 1] } } }, journey: { records: {}, session: active } }, {
      legacy: { a: { solved: ['b'], hints: { word: [1, 2] } } }, journey: { records: {}, session: expired },
    });
    expect(merged.legacy.a.solved.sort()).toEqual(['a', 'b']);
    expect(merged.legacy.a.hints.word.sort()).toEqual([0, 1, 2]);
    expect(merged.journey.session).toEqual(active);
  });
  it('keeps saved puzzle answers after the old session deadline has passed', () => {
    const old = { key: 'beginners:mcq:1', endsAt: 1, startedAt: 1, index: 42, answers: { 0: 'CAT', 41: 'DOG' }, solved: [], hints: {} };
    const merged = account.mergeJourney({ records: {} }, { records: {}, session: old });
    expect(merged.session).toEqual(old);
  });
  it('resumes an untimed session in preference to an older attempt', () => {
    const older = { key: 'beginners:mcq:1', startedAt: 1, index: 1, answers: { 0: 'CAT' }, solved: [], hints: {} };
    const newer = { ...older, key: 'beginners:mcq:2', startedAt: 2, questionCount: 5 };
    const merged = account.mergeJourney({ records: {}, session: older }, { records: {}, session: newer });
    expect(merged.session).toEqual(newer);
  });
  it('unions answers and credited groups when two devices resume the same old attempt', () => {
    const shared = { key: 'beginners:mcq:1', startedAt: 1, endsAt: 2, questionCount: 50, solved: ['CAT'], hints: { cat: [0] } };
    const merged = account.mergeJourney(
      { records: {}, session: { ...shared, index: 12, groupStart: 10, completedGroups: [0, 1], answers: { 11: 'CAT' } } },
      { records: {}, session: { ...shared, index: 24, groupStart: 20, completedGroups: [1, 2, 3], answers: { 23: 'DOG' }, solved: ['DOG'], hints: { cat: [1] } } },
    );
    expect(merged.session).toMatchObject({ index: 24, groupStart: 20, answers: { 11: 'CAT', 23: 'DOG' } });
    expect(merged.session?.solved.sort()).toEqual(['CAT', 'DOG']);
    expect(merged.session?.hints.cat.sort()).toEqual([0, 1]);
    expect(merged.session?.completedGroups?.sort()).toEqual([0, 1, 2, 3]);
  });
  it('does not revive a completed untimed attempt from a stale device snapshot', () => {
    const saved = { key: 'beginners:mcq:1', startedAt: 1, index: 4, questionCount: 5, answers: { 4: 'CAT' }, solved: [], hints: {} };
    const merged = account.mergeJourney(
      { records: {}, completionIds: ['game:beginners:mcq:1:1'] },
      { records: {}, session: saved },
    );
    expect(merged.session).toBeUndefined();
  });
  it('preserves archived old-bank answers and does not restore them as a new activity', () => {
    const old = { key: 'beginners:mcq:1', startedAt: 1, endsAt: 2, index: 42, answers: { 41: 'OLD ANSWER' }, solved: [], hints: {} };
    const merged = account.mergeJourney(
      { records: {}, retiredSessions: [old] },
      { records: {}, session: old, retiredSessions: [{ ...old, index: 3, answers: { 2: 'EARLIER ANSWER' } }] },
    );
    expect(merged.session).toBeUndefined();
    expect(merged.retiredSessions).toHaveLength(1);
    expect(merged.retiredSessions?.[0].answers).toEqual({ 2: 'EARLIER ANSWER', 41: 'OLD ANSWER' });
  });
  it('never carries account A progress into B, and preserves A unsynced work in its own cache', () => {
    const a = account.prepareLocalProgressForUser('account-a', snapshot('guest'));
    a.journey.records['unsynced-a'] = record(3, 99);
    const b = account.prepareLocalProgressForUser('account-b', a);
    expect(b.legacy).toEqual({});
    expect(b.journey.records).toEqual({});
    b.journey.records['only-b'] = record(2);
    const restoredA = account.prepareLocalProgressForUser('account-a', b);
    expect(restoredA.journey.records['unsynced-a'].xp).toBe(99);
    expect(restoredA.journey.records.guest).toBeDefined();
    expect(restoredA.journey.records['only-b']).toBeUndefined();
    const restoredB = account.prepareLocalProgressForUser('account-b', restoredA);
    expect(Object.keys(restoredB.journey.records)).toEqual(['only-b']);
    expect(localStorage.getItem(account.PROGRESS_OWNER_KEY)).toBe('account-b');
  });
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
