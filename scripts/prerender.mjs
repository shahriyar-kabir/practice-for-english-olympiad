// Render only anonymous public pages. No remote API calls or stored sessions enter the build.
import { chromium } from '@playwright/test';
import { preview } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const shell = await readFile('dist/index.html', 'utf8');
await writeFile('dist/app.html', shell.replace('</head>', '<meta name="robots" content="noindex, follow" /></head>'));
const pages = JSON.parse(await readFile('src/seo-routes.json', 'utf8'));
const server = await preview({preview:{host:'127.0.0.1',port:4173,strictPort:true}});
const browser = await chromium.launch({headless:true});
try {
  const context = await browser.newContext();
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  const page = await context.newPage();
  for (const path of [...Object.keys(pages), '/404.html']) {
    await page.goto('http://127.0.0.1:4173' + path);
    await page.waitForSelector('main h1');
    await page.waitForFunction(() => !document.querySelector('.wz-page-loading'));
    if (path !== '/404.html') {
      await page.waitForFunction(() => document.querySelector('link[rel="canonical"]'));
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      if (description !== pages[path].description) throw new Error('Incorrect metadata: '+path);
    }
    // createRoot replaces this anonymous snapshot; hydration is deliberately not used.
    const html = await page.content();
    const target = path === '/' ? 'dist/index.html' : path === '/404.html' ? 'dist/404.html' : 'dist'+path+'/index.html';
    await mkdir(target.slice(0,target.lastIndexOf('/')), {recursive:true});
    await writeFile(target,html);
  }
  await writeFile('dist/sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+Object.keys(pages).map(path=>`  <url><loc>https://wizpiko.com${path}</loc></url>`).join('\n')+'\n</urlset>\n');
  await writeFile('dist/robots.txt', 'User-agent: *\nAllow: /\n\nSitemap: https://wizpiko.com/sitemap.xml\n');
} finally { await browser.close(); await new Promise(resolve=>server.httpServer.close(resolve)); }
