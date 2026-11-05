const paths = new Set(['/', '/home', '/english-academy', '/maths-academy', '/games', '/games/english', '/games/maths', '/my-profile', '/my-progress', '/my-achievements', '/my-certificates', '/streak', '/learning-preferences', '/help-support', '/contact-us', '/about-us', '/privacy-safety', '/account-guide', '/help-centre']);
/** Navigation links carry routes, never credentials, executable URLs or redirects. */
export function appLinkPath(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.username || url.password || url.hash) return null;
    const custom = url.protocol === 'wizpiko:' && url.hostname === 'open';
    if (!custom && !(url.protocol === 'https:' && ['wizpiko.com', 'www.wizpiko.com'].includes(url.hostname))) return null;
    const path = custom ? url.searchParams.get('path') || '/home' : url.pathname;
    if (!paths.has(path)) return null;
    if (custom && [...url.searchParams.keys()].some(key => key !== 'path')) return null;
    if (!custom && [...url.searchParams.keys()].some(key => key !== 'certificate')) return null;
    const token = url.searchParams.get('certificate');
    if (token) return path === '/' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token) ? '/?certificate=' + token : null;
    return path;
  } catch { return null; }
}
export function externalLink(value: string): string | null {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function certificateFilename(value: string) { return value.replace(/[^a-zA-Z0-9.\-]/g, '-').slice(0, 160); }
