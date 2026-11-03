export class AccountActionError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'AccountActionError';
    this.code = code;
  }
}

export const ACCOUNT_NOT_FOUND_MESSAGE = 'No account found with this email. Please sign up.';
const supportURL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '') + '/functions/v1/public-support';
const publicKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function normalizeAccountEmail(input: string): string {
  if (typeof input !== 'string' || /[\r\n\u0000-\u001f\u007f]/.test(input)) {
    throw new AccountActionError('invalid_input', 'Enter a valid email address.');
  }
  const email = input.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@<>(),;:"\\]+@[^\s@<>(),;:"\\]+\.[^\s@<>(),;:"\\]+$/.test(email)) {
    throw new AccountActionError('invalid_input', 'Enter a valid email address.');
  }
  return email;
}

async function requestSupport(payload: Record<string, string>): Promise<Record<string, unknown>> {
  if (!supportURL.startsWith('https://') || publicKey.length <= 12) {
    throw new AccountActionError('service_unavailable', 'This service is temporarily unavailable. Please try again later.');
  }
  let response: Response;
  try {
    response = await fetch(supportURL, {
      method: 'POST',
      headers: { apikey: publicKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AccountActionError('network_error', 'We could not reach Wizpiko. Check your connection and try again.');
  }
  const body: unknown = await response.json().catch(() => null);
  const result = body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : {};
  if (!response.ok) {
    // HTTP failures cannot establish that an account does not exist. Only a
    // successful, boolean account-status reply is authoritative for that case.
    const allowedCodes = ['invalid_input', 'origin_not_allowed', 'method_not_allowed', 'payload_too_large',
      'unsupported_media_type', 'rate_limited', 'delivery_failed', 'service_unavailable'];
    const code = response.status === 429 ? 'rate_limited' :
      typeof result.code === 'string' && allowedCodes.includes(result.code) ? result.code : 'service_unavailable';
    const fallback = response.status === 429 ? 'Too many requests. Please wait a few minutes and try again.' :
      'This service is temporarily unavailable. Please try again later.';
    throw new AccountActionError(code, typeof result.error === 'string' ? result.error : fallback);
  }
  return result;
}

export async function accountExists(input: string): Promise<boolean> {
  const email = normalizeAccountEmail(input);
  const result = await requestSupport({ action: 'account-status', email });
  if (typeof result.exists !== 'boolean') {
    throw new AccountActionError('service_unavailable', 'Account lookup is temporarily unavailable. Please try again later.');
  }
  return result.exists;
}

export type ContactSubmission = { name: string; email: string; suggestion: string; website?: string };
export async function submitContact(input: ContactSubmission): Promise<void> {
  const name = input.name.trim();
  const suggestion = input.suggestion.trim();
  if (!name || name.length > 100 || /[\u0000-\u001f\u007f]/.test(input.name)) {
    throw new AccountActionError('invalid_input', 'Enter your name using 1 to 100 characters.');
  }
  const email = normalizeAccountEmail(input.email);
  if (suggestion.length < 10 || suggestion.length > 5000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(suggestion)) {
    throw new AccountActionError('invalid_input', 'Enter a suggestion between 10 and 5,000 characters.');
  }
  const result = await requestSupport({ action: 'contact', name, email, suggestion, website: input.website || '' });
  if (result.accepted !== true) {
    throw new AccountActionError('service_unavailable', 'Your message has not been sent. Please try again later.');
  }
}
