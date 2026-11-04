import { normalizeSupportEmail, SUPPORT_RECIPIENT } from './handler.ts';
import type { SupportBackend } from './handler.ts';

export type SmtpConfig = {
  fromEmail: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUsername?: string;
  smtpPassword?: string;
};
export type SmtpTransportOptions = {
  host: string;
  port: 465;
  secure: true;
  auth: { user: string; pass: string };
  tls: { servername: string; minVersion: 'TLSv1.2'; rejectUnauthorized: true };
  connectionTimeout: number;
  greetingTimeout: number;
  socketTimeout: number;
  logger: false;
  debug: false;
};
export type SmtpMessage = {
  from: string;
  to: typeof SUPPORT_RECIPIENT;
  replyTo: string;
  subject: 'Wizpiko website message';
  text: string;
  envelope: { from: string; to: [typeof SUPPORT_RECIPIENT] };
  disableFileAccess: true;
  disableUrlAccess: true;
};
export type SmtpTransport = {
  sendMail: (message: SmtpMessage) => Promise<unknown>;
  close: () => void;
  getPhase?: () => SmtpPhase;
};
export type SmtpTransportFactory = (options: SmtpTransportOptions) => SmtpTransport;
export const SMTP_TIMEOUT_MS = 10_000;
export type SmtpPhase = 'compose' | 'connect' | 'auth' | 'send' | 'acceptance' | 'unknown';
export type SmtpFailureDiagnostic = {
  requestId: string;
  phase: SmtpPhase;
  code: string;
  responseCode: number | null;
};
const SMTP_PHASES = new Set<SmtpPhase>(['compose', 'connect', 'auth', 'send', 'acceptance', 'unknown']);
const SMTP_CODES = new Set([
  'EAUTH', 'ECONNECTION', 'ESOCKET', 'EDNS', 'ETIMEDOUT', 'ETLS', 'EPROTOCOL', 'EENVELOPE', 'EMESSAGE',
  'ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ENETUNREACH', 'EHOSTUNREACH', 'EACCES', 'EPERM',
  'ERR_ACCESS_DENIED', 'ERR_NOT_IMPLEMENTED', 'ERR_TLS_CERT_ALTNAME_INVALID', 'CERT_HAS_EXPIRED',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'SELF_SIGNED_CERT_IN_CHAIN', 'DEPTH_ZERO_SELF_SIGNED_CERT',
  'ERR_INVALID_ARG_TYPE', 'ERR_INVALID_ARG_VALUE', 'ERR_STREAM_WRITE_AFTER_END',
  'SMTP_TIMEOUT', 'SMTP_NOT_ACCEPTED',
]);
const ERROR_NAMES: Record<string, string> = {
  TypeError: 'TYPE_ERROR', ReferenceError: 'REFERENCE_ERROR', RangeError: 'RANGE_ERROR',
  NotSupported: 'NOT_SUPPORTED', NotSupportedError: 'NOT_SUPPORTED',
  NotCapable: 'ERR_ACCESS_DENIED', PermissionDenied: 'ERR_ACCESS_DENIED',
};
function diagnostic(error: unknown, requestId: string, phase: unknown): SmtpFailureDiagnostic {
  const detail = error && typeof error === 'object' ? error as Record<string, unknown> : {};
  const codes = [detail.originalCode, detail.code];
  const code = codes.find((value): value is string => typeof value === 'string' && SMTP_CODES.has(value));
  return {
    requestId: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(requestId) ? requestId.toLowerCase() : 'unavailable',
    phase: typeof phase === 'string' && SMTP_PHASES.has(phase as SmtpPhase) ? phase as SmtpPhase : 'unknown',
    code: code || (typeof detail.name === 'string' && Object.hasOwn(ERROR_NAMES, detail.name) ? ERROR_NAMES[detail.name] : 'SMTP_UNKNOWN'),
    responseCode: typeof detail.responseCode === 'number' && Number.isInteger(detail.responseCode) &&
      detail.responseCode >= 100 && detail.responseCode <= 599 ? detail.responseCode : null,
  };
}

function senderAddress(value: string): string | null {
  if (!value || value.length > 320 || /[\u0000-\u001f\u007f]/.test(value)) return null;
  const plain = normalizeSupportEmail(value);
  if (plain) return plain;
  const display = value.match(/^[^<>]+<([^<>]+)>$/);
  return display ? normalizeSupportEmail(display[1]) : null;
}

export function createSmtpMailer(config: SmtpConfig, createTransport?: SmtpTransportFactory,
  reportFailure: (failure: SmtpFailureDiagnostic) => void = failure => console.error(JSON.stringify(failure))): SupportBackend['mailer'] {
  const host = (config.smtpHost || '').trim().toLowerCase();
  const username = normalizeSupportEmail(config.smtpUsername);
  const sender = senderAddress(config.fromEmail);
  // Hosted Edge Functions block SMTP ports 25 and 587. Require implicit TLS on
  // 465; there is no plaintext mode, certificate override or automatic fallback.
  if (!createTransport || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(host) ||
    config.smtpPort !== '465' || !username || !config.smtpPassword || !sender || sender !== username) return null;

  return {
    async send(mail) {
      const replyTo = normalizeSupportEmail(mail.replyTo);
      if (!replyTo) throw new Error('mail_delivery_failed');
      let transport: SmtpTransport | undefined;
      let timer: ReturnType<typeof setTimeout> | undefined;
      let phase: SmtpPhase = 'compose';
      try {
        transport = createTransport({
          host, port: 465, secure: true, auth: { user: username, pass: config.smtpPassword! },
          tls: { servername: host, minVersion: 'TLSv1.2', rejectUnauthorized: true },
          connectionTimeout: SMTP_TIMEOUT_MS, greetingTimeout: SMTP_TIMEOUT_MS,
          socketTimeout: SMTP_TIMEOUT_MS, logger: false, debug: false,
        });
        const result = await Promise.race([
          transport.sendMail({
            from: config.fromEmail, to: SUPPORT_RECIPIENT, replyTo,
            subject: 'Wizpiko website message', text: mail.text,
            envelope: { from: sender, to: [SUPPORT_RECIPIENT] },
            disableFileAccess: true, disableUrlAccess: true,
          }),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(Object.assign(new Error('smtp_timeout'), { code: 'SMTP_TIMEOUT' })), SMTP_TIMEOUT_MS);
          }),
        ]);
        phase = 'acceptance';
        // accepted alone describes RCPT TO. The final DATA response must also
        // be 250 before we tell the browser that the server accepted the message.
        if (!result || typeof result !== 'object' || !('accepted' in result) || !Array.isArray(result.accepted) ||
          result.accepted.length !== 1 || normalizeSupportEmail(result.accepted[0]) !== SUPPORT_RECIPIENT ||
          !('rejected' in result) || !Array.isArray(result.rejected) || result.rejected.length !== 0 ||
          !('response' in result) || typeof result.response !== 'string' || !/^250(?:[ -]|$)/.test(result.response) ||
          !('messageId' in result) || typeof result.messageId !== 'string' || !result.messageId.trim() ||
          /[\u0000-\u001f\u007f]/.test(result.messageId)) throw Object.assign(new Error('smtp_not_accepted'), { code: 'SMTP_NOT_ACCEPTED' });
        return { id: result.messageId };
      } catch (error) {
        try {
          reportFailure(diagnostic(error, mail.requestId, phase === 'acceptance' ? phase : transport?.getPhase?.() || phase));
        } catch { /* Diagnostics must never change delivery behavior or expose raw provider errors. */ }
        // Do not expose SMTP authentication, server responses or credentials.
        throw new Error('mail_delivery_failed');
      } finally {
        if (timer !== undefined) clearTimeout(timer);
        try { transport?.close(); } catch { /* A cleanup error cannot cause a second send. */ }
      }
    },
  };
}
