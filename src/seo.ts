import pages from './seo-routes.json';
import { appPath, readAppRoute, routePath } from './routes';
export const siteUrl = 'https://wizpiko.com';
export function metadata(pathname: string, search = '') {
  const path = appPath(pathname);
  const route = readAppRoute(pathname, search);
  const publicPath = route.view === 'info' || route.view === 'contact' ? routePath(route) : path;
  const page = (pages as Record<string, {title: string; description: string}>)[publicPath];
  const indexable = !!page && route.view !== 'certificate' && route.view !== 'not-found';
  const gatedTitle = route.view === 'certificate' ? 'Shared Certificate' : route.view === 'categories' ? (route.academySubject === 'maths' ? 'Mathematics Lessons' : 'English Lessons') : route.view === 'subject-games' ? (route.gameSubject === 'maths' ? 'Mental Maths Trail' : 'English Word Games') : route.view === 'classic' ? 'Word Puzzles' : 'Your learning space';
  return { title: indexable ? page.title : route.view === 'not-found' ? 'Page not found | Wizpiko' : gatedTitle + ' | Wizpiko', description: indexable ? page.description : 'Sign in to access your private Wizpiko learning space.', canonical: indexable ? siteUrl + publicPath : null, indexable };
}
export function updateSeo(url = window.location.pathname + window.location.search) {
  const parsed = new URL(url, window.location.origin);
  const data = metadata(parsed.pathname, parsed.search);
  document.title = data.title;
  function meta(key: string, value: string, property = false) {
    const attr = property ? 'property' : 'name';
    let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attr, key); document.head.append(tag); }
    tag.content = value;
  }
  meta('description', data.description);
  meta('robots', data.indexable ? 'index, follow' : 'noindex, follow');
  for (const prefix of ['og', 'twitter']) {
    meta(prefix + ':title', data.title, prefix === 'og');
    meta(prefix + ':description', data.description, prefix === 'og');
    meta(prefix + ':image', siteUrl + '/wizpiko-wordmark.png', prefix === 'og');
    meta(prefix + ':image:alt', 'Wizpiko — Think. Play. Shine.', prefix === 'og');
  }
  meta('og:type', 'website', true); meta('og:site_name', 'Wizpiko', true); meta('twitter:card', 'summary_large_image');
  document.querySelectorAll('link[rel="canonical"],meta[property="og:url"]').forEach(tag => tag.remove());
  if (data.canonical) {
    const tag = document.createElement('link'); tag.rel = 'canonical'; tag.href = data.canonical; document.head.append(tag);
    meta('og:url', data.canonical, true);
  }
  document.getElementById('website-schema')?.remove();
  if (data.indexable) {
    const script = document.createElement('script'); script.id = 'website-schema'; script.type = 'application/ld+json';
    script.textContent = JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:'Wizpiko',url:siteUrl}); document.head.append(script);
  }
}
