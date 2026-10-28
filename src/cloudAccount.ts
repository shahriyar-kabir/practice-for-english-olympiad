import { useEffect, useRef, useState } from 'react';
import type { JourneyProgress } from './EnglishJourney';
import { saveJourney } from './EnglishJourney';
import type { Progress } from './game';
import { saveProgress } from './game';

type Session = { access_token: string; refresh_token: string; expires_at: number };
type User = { id: string; email?: string };
type AuthState = { user: User | null; loading: boolean; configured: boolean; status: string };
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
  return { records, session: sessions.sort((a, b) => (b?.startedAt || 0) - (a?.startedAt || 0))[0] };
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
  const [auth, setAuth] = useState<AuthState>({ user: null, loading: configured, configured, status: configured ? 'Checking account…' : 'Cloud accounts need Supabase configuration.' });
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
        if (access && refresh) {
          next = { access_token: access, refresh_token: refresh, expires_at: Date.now() + Number(params.get('expires_in') || '3600') * 1000 };
          saveSession(next);
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        if (!next) { if (!canceled) setAuth({ user: null, loading: false, configured: true, status: 'You are playing as a guest.' }); return; }
        next = await validSession(next);
        const response = await fetch(URL + '/auth/v1/user', { headers: { apikey: KEY, Authorization: 'Bearer ' + next.access_token } });
        if (!response.ok) throw new Error('Session expired.');
        const user = await response.json() as User;
        if (canceled) return;
        // Authentication and cloud storage can fail independently. Keep a valid
        // signed-in session even if the progress table or policy is misconfigured.
        setSession(next);
        setAuth({ user, loading: false, configured: true, status: 'Signed in. Loading cloud progress…' });
        try {
          const cloud = await remoteGet(next);
          if (canceled) return;
          const merged: Snapshot = { legacy: mergeLegacy(latest.current.legacy, cloud?.legacy || {}), journey: mergeJourney(latest.current.journey, cloud?.journey || { records: {} }) };
          restoreRef.current(merged);
          saveProgress(merged.legacy);
          saveJourney(merged.journey);
          restored.current = true;
          setAuth({ user, loading: false, configured: true, status: 'Cloud progress connected.' });
          try { await remotePut(next, user.id, merged); }
          catch (cloudError) {
            if (!canceled) setAuth({ user, loading: false, configured: true, status: cloudError instanceof Error ? cloudError.message : 'Cloud save failed.' });
          }
        } catch (cloudError) {
          if (!canceled) setAuth({ user, loading: false, configured: true, status: cloudError instanceof Error ? cloudError.message : 'Cloud progress unavailable.' });
        }
      } catch (error) {
        if (canceled) return;
        saveSession(null); restored.current = false;
        setAuth({ user: null, loading: false, configured: true, status: error instanceof Error ? error.message : 'Could not connect your account.' });
      }
    }
    void bootstrap();
    return () => { canceled = true; };
  }, []);

  useEffect(() => {
    if (!auth.user || !session || !restored.current) return;
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
      throw new Error('No session was created. For password-only testing, turn off Confirm Email in Supabase Authentication → Sign In / Providers → Email.');
    }
    saveSession({
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      expires_at: Date.now() + (response.expires_in || 3600) * 1000,
    });
    // A fresh page load verifies the session and safely merges guest progress.
    window.location.assign(window.location.origin + '/');
  }

  async function signUp(email: string, password: string) {
    if (!configured) throw new Error('Supabase account settings are missing from this build.');
    if (password.length < 8) throw new Error('Use a password of at least 8 characters.');
    const response = await authRequest('signup', { email: email.trim().toLowerCase(), password });
    acceptCredentials(response);
  }

  async function signIn(email: string, password: string) {
    if (!configured) throw new Error('Supabase account settings are missing from this build.');
    const response = await authRequest('token?grant_type=password', { email: email.trim().toLowerCase(), password });
    acceptCredentials(response);
  }
  async function signOut() {
    const current = session;
    if (current) {
      void fetch(URL + '/auth/v1/logout', { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + current.access_token } }).catch(() => {});
    }
    saveSession(null); restored.current = false; setSession(null);
    try { localStorage.removeItem('wordsprout-progress-v1'); localStorage.removeItem('wizpiko-english-journey-v1'); } catch { /* private browsing */ }
    restoreRef.current({ legacy: {}, journey: { records: {} } });
    setAuth({ user: null, loading: false, configured, status: 'Signed out. You can continue as a guest.' });
  }
  return { auth, signUp, signIn, signOut };
}
