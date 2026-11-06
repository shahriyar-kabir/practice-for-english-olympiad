import { describe, expect, it } from 'vitest';
import { metadata } from './seo';
import pages from './seo-routes.json';
describe('public SEO boundary', () => {
  it.each(Object.keys(pages))('%s has its own canonical and public metadata', path => {
    expect(metadata(path)).toMatchObject({...pages[path as keyof typeof pages], canonical:'https://wizpiko.com'+path,indexable:true});
  });
  it.each(['/home','/my-profile','/my-progress','/my-certificates','/english-academy','/games/maths','/unknown','/certificates/11111111-1111-4111-8111-111111111111'])('%s never inherits a home canonical', path => {
    expect(metadata(path)).toMatchObject({indexable:false,canonical:null});
  });
  it('does not index tokenized root certificates', () => {
    expect(metadata('/', '?certificate=11111111-1111-4111-8111-111111111111')).toMatchObject({indexable:false,canonical:null});
  });
});
