import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPublicSupportHandler } from './handler';
import type { ContactMail } from './handler';
import { createSmtpMailer, SMTP_TIMEOUT_MS } from './smtp';
import { createPublicSupportBackend } from './supabase';

const config = {
  supabaseUrl: 'https://example.supabase.co', serviceRoleKey: 'server-only-role',
  appOrigin: 'https://wizpiko.com', rateLimitSalt: 'private-random-salt-at-least-thirty-two-characters',
  mailTransport: 'smtp', fromEmail: 'Wizpiko <support@wizpiko.com>', resendApiKey: 'unused-resend-key',
  smtpHost: 'mail.spacemail.com', smtpPort: '465', smtpUsername: 'support@wizpiko.com', smtpPassword: 'private-offline-placeholder',
};
const mail: ContactMail = {
  to: 'support@wizpiko.com', replyTo: 'visitor@example.com', subject: 'Wizpiko website message',
  text: 'Name: A visitor\n\nA plain-text message with "quotes", <b>markup</b> and\n.a leading dot.', requestId: 'request-123',
};
const accepted = { accepted: ['support@wizpiko.com'], rejected: [], response: '250 2.0.0 Message accepted', messageId: '<message-id@wizpiko.com>' };
let sendMail: ReturnType<typeof vi.fn>;
let close: ReturnType<typeof vi.fn>;
let factory: ReturnType<typeof vi.fn>;
beforeEach(() => {
  sendMail = vi.fn().mockResolvedValue(accepted);
  close = vi.fn();
  factory = vi.fn().mockImplementation(() => ({ sendMail, close }));
});
afterEach(() => { vi.useRealTimers(); });

describe('SpaceMail SMTP configuration and headers', () => {
  it('opens no connection until a message is submitted and requires an injected implementation', () => {
    expect(createSmtpMailer(config)).toBeNull();
    expect(createSmtpMailer(config, factory)).not.toBeNull();
    expect(factory).not.toHaveBeenCalled();
  });
  it.each([
    { smtpHost: '' }, { smtpHost: 'https://mail.spacemail.com' }, { smtpPort: '25' }, { smtpPort: '587' },
    { smtpPort: '' }, { smtpUsername: 'invalid' }, { smtpPassword: '' },
    { smtpUsername: 'support@wizpiko.com\r\nBcc:bad@example.com' },
    { fromEmail: 'Wizpiko <support@wizpiko.com>\r\nBcc:bad@example.com' },
    { fromEmail: 'Other <other@wizpiko.com>' },
  ])('fails closed for incomplete or unsafe SMTP configuration %j', patch => {
    expect(createSmtpMailer({ ...config, ...patch }, factory)).toBeNull();
    expect(factory).not.toHaveBeenCalled();
  });
  it('uses implicit TLS, verified certificates, authenticated mailbox and bounded phase timeouts', async () => {
    await createSmtpMailer(config, factory)!.send(mail);
    expect(factory).toHaveBeenCalledWith({
      host: 'mail.spacemail.com', port: 465, secure: true,
      auth: { user: 'support@wizpiko.com', pass: 'private-offline-placeholder' },
      tls: { servername: 'mail.spacemail.com', minVersion: 'TLSv1.2', rejectUnauthorized: true },
      connectionTimeout: SMTP_TIMEOUT_MS, greetingTimeout: SMTP_TIMEOUT_MS, socketTimeout: SMTP_TIMEOUT_MS,
      logger: false, debug: false,
    });
  });
  it('fixes sender, recipient, subject and envelope while keeping a validated Reply-To and plain text', async () => {
    const supplied = { ...mail, to: 'attacker@example.com', subject: 'Untrusted subject' } as unknown as ContactMail;
    await expect(createSmtpMailer(config, factory)!.send(supplied)).resolves.toEqual({ id: accepted.messageId });
    expect(sendMail).toHaveBeenCalledExactlyOnceWith({
      from: 'Wizpiko <support@wizpiko.com>', to: 'support@wizpiko.com', replyTo: 'visitor@example.com',
      subject: 'Wizpiko website message', text: mail.text,
      envelope: { from: 'support@wizpiko.com', to: ['support@wizpiko.com'] },
      disableFileAccess: true, disableUrlAccess: true,
    });
    expect(JSON.stringify(sendMail.mock.calls[0][0])).not.toContain(config.smtpPassword);
  });
  it('rejects Reply-To header injection before constructing a transport', async () => {
    await expect(createSmtpMailer(config, factory)!.send({ ...mail, replyTo: 'visitor@example.com\r\nBcc:bad@example.com' })).rejects.toThrow('mail_delivery_failed');
    expect(factory).not.toHaveBeenCalled();
  });
});

describe('honest SMTP acceptance, timeout and cleanup', () => {
  it.each([
    null, {}, { ...accepted, accepted: [] }, { ...accepted, accepted: ['other@example.com'] },
    { ...accepted, rejected: ['support@wizpiko.com'] }, { ...accepted, rejected: undefined },
    { ...accepted, response: '354 Continue with DATA' }, { ...accepted, response: '550 Rejected' },
    { ...accepted, messageId: '' }, { ...accepted, messageId: '<id>\r\nBcc:bad@example.com' },
  ])('rejects partial, ambiguous or rejected SMTP results %j', async result => {
    sendMail.mockResolvedValueOnce(result);
    await expect(createSmtpMailer(config, factory)!.send(mail)).rejects.toThrow('mail_delivery_failed');
    expect(close).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(1);
  });
  it('removes its timer and closes the connection after final acceptance', async () => {
    vi.useFakeTimers();
    await expect(createSmtpMailer(config, factory)!.send(mail)).resolves.toEqual({ id: accepted.messageId });
    expect(close).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('closes after authentication/network failure and hides the server error', async () => {
    sendMail.mockRejectedValueOnce(new Error('AUTH failed with sensitive provider detail'));
    await expect(createSmtpMailer(config, factory)!.send(mail)).rejects.toThrow(/^mail_delivery_failed$/);
    expect(close).toHaveBeenCalledTimes(1);
  });
  it('times out once, closes the active transport and never turns late acceptance into success', async () => {
    vi.useFakeTimers();
    let complete!: (value: unknown) => void;
    sendMail.mockImplementationOnce(() => new Promise(resolve => { complete = resolve; }));
    const result = expect(createSmtpMailer(config, factory)!.send(mail)).rejects.toThrow('mail_delivery_failed');
    await vi.advanceTimersByTimeAsync(SMTP_TIMEOUT_MS);
    await result;
    expect(close).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    complete(accepted);
    await Promise.resolve();
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(factory).toHaveBeenCalledTimes(1);
  });
  it('does not retry a message because cleanup throws after server acceptance', async () => {
    close.mockImplementationOnce(() => { throw new Error('Already closed'); });
    await expect(createSmtpMailer(config, factory)!.send(mail)).resolves.toEqual({ id: accepted.messageId });
    expect(sendMail).toHaveBeenCalledTimes(1);
  });
});

describe('explicit contact mail transport selection', () => {
  it.each(['', 'unknown'])('does not choose a provider implicitly for transport=%s', transport => {
    const fetcher = vi.fn();
    expect(createPublicSupportBackend({ ...config, mailTransport: transport }, fetcher, factory).mailer).toBeNull();
    expect(factory).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
  });
  it('never falls back to configured Resend when SMTP configuration is missing', () => {
    const fetcher = vi.fn();
    expect(createPublicSupportBackend({ ...config, smtpPassword: '' }, fetcher, factory).mailer).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('never falls back to Resend after SMTP rejection', async () => {
    const fetcher = vi.fn();
    sendMail.mockRejectedValueOnce(new Error('SMTP rejected'));
    await expect(createPublicSupportBackend(config, fetcher, factory).mailer!.send(mail)).rejects.toThrow('mail_delivery_failed');
    expect(fetcher).not.toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledTimes(1);
  });
  it('keeps Resend available only when explicitly selected', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ id: 'resend-id' }));
    await expect(createPublicSupportBackend({ ...config, mailTransport: 'resend' }, fetcher, factory).mailer!.send(mail)).resolves.toEqual({ id: 'resend-id' });
    expect(factory).not.toHaveBeenCalled();
    expect(fetcher.mock.calls[0][0]).toBe('https://api.resend.com/emails');
  });
  it('returns honest HTTP 502 for a failed SMTP submission through the handler', async () => {
    const fetcher = vi.fn();
    const backend = createPublicSupportBackend(config, fetcher, factory);
    backend.rpc = vi.fn().mockResolvedValue({ allowed: true });
    sendMail.mockRejectedValueOnce(new Error('Authentication rejected'));
    const response = await createPublicSupportHandler(config, backend)(new Request('https://example.supabase.co/functions/v1/public-support', {
      method: 'POST', headers: { Origin: config.appOrigin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'contact', name: 'Visitor', email: mail.replyTo, suggestion: 'Please add more learning games.' }),
    }));
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ code: 'delivery_failed' });
    expect(close).toHaveBeenCalledTimes(1);
    expect(fetcher).not.toHaveBeenCalled();
  });
});

const diagnosticRequestId = '1e3551bb-7e39-4f04-90f2-3ccbfa66aefa';
describe('private server-side SMTP failure diagnostics', () => {
  it('classifies a runtime error without copying its message or stack', async () => {
    const report = vi.fn();
    sendMail.mockRejectedValueOnce(new TypeError(config.smtpPassword));
    await expect(createSmtpMailer(config, factory, report)!.send({ ...mail, requestId: diagnosticRequestId })).rejects.toThrow(/^mail_delivery_failed$/);
    expect(report).toHaveBeenCalledExactlyOnceWith({ requestId: diagnosticRequestId, phase: 'compose', code: 'TYPE_ERROR', responseCode: null });
    expect(JSON.stringify(report.mock.calls)).not.toContain(config.smtpPassword);
  });
  it('reports only a correlation id, phase, whitelisted code and numeric response code', async () => {
    const report = vi.fn();
    const providerError = Object.assign(new Error('AUTH PLAIN private-mailbox-password visitor@example.com'), {
      code: 'EAUTH', responseCode: 535, response: '535 sensitive provider reply',
      stack: 'sensitive stack', auth: config.smtpPassword,
    });
    factory.mockImplementationOnce(() => ({ sendMail, close, getPhase: () => 'auth' }));
    sendMail.mockRejectedValueOnce(providerError);
    await expect(createSmtpMailer(config, factory, report)!.send({ ...mail, requestId: diagnosticRequestId })).rejects.toThrow(/^mail_delivery_failed$/);
    expect(report).toHaveBeenCalledExactlyOnceWith({ requestId: diagnosticRequestId, phase: 'auth', code: 'EAUTH', responseCode: 535 });
    expect(JSON.stringify(report.mock.calls)).not.toMatch(/password|visitor@|sensitive|AUTH PLAIN/);
    expect(close).toHaveBeenCalledTimes(1);
  });
  it('drops arbitrary provider values from every diagnostic field', async () => {
    const report = vi.fn();
    factory.mockImplementationOnce(() => ({ sendMail, close, getPhase: () => config.smtpPassword }));
    sendMail.mockRejectedValueOnce({ code: config.smtpPassword, originalCode: mail.text, responseCode: '535 '+mail.replyTo,
      message: config.smtpPassword, response: mail.text, stack: mail.text });
    await expect(createSmtpMailer(config, factory, report)!.send({ ...mail, requestId: mail.replyTo })).rejects.toThrow(/^mail_delivery_failed$/);
    expect(report).toHaveBeenCalledExactlyOnceWith({ requestId: 'unavailable', phase: 'unknown', code: 'SMTP_UNKNOWN', responseCode: null });
    expect(JSON.stringify(report.mock.calls)).not.toContain(config.smtpPassword);
    expect(JSON.stringify(report.mock.calls)).not.toContain(mail.replyTo);
  });
  it('preserves a whitelisted underlying network code without logging server text', async () => {
    const report = vi.fn();
    factory.mockImplementationOnce(() => ({ sendMail, close, getPhase: () => 'connect' }));
    sendMail.mockRejectedValueOnce({ code: 'ESOCKET', originalCode: 'ECONNREFUSED', responseCode: 999, response: config.smtpPassword });
    await expect(createSmtpMailer(config, factory, report)!.send({ ...mail, requestId: diagnosticRequestId })).rejects.toThrow(/^mail_delivery_failed$/);
    expect(report).toHaveBeenCalledExactlyOnceWith({ requestId: diagnosticRequestId, phase: 'connect', code: 'ECONNREFUSED', responseCode: null });
  });
  it('reports invalid final acceptance as its own phase rather than an auth failure', async () => {
    const report = vi.fn();
    factory.mockImplementationOnce(() => ({ sendMail, close, getPhase: () => 'send' }));
    sendMail.mockResolvedValueOnce({ ...accepted, response: '550 rejected' });
    await expect(createSmtpMailer(config, factory, report)!.send({ ...mail, requestId: diagnosticRequestId })).rejects.toThrow(/^mail_delivery_failed$/);
    expect(report).toHaveBeenCalledExactlyOnceWith({ requestId: diagnosticRequestId, phase: 'acceptance', code: 'SMTP_NOT_ACCEPTED', responseCode: null });
  });
  it('records the active phase on its overall deadline and still closes only once', async () => {
    vi.useFakeTimers();
    const report = vi.fn();
    factory.mockImplementationOnce(() => ({ sendMail, close, getPhase: () => 'connect' }));
    sendMail.mockImplementationOnce(() => new Promise(() => {}));
    const result = expect(createSmtpMailer(config, factory, report)!.send({ ...mail, requestId: diagnosticRequestId })).rejects.toThrow(/^mail_delivery_failed$/);
    await vi.advanceTimersByTimeAsync(SMTP_TIMEOUT_MS);
    await result;
    expect(report).toHaveBeenCalledExactlyOnceWith({ requestId: diagnosticRequestId, phase: 'connect', code: 'SMTP_TIMEOUT', responseCode: null });
    expect(close).toHaveBeenCalledTimes(1);
  });
  it('keeps the same failure and cleanup if the diagnostic sink fails', async () => {
    const report = vi.fn().mockImplementation(() => { throw new Error('logger unavailable'); });
    sendMail.mockRejectedValueOnce({ code: 'EAUTH', responseCode: 535 });
    await expect(createSmtpMailer(config, factory, report)!.send(mail)).rejects.toThrow(/^mail_delivery_failed$/);
    expect(close).toHaveBeenCalledTimes(1);
  });
  it('serializes only the safe diagnostic object through the default server logger', async () => {
    const logger = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      sendMail.mockRejectedValueOnce({ code: 'EAUTH', responseCode: 535, message: config.smtpPassword, response: mail.text });
      await expect(createSmtpMailer(config, factory)!.send({ ...mail, requestId: diagnosticRequestId })).rejects.toThrow(/^mail_delivery_failed$/);
      expect(logger).toHaveBeenCalledExactlyOnceWith(JSON.stringify({ requestId: diagnosticRequestId, phase: 'compose', code: 'EAUTH', responseCode: 535 }));
    } finally { logger.mockRestore(); }
  });
  it('does not expose diagnostics in the public contact response', async () => {
    const backend = createPublicSupportBackend(config, vi.fn(), factory);
    backend.rpc = vi.fn().mockResolvedValue({ allowed: true });
    sendMail.mockRejectedValueOnce({ code: 'EAUTH', responseCode: 535, message: config.smtpPassword, response: mail.text });
    const logger = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const response = await createPublicSupportHandler(config, backend)(new Request('https://example.supabase.co/functions/v1/public-support', {
        method: 'POST', headers: { Origin: config.appOrigin, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'contact', name: 'Visitor', email: mail.replyTo, suggestion: 'A deployment test message.' }),
      }));
      expect(response.status).toBe(502);
      const body = await response.json();
      expect(body).toEqual({ error: 'Your message could not be sent. Please try again later.', code: 'delivery_failed' });
      expect(JSON.stringify(body)).not.toMatch(/EAUTH|535|phase|password/);
      expect(logger).toHaveBeenCalledTimes(1);
    } finally { logger.mockRestore(); }
  });
});
