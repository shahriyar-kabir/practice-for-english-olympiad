import type { ContactMail, SupportBackend, SupportConfig } from './handler.ts';
import { createSmtpMailer } from './smtp.ts';
import type { SmtpConfig, SmtpTransportFactory } from './smtp.ts';

type MailConfig = SmtpConfig & { mailTransport?: string; resendApiKey: string };
const EMAIL = /^[^\s@<>(),;:"\\]+@[^\s@<>(),;:"\\]+\.[^\s@<>(),;:"\\]+$/;
function validSender(value: string): boolean {
  if (!value || value.length > 320 || /[\u0000-\u001f\u007f]/.test(value)) return false;
  if (EMAIL.test(value)) return true;
  const match = value.match(/^[^<>]+<([^<>]+)>$/);
  return !!match && EMAIL.test(match[1]);
}
export function createResendMailer(config: MailConfig,fetcher: typeof fetch = fetch): SupportBackend['mailer'] {
  if (!config.resendApiKey || !validSender(config.fromEmail)) return null;
  return {
    async send(mail: ContactMail) {
      // Recipient and subject are fixed again at this trust boundary. No browser
      // parameter can select a recipient or create a mail header.
      const response = await fetcher('https://api.resend.com/emails',{
        method:'POST',headers:{Authorization:'Bearer ' + config.resendApiKey,'Content-Type':'application/json','Idempotency-Key':'public-support/' + mail.requestId},
        body:JSON.stringify({from:config.fromEmail,to:['support@wizpiko.com'],reply_to:mail.replyTo,subject:'Wizpiko website message',text:mail.text}),
        signal:AbortSignal.timeout(10_000),
      });
      if (response.status !== 200) throw new Error('mail_delivery_failed');
      const result: unknown = await response.json();
      if (!result || typeof result !== 'object' || !('id' in result) || typeof result.id !== 'string' || !result.id.trim()) throw new Error('mail_delivery_failed');
      return {id:result.id};
    },
  };
}
export function createPublicSupportBackend(config: SupportConfig & MailConfig,fetcher: typeof fetch = fetch,createSmtpTransport?: SmtpTransportFactory): SupportBackend {
  const base = config.supabaseUrl.replace(/\/$/,'');
  const allowed = new Set(['wizpiko_public_support_take_buckets','wizpiko_public_account_exists']);
  return {
    async rpc(name,args) {
      if (!allowed.has(name)) throw new Error('unsupported_rpc');
      const response = await fetcher(base + '/rest/v1/rpc/' + name,{
        method:'POST',headers:{apikey:config.serviceRoleKey,Authorization:'Bearer ' + config.serviceRoleKey,'Content-Type':'application/json'},
        body:JSON.stringify(args),signal:AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error('support_database_unavailable');
      return await response.json() as unknown;
    },
    // Exactly one configured transport. A send failure never retries through a
    // different provider, where an ambiguous timeout could duplicate a message.
    mailer:config.mailTransport === 'smtp' ? createSmtpMailer(config,createSmtpTransport) :
      config.mailTransport === 'resend' ? createResendMailer(config,fetcher) : null,
  };
}
