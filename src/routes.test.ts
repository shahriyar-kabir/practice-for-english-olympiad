import { describe, expect, it } from 'vitest';
import { appHref, appPath, INFO_ROUTES, HUB_ROUTES, readAppRoute, routePath } from './routes';

describe('Wizpiko page URLs', () => {
  it.each([
    ['/', 'home', undefined],
    ['/home', 'home', undefined],
    ['/about-us', 'info', 'about'],
    ['/help-centre', 'info', 'help'],
    ['/account-guide', 'info', 'account-guide'],
    ['/privacy-safety', 'info', 'privacy'],
    ['/mission', 'info', 'mission'],
    ['/my-profile', 'hub', 'profile'],
    ['/my-progress', 'hub', 'progress'],
    ['/my-achievements', 'hub', 'achievements'],
    ['/streak', 'hub', 'streak'],
    ['/learning-preferences', 'hub', 'preferences'],
    ['/help-support', 'hub', 'help'],
    ['/english-academy', 'categories', undefined],
    ['/games', 'games', undefined],
    ['/word-puzzles', 'classic', undefined],
    ['/contact-us', 'contact', undefined],
  ])('%s resolves to its existing view', (path, view, page) => {
    const route = readAppRoute(path, '', '/');
    expect(route.view).toBe(view);
    if (route.view === 'info') expect(route.infoPage).toBe(page);
    if (route.view === 'hub') expect(route.hubPage).toBe(page);
  });

  it('keeps every information and learner route unique', () => {
    const paths = [...Object.values(INFO_ROUTES), ...Object.values(HUB_ROUTES), '/home', '/english-academy', '/games'];
    expect(new Set(paths).size).toBe(paths.length);
  });

  it.each(['about', 'help', 'account-guide', 'privacy', 'mission'])('accepts legacy ?page=%s', page => {
    const legacy = readAppRoute('/', '?page=' + page, '/');
    expect(legacy.view).toBe('info');
    expect(routePath(legacy)).toBe(INFO_ROUTES[page as keyof typeof INFO_ROUTES]);
  });

  it('accepts legacy contact URLs', () => {
    expect(readAppRoute('/', '?page=contact', '/')).toEqual({ view: 'contact' });
  });

  it('handles GitHub Pages deployment paths and trailing slashes', () => {
    const base = '/practice-for-english-olympiad/';
    expect(appPath('/practice-for-english-olympiad/my-progress/', base)).toBe('/my-progress');
    expect(appHref('/my-progress', base)).toBe('/practice-for-english-olympiad/my-progress');
    expect(readAppRoute('/practice-for-english-olympiad/my-progress/', '', base))
      .toEqual({ view: 'hub', hubPage: 'progress' });
  });

  it('keeps coming-soon subjects in shareable URLs', () => {
    const route = readAppRoute('/coming-soon', '?subject=Mathematics%20%26%20Science', '/');
    expect(routePath(route)).toBe('/coming-soon?subject=Mathematics%20%26%20Science');
  });

  it.each(['english', 'maths'] as const)('opens the %s game branch at either deployment base', subject => {
    for (const base of ['/', '/practice-for-english-olympiad/']) {
      const route = readAppRoute(appHref('/games/' + subject, base) + '/', '', base);
      expect(route).toEqual({ view: 'subject-games', gameSubject: subject });
      expect(routePath(route)).toBe('/games/' + subject);
    }
  });
  it('does not expose unfinished subject branches', () => {
    expect(readAppRoute('/games/science', '', '/')).toEqual({ view: 'subject-games',gameSubject:'science' });
    expect(readAppRoute('/games/maths/extra', '', '/')).toEqual({ view: 'not-found' });
  });

  it('does not silently render the original crossword for unknown URLs', () => {
    expect(readAppRoute('/nonexistent', '', '/').view).toBe('not-found');
  });
  it('opens both course libraries and keeps unpublished subjects as information pages',()=>{
    expect(readAppRoute('/maths-academy','','/')).toMatchObject({view:'categories',academySubject:'maths'});
    expect(readAppRoute('/learn/english','','/')).toMatchObject({view:'categories',academySubject:'english'});
    expect(readAppRoute('/subjects/physics','','/')).toEqual({view:'coming',subject:'physics'});
    expect(readAppRoute('/learn/physics','','/')).toEqual({view:'not-found'});
    expect(readAppRoute('/subjects/unknown','','/')).toEqual({view:'not-found'});
  });
  it('uses an HTTP-200 root URL for publicly shared certificates on static hosting',()=>{
    const token='11111111-1111-4111-8111-111111111111';
    const route=readAppRoute('/','?certificate='+token,'/');expect(route).toEqual({view:'certificate',certificateToken:token});expect(routePath(route)).toBe('/?certificate='+token);
    expect(readAppRoute('/','?certificate=invalid','/')).toEqual({view:'not-found'});
    expect(readAppRoute('/certificates/'+token,'','/')).toEqual(route);
  });
});
