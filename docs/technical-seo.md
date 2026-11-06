# Wizpiko technical SEO

The initial checkout was clean on `work` at d1ac7d1. This change is based on current `origin/main` (7cb7844), preserving the intervening releases.

## Implementation

The shared `src/seo-routes.json` allowlist drives public metadata, browser prerendering and sitemap generation. Only the homepage, Games overview, information/contact pages and real subject information pages are indexable (16 pages). Planned subjects explicitly remain previews in development. Sign-in-gated lessons/games, learner pages, arbitrary coming-soon queries and shared certificates are excluded. No Organization claims were added because public organization facts were insufficient.

`npm run build` runs TypeScript, Vite and Chromium prerendering. Install the browser first with `npx playwright install chromium` (CI additionally installs system dependencies). Anonymous snapshots contain actual rendered application content. Remote requests are blocked during prerendering; no live Supabase API or stored login is used. React still uses createRoot and replaces the anonymous snapshot on startup. There is no hydration dependency or change to auth/storage/API logic.

The 96px favicon is a deterministic resize of the existing square wizpiko-icon.webp, available at `/wizpiko-favicon-96.png`. Existing logo/wordmark files and the 180px Apple icon are unchanged. Public pages use their own canonical; private/unknown routes remove canonicals and use noindex. WebSite schema uses Wizpiko and https://wizpiko.com. Header and information navigation now expose anchors, as do subject links.

Netlify retains explicit SPA rewrites for valid gated routes and certificate URLs, using a separate noindex shell without a homepage canonical. Public static files shadow redirects. Unknown paths receive `/404.html` with HTTP 404. GitHub Pages retains its native 404 handling; its workflow must not replace this file with the homepage. Gated deep links on Pages still depend on executing the custom 404 shell and retain HTTP 404; Netlify provides the configured HTTP 200 rewrites.

## Hosting and production verification

Observed before changes: https://wizpiko.com returns 200 with GitHub Pages headers; http://wizpiko.com and https://www.wizpiko.com return 301 to https://wizpiko.com/. The repository still actively deploys Pages, alongside netlify.toml. Editing Netlify configuration does not migrate production hosting.

Manually confirm which host is intended. If using Netlify, confirm linked repository, production branch main, build/publish settings, primary domain wizpiko.com, www alias, automatic primary-domain redirects, TLS certificate and Force HTTPS. In Spaceship, verify apex and www DNS against the selected host's current instructions; remove stale conflicting records only after confirming the migration plan. Do not change DNS blindly. Verify path/query preservation for both www and HTTP redirects after deployment, as well as generated HTML, public asset status/content types, unknown URL 404s and authenticated deep links.

Legacy root certificate URLs (`/?certificate=...`) receive the static homepage before JavaScript applies certificate noindex and removes the canonical. Static GitHub Pages cannot vary headers or HTML by query. Netlify has a noindex response header for `/certificates/*`; legacy root query links need a query-aware edge/server rule for equivalent first-response exclusion. Do not robots-block these URLs as a substitute for noindex. No private certificate data enters prerendered HTML, and tokens never enter the sitemap. Validate both URL forms after release. Personalized users may briefly see the anonymous snapshot until React starts.

## Search Console after release

Verify the wizpiko.com Domain property using the TXT record supplied by Google in Spaceship. Submit https://wizpiko.com/sitemap.xml. Inspect the homepage and representative public pages using live URL inspection; confirm rendered HTML, Google-selected canonical and indexing eligibility. Check Page Indexing, HTTPS, crawl errors and excluded private/token URLs. Validate WebSite JSON-LD with Schema Markup Validator. Request homepage recrawl after the favicon and description deploy; Google controls indexing, favicon adoption and snippets.

## Validation

Run `npm test`, existing SQL/RLS suites and `node scripts/verify-seo.mjs` after `npm run build`. No live database changes are needed. Production behavior of this PR remains unverified until it is deployed; review the hosting ambiguity and legacy certificate limitation above before claiming completion in production.
