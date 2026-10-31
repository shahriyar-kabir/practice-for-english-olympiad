import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

type Decision = 'approve' | 'reject';
type GuardianDetails = { display_name: string; expires_at: string };
type GuardianResult = { ok: true; decision?: Decision; display_name?: string; expires_at?: string };
type PageState = { status: 'loading' } | { status: 'ready' | 'submitting'; details: GuardianDetails } |
  { status: 'complete'; decision: Decision } | { status: 'error'; message: string };

const endpoint = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const publicKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Call once before mounting the app. Guardian tokens never enter app auth,
// storage, server request URLs, browser history, or outgoing referrers.
export function consumeGuardianLink(): { token: string } | null {
  if (!window.location.hash.startsWith('#guardian-consent?')) return null;
  const params = new URLSearchParams(window.location.hash.slice('#guardian-consent?'.length));
  const token = params.get('token') || '';
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  const referrer = document.querySelector<HTMLMetaElement>('meta[name="referrer"]') || document.createElement('meta');
  referrer.name = 'referrer';
  referrer.content = 'no-referrer';
  if (!referrer.parentNode) document.head.appendChild(referrer);
  document.title = 'Wizpiko Guardian Approval';
  return { token };
}

export async function guardianAction(action: 'inspect' | Decision, token: string, signal?: AbortSignal): Promise<GuardianResult> {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error('This guardian approval link is invalid. Ask the learner to request a new email.');
  if (!endpoint.startsWith('https://') || !publicKey) throw new Error('Guardian approval is unavailable in this build. Please contact Wizpiko support.');
  let response: Response;
  try {
    response = await fetch(endpoint + '/functions/v1/guardian-consent', {
      method: 'POST',
      headers: { apikey: publicKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, token }),
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('Guardian approval could not connect. Open the email link again when your connection is available.');
  }
  const result: unknown = await response.json().catch(() => null);
  const body = result && typeof result === 'object' ? result as Record<string, unknown> : {};
  if (!response.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : 'This link could not be used. It may have expired or already been used. Ask the learner to request a new email.');
  }
  if (body.ok !== true || (action === 'inspect' && (typeof body.display_name !== 'string' ||
      typeof body.expires_at !== 'string' || !Number.isFinite(Date.parse(body.expires_at)))) ||
      (action !== 'inspect' && body.decision !== action)) {
    throw new Error('Guardian approval returned an unexpected response. Please contact Wizpiko support.');
  }
  return body as GuardianResult;
}

const card: CSSProperties = { width: 'min(100%, 560px)', padding: 'clamp(24px, 5vw, 40px)', borderRadius: 22, background: 'white', boxShadow: '0 12px 40px #18346915' };

export default function GuardianConsentPage({ token }: { token: string }) {
  const [state, setState] = useState<PageState>({ status: 'loading' });
  const [acknowledged, setAcknowledged] = useState(false);
  const inFlight = useRef(false);
  const tokenRef = useRef(token);
  useEffect(() => {
    const controller = new AbortController();
    void guardianAction('inspect', tokenRef.current, controller.signal).then(result => {
      if (!controller.signal.aborted) setState({ status: 'ready', details: { display_name: result.display_name!, expires_at: result.expires_at! } });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ status: 'error', message: error instanceof Error ? error.message : 'This link could not be checked. Please try again later.' });
    });
    return () => controller.abort();
  }, []);

  async function decide(decision: Decision) {
    if (state.status !== 'ready' || inFlight.current || (decision === 'approve' && !acknowledged)) return;
    inFlight.current = true;
    setState({ status: 'submitting', details: state.details });
    try {
      await guardianAction(decision, tokenRef.current);
      tokenRef.current = '';
      setState({ status: 'complete', decision });
    } catch (error) {
      tokenRef.current = '';
      setState({ status: 'error', message: error instanceof Error ? error.message : 'This decision could not be recorded. Please contact support.' });
    }
  }

  const details = state.status === 'ready' || state.status === 'submitting' ? state.details : null;
  return <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 20, background: '#eff6ff', color: '#183469' }}>
    <section style={card} aria-labelledby="guardian-heading">
      <p style={{ fontWeight: 900, color: '#1265ea', marginTop: 0 }}>Wizpiko</p>
      <h1 id="guardian-heading" style={{ fontSize: 28, lineHeight: 1.25 }}>Guardian account approval</h1>
      {state.status === 'loading' && <p role="status">Checking your approval link…</p>}
      {details && <>
        <p>A learner using the nickname <strong>{details.display_name}</strong> has requested your permission to create a Wizpiko account.</p>
        <p>The learner account stays blocked until you explicitly approve. Opening this page does not approve the request.</p>
        <p style={{ fontSize: 14 }}>This confirms access to the guardian email address and records your decision. Additional guardian identity or consent steps may be required.</p>
        <p style={{ fontSize: 14 }}>Link expires: <time dateTime={details.expires_at}>{new Date(details.expires_at).toLocaleString()}</time></p>
        <form onSubmit={event => { event.preventDefault(); void decide('approve'); }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '24px 0', lineHeight: 1.6 }}>
            <input type="checkbox" required checked={acknowledged} disabled={state.status !== 'ready'} onChange={event => setAcknowledged(event.target.checked)} style={{ marginTop: 6, flexShrink: 0 }} />
            <span>I am this learner’s parent or legal guardian, and I give permission to create this Wizpiko account.</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button type="submit" className="wiz-btn-primary" disabled={state.status !== 'ready' || !acknowledged}>Approve learner account</button>
            <button type="button" className="wiz-btn-secondary" disabled={state.status !== 'ready'} onClick={() => { void decide('reject'); }}>Reject request</button>
          </div>
          {state.status === 'submitting' && <p role="status">Recording your decision…</p>}
        </form>
        <p style={{ fontSize: 14 }}>If you do not recognize this request, choose Reject request.</p>
      </>}
      {state.status === 'complete' && <div role="status">
        <h2>{state.decision === 'approve' ? 'Approval recorded' : 'Request rejected'}</h2>
        <p>{state.decision === 'approve' ? 'The learner can sign in again to refresh their account. This link has been used and cannot be used again.' : 'The learner account remains blocked. This link has been used and cannot approve the account.'}</p>
      </div>}
      {state.status === 'error' && <div role="alert"><p>{state.message}</p><p>This page could not confirm the request status. For an expired or used link, ask the learner to request a new email. If you already submitted a decision, contact Wizpiko support to confirm whether it was recorded.</p></div>}
      <p style={{ marginBottom: 0, marginTop: 28 }}><a href={window.location.pathname + window.location.search} referrerPolicy="no-referrer">Return to Wizpiko</a></p>
    </section>
  </main>;
}
