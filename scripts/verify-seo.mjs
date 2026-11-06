import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const pages = JSON.parse(await readFile('src/seo-routes.json','utf8'));
for (const [path,meta] of Object.entries(pages)) {
  const html = await readFile(path==='/'?'dist/index.html':`dist${path}/index.html`,'utf8');
  assert(html.includes('<h1'),path+' content');
  assert(html.includes(meta.description),path+' description');
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  assert(html.includes(`href="https://wizpiko.com${path}"`),path+' canonical');
  for (const tag of ['og:title','og:description','og:url','twitter:card','twitter:title','website-schema']) assert(html.includes(tag),path+' '+tag);
  assert(!html.includes('Getting your learning space ready'));
}
const sitemap = await readFile('dist/sitemap.xml','utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length,Object.keys(pages).length);
assert(!/my-profile|my-progress|certificates|academy/.test(sitemap));
assert((await readFile('dist/robots.txt','utf8')).includes('Sitemap: https://wizpiko.com/sitemap.xml'));
const shell = await readFile('dist/app.html','utf8');
assert(shell.includes('noindex')); assert(!shell.includes('rel="canonical"'));
const missing = await readFile('dist/404.html','utf8');
assert(missing.includes('Page not found')); assert(missing.includes('noindex')); assert(!missing.includes('rel="canonical"'));
const icon = await readFile('dist/wizpiko-favicon-96.png');
assert.equal(icon.readUInt32BE(16),96); assert.equal(icon.readUInt32BE(20),96);
const apple = await readFile('dist/wizpiko-touch-180.png');
assert.equal(apple.readUInt32BE(16),180); assert.equal(apple.readUInt32BE(20),180);
console.log(`Verified ${Object.keys(pages).length} public HTML pages, canonical/social/schema metadata, private shell, 404, sitemap, robots and icons.`);
