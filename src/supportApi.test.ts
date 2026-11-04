import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let support: typeof import('./supportApi');
let request: ReturnType<typeof vi.fn>;
beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'public-publishable-key');
  request = vi.fn();
  vi.stubGlobal('fetch', request);
  support = await import('./supportApi');
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('authoritative account lookup', () => {
  it.each([true, false])('returns only a verified boolean response: %s', async exists => {
    request.mockResolvedValue(Response.json({ exists }));
    await expect(support.accountExists(' Explorer@Example.com ')).resolves.toBe(exists);
    expect(request.mock.calls[0][0]).toBe('https://example.supabase.co/functions/v1/public-support');
    expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ action: 'account-status', email: 'explorer@example.com' });
  });
  it.each([{}, { exists: null }, { exists: 0 }, []])('rejects ambiguous successful responses instead of claiming no account', async body => {
    request.mockResolvedValue(Response.json(body));
    await expect(support.accountExists('user@example.com')).rejects.toMatchObject({ code: 'service_unavailable' });
  });
  it('preserves rate-limit errors and never turns them into nonexistent accounts', async () => {
    request.mockResolvedValue(Response.json({ error: 'Please wait before checking again.', code: 'rate_limited' }, { status: 429 }));
    await expect(support.accountExists('user@example.com')).rejects.toMatchObject({ code: 'rate_limited', message: 'Please wait before checking again.' });
  });
  it('reports missing backend and network failure as unavailable', async () => {
    request.mockResolvedValueOnce(new Response('Not found', { status: 404 }));
    await expect(support.accountExists('user@example.com')).rejects.toMatchObject({ code: 'service_unavailable' });
    request.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(support.accountExists('user@example.com')).rejects.toMatchObject({ code: 'network_error' });
  });
  it('does not treat an HTTP error claiming account_not_found as an authoritative lookup', async () => {
    request.mockResolvedValueOnce(Response.json({ code: 'account_not_found', error: 'Unavailable endpoint' }, { status: 404 }));
    await expect(support.accountExists('user@example.com')).rejects.toMatchObject({ code: 'service_unavailable' });
  });
  it.each(['bad-address', 'x@example.com\r\nBcc:other@example.com', 'person<@example.com', 'a'.repeat(255) + '@example.com'])('rejects invalid input before a request', async email => {
    await expect(support.accountExists(email)).rejects.toMatchObject({ code: 'invalid_input' });
    expect(request).not.toHaveBeenCalled();
  });
});

describe('contact delivery acknowledgement', () => {
  const input = { name: ' Explorer ', email: 'Explorer@Example.com', suggestion: 'Please add more reading activities.' };
  it('resolves only when the server confirms real acceptance', async () => {
    request.mockResolvedValue(Response.json({ accepted: true }));
    await expect(support.submitContact(input)).resolves.toBeUndefined();
    expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ action: 'contact', name: 'Explorer', email: 'explorer@example.com', suggestion: input.suggestion, website: '' });
  });
  it.each([{}, { accepted: false }, { ok: true }])('does not display success for an unaccepted response', async body => {
    request.mockResolvedValue(Response.json(body));
    await expect(support.submitContact(input)).rejects.toThrow('has not been sent');
  });
  it('passes the honeypot through for authoritative server validation', async () => {
    request.mockResolvedValue(Response.json({ error: 'Could not accept this message.', code: 'invalid_input' }, { status: 400 }));
    await expect(support.submitContact({ ...input, website: 'spam.example' })).rejects.toMatchObject({ code: 'invalid_input' });
    expect(JSON.parse(request.mock.calls[0][1].body).website).toBe('spam.example');
  });
  it('reports delivery unavailable rather than returning fake success', async () => {
    request.mockResolvedValue(Response.json({ error: 'Contact delivery is not configured.', code: 'service_unavailable' }, { status: 503 }));
    await expect(support.submitContact(input)).rejects.toMatchObject({ code: 'service_unavailable' });
  });
  it.each([429, 502])('surfaces contact HTTP %s failures', async status => {
    request.mockResolvedValue(Response.json({ code: status === 429 ? 'rate_limited' : 'delivery_failed', error: 'Please try later.' }, { status }));
    await expect(support.submitContact(input)).rejects.toMatchObject({ code: status === 429 ? 'rate_limited' : 'delivery_failed' });
  });
  it.each([{ name: '' }, { name: 'Explorer\r\nBcc:other@example.com' }, { suggestion: 'Short' }, { email: 'invalid' }])('validates contact fields before sending', async patch => {
    await expect(support.submitContact({ ...input, ...patch })).rejects.toMatchObject({ code: 'invalid_input' });
    expect(request).not.toHaveBeenCalled();
  });
});
