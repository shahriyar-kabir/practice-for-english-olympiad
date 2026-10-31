import { useEffect, useRef, useState } from 'react';
import type { JourneyProgress } from './EnglishJourney';
import { ageFromBirthdate, validateSignup } from './learnerData';
import type { LearnerProfile } from './learnerData';
import { saveJourney } from './EnglishJourney';
import type { Progress } from './game';
import { saveProgress } from './game';

type Session = { access_token: string; refresh_token: string; expires_at: number };
type User = { id: string; email?: string };
type AuthState = { user: User | null; profile: LearnerProfile | null; loading: boolean; configured: boolean; status: string; recovery?: boolean };
const STORAGE = 'wizpiko-cloud-session-v1';
const URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const configured = URL.startsWith('https://') && KEY.length > 12;
function fromStorage(): Session | null {
  try { return JSON.parse(localStorage.getItem(STORAGE) || 'null') as Session | null; }
  catch { return null; }
}
function saveSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(STORAGE, JSON.stringify(session));
    else localStorage.removeItem(STORAGE);
  } catch { /* storage not available */ }
}
function mergeLegacy(local: Progress, cloud: Progress): Progress {
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
function mergeJourney(local: JourneyProgress, cloud: JourneyProgress): JourneyProgress {
  const records = { ...(cloud.records || {}), ...(local.records || {}) };
  for (const id of Object.keys(records)) {
    const a = local.records?.[id], b = cloud.records?.[id];
    if (a && b) records[id] = { unlocked: Math.max(a.unlocked, b.unlocked), completed: Math.max(a.completed, b.completed), bestScore: Math.max(a.bestScore, b.bestScore), xp: Math.max(a.xp, b.xp) };
  }
  const sessions = [local.session, cloud.session].filter(s => s && s.endsAt > Date.now());
  return { records, activityDates: [...new Set([...(local.activityDates || []), ...(cloud.activityDates || [])])].sort().slice(-370), session: sessions.sort((a, b) => (b?.startedAt || 0) - (a?.startedAt || 0))[0] };
}
type Snapshot = { legacy: Progress; journey: JourneyProgress };
async function authRequest(path: string, payload: unknown) {
  const response = await fetch(URL + '/auth/v1/' + path, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({})) as { error_description?: string; msg?: string; message?: string; error?: string; access_token?: string; refresh_token?: string; expires_in?: number };
  if (!response.ok) throw new Error(body.error_description || body.msg || body.message || body.error || 'Could not complete sign-in.');
  return body;
}
async function validSession(input: Session): Promise<Session> {
  if (input.expires_at > Date.now() + 60000) return input;
  const result = await authRequest('token?grant_type=refresh_token', { refresh_token: input.refresh_token });
  if (!result.access_token || !result.refresh_token) throw new Error('Please sign in again.');
  const next: Session = { access_token: result.access_token, refresh_token: result.refresh_token, expires_at: Date.now() + (result.expires_in || 3600) * 1000 };
  saveSession(next);
  return next;
}
export async function profileGet(session: Session, userId: string): Promise<LearnerProfile> {
  const response = await fetch(URL + '/rest/v1/learner_profiles?user_id=eq.' + encodeURIComponent(userId) + '&select=display_name,birth_date,avatar,guardian_email,consent_status,preferences', {
    headers: { apikey: KEY, Authorization: 'Bearer ' + session.access_token },
  });
  if (!response.ok) throw new Error('Your learner profile could not be loaded. Please try again or contact support.');
  const rows: unknown = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1 || !rows[0] ||
      !['active', 'pending', 'verified'].includes(rows[0].consent_status)) {
    throw new Error('This account is missing a valid protected learner profile. Please contact support.');
  }
  return rows[0] as LearnerProfile;
}
export async function guardianRequest(session: Session): Promise<void> {
  let response: Response;
  try {
    response = await fetch(URL + '/functions/v1/guardian-consent', {
      method: 'POST',
      headers: { apikey: KEY, Authorization: 'Bearer ' + session.access_token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request' }),
    });
  } catch {
    throw new Error('Guardian verification could not connect. Please try again or contact support.');
  }
  const body = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(body.error || 'Unable to send guardian verification. Please contact support.');
}
async function remoteGet(session: Session): Promise<Snapshot | null> {
  const response = await fetch(URL + '/rest/v1/student_progress?select=payload', {
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
  const [auth, setAuth] = useState<AuthState>({ user: null, profile: null, loading: configured, configured, status: configured ? 'Checking account…' : 'Cloud accounts need Supabase configuration.' });
  const [session, setSession] = useState<Session | null>(null);
  const restored = useRef(false);
  const latest = useRef(snapshot);
  const restoreRef = useRef(onRestore);
  latest.current = snapshot;
  restoreRef.current = onRestore;

  useEffect(() => {
    if (!configured) return;
    let canceled = false;
    async function bootstrap() {
      try {
        const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const callbackError = params.get('error_description') || params.get('error');
        if (callbackError) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          throw new Error(decodeURIComponent(callbackError.replace(/\+/g, ' ')));
        }
        let next = fromStorage();
        const access = params.get('access_token'), refresh = params.get('refresh_token');
        const recovery = params.get('type') === 'recovery';
        if (access && refresh) {
          next = { access_token: access, refresh_token: refresh, expires_at: Date.now() + Number(params.get('expires_in') || '3600') * 1000 };
          saveSession(next);
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        if (!next) { if (!canceled) setAuth({ user: null, profile: null, loading: false, configured: true, status: 'You are playing as a guest.' }); return; }
        next = await validSession(next);
        const response = await fetch(URL + '/auth/v1/user', { headers: { apikey: KEY, Authorization: 'Bearer ' + next.access_token } });
        if (!response.ok) throw new Error('Session expired.');
        const user = await response.json() as User;
        if (canceled) return;
        // A protected profile is required before deciding whether consent is
        // complete. A missing profile or database error must never unlock learning.
        const profile = await profileGet(next, user.id);
        if (canceled) return;
        setSession(next);
        const pending = profile?.consent_status === 'pending';
        if (pending) {
          setAuth({ user, profile, loading: false, configured: true, recovery, status: 'Parent/guardian approval is required before this learner account can be used.' });
          try {
            await guardianRequest(next); // Automatic request after verified learner sign-in.
            if (!canceled) setAuth({ user, profile, loading: false, configured: true, recovery, status: 'Guardian verification link sent. Check the parent/guardian email inbox.' });
          } catch (error) {
            if (!canceled) setAuth({ user, profile, loading: false, configured: true, recovery, status: error instanceof Error ? error.message : 'Guardian email delivery is not configured.' });
          }
          return;
        }
        setAuth({ user, profile, loading: false, configured: true, recovery, status: 'Signed in. Loading cloud progress…' });
        try {
          const cloud = await remoteGet(next);
          if (canceled) return;
          const merged: Snapshot = { legacy: mergeLegacy(latest.current.legacy, cloud?.legacy || {}), journey: mergeJourney(latest.current.journey, cloud?.journey || { records: {} }) };
          restoreRef.current(merged);
          saveProgress(merged.legacy);
          saveJourney(merged.journey);
          restored.current = true;
          setAuth({ user, profile, loading: false, configured: true, recovery, status: 'Cloud progress connected.' });
          try { await remotePut(next, user.id, merged); }
          catch (cloudError) {
            if (!canceled) setAuth({ user, profile, loading: false, configured: true, recovery, status: cloudError instanceof Error ? cloudError.message : 'Cloud save failed.' });
          }
        } catch (cloudError) {
          if (!canceled) setAuth({ user, profile, loading: false, configured: true, recovery, status: cloudError instanceof Error ? cloudError.message : 'Cloud progress unavailable.' });
        }
      } catch (error) {
        if (canceled) return;
        saveSession(null); restored.current = false;
        setAuth({ user: null, profile: null, loading: false, configured: true, status: error instanceof Error ? error.message : 'Could not connect your account.' });
      }
    }
    void bootstrap();
    return () => { canceled = true; };
  }, []);

  useEffect(() => {
    if (!auth.user || !session || !restored.current || !auth.profile ||
        !['active', 'verified'].includes(auth.profile.consent_status)) return;
    const id = window.setTimeout(async () => {
      try {
        const next = await validSession(session);
        if (next.access_token !== session.access_token) setSession(next);
        await remotePut(next, auth.user!.id, latest.current);
        setAuth(previous => previous.user ? { ...previous, status: 'Saved to your account.' } : previous);
      } catch (error) {
        setAuth(previous => ({ ...previous, status: error instanceof Error ? error.message : 'Cloud sync failed.' }));
      }
    }, 1200);
    return () => window.clearTimeout(id);
  }, [snapshot.legacy, snapshot.journey, auth.user?.id, session?.access_token]);


  function acceptCredentials(response: { access_token?: string; refresh_token?: string; expires_in?: number }) {
    if (!response.access_token || !response.refresh_token) {
      throw new Error('No session was created. Confirm your account email, then sign in again.');
    }
    saveSession({
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      expires_at: Date.now() + (response.expires_in || 3600) * 1000,
    });
    // A fresh page load verifies the session and safely merges guest progress.
    window.location.assign(window.location.origin + window.location.pathname);
  }

  async function signUp(email: string, password: string, displayName: string, birthDate: string, guardianEmail: string): Promise<string> {
    if (!configured) throw new Error('Supabase account settings are missing from this build.');
    // Fail closed if the protected profile trigger has not been installed.
    const readyResponse = await fetch(URL + '/rest/v1/rpc/wizpiko_registration_ready', {
      method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: '{}',
    });
    const registrationReady = readyResponse.ok && await readyResponse.json().catch(() => false) === true;
    if (!registrationReady) throw new Error('New registrations are paused until Wizpiko finishes the Supabase learner-account setup.');
    const issue = validateSignup(displayName, birthDate, email, password);
    if (issue) throw new Error(issue);
    const age = ageFromBirthdate(birthDate)!;
    if (age < 10 && (!/^\S+@\S+\.\S+$/.test(guardianEmail.trim()) || guardianEmail.trim().toLowerCase() === email.trim().toLowerCase())) {
      throw new Error('For children under 10, enter a different, valid parent/guardian email.');
    }
    const response = await authRequest('signup', {
      email: email.trim().toLowerCase(), password,
      data: { display_name: displayName.trim(), birth_date: birthDate, guardian_email: age < 10 ? guardianEmail.trim().toLowerCase() : null },
    });
    if (!response.access_token || !response.refresh_token) {
      return 'Check your email for a confirmation link. After confirming, sign in with your password.';
    }
    acceptCredentials(response);
    return 'Account created.';
  }

  async function signIn(email: string, password: string) {
    if (!configured) throw new Error('Supabase account settings are missing from this build.');
    const response = await authRequest('token?grant_type=password', { email: email.trim().toLowerCase(), password });
    acceptCredentials(response);
  }
  async function sendPasswordReset(email: string): Promise<string> {
    if (!configured) throw new Error('Supabase account settings are missing from this build.');
    const redirect = window.location.origin + window.location.pathname;
    await authRequest('recover?redirect_to=' + encodeURIComponent(redirect), { email: email.trim().toLowerCase() });
    return 'If this account exists, a password-reset link will be sent to its email address.';
  }
  async function updatePassword(password: string): Promise<void> {
    if (!session) throw new Error('Open your password-reset link first.');
    if (password.length < 8) throw new Error('Use at least 8 password characters.');
    const next = await validSession(session);
    const response = await fetch(URL + '/auth/v1/user', {
      method: 'PUT', headers: { apikey: KEY, Authorization: 'Bearer ' + next.access_token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) throw new Error('Password change failed. Please request a new reset link.');
    setAuth(previous => ({ ...previous, recovery: false, status: 'Password updated successfully.' }));
  }
  async function sendGuardianVerification(): Promise<void> {
    if (!session || !auth.user) throw new Error('Sign in to request guardian approval.');
    const next = await validSession(session);
    await guardianRequest(next);
    setAuth(previous => ({ ...previous, status: 'Parent/guardian verification email requested. Check the guardian inbox.' }));
  }
  async function updateProfile(patch: Partial<Pick<LearnerProfile, 'display_name' | 'avatar' | 'preferences'>>): Promise<void> {
    if (!session || !auth.user) throw new Error('Sign in first.');
    const next = await validSession(session);
    const response = await fetch(URL + '/rest/v1/learner_profiles?user_id=eq.' + encodeURIComponent(auth.user.id), {
      method: 'PATCH', headers: { apikey: KEY, Authorization: 'Bearer ' + next.access_token, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(patch),
    });
    if (!response.ok) throw new Error('Could not update profile. Check whether the database migration is installed.');
    const rows = await response.json() as LearnerProfile[];
    if (rows[0]) setAuth(previous => ({ ...previous, profile: rows[0], status: 'Profile saved.' }));
  }
  async function signOut() {
    const current = session;
    if (current) {
      void fetch(URL + '/auth/v1/logout', { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + current.access_token } }).catch(() => {});
    }
    saveSession(null); restored.current = false; setSession(null);
    try { localStorage.removeItem('wordsprout-progress-v1'); localStorage.removeItem('wizpiko-english-journey-v1'); } catch { /* private browsing */ }
    restoreRef.current({ legacy: {}, journey: { records: {} } });
    setAuth({ user: null, profile: null, loading: false, configured, status: 'Signed out. You can continue as a guest.' });
  }
  return { auth, signUp, signIn, signOut, sendPasswordReset, updatePassword, sendGuardianVerification, updateProfile };
}
