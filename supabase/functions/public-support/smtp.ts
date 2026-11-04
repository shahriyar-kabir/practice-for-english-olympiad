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
};
export type SmtpTransportFactory = (options: SmtpTransportOptions) => SmtpTransport;
export const SMTP_TIMEOUT_MS = 10_000;

function senderAddress(value: string): string | null {
  if (!value || value.length > 320 || /[\u0000-\u001f\u007f]/.test(value)) return null;
  const plain = normalizeSupportEmail(value);
  if (plain) return plain;
  const display = value.match(/^[^<>]+<([^<>]+)>$/);
  return display ? normalizeSupportEmail(display[1]) : null;
}

export function createSmtpMailer(config: SmtpConfig, createTransport?: SmtpTransportFactory): SupportBackend['mailer'] {
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
            timer = setTimeout(() => reject(new Error('smtp_timeout')), SMTP_TIMEOUT_MS);
          }),
        ]);
        // accepted alone describes RCPT TO. The final DATA response must also
        // be 250 before we tell the browser that the server accepted the message.
        if (!result || typeof result !== 'object' || !('accepted' in result) || !Array.isArray(result.accepted) ||
          result.accepted.length !== 1 || normalizeSupportEmail(result.accepted[0]) !== SUPPORT_RECIPIENT ||
          !('rejected' in result) || !Array.isArray(result.rejected) || result.rejected.length !== 0 ||
          !('response' in result) || typeof result.response !== 'string' || !/^250(?:[ -]|$)/.test(result.response) ||
          !('messageId' in result) || typeof result.messageId !== 'string' || !result.messageId.trim() ||
          /[\u0000-\u001f\u007f]/.test(result.messageId)) throw new Error('smtp_not_accepted');
        return { id: result.messageId };
      } catch {
        // Do not expose SMTP authentication, server responses or credentials.
        throw new Error('mail_delivery_failed');
      } finally {
        if (timer !== undefined) clearTimeout(timer);
        try { transport?.close(); } catch { /* A cleanup error cannot cause a second send. */ }
      }
    },
  };
}
