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

  it('does not silently render the original crossword for unknown URLs', () => {
    expect(readAppRoute('/nonexistent', '', '/').view).toBe('not-found');
  });
});
