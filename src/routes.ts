import type { AcademyLevel } from './learningTypes';
import type { InfoPageId } from './content/siteCopy';
import { isCurriculumSubject } from '../supabase/functions/_shared/curriculum/programs.ts';
import type { CurriculumSubject } from '../supabase/functions/_shared/curriculum/programs.ts';
import type { LearnerPage } from './LearnerHub';
import { isGameSubject } from './gameSubjects';
import type { GameSubjectId } from './gameSubjects';
import { isSubjectId, subjectInfoPath } from './subjects';

export type RouteView = 'home' | 'categories' | 'games' | 'subject-games' | 'classic' | 'hub' | 'coming' | 'info' | 'contact' | 'certificate' | 'not-found';
export type AppRoute = { view: RouteView; infoPage?: InfoPageId; hubPage?: LearnerPage; subject?: string; gameSubject?: GameSubjectId; academySubject?: CurriculumSubject; academyLevel?: AcademyLevel; certificateToken?: string };

export const INFO_ROUTES: Record<InfoPageId, string> = {
  about: '/about-us',
  help: '/help-centre',
  'account-guide': '/account-guide',
  privacy: '/privacy-safety',
  mission: '/mission',
};

export const HUB_ROUTES: Record<LearnerPage, string> = {
  profile: '/my-profile',
  certificates: '/my-certificates',
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
  const publicToken = query.get('certificate');
  if (path === '/' && query.has('certificate')) return publicToken && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(publicToken) ? {view:'certificate',certificateToken:publicToken} : {view:'not-found'};

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
  if (path.startsWith('/subjects/') && isSubjectId(path.slice(10))) return { view: 'coming', subject: path.slice(10) };
  if (path === '/contact-us') return { view: 'contact' };
  if (path === '/english-academy') return { view: 'categories', academySubject: 'english' };
  if (/^\/english-academy\/(starter|beginner|intermediate|advanced)$/.test(path)) return {view:'categories',academySubject:'english',academyLevel:path.split('/')[2] as AcademyLevel};
  if (path.startsWith('/learn/') && isCurriculumSubject(path.slice(7))) return { view: 'categories', academySubject: path.slice(7) as CurriculumSubject };
  if (path === '/maths-academy') return { view: 'categories', academySubject: 'maths' };
  if (/^\/maths-academy\/(starter|beginner|intermediate|advanced)$/.test(path)) return {view:'categories',academySubject:'maths',academyLevel:path.split('/')[2] as AcademyLevel};
  if (/^\/certificates\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(path)) return { view: 'certificate', certificateToken: path.slice(14) };
  if (path === '/games') return { view: 'games' };
  if (path.startsWith('/games/') && isGameSubject(path.slice(7))) return { view: 'subject-games', gameSubject: path.slice(7) as GameSubjectId };
  if (path === '/word-puzzles') return { view: 'classic' };
  if (path === '/coming-soon') return { view: 'coming', subject: (query.get('subject') || '').slice(0, 80) };
  return { view: 'not-found' };
}

export function routePath(route: AppRoute): string {
  if (route.view === 'info') return INFO_ROUTES[route.infoPage || 'about'];
  if (route.view === 'hub') return HUB_ROUTES[route.hubPage || 'profile'];
  if (route.view === 'contact') return '/contact-us';
  if (route.view === 'categories') return academyPath(route.academySubject||'english')+(route.academyLevel?'/'+route.academyLevel:'');
  if (route.view === 'certificate') return '/?certificate=' + encodeURIComponent(route.certificateToken || '');
  if (route.view === 'games') return '/games';
  if (route.view === 'subject-games') return isGameSubject(route.gameSubject) ? '/games/' + route.gameSubject : '/games';
  if (route.view === 'classic') return '/word-puzzles';
  if (route.view === 'coming') return subjectInfoPath(route.subject || '');
  return '/';
}

export function academyPath(subject:CurriculumSubject):string { return subject==='english'?'/english-academy':subject==='maths'?'/maths-academy':'/learn/'+subject; }
