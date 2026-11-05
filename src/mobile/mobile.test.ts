import { afterEach, describe, expect, it, vi } from 'vitest';
import { appLinkPath, certificateFilename, externalLink } from './policies';
import { secureSession } from './secureSession';
import { configurePlatform } from '../platform/integration';
import { publicCertificateURL } from '../certificates/presentation';

afterEach(()=>{configurePlatform(undefined);vi.unstubAllGlobals();});
describe('iOS routes and sharing',()=>{
  it('accepts only explicit Wizpiko navigation destinations',()=>{
    expect(appLinkPath('wizpiko://open?path=%2Fmaths-academy')).toBe('/maths-academy');
    expect(appLinkPath('https://wizpiko.com/games/maths')).toBe('/games/maths');
    expect(appLinkPath('https://wizpiko.com/?certificate=00000000-0000-4000-8000-000000000001')).toBe('/?certificate=00000000-0000-4000-8000-000000000001');
    for(const link of ['javascript:alert(1)','https://wizpiko.com.evil.test/home','https://user:pass@wizpiko.com/home','wizpiko://open?path=//evil.test','wizpiko://auth#access_token=secret','https://wizpiko.com/home#access_token=secret','https://wizpiko.com/?redirect=https://evil.test','https://wizpiko.com/?certificate=invalid','file:///my-profile'])expect(appLinkPath(link),link).toBeNull();
  });
  it('opens external HTTPS links with no credentials or executable schemes',()=>{
    expect(externalLink('https://www.linkedin.com/sharing/share-offsite/')).toContain('https://www.linkedin.com');
    for(const value of ['javascript:alert(1)','http://example.test','file:///secret','https://user:pass@example.test'])expect(externalLink(value)).toBeNull();
    expect(certificateFilename('../../Wizpiko certificate.pdf')).not.toContain('/');
  });
  it('keeps native public certificate links on the actual website',()=>{
    configurePlatform({siteOrigin:'https://wizpiko.com',authRedirect:'https://wizpiko.com/',session:{read:()=>null,write:()=>{},flush:async()=>{}},credentialsAccepted:()=>{},saveFile:async()=>{},shareURL:async()=>{}});
    expect(publicCertificateURL('00000000-0000-4000-8000-000000000001')).toBe('https://wizpiko.com/?certificate=00000000-0000-4000-8000-000000000001');
  });
});
describe('Keychain session ordering',()=>{
  it('serializes refresh then sign-out so sign-out wins on disk and in memory',async()=>{
    const writes:string[]=[];
    const store=await secureSession({getSession:async()=>({value:'old'}),setSession:async({value})=>{await Promise.resolve();writes.push(value);},clearSession:async()=>{writes.push('cleared');}});
    store.write(JSON.stringify({refresh_token:'new'}));store.write(null);
    expect(store.read()).toBeNull();await store.flush();expect(writes).toEqual(['{"refresh_token":"new"}','cleared']);
  });
  it('keeps Remember me off sessions only in memory',async()=>{
    const set=vi.fn(),clear=vi.fn();const store=await secureSession({getSession:async()=>({}),setSession:set,clearSession:clear});
    const value=JSON.stringify({access_token:'short-session',remember:false});store.write(value);await store.flush();expect(store.read()).toBe(value);expect(set).not.toHaveBeenCalled();expect(clear).toHaveBeenCalledOnce();
  });
  it('reports failed Keychain writes and allows a successful retry',async()=>{
    const set=vi.fn().mockRejectedValueOnce(new Error('locked')).mockResolvedValue(undefined);
    const store=await secureSession({getSession:async()=>({}),setSession:set,clearSession:async()=>{}});
    store.write('{"access_token":"session"}');await expect(store.flush()).rejects.toThrow('secure sign-in');
    store.write('{"access_token":"retry"}');await expect(store.flush()).resolves.toBeUndefined();
  });
});
