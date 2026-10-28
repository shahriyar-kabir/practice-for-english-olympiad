# Wizpiko guest-only preview

The current release deliberately skips student authentication and cloud accounts. No Supabase project, custom SMTP provider, or Google OAuth setup is required to play English games.

Learning progress is stored in browser localStorage; pupils can resume on the same device and browser, but not across devices. Clearing browser data or browsing privately may remove progress. Do not claim cross-device account sync is active.

The original account and Supabase integration source remains in the repository for future work, but is not loaded or required in guest mode. Authentication would require separate security, privacy, consent, retention and deletion reviews before enabling it for children.

## Preview and launch

1. On Netlify, deploy the feature branch `feature/wizpiko-complete-learning-hub` and verify page navigation, responsive design, the 7 English difficulties, timed crosswords, MCQs, rewards, and resume-on-reload.
2. Test on desktop and mobile with a new/empty browser profile. Verify timers, crossing letter consistency, achievement counts and saved progress across refreshes.
3. The game's vocabulary banks are finite and remixed across levels; they do **not** guarantee infinite unique questions.
4. Complete a visual/editorial QA pass; review age suitability and content; publish a public privacy notice and contact information.
5. Once approved, merge the draft PR #2 into main; GitHub Pages will then deploy to wizpiko.com.

## Future: optional accounts

An unused prototype exists in `src/cloudAccount.ts`, `src/AccountDialog.tsx` and `supabase/student_progress.sql`. Reactivating it requires a deliberately reviewed implementation, not just environment variables.
