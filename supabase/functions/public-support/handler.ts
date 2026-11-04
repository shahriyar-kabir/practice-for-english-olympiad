export type SupportConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  appOrigin: string;
  allowedOrigins?: string;
  rateLimitSalt: string;
};
export type ContactMail = {
  to: 'support@wizpiko.com';
  replyTo: string;
  subject: 'Wizpiko website message';
  text: string;
  requestId: string;
};
export type SupportBackend = {
  rpc: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  mailer: { send: (mail: ContactMail) => Promise<{ id: string }> } | null;
};
const MAX_BODY_BYTES = 24_576;
const EMAIL = /^[^\s@<>(),;:"\\]+@[^\s@<>(),;:"\\]+\.[^\s@<>(),;:"\\]+$/;
const NO_SINGLE_LINE_CONTROLS = /[\u0000-\u001f\u007f]/;
export const SUPPORT_RECIPIENT = 'support@wizpiko.com' as const;
export function normalizeSupportEmail(value: unknown): string | null {
  if (typeof value !== 'string' || NO_SINGLE_LINE_CONTROLS.test(value)) return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && EMAIL.test(email) ? email : null;
}
function allowedOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.origin === value ? value : null;
  } catch { return null; }
}
export async function supportRateKey(salt: string, scope: string, value: string): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify([salt,scope,value]));
  const digest = await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest),b => b.toString(16).padStart(2,'0')).join('');
}
async function readJson(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') throw new Error('unsupported_media_type');
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) throw new Error('payload_too_large');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid_json');
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const part = await reader.read();
    if (part.done) break;
    length += part.value.byteLength;
    if (length > MAX_BODY_BYTES) { await reader.cancel(); throw new Error('payload_too_large'); }
    chunks.push(part.value);
  }
  const content = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { content.set(chunk,offset); offset += chunk.byteLength; }
  const value: unknown = JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(content));
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid_json');
  return value as Record<string,unknown>;
}
function clientAddress(request: Request): string {
  // Only deploy behind an ingress that overwrites these headers. Unknown clients
  // share one restricted bucket rather than bypassing the quota.
  const candidate = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || '';
  return /^[a-fA-F0-9:.]{3,64}$/.test(candidate) ? candidate.toLowerCase() : 'unknown-client';
}
export function createPublicSupportHandler(config: SupportConfig,backend: SupportBackend) {
  const primaryOrigin = allowedOrigin(config.appOrigin);
  const origins = new Set([primaryOrigin,...(config.allowedOrigins || '').split(',').map(v => allowedOrigin(v.trim()))].filter((v): v is string => !!v));
  const backendConfigured = primaryOrigin && allowedOrigin(config.supabaseUrl.replace(/\/$/,'')) &&
    !!config.serviceRoleKey && config.rateLimitSalt.length >= 32;
  return async (request: Request): Promise<Response> => {
    const requestId = crypto.randomUUID();
    const origin = request.headers.get('origin');
    const headers = new Headers({
      'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
      'Referrer-Policy':'no-referrer','Vary':'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
      'X-Request-Id':requestId,
    });
    const permitted = !!origin && origins.has(origin);
    if (permitted) {
      headers.set('Access-Control-Allow-Origin',origin!);
      headers.set('Access-Control-Allow-Methods','POST, OPTIONS');
      headers.set('Access-Control-Allow-Headers','authorization, apikey, content-type, x-client-info');
      headers.set('Access-Control-Expose-Headers','Retry-After, X-Request-Id');
      headers.set('Access-Control-Max-Age','600');
    }
    const json = (body: unknown,status = 200) => {
      const responseHeaders = new Headers(headers); responseHeaders.set('Content-Type','application/json; charset=utf-8');
      return new Response(JSON.stringify(body),{status,headers:responseHeaders});
    };
    const fail = (code: string,status: number,error: string) => json({error,code},status);
    if (!permitted) return fail('origin_not_allowed',403,'This site is not allowed to use Wizpiko support.');
    if (request.method === 'OPTIONS') return new Response(null,{status:204,headers});
    if (request.method !== 'POST') { headers.set('Allow','POST, OPTIONS'); return fail('method_not_allowed',405,'Use POST for this request.'); }
    if (!backendConfigured) return fail('service_unavailable',503,'Wizpiko support is temporarily unavailable. Please try again later.');
    let body: Record<string,unknown>;
    try { body = await readJson(request); }
    catch (error) {
      const code = error instanceof Error ? error.message : '';
      if (code === 'payload_too_large') return fail(code,413,'This request is too large.');
      if (code === 'unsupported_media_type') return fail(code,415,'Send this request as JSON.');
      return fail('invalid_input',400,'Please check the information and try again.');
    }
    const action = body.action;
    const allowedFields = action === 'account-status' ? ['action','email'] : action === 'contact' ? ['action','name','email','suggestion','website'] : [];
    if (!allowedFields.length || Object.keys(body).some(key => !allowedFields.includes(key))) return fail('invalid_input',400,'Please check the information and try again.');
    const email = normalizeSupportEmail(body.email);
    if (!email) return fail('invalid_input',400,'Enter a valid email address.');
    let name = '',suggestion = '';
    if (action === 'contact') {
      name = typeof body.name === 'string' ? body.name.trim() : '';
      suggestion = typeof body.suggestion === 'string' ? body.suggestion.trim() : '';
      const website = body.website === undefined ? '' : body.website;
      if (typeof website !== 'string' || website.trim() || name.length < 1 || name.length > 100 ||
        (typeof body.name === 'string' && NO_SINGLE_LINE_CONTROLS.test(body.name)) || suggestion.length < 10 || suggestion.length > 5000 ||
        /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(suggestion)) {
        return fail('invalid_input',400,'Enter your name, email and a message between 10 and 5,000 characters.');
      }
      if (!backend.mailer) return fail('service_unavailable',503,'The contact form is temporarily unavailable. Please try again later.');
    }
    try {
      const scope = String(action);
      const keys = await Promise.all([
        supportRateKey(config.rateLimitSalt,scope + ':ip',clientAddress(request)),
        supportRateKey(config.rateLimitSalt,scope + ':email',email),
      ]);
      const quota: unknown = await backend.rpc('wizpiko_public_support_take_buckets',{
        p_keys:keys,p_limits:action === 'account-status' ? [20,5] : [3,3],
        p_windows:action === 'account-status' ? [600,600] : [3600,86400],
      });
      if (!quota || typeof quota !== 'object' || !('allowed' in quota) || typeof quota.allowed !== 'boolean') throw new Error('quota_unavailable');
      if (!quota.allowed) {
        const delay = 'retry_after' in quota && typeof quota.retry_after === 'number' && Number.isFinite(quota.retry_after) ? quota.retry_after : 600;
        headers.set('Retry-After',String(Math.min(86400,Math.max(1,Math.ceil(delay)))));
        return fail('rate_limited',429,'Too many requests. Please wait before trying again.');
      }
      if (action === 'account-status') {
        const exists: unknown = await backend.rpc('wizpiko_public_account_exists',{p_email:email});
        if (typeof exists !== 'boolean') throw new Error('lookup_unavailable');
        return json({exists});
      }
      let delivered: { id: string };
      try { delivered = await backend.mailer!.send({
        to:SUPPORT_RECIPIENT,replyTo:email,subject:'Wizpiko website message',
        text:'Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + suggestion,
        requestId,
      }); } catch {
        return fail('delivery_failed',502,'Your message could not be sent. Please try again later.');
      }
      if (!delivered || typeof delivered.id !== 'string' || !delivered.id.trim()) return fail('delivery_failed',502,'Your message could not be sent. Please try again later.');
      return json({accepted:true});
    } catch {
      return fail('service_unavailable',503,'Wizpiko support is temporarily unavailable. Please try again later.');
    }
  };
}
