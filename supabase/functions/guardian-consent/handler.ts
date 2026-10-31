export type Config = {
  supabaseUrl: string; serviceRoleKey: string; resendApiKey: string;
  fromEmail: string; appOrigin: string; allowedOrigins?: string;
};
export type RpcResult = {
  code?: string; ok?: boolean; retry_after?: number; id?: string;
  guardian_email?: string; display_name?: string; expires_at?: string; decision?: string;
};
export type Backend = {
  authenticate: (jwt: string) => Promise<{ id: string } | null>;
  rpc: (name: string, args: Record<string, unknown>) => Promise<RpcResult>;
  fetch: typeof fetch;
};
const MAX_BODY = 4096;
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function newToken(): string {
  return [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, '0')).join('');
}
function origin(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.origin === value ? value : null;
  } catch { return null; }
}
const errors: Record<string, [number, string]> = {
  not_found: [403, 'This account has no learner profile. Please contact Wizpiko support.'],
  not_pending: [409, 'This learner does not need a guardian approval request.'],
  unconfirmed: [403, 'Confirm your learner email before requesting guardian approval.'],
  invalid_guardian: [409, 'A separate, valid guardian email must be configured for this learner.'],
  rejected: [409, 'The guardian declined this request. Contact Wizpiko support for help.'],
  rate_limited: [429, 'Too many guardian email requests. Please wait before trying again.'],
  invalid_token: [400, 'This guardian link is invalid. Ask the learner to request another email.'],
  expired: [410, 'This guardian link has expired. Ask the learner to request another email.'],
  used: [409, 'This guardian link has already been used or replaced.'],
  guardian_changed: [409, 'The guardian information changed. Request a new approval link.'],
  delivery_pending: [409, 'This guardian link is not ready. Please try again shortly.'],
};

async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (Number(request.headers.get('content-length')) > MAX_BODY) throw new Error('too_large');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('bad_body');
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) { await reader.cancel(); throw new Error('too_large'); }
    chunks.push(value);
  }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
  const text = new TextDecoder().decode(buffer);
  const type = request.headers.get('content-type')?.split(';')[0].trim();
  if (type === 'application/x-www-form-urlencoded') {
    const params = new URLSearchParams(text);
    if ([...params.keys()].some(key => params.getAll(key).length !== 1)) throw new Error('bad_body');
    return Object.fromEntries(params);
  }
  if (type !== 'application/json') throw new Error('unsupported_media_type');
  const body = JSON.parse(text);
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('bad_body');
  return body;
}

export function createGuardianHandler(config: Config, backend: Backend): (request: Request) => Promise<Response> {
  const appOrigin = origin(config.appOrigin);
  const allowed = new Set([appOrigin, ...(config.allowedOrigins || '').split(',').map(v => origin(v.trim()))].filter((v): v is string => !!v));
  let functionOrigin = '';
  try { functionOrigin = new URL(config.supabaseUrl).origin; } catch { /* fail closed below */ }
  return async request => {
    const requestId = crypto.randomUUID();
    const requestOrigin = request.headers.get('origin');
    const headers = new Headers({
      'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff',
      Vary: 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers', 'X-Request-Id': requestId,
    });
    if (requestOrigin && allowed.has(requestOrigin)) {
      headers.set('Access-Control-Allow-Origin', requestOrigin);
      headers.set('Access-Control-Allow-Headers', 'authorization, apikey, content-type, x-client-info');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      headers.set('Access-Control-Expose-Headers', 'Retry-After, X-Request-Id');
      headers.set('Access-Control-Max-Age', '600');
    }
    const json = (body: unknown, status = 200) => {
      const h = new Headers(headers); h.set('Content-Type', 'application/json');
      return new Response(JSON.stringify(body), { status, headers: h });
    };
    const fail = (code: string, status: number, error: string) => json({ error, code, request_id: requestId }, status);
    const html = (content: string, status = 200) => {
      const h = new Headers(headers);
      h.set('Content-Type', 'text/html; charset=utf-8');
      h.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
      h.set('X-Frame-Options', 'DENY');
      return new Response('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wizpiko Guardian Approval</title></head><body style="font:17px system-ui;line-height:1.6;max-width:36rem;margin:3rem auto;padding:1rem;color:#183469"><main><h1>Wizpiko</h1>' + content + '</main></body></html>', { status, headers: h });
    };
    const logicalError = (result: RpcResult, page: boolean): Response | null => {
      if (!result.code) return null;
      const [status, message] = errors[result.code] || [503, 'Guardian approval is temporarily unavailable. Please try again later.'];
      if (status === 429) headers.set('Retry-After', String(Math.max(1, Math.ceil(result.retry_after || 600))));
      return page ? html('<p>' + escapeHtml(message) + '</p>', status) : fail(result.code, status, message);
    };
    const url = new URL(request.url);
    const pageRequest = request.method === 'GET' || request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded');
    try {
      if (requestOrigin && !allowed.has(requestOrigin) && !(request.method === 'POST' && requestOrigin === functionOrigin)) return fail('origin_not_allowed', 403, 'This site is not allowed to request guardian approval.');
      if (request.method === 'OPTIONS') {
        if (!requestOrigin || !allowed.has(requestOrigin)) return fail('origin_not_allowed', 403, 'Origin is not allowed.');
        return new Response(null, { status: 204, headers });
      }
      if (!['GET', 'POST'].includes(request.method)) {
        headers.set('Allow', 'GET, POST, OPTIONS');
        return fail('method_not_allowed', 405, 'Method not allowed.');
      }
      if (!appOrigin || !origin(functionOrigin) || !config.serviceRoleKey) return fail('not_configured', 503, 'Guardian approval is not configured. Please contact Wizpiko support.');
      if (request.method === 'GET') {
        const token = url.searchParams.get('token') || '';
        if (!TOKEN_PATTERN.test(token)) return html('<p>Invalid guardian approval link.</p>', 400);
        const result = await backend.rpc('guardian_consent_inspect', { p_token_hash: await hashToken(token) });
        const error = logicalError(result, true); if (error) return error;
        if (typeof result.display_name !== 'string' || !result.expires_at || !Number.isFinite(Date.parse(result.expires_at))) throw new Error('invalid_inspection');
        // GET is read-only: mail scanners and prefetchers cannot grant consent.
        const endpoint = escapeHtml(url.origin + url.pathname);
        return html('<h2>Review guardian approval</h2><p>A learner (' + escapeHtml(result.display_name || 'Learner') + ') has asked to create a Wizpiko account.</p><p>Continue only if you are their parent or legal guardian. Approving lets this learner use their account and save learning progress online.</p><p>Review <a href="' + escapeHtml(appOrigin) + '" rel="noreferrer">Wizpiko’s account and privacy information</a> before deciding. Email ownership alone does not establish parental identity or satisfy every legal consent requirement.</p><form method="POST" action="' + endpoint + '"><input type="hidden" name="token" value="' + token + '"><button type="submit" name="action" value="approve">I am the guardian and approve</button> <button type="submit" name="action" value="reject">Decline this request</button></form><p>If you do not recognize this request, decline it or close this page. Opening this link does not approve the account.</p>');
      }
      const body = await readBody(request);
      if (body.action === 'inspect') {
        if (pageRequest || Object.keys(body).some(key => !['action', 'token'].includes(key))) return fail('invalid_request', 400, 'Expected an approval inspection request.');
        const token = typeof body.token === 'string' ? body.token : '';
        if (!TOKEN_PATTERN.test(token)) return fail('invalid_token', 400, 'Invalid guardian approval link.');
        const result = await backend.rpc('guardian_consent_inspect', { p_token_hash: await hashToken(token) });
        const error = logicalError(result, false); if (error) return error;
        if (typeof result.display_name !== 'string' || !result.expires_at || !Number.isFinite(Date.parse(result.expires_at))) throw new Error('invalid_inspection');
        return json({ ok: true, display_name: result.display_name, expires_at: result.expires_at });
      }
      if (body.action === 'approve' || body.action === 'reject') {
        if (Object.keys(body).some(key => !['action', 'token'].includes(key))) return fail('invalid_request', 400, 'Unexpected approval fields.');
        const token = typeof body.token === 'string' ? body.token : '';
        if (!TOKEN_PATTERN.test(token)) return pageRequest ? html('<p>Invalid guardian approval link.</p>', 400) : fail('invalid_token', 400, 'Invalid guardian approval link.');
        const result = await backend.rpc('guardian_consent_decide', { p_token_hash: await hashToken(token), p_decision: body.action });
        const error = logicalError(result, !!pageRequest); if (error) return error;
        if (result.ok !== true || result.decision !== body.action) throw new Error('invalid_decision_result');
        if (!pageRequest) return json({ ok: true, decision: result.decision });
        return html(body.action === 'approve' ? '<h2>Approval recorded</h2><p>The learner can sign out and sign in again to refresh their account.</p>' : '<h2>Request declined</h2><p>The learner account remains blocked. This approval link cannot be used again.</p>');
      }
      if (body.action !== 'request' || Object.keys(body).length !== 1) return fail('invalid_request', 400, 'Expected {"action":"request"}.');
      const match = /^Bearer ([^\s]+)$/i.exec(request.headers.get('authorization') || '');
      if (!match || match[1].length > 8192) return fail('unauthorized', 401, 'Please sign in with a confirmed learner email first.');
      const user = await backend.authenticate(match[1]);
      if (!user) return fail('unauthorized', 401, 'Your session is invalid or your learner email is unconfirmed. Please sign in again.');
      if (!config.resendApiKey || !config.fromEmail) return fail('email_not_configured', 503, 'Guardian email delivery is not configured. Please contact Wizpiko support.');
      const token = newToken();
      const reservation = await backend.rpc('guardian_consent_reserve', { p_learner_id: user.id, p_token_hash: await hashToken(token) });
      const error = logicalError(reservation, false); if (error) return error;
      if (!reservation.id || typeof reservation.guardian_email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reservation.guardian_email) || typeof reservation.display_name !== 'string' || !reservation.expires_at || !Number.isFinite(Date.parse(reservation.expires_at))) throw new Error('invalid_reservation');
      // The app serves the review UI because the default Supabase gateway may
      // rewrite HTML to plain text. Keep capabilities out of HTTP/referrer logs.
      const link = appOrigin + '/#guardian-consent?token=' + token;
      let sent = false;
      try {
        const response = await backend.fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + config.resendApiKey, 'Content-Type': 'application/json', 'Idempotency-Key': 'guardian-consent/' + reservation.id },
          body: JSON.stringify({
            from: config.fromEmail, to: [reservation.guardian_email], subject: 'Wizpiko – guardian approval request',
            text: 'A Wizpiko learner (' + (reservation.display_name || 'Learner') + ') has asked you to review their account. If you are their parent or guardian, review and explicitly approve or decline at ' + link + '\nThis single-use link expires in 24 hours. If unexpected, decline it or ignore this message.',
            html: '<p>A Wizpiko learner (' + escapeHtml(reservation.display_name || 'Learner') + ') has asked you to review their account.</p><p>If you are their parent or guardian, <a href="' + escapeHtml(link) + '">review and approve or decline the request</a>.</p><p>This single-use link expires in 24 hours. Opening it does not approve the account. If unexpected, decline it or ignore this email.</p>',
          }), signal: AbortSignal.timeout(10_000),
        });
        sent = response.ok && typeof (await response.json().catch(() => null))?.id === 'string';
      } catch { /* Ambiguous delivery stays invalid; never grant consent on failure. */ }
      const delivery = await backend.rpc('guardian_consent_delivery', { p_id: reservation.id, p_sent: sent });
      const deliveryError = logicalError(delivery, false); if (deliveryError) return deliveryError;
      if (delivery.ok !== true) throw new Error('invalid_delivery_result');
      if (!sent) return fail('email_delivery_failed', 502, 'Guardian email could not be sent. Please wait 10 minutes and try again.');
      return json({ ok: true, message: 'Guardian email sent.', expires_at: reservation.expires_at });
    } catch (error) {
      if (error instanceof Error && error.message === 'email_confirmation_disabled') return fail('email_confirmation_disabled', 503, 'Guardian verification is paused until learner email confirmation is enabled. Please contact Wizpiko support.');
      if (error instanceof Error && ['too_large', 'bad_body', 'unsupported_media_type'].includes(error.message)) return fail(error.message, error.message === 'too_large' ? 413 : error.message === 'unsupported_media_type' ? 415 : 400, 'Send a valid, small JSON request or guardian approval form.');
      if (error instanceof SyntaxError) return fail('invalid_json', 400, 'The request contains invalid JSON.');
      // Never log bearer tokens, guardian addresses, bodies or provider responses.
      console.error(JSON.stringify({ event: 'guardian_consent_error', request_id: requestId }));
      return pageRequest ? html('<p>Guardian approval is temporarily unavailable. Please try again later.</p>', 503) : fail('temporarily_unavailable', 503, 'Guardian approval is temporarily unavailable. Please try again later.');
    }
  };
}
