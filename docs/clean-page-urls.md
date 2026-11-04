# Wizpiko clean page URLs

This change gives existing React views shareable URLs without rewriting their content, CSS or Supabase persistence.

## Paths

| Path | Existing view | Access |
| --- | --- | --- |
| / | WizpikoPortal (public homepage) | Public |
| /home | WizpikoPortal (signed-in homepage) | Signed-in destination |
| /about-us | InfoPages: about | Public |
| /help-centre | InfoPages: help | Public |
| /account-guide | InfoPages: account-guide | Public |
| /privacy-safety | InfoPages: privacy | Public |
| /mission | InfoPages: mission | Public |
| /my-profile | LearnerHub: profile | Signed in |
| /my-progress | LearnerHub: progress | Signed in |
| /my-achievements | LearnerHub: achievements | Signed in |
| /streak | LearnerHub: streak | Signed in |
| /learning-preferences | LearnerHub: preferences | Signed in |
| /help-support | LearnerHub: help | Signed in |
| /english-academy | EnglishAcademy | Signed in |
| /games | EnglishJourney | Signed in |
| /word-puzzles | Original word puzzles | Signed in |
| /contact-us | ContactPage | Public |
| /coming-soon?subject=... | Existing Coming Soon view | Signed in |

## Behavior

- Existing header, footer, learner navigation and informational links use history-based client routing.
- Refreshing a clean URL restores the corresponding React view.
- Browser Back/Forward restores the selected page.
- Successful sign-in from a public page leads to /home, while protected deep links and saved learning destinations are retained.
- Signing out returns to /.
- Older /?page=help, /?page=account-guide, /?page=privacy, /?page=about, /?page=mission and /?page=contact links remain supported and are replaced with their new paths.
- Unknown URLs display a not-found view rather than the crossword page.
- The existing account implementation, progress payload and content files are preserved.

## Hosting

Netlify uses a 200 rewrite from /* to /index.html to support direct loads.

GitHub Pages retains its /practice-for-english-olympiad/ base URL and publishes dist/404.html as an SPA deep-link fallback. Note that GitHub Pages serves that fallback with HTTP 404; for production canonical URLs and search indexing, use Netlify or another host with real 200 rewrites. If configuring a GitHub Pages custom domain at the root instead of Netlify, adjust its Vite base before deployment.

## Verification before merge

- Run npm ci, npm test and npm run build.
- Open every public URL directly and refresh it.
- Test sign-in from /, from /about-us, and from a protected direct URL.
- Test sign-out, Back/Forward, account links and navigation to the games and academy.
- Confirm original illustrations, favicon, layout, account progress, streaks and achievements are unchanged.
- Check the intended production host's SPA rewrite and domain mapping.
