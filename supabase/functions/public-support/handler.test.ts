import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPublicSupportHandler, normalizeSupportEmail, supportRateKey } from './handler';
import type { SupportBackend, SupportConfig } from './handler';
import { createPublicSupportBackend, createResendMailer } from './supabase';

const config: SupportConfig = {
  supabaseUrl:'https://example.supabase.co',serviceRoleKey:'server-only-service-role',
  appOrigin:'https://wizpiko.com',allowedOrigins:'https://preview.wizpiko.com',
  rateLimitSalt:'private-random-salt-at-least-thirty-two-characters',
};
const contact = {action:'contact',name:' Explorer ',email:' LEARNER@Example.com ',suggestion:'Please add more listening activities.'};
let backend: SupportBackend;
let rpc: ReturnType<typeof vi.fn>;
let send: ReturnType<typeof vi.fn>;
function request(body: unknown,headers: Record<string,string> = {}) {
  return new Request('https://example.supabase.co/functions/v1/public-support',{
    method:'POST',headers:{origin:'https://wizpiko.com','Content-Type':'application/json','cf-connecting-ip':'203.0.113.7',...headers},
    body:JSON.stringify(body),
  });
}
beforeEach(() => {
  rpc=vi.fn().mockImplementation((name: string) => name === 'wizpiko_public_support_take_buckets' ? {allowed:true,retry_after:0} : true);
  send=vi.fn().mockResolvedValue({id:'mail-provider-id'});
  backend={rpc,mailer:{send}};
});

describe('public support access and validation',() => {
  it('allows exact-origin preflight with no service call',async () => {
    const response=await createPublicSupportHandler(config,backend)(new Request('https://example.supabase.co/functions/v1/public-support',{
      method:'OPTIONS',headers:{origin:'https://preview.wizpiko.com','Access-Control-Request-Method':'POST'},
    }));
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://preview.wizpiko.com');
    expect(rpc).not.toHaveBeenCalled();
  });
  it.each(['https://evil.example','https://wizpiko.com.evil.example','null',''])('rejects unapproved or missing origin %s',async origin => {
    const response=await createPublicSupportHandler(config,backend)(request({action:'account-status',email:'person@example.com'},{origin}));
    expect(response.status).toBe(403);
    expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });
  it('fails closed without a private limiter salt or service config',async () => {
    const handler=createPublicSupportHandler({...config,rateLimitSalt:''},backend);
    expect((await handler(request({action:'account-status',email:'person@example.com'}))).status).toBe(503);
    expect(rpc).not.toHaveBeenCalled();
  });
  it.each(['bad','person@example.com\r\nBcc: target@example.com','person@example.com\n', 'x'.repeat(245)+'@example.com'])('rejects invalid/header-injected emails %s',async email => {
    const response=await createPublicSupportHandler(config,backend)(request({action:'account-status',email}));
    expect(response.status).toBe(400); expect(rpc).not.toHaveBeenCalled();
  });
  it('rejects unsupported fields so the browser cannot supply a mail recipient',async () => {
    const response=await createPublicSupportHandler(config,backend)(request({...contact,to:'attacker@example.com'}));
    expect(response.status).toBe(400);expect(send).not.toHaveBeenCalled();
  });
  it('rejects an oversized streaming body even without content-length',async () => {
    const response=await createPublicSupportHandler(config,backend)(request({...contact,suggestion:'x'.repeat(25_000)}));
    expect(response.status).toBe(413);expect(rpc).not.toHaveBeenCalled();
  });
  it('accepts single-character names and normalizes valid email only',async () => {
    expect(normalizeSupportEmail(' Person+Tag@Example.com ')).toBe('person+tag@example.com');
    const response=await createPublicSupportHandler(config,backend)(request({...contact,name:'李'}));
    expect(response.status).toBe(200);
  });
});

describe('account-status disclosure contract and rate limits',() => {
  it.each([true,false])('returns only exists=%s, never records',async exists => {
    rpc.mockResolvedValueOnce({allowed:true}).mockResolvedValueOnce(exists);
    const response=await createPublicSupportHandler(config,backend)(request({action:'account-status',email:' Learner@Example.com '}));
    expect(response.status).toBe(200);expect(await response.json()).toEqual({exists});
    expect(rpc.mock.calls[1]).toEqual(['wizpiko_public_account_exists',{p_email:'learner@example.com'}]);
    const args=rpc.mock.calls[0][1];
    expect(args.p_keys).toHaveLength(2);
    expect(args.p_keys.every((key: string) => /^[a-f0-9]{64}$/.test(key))).toBe(true);
    expect(JSON.stringify(args)).not.toContain('learner@example.com');
    expect(JSON.stringify(args)).not.toContain('203.0.113.7');
    expect(args.p_limits).toEqual([20,5]);expect(args.p_windows).toEqual([600,600]);
  });
  it('returns 429 and skips lookup when any atomic quota is blocked',async () => {
    rpc.mockResolvedValueOnce({allowed:false,retry_after:38.2});
    const response=await createPublicSupportHandler(config,backend)(request({action:'account-status',email:'learner@example.com'}));
    expect(response.status).toBe(429);expect(response.headers.get('Retry-After')).toBe('39');
    expect(await response.json()).toMatchObject({code:'rate_limited'});expect(rpc).toHaveBeenCalledTimes(1);
  });
  it.each([null,{},[],{email:'learner@example.com'},'false'])('never labels unavailable/malformed lookup result as nonexistent',async result => {
    rpc.mockResolvedValueOnce({allowed:true}).mockResolvedValueOnce(result);
    const response=await createPublicSupportHandler(config,backend)(request({action:'account-status',email:'learner@example.com'}));
    expect(response.status).toBe(503);expect(await response.json()).not.toHaveProperty('exists');
  });
  it('fails closed on quota/database errors rather than returning false',async () => {
    rpc.mockRejectedValueOnce(new TypeError('Network failed'));
    const response=await createPublicSupportHandler(config,backend)(request({action:'account-status',email:'learner@example.com'}));
    expect(response.status).toBe(503);expect(await response.json()).not.toHaveProperty('exists');
  });
  it('hashes distinct scopes and secret salts into separate bucket identities',async () => {
    const a=await supportRateKey(config.rateLimitSalt,'account-status:email','person@example.com');
    expect(a).not.toBe(await supportRateKey(config.rateLimitSalt,'contact:email','person@example.com'));
    expect(a).not.toBe(await supportRateKey('different-private-salt','account-status:email','person@example.com'));
  });
});

describe('honest contact mail delivery',() => {
  it('sends text to fixed support destination with validated visitor Reply-To',async () => {
    const response=await createPublicSupportHandler(config,backend)(request(contact));
    expect(response.status).toBe(200);expect(await response.json()).toEqual({accepted:true});
    expect(send).toHaveBeenCalledWith({to:'support@wizpiko.com',replyTo:'learner@example.com',subject:'Wizpiko website message',
      text:'Name: Explorer\nEmail: learner@example.com\n\nMessage:\nPlease add more listening activities.',requestId:expect.any(String)});
    expect(rpc.mock.calls[0][1]).toMatchObject({p_limits:[3,3],p_windows:[3600,86400]});
  });
  it.each([
    {website:'https://spam.example'}, {name:''}, {name:'x'.repeat(101)}, {name:'Person\r\nBcc: bad@example.com'},
    {suggestion:'short'}, {suggestion:'x'.repeat(5001)}, {suggestion:'Message with null\u0000character'},
  ])('rejects invalid contact input and honeypot without fake success %j',async patch => {
    const response=await createPublicSupportHandler(config,backend)(request({...contact,...patch}));
    expect(response.status).toBe(400);expect(await response.json()).not.toHaveProperty('accepted');
    expect(send).not.toHaveBeenCalled();expect(rpc).not.toHaveBeenCalled();
  });
  it('reports an unconfigured mailer honestly',async () => {
    const response=await createPublicSupportHandler(config,{...backend,mailer:null})(request(contact));
    expect(response.status).toBe(503);expect(await response.json()).not.toHaveProperty('accepted');
  });
  it('does not send when contact quota is exhausted',async () => {
    rpc.mockResolvedValueOnce({allowed:false,retry_after:3600});
    const response=await createPublicSupportHandler(config,backend)(request(contact));
    expect(response.status).toBe(429);expect(send).not.toHaveBeenCalled();
  });
  it.each([{},null,{id:''}])('never accepts an ambiguous mail-provider response %j',async result => {
    send.mockResolvedValueOnce(result);
    const response=await createPublicSupportHandler(config,backend)(request(contact));
    expect(response.status).toBe(502);expect(await response.json()).not.toHaveProperty('accepted');
  });
  it('reports provider timeouts without claiming delivery',async () => {
    send.mockRejectedValueOnce(new Error('Provider timed out'));
    const response=await createPublicSupportHandler(config,backend)(request(contact));
    expect(response.status).toBe(502);expect(await response.json()).not.toHaveProperty('accepted');
  });
});

describe('service adapters',() => {
  it('keeps service role RPC authorization server side and rejects other RPCs',async () => {
    const fetcher=vi.fn().mockResolvedValue(Response.json(false));
    const service=createPublicSupportBackend({...config,resendApiKey:'',fromEmail:''},fetcher);
    await expect(service.rpc('wizpiko_public_account_exists',{p_email:'person@example.com'})).resolves.toBe(false);
    const [url,init]=fetcher.mock.calls[0];
    expect(url).toBe('https://example.supabase.co/rest/v1/rpc/wizpiko_public_account_exists');
    expect(init.headers.Authorization).toBe('Bearer server-only-service-role');
    await expect(service.rpc('arbitrary_rpc',{})).rejects.toThrow('unsupported_rpc');
  });
  it('requires mail configuration and prevents sender-header injection',() => {
    expect(createResendMailer({resendApiKey:'',fromEmail:'sender@wizpiko.com'})).toBeNull();
    expect(createResendMailer({resendApiKey:'key',fromEmail:'sender@wizpiko.com\r\nBcc: bad@example.com'})).toBeNull();
  });
  it.each([201,202,400,429,500])('rejects mail-provider HTTP %s even if its body claims an id',async status => {
    const fetcher=vi.fn().mockResolvedValue(Response.json({id:'unconfirmed-id'},{status}));
    const mailer=createResendMailer({resendApiKey:'private-mail-key',fromEmail:'Wizpiko <sender@wizpiko.com>'},fetcher)!;
    await expect(mailer.send({to:'support@wizpiko.com',replyTo:'person@example.com',subject:'Wizpiko website message',text:'Hello support',requestId:'request-123'})).rejects.toThrow('mail_delivery_failed');
  });
  it.each([{}, {id: ''}, {id: 123}])('rejects mail-provider HTTP 200 without a valid message id',async body => {
    const fetcher=vi.fn().mockResolvedValue(Response.json(body));
    const mailer=createResendMailer({resendApiKey:'private-mail-key',fromEmail:'sender@wizpiko.com'},fetcher)!;
    await expect(mailer.send({to:'support@wizpiko.com',replyTo:'person@example.com',subject:'Wizpiko website message',text:'Hello support',requestId:'request-123'})).rejects.toThrow('mail_delivery_failed');
  });
  it('sends fixed recipient/subject and no key in the mail body',async () => {
    const fetcher=vi.fn().mockResolvedValue(Response.json({id:'provider-message-id'}));
    const mailer=createResendMailer({resendApiKey:'private-mail-key',fromEmail:'Wizpiko <sender@wizpiko.com>'},fetcher)!;
    await mailer.send({to:'support@wizpiko.com',replyTo:'person@example.com',subject:'Wizpiko website message',text:'Hello support',requestId:'request-123'});
    const [url,init]=fetcher.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');expect(init.headers.Authorization).toBe('Bearer private-mail-key');
    expect(JSON.parse(init.body)).toEqual({from:'Wizpiko <sender@wizpiko.com>',to:['support@wizpiko.com'],reply_to:'person@example.com',subject:'Wizpiko website message',text:'Hello support'});
  });
});
