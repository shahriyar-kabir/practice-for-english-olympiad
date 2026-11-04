import type { InfoPageId } from './content/siteCopy';
import type { LearnerPage } from './LearnerHub';

export type RouteView = 'home' | 'categories' | 'games' | 'classic' | 'hub' | 'coming' | 'info' | 'contact' | 'not-found';
export type AppRoute = { view: RouteView; infoPage?: InfoPageId; hubPage?: LearnerPage; subject?: string };

export const INFO_ROUTES: Record<InfoPageId, string> = {
  about: '/about-us',
  help: '/help-centre',
  'account-guide': '/account-guide',
  privacy: '/privacy-safety',
  mission: '/mission',
};

export const HUB_ROUTES: Record<LearnerPage, string> = {
  profile: '/my-profile',
  progress: '/my-progress',
  achievements: '/my-achievements',
  streak: '/streak',
  preferences: '/learning-preferences',
  help: '/help-support',
};

const infoByPath = new Map(Object.entries(INFO_ROUTES).map(([key, path]) => [path, key as InfoPageId]));
const hubByPath = new Map(Object.entries(HUB_ROUTES).map(([key, path]) => [path, key as LearnerPage]));

// The same app runs at the root domain and at a GitHub Pages project subpath.
export function appPath(pathname: string = window.location.pathname, base: string = import.meta.env.BASE_URL): string {
  const prefix = base.replace(/\/+$/, '');
  let path = pathname;
  if (prefix && (path === prefix || path.startsWith(prefix + '/'))) path = path.slice(prefix.length) || '/';
  return path.replace(/\/+$/, '') || '/';
}

export function appHref(path: string, base: string = import.meta.env.BASE_URL): string {
  const prefix = base.replace(/\/+$/, '');
  return prefix + (path.startsWith('/') ? path : '/' + path);
}

export function readAppRoute(
  pathname: string = window.location.pathname,
  search: string = window.location.search,
  base: string = import.meta.env.BASE_URL,
): AppRoute {
  const path = appPath(pathname, base);
  const query = new URLSearchParams(search);

  // Preserve older links of the form /?page=privacy or /?page=contact.
  if (path === '/' && query.has('page')) {
    const legacy = query.get('page');
    if (legacy === 'contact') return { view: 'contact' };
    if (legacy && Object.hasOwn(INFO_ROUTES, legacy)) return { view: 'info', infoPage: legacy as InfoPageId };
  }

  if (path === '/' || path === '/home') return { view: 'home' };
  const infoPage = infoByPath.get(path);
  if (infoPage) return { view: 'info', infoPage };
  const hubPage = hubByPath.get(path);
  if (hubPage) return { view: 'hub', hubPage };
  if (path === '/contact-us') return { view: 'contact' };
  if (path === '/english-academy') return { view: 'categories' };
  if (path === '/games') return { view: 'games' };
  if (path === '/word-puzzles') return { view: 'classic' };
  if (path === '/coming-soon') return { view: 'coming', subject: (query.get('subject') || '').slice(0, 80) };
  return { view: 'not-found' };
}

export function routePath(route: AppRoute): string {
  if (route.view === 'info') return INFO_ROUTES[route.infoPage || 'about'];
  if (route.view === 'hub') return HUB_ROUTES[route.hubPage || 'profile'];
  if (route.view === 'contact') return '/contact-us';
  if (route.view === 'categories') return '/english-academy';
  if (route.view === 'games') return '/games';
  if (route.view === 'classic') return '/word-puzzles';
  if (route.view === 'coming') return '/coming-soon?subject=' + encodeURIComponent(route.subject || '');
  return '/';
}
