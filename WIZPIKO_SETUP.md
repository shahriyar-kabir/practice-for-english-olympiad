# Wizpiko release setup

This release preserves the complete learning hub: original artwork, responsive homepage, eight subjects, English category games, all ten original crosswords, account/profile views, preferences, cloud progress, achievements and activity streaks. Guardian email collection, verification screens and approval gating have been retired. Normal email/password authentication, email-confirmation handling and password recovery remain.

## Database upgrade

Apply `supabase/migrations/20261103000000_retire_guardian_verification.sql` to the intended Supabase project after inspecting the live schema. It supports the existing learner-account baseline with or without the previous guardian repair. On a new database, install `supabase/student_progress.sql` and `supabase/learner_accounts.sql` first, then the release migration.

The transaction creates active profiles for new learners, activates existing pending profiles without marking consent as verified, and fills missing profiles from existing account metadata. Unknown birth dates remain null. It retains progress payloads and historical guardian audit data. Profile and progress access remain restricted to the authenticated owner; editable fields remain limited to nickname, avatar and preferences.

Do not rerun an older baseline after this upgrade. The frontend checks `wizpiko_registration_ready_v2()` before signup so an old guardian-based database cannot silently create another pending account. If this probe is unavailable, visitors can continue playing as guests while new registration is temporarily unavailable.

## Hosting and account configuration

GitHub Pages deploys changes pushed to `main` using `.github/workflows/deploy-pages.yml`. Pages must use GitHub Actions as its source. The workflow retains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from repository variables; these must be public browser-safe values. Relative artwork URLs support both the Pages project path and root-origin hosts. `netlify.toml` also retains the existing Node 24 static build configuration.

Retain the existing Supabase email provider, confirmation and SMTP settings. Set approved callback URLs for each production origin used by signup confirmation and password recovery. A deployment does not independently verify email delivery. Never put service-role, personal access, or email-provider secrets into frontend variables or Git.

The retired guardian function and old migration/tests remain as historical source and audit support. They are not invoked or deployed by the frontend release. `supabase/GUARDIAN_DEPLOYMENT.md` documents the older flow, not this release's setup.

## Checks

- `npm ci`
- `npm test`
- `npm run test:guardian-db` (historical migration regression)
- `npm run test:accounts` (release migration, retained progress and per-user isolation)
- `npm run build`

Browser QA should cover desktop and phone layouts, artwork under the Pages project path, guest learning and original crosswords, signup fields without guardian collection, and profile/progress/achievement/streak/preferences navigation. Mock account requests for UI testing; do not submit real registrations or emails as a smoke test.
