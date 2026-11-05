import { useEffect, useRef, useState } from 'react';
import type { GameSession, JourneyProgress } from './journey';
import { mergeSubjectGames } from './subjectGameProgress';
import { mergeSkillDrafts } from './skillProgress';
import { validateSignup } from './learnerData';
import type { LearnerProfile } from './learnerData';
import type { AcademyProgress, LearningEvent, LessonResult } from './learningTypes';
import { saveJourney } from './journey';
import type { Progress } from './game';
import { saveProgress } from './game';
import { AccountActionError, ACCOUNT_NOT_FOUND_MESSAGE, accountExists, normalizeAccountEmail } from './supportApi';

export type Session = { access_token: string; refresh_token: string; expires_at: number; remember?: boolean };
type User = { id: string; email?: string };
type AuthState = { user: User | null; profile: LearnerProfile | null; loading: boolean; configured: boolean; status: string; recovery?: boolean };
type AuthReply = { access_token?: string; refresh_token?: string; expires_in?: number; [key: string]: unknown };
export type Snapshot = { legacy: Progress; journey: JourneyProgress };
export const SESSION_STORAGE_KEY = 'wizpiko-cloud-session-v1';
export const PROGRESS_OWNER_KEY = 'wizpiko-progress-owner-v1';
const CACHE_PREFIX = 'wizpiko-account-progress-v1:';
export const SIGNUP_CONFIRMATION_MESSAGE = 'Check your email for a confirmation link. After confirming, sign in with your password.';
const URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const configured = URL.startsWith('https://') && KEY.length > 12;
const blankSnapshot = (): Snapshot => ({ legacy: {}, journey: { records: {} } });
let memoryOwner: string | null = null;

export function readStoredSession(): Session | null {
  for (const remember of [false, true]) {
    try {
      const storage = remember ? localStorage : sessionStorage;
      const value: unknown = JSON.parse(storage.getItem(SESSION_STORAGE_KEY) || 'null');
      if (value && typeof value === 'object') {
        const session = value as Session;
        if (typeof session.access_token === 'string' && typeof session.refresh_token === 'string' &&
            Number.isFinite(session.expires_at)) return { ...session, remember };
      }
    } catch { /* Check the other store when this one is unavailable. */ }
  }
  return null;
}
export function persistSession(session: Session | null, remember = session?.remember !== false): boolean {
  let cleared = true;
  try { localStorage.removeItem(SESSION_STORAGE_KEY); } catch { cleared = false; }
  try { sessionStorage.removeItem(SESSION_STORAGE_KEY); } catch { cleared = false; }
  if (!session) return cleared;
  if (!cleared) return false;
  try {
    (remember ? localStorage : sessionStorage).setItem(SESSION_STORAGE_KEY, JSON.stringify({ ...session, remember }));
    return true;
  } catch { return false; }
}
function progressOwner(): string | null {
  try { return localStorage.getItem(PROGRESS_OWNER_KEY) || memoryOwner; }
  catch { return memoryOwner; }
}
function setProgressOwner(owner: string | null) {
  memoryOwner = owner;
  try {
    if (owner) localStorage.setItem(PROGRESS_OWNER_KEY, owner);
    else localStorage.removeItem(PROGRESS_OWNER_KEY);
  } catch { /* The in-memory marker still isolates accounts for this visit. */ }
}
function cacheOwnedProgress(owner: string, snapshot: Snapshot) {
  try { localStorage.setItem(CACHE_PREFIX + owner, JSON.stringify(snapshot)); }
  catch { /* Cloud and current browser progress remain available. */ }
}
function cachedProgress(owner: string): Snapshot | null {
  try {
    const value = JSON.parse(localStorage.getItem(CACHE_PREFIX + owner) || 'null') as Snapshot | null;
    return value && value.legacy && value.journey?.records ? value : null;
  } catch { return null; }
}
export function mergeLegacy(local: Progress, cloud: Progress): Progress {
  const merged: Progress = { ...cloud, ...local };
  for (const key of new Set([...Object.keys(local), ...Object.keys(cloud)])) {
    const a = local[key], b = cloud[key];
    if (!a || !b) continue;
    const hints: Record<string, number[]> = { ...b.hints };
    for (const id of Object.keys(a.hints)) hints[id] = Array.from(new Set([...(b.hints?.[id] || []), ...a.hints[id]]));
    merged[key] = { solved: Array.from(new Set([...a.solved, ...b.solved])), hints };
  }
  return merged;
}
const timestamp = (value?: string): number => value && Number.isFinite(Date.parse(value)) ? Date.parse(value) : 0;
function mergeLesson(a: LessonResult, b: LessonResult): LessonResult {
  const best = b.score > a.score || b.score === a.score && timestamp(b.completedAt) > timestamp(a.completedAt) ? b : a;
  return {
    ...best,
    score: Math.max(a.score, b.score),
    xp: Math.max(a.xp, b.xp),
    completedAt: timestamp(b.completedAt) > timestamp(a.completedAt) ? b.completedAt : a.completedAt,
  };
}
function mergeAcademy(local?: AcademyProgress, cloud?: AcademyProgress): AcademyProgress | undefined {
  if (!local && !cloud) return undefined;
  const results = { ...cloud?.results, ...local?.results };
  for (const id of Object.keys(results)) {
    const a = local?.results[id], b = cloud?.results[id];
    if (a && b) results[id] = mergeLesson(a, b);
  }
  const lastIds = [local?.lastLessonId, cloud?.lastLessonId].filter((id): id is string => !!id);
  const lastLessonId = lastIds.sort((a, b) => timestamp(results[b]?.completedAt) - timestamp(results[a]?.completedAt))[0];
  return { results, ...(lastLessonId ? { lastLessonId } : {}) };
}
function mergeActivity(local: LearningEvent[] = [], cloud: LearningEvent[] = []): LearningEvent[] {
  const events = new Map<string, LearningEvent>();
  for (const event of [...cloud, ...local]) {
    const previous = events.get(event.id);
    if (!previous) events.set(event.id, event);
    else {
      const latest = timestamp(event.completedAt) >= timestamp(previous.completedAt) ? event : previous;
      events.set(event.id, { ...latest, xp: Math.max(event.xp, previous.xp) });
    }
  }
  return [...events.values()].sort((a, b) => timestamp(b.completedAt) - timestamp(a.completedAt)).slice(0, 500);
}
function mergeGameSession(local: GameSession | undefined, cloud: GameSession | undefined, completed: Set<string>): GameSession | undefined {
  const open = (session: GameSession | undefined): session is GameSession => !!session &&
    !completed.has(`game:${session.key}:${session.startedAt}`);
  const sessions = [local, cloud].filter(open).sort((a, b) => b.startedAt - a.startedAt || b.index - a.index);
  const newest = sessions[0], other = sessions[1];
  if (!newest || !other || newest.key !== other.key || newest.startedAt !== other.startedAt) return newest;
  const hints = { ...other.hints };
  for (const id of Object.keys(newest.hints)) hints[id] = [...new Set([...(other.hints[id] || []), ...newest.hints[id]])];
  return {
    ...other, ...newest,
    answers: { ...other.answers, ...newest.answers },
    solved: [...new Set([...other.solved, ...newest.solved])],
    hints,
    ...(newest.groupStart !== undefined || other.groupStart !== undefined ? { groupStart: Math.max(newest.groupStart || 0, other.groupStart || 0) } : {}),
    ...(newest.questionCount !== undefined || other.questionCount !== undefined ? { questionCount: Math.max(newest.questionCount || 0, other.questionCount || 0) } : {}),
    ...(newest.completedGroups || other.completedGroups ? { completedGroups: [...new Set([...(other.completedGroups || []), ...(newest.completedGroups || [])])] } : {}),
  };
}
export function mergeJourney(local: JourneyProgress, cloud: JourneyProgress): JourneyProgress {
  const records = { ...(cloud.records || {}), ...(local.records || {}) };
  for (const id of Object.keys(records)) {
    const a = local.records?.[id], b = cloud.records?.[id];
    if (a && b) records[id] = { unlocked: Math.max(a.unlocked, b.unlocked), completed: Math.max(a.completed, b.completed), bestScore: Math.max(a.bestScore, b.bestScore), xp: Math.max(a.xp, b.xp) };
  }
  const retired = new Map<string, GameSession>();
  for (const session of [...(local.retiredSessions || []), ...(cloud.retiredSessions || [])]) {
    const id = `${session.key}:${session.startedAt}`;
    retired.set(id, mergeGameSession(retired.get(id), session, new Set())!);
  }
  const completionIds = [...new Set([
    ...(cloud.completionIds || []), ...(local.completionIds || []),
    ...(cloud.activityLog || []).map(event => event.id), ...(local.activityLog || []).map(event => event.id),
  ])];
  const earnedBadges = { ...cloud.earnedBadges, ...local.earnedBadges };
  for (const id of Object.keys(earnedBadges)) {
    const a = local.earnedBadges?.[id], b = cloud.earnedBadges?.[id];
    if (a && b) earnedBadges[id] = timestamp(a) <= timestamp(b) ? a : b;
  }
  return {
    records,
    activityDates: [...new Set([...(local.activityDates || []), ...(cloud.activityDates || [])])].sort(),
    session: mergeGameSession(local.session && !retired.has(`${local.session.key}:${local.session.startedAt}`) ? local.session : undefined,
      cloud.session && !retired.has(`${cloud.session.key}:${cloud.session.startedAt}`) ? cloud.session : undefined, new Set(completionIds)),
    ...(retired.size ? { retiredSessions: [...retired.values()] } : {}),
    academy: mergeAcademy(local.academy, cloud.academy),
    activityLog: mergeActivity(local.activityLog, cloud.activityLog),
    earnedBadges,
    streakRecord: Math.max(local.streakRecord || 0, cloud.streakRecord || 0),
    completionIds,
    subjectGames: mergeSubjectGames(local.subjectGames, cloud.subjectGames, new Set(completionIds)),
    skillDrafts: mergeSkillDrafts(local.skillDrafts, cloud.skillDrafts, new Set(completionIds)),
  };
}
export function mergeSnapshots(local: Snapshot, cloud: Snapshot): Snapshot {
  return { legacy: mergeLegacy(local.legacy, cloud.legacy), journey: mergeJourney(local.journey, cloud.journey) };
}
// Unowned historical guest data can be imported once. Once attributed, it can
// only rejoin that same account; switching accounts loads only the new owner's cache.
export function prepareLocalProgressForUser(userId: string, current: Snapshot): Snapshot {
  const owner = progressOwner();
  if (owner) cacheOwnedProgress(owner, current);
  const eligible = !owner || owner === userId ? current : blankSnapshot();
  const prepared = mergeSnapshots(eligible, cachedProgress(userId) || blankSnapshot());
  setProgressOwner(userId);
  cacheOwnedProgress(userId, prepared);
  return prepared;
}
function leaveOwnedProgress(current: Snapshot): Snapshot {
  const owner = progressOwner();
  if (owner) cacheOwnedProgress(owner, current);
  setProgressOwner(null);
  const empty = blankSnapshot();
  saveProgress(empty.legacy);
  saveJourney(empty.journey);
  return empty;
}
async function authRequest(path: string, payload: unknown): Promise<AuthReply> {
  let response: Response;
  try {
    response = await fetch(URL + '/auth/v1/' + path, {
      method: 'POST',
      headers: { apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AccountActionError('network_error', 'We could not reach Wizpiko. Check your connection and try again.');
  }
  const raw: unknown = await response.json().catch(() => ({}));
  const body = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  if (!response.ok) {
    const message = [body.error_description, body.msg, body.message, body.error].find(value => typeof value === 'string') as string | undefined;
    const reportedCode = [body.error_code, body.code].find(value => typeof value === 'string') as string | undefined;
    const code = response.status === 429 ? 'rate_limited' :
      reportedCode || (message === 'Invalid login credentials' ? 'invalid_credentials' : 'authentication_failed');
    throw new AccountActionError(code, message || 'Could not complete sign-in. Please try again.');
  }
  return body as AuthReply;
}
async function validSession(input: Session): Promise<Session> {
  if (input.expires_at > Date.now() + 60000) return input;
  const result = await authRequest('token?grant_type=refresh_token', { refresh_token: input.refresh_token });
  if (!result.access_token || !result.refresh_token) throw new Error('Please sign in again.');
  const next: Session = { access_token: result.access_token, refresh_token: result.refresh_token, expires_at: Date.now() + (result.expires_in || 3600) * 1000, remember: input.remember !== false };
  // A refresh finishing after sign-out/account-switch must not restore that session.
  if (readStoredSession()?.refresh_token === input.refresh_token) persistSession(next);
  return next;
}
export async function authenticateLearner(email: string, password: string): Promise<AuthReply> {
  if (!configured) throw new AccountActionError('service_unavailable', 'Supabase account settings are missing from this build.');
  const address = normalizeAccountEmail(email);
  try {
    return await authRequest('token?grant_type=password', { email: address, password });
  } catch (error) {
    if (!(error instanceof AccountActionError) || error.code !== 'invalid_credentials') throw error;
    // Supabase intentionally uses invalid_credentials for multiple situations.
    // Only the protected service lookup can establish that no account exists.
    if (!await accountExists(address)) throw new AccountActionError('account_not_found', ACCOUNT_NOT_FOUND_MESSAGE);
    throw new AccountActionError('invalid_credentials', 'The password is incorrect. Please try again.');
  }
}
/** Reuse refresh and reject requests that finish after an account switch. */
export async function learningRequestSession(): Promise<Session> {
  const current = readStoredSession();
  if (!current) throw new Error('Please sign in to use your learning profile.');
  const session = await validSession(current);
  if (readStoredSession()?.refresh_token !== session.refresh_token) throw new Error('Your account changed. Please open this page again.');
  return session;
}
export async function requestPasswordReset(email: string): Promise<string> {
  if (!configured) throw new AccountActionError('service_unavailable', 'Supabase account settings are missing from this build.');
  const address = normalizeAccountEmail(email);
  if (!await accountExists(address)) throw new AccountActionError('account_not_found', ACCOUNT_NOT_FOUND_MESSAGE);
  const redirect = window.location.origin + window.location.pathname;
  await authRequest('recover?redirect_to=' + encodeURIComponent(redirect), { email: address });
  return 'Check your email for a password-reset link.';
}
export async function resendSignupConfirmation(email: string): Promise<string> {
  if (!configured) throw new AccountActionError('service_unavailable', 'Supabase account settings are missing from this build.');
  const redirect = window.location.origin + window.location.pathname;
  await authRequest('resend?redirect_to=' + encodeURIComponent(redirect), {
    type: 'signup',
    email: normalizeAccountEmail(email),
  });
  return SIGNUP_CONFIRMATION_MESSAGE;
}
export function consumeSignupConfirmation(): boolean {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  if (params.get('type') !== 'signup') return false;
  // A confirmation link verifies email ownership; it does not sign the visitor
  // into an account. Recovery links retain their separate authenticated flow.
  persistSession(null);
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  return true;
}
export async function profileGet(session: Session, userId: string): Promise<LearnerProfile> {
  const response = await fetch(URL + '/rest/v1/learner_profiles?user_id=eq.' + encodeURIComponent(userId) + '&select=display_name,birth_date,avatar,preferences', {
    headers: { apikey: KEY, Authorization: 'Bearer ' + session.access_token },
  });
  if (!response.ok) throw new Error('Your learner profile could not be loaded. Please try again or contact support.');
  const rows: unknown = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1 || !rows[0] ||
      typeof rows[0].display_name !== 'string' ||
      !['girl', 'boy', 'robot', 'panda', 'cat'].includes(rows[0].avatar)) {
    throw new Error('This account is missing a valid protected learner profile. Please contact support.');
  }
  return rows[0] as LearnerProfile;
}
export async function registerLearner(email: string, password: string, displayName: string, birthDate: string): Promise<AuthReply> {
  if (!configured) throw new Error('Supabase account settings are missing from this build.');
  const issue = validateSignup(displayName, birthDate, email, password);
  if (issue) throw new Error(issue);
  const readyResponse = await fetch(URL + '/rest/v1/rpc/wizpiko_registration_ready_v2', {
    method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: '{}',
  });
  const registrationReady = readyResponse.ok && await readyResponse.json().catch(() => false) === true;
  if (!registrationReady) throw new Error('New registrations are temporarily unavailable. Please try again later.');
  return authRequest('signup', {
    email: normalizeAccountEmail(email), password,
    data: { display_name: displayName.trim(), birth_date: birthDate },
  });
}
export async function signupWithConfirmation(email: string, password: string, displayName: string, birthDate: string): Promise<string> {
  await registerLearner(email, password, displayName, birthDate);
  // The confirmation UI stays explicit even if a misconfigured service returns
  // credentials. No signup response creates a browser session or navigates away.
  return SIGNUP_CONFIRMATION_MESSAGE;
}
async function remoteGet(session: Session, userId: string): Promise<Snapshot | null> {
  const response = await fetch(URL + '/rest/v1/student_progress?user_id=eq.' + encodeURIComponent(userId) + '&select=payload', {
    headers: { apikey: KEY, Authorization: 'Bearer ' + session.access_token },
  });
  if (!response.ok) throw new Error('Unable to load your cloud progress. Please check database permissions.');
  const rows = await response.json() as { payload: Snapshot }[];
  return rows[0]?.payload || null;
}
async function remotePut(session: Session, userId: string, payload: Snapshot) {
  const response = await fetch(URL + '/rest/v1/student_progress?on_conflict=user_id', {
    method: 'POST',
    headers: { apikey: KEY, Authorization: 'Bearer ' + session.access_token, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ user_id: userId, payload, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error('Cloud save failed. Your progress is still saved on this browser.');
}

export function useWizpikoAccount(snapshot: Snapshot, onRestore: (value: Snapshot) => void) {
  const [auth, setAuth] = useState<AuthState>({ user: null, profile: null, loading: configured, configured, status: configured ? 'Checking account…' : 'Account sign-in is temporarily unavailable.' });
  const [session, setSession] = useState<Session | null>(null);
  const restored = useRef(false);
  const authEpoch = useRef(0);
  const latest = useRef(snapshot);
  const restoreRef = useRef(onRestore);
  latest.current = snapshot;
  restoreRef.current = onRestore;

  useEffect(() => {
    if (!configured) return;
    let canceled = false;
    const epoch = authEpoch.current;
    const stale = () => canceled || epoch !== authEpoch.current;
    function restore(value: Snapshot) {
      latest.current = value;
      restoreRef.current(value);
      saveProgress(value.legacy);
      saveJourney(value.journey);
    }
    async function bootstrap() {
      try {
        const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const callbackError = params.get('error_description') || params.get('error');
        if (callbackError) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          throw new Error(decodeURIComponent(callbackError.replace(/\+/g, ' ')));
        }
        if (consumeSignupConfirmation()) {
          if (!stale()) {
            restore(leaveOwnedProgress(latest.current));
            setSession(null);
            setAuth({ user: null, profile: null, loading: false, configured: true, status: 'Email confirmed. Sign in with your password.' });
          }
          return;
        }
        let next = readStoredSession();
        const access = params.get('access_token'), refresh = params.get('refresh_token');
        const recovery = params.get('type') === 'recovery';
        if (access && refresh) {
          next = { access_token: access, refresh_token: refresh, expires_at: Date.now() + Number(params.get('expires_in') || '3600') * 1000, remember: next?.remember !== false };
          if (!persistSession(next)) throw new AccountActionError('storage_unavailable', 'Your browser could not save this session. Enable browser storage and try again.');
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        if (!next) {
          if (!stale()) {
            if (progressOwner()) restore(leaveOwnedProgress(latest.current));
            setAuth({ user: null, profile: null, loading: false, configured: true, status: 'Please sign in to continue learning.' });
          }
          return;
        }
        next = await validSession(next);
        if (stale()) return;
        const response = await fetch(URL + '/auth/v1/user', { headers: { apikey: KEY, Authorization: 'Bearer ' + next.access_token } });
        if (!response.ok) throw new Error('Session expired. Please sign in again.');
        const user = await response.json() as User;
        if (stale()) return;
        const profile = await profileGet(next, user.id);
        if (stale()) return;
        const local = prepareLocalProgressForUser(user.id, latest.current);
        restore(local);
        setSession(next);
        setAuth({ user, profile, loading: false, configured: true, recovery, status: 'Signed in. Loading cloud progress…' });
        try {
          const cloud = await remoteGet(next, user.id);
          if (stale()) return;
          const merged = mergeSnapshots(local, cloud || blankSnapshot());
          restore(merged);
          cacheOwnedProgress(user.id, merged);
          restored.current = true;
          setAuth({ user, profile, loading: false, configured: true, recovery, status: 'Cloud progress connected.' });
          try { await remotePut(next, user.id, merged); }
          catch (cloudError) {
            if (!stale()) setAuth({ user, profile, loading: false, configured: true, recovery, status: cloudError instanceof Error ? cloudError.message : 'Cloud save failed.' });
          }
        } catch (cloudError) {
          if (!stale()) setAuth({ user, profile, loading: false, configured: true, recovery, status: cloudError instanceof Error ? cloudError.message : 'Cloud progress unavailable.' });
        }
      } catch (error) {
        if (stale()) return;
        persistSession(null); restored.current = false;
        if (progressOwner()) restore(leaveOwnedProgress(latest.current));
        setSession(null);
        setAuth({ user: null, profile: null, loading: false, configured: true, status: error instanceof Error ? error.message : 'Could not connect your account.' });
      }
    }
    void bootstrap();
    return () => { canceled = true; };
  }, []);

  useEffect(() => {
    if (!auth.user || !session || !auth.profile || progressOwner() !== auth.user.id) return;
    const userId = auth.user.id;
    cacheOwnedProgress(userId, snapshot);
    if (!restored.current) return;
    const payload = snapshot;
    const epoch = authEpoch.current;
    const id = window.setTimeout(async () => {
      try {
        const next = await validSession(session);
        if (epoch !== authEpoch.current || progressOwner() !== userId) return;
        if (next.access_token !== session.access_token) setSession(next);
        await remotePut(next, userId, payload);
        if (epoch === authEpoch.current) setAuth(previous => previous.user?.id === userId ? { ...previous, status: 'Saved to your account.' } : previous);
      } catch (error) {
        if (epoch === authEpoch.current) setAuth(previous => ({ ...previous, status: error instanceof Error ? error.message : 'Cloud sync failed.' }));
      }
    }, 1200);
    return () => window.clearTimeout(id);
  }, [snapshot.legacy, snapshot.journey, auth.user?.id, session?.access_token]);

  function acceptCredentials(response: AuthReply, remember: boolean) {
    if (!response.access_token || !response.refresh_token) {
      throw new Error('No session was created. Confirm your account email, then sign in again.');
    }
    if (!persistSession({
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      expires_at: Date.now() + (response.expires_in || 3600) * 1000,
    }, remember)) throw new AccountActionError('storage_unavailable', 'Your browser could not save this session. Enable browser storage and try again.');
    // After sign-in open /home unless the learner requested a protected page directly.
    // Existing pending learning destinations are restored by App from session storage.
    const currentPath = window.location.pathname;
    const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
    const relativePath = base && (currentPath === base || currentPath.startsWith(base + '/'))
      ? currentPath.slice(base.length) || '/'
      : currentPath;
    const protectedPaths = ['/home', '/my-profile', '/my-progress', '/my-achievements', '/streak',
      '/learning-preferences', '/help-support', '/english-academy', '/games', '/word-puzzles'];
    const nextPath = protectedPaths.includes(relativePath) ? currentPath : base + '/home';
    window.location.assign(window.location.origin + nextPath);
  }
  async function signIn(email: string, password: string, remember = true) {
    acceptCredentials(await authenticateLearner(email, password), remember);
  }
  async function updatePassword(password: string): Promise<void> {
    if (!session) throw new Error('Open your password-reset link first.');
    if (password.length < 8) throw new Error('Use at least 8 password characters.');
    const epoch = authEpoch.current;
    const next = await validSession(session);
    if (epoch !== authEpoch.current) return;
    const response = await fetch(URL + '/auth/v1/user', {
      method: 'PUT', headers: { apikey: KEY, Authorization: 'Bearer ' + next.access_token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) throw new Error('Password change failed. Please request a new reset link.');
    if (epoch === authEpoch.current) setAuth(previous => ({ ...previous, recovery: false, status: 'Password updated successfully.' }));
  }
  async function updateProfile(patch: Partial<Pick<LearnerProfile, 'display_name' | 'avatar' | 'preferences'>>): Promise<void> {
    if (!session || !auth.user) throw new Error('Sign in first.');
    const userId = auth.user.id;
    const epoch = authEpoch.current;
    const next = await validSession(session);
    if (epoch !== authEpoch.current) return;
    const response = await fetch(URL + '/rest/v1/learner_profiles?user_id=eq.' + encodeURIComponent(userId), {
      method: 'PATCH', headers: { apikey: KEY, Authorization: 'Bearer ' + next.access_token, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(patch),
    });
    if (!response.ok) throw new Error('Could not update profile. Please try again later.');
    const rows = await response.json() as LearnerProfile[];
    if (rows[0] && epoch === authEpoch.current) setAuth(previous => previous.user?.id === userId ? { ...previous, profile: rows[0], status: 'Profile saved.' } : previous);
  }
  async function signOut() {
    authEpoch.current++;
    const current = session;
    if (current) void fetch(URL + '/auth/v1/logout', { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + current.access_token } }).catch(() => {});
    persistSession(null); restored.current = false; setSession(null);
    const empty = leaveOwnedProgress(latest.current);
    latest.current = empty;
    restoreRef.current(empty);
    setAuth({ user: null, profile: null, loading: false, configured, status: 'Signed out. Sign in when you are ready to continue.' });
  }
  return {
    auth,
    signUp: signupWithConfirmation,
    signIn,
    signOut,
    sendPasswordReset: requestPasswordReset,
    resendSignupConfirmation,
    updatePassword,
    updateProfile,
  };
}
