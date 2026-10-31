# Wizpiko — preview release and Supabase setup (October 2026)

## What this branch includes
- Clean public homepage and responsive original-brand logo, original robot mascot, eight subjects; English Practice active and all other subjects marked Coming soon
- Signed-in homepage; avatar dropdown; separate Profile, Progress, Achievements, Learning Streak, Learning Preferences, Guardian Settings and Help views
- Daily streak increases when a learner completes an activity, not just on login; achievements never disappear if a streak breaks
- Email/password sign-in modal, age-aware signup (nickname, DOB, learner email, password, confirmation), email confirmation flow, password recovery and guardian email approval for accounts under 10
- Original 10 beginner English crosswords and seven English practice categories preserved; actual question banks remain finite

## Deployment sequence — important
Follow [Guardian consent deployment and validation](supabase/GUARDIAN_DEPLOYMENT.md)
for the repaired function, exact schema changes, secrets, and deployment blockers.
The current guardian review screen must be deployed with the function.

1. Keep the draft PR open until the workflow build and human QA pass. Do not merge into main as an unreviewed public child-registration rollout.
2. Inspect the actual project's schema and existing test accounts/progress first. On a new database only, install `supabase/student_progress.sql`, then `supabase/learner_accounts.sql`. Apply `supabase/migrations/20261031000000_guardian_consent.sql` after those baselines are installed. Do not rerun the old scripts afterward because they restore older RLS policies. The trigger creates protected profiles for **new** Auth users. Missing profiles now block cloud sync; existing test accounts need reviewed profile migration without invented DOB or consent. Until the profile trigger and readiness probe are installed, new signup remains paused.
3. In Supabase Authentication → Email provider, enable **Confirm Email** before public registration. Configure a custom SMTP/email service with a verified sending domain and working confirmation/reset email templates; Supabase's default email service is rate-limited and may not send to public users.
4. Set your production **Site URL** to `https://wizpiko.com` and configure authorized redirect URLs for the production site and explicitly used preview domain(s), including `https://phenomenal-sunshine-6e69fa.netlify.app`. Confirm both signup verification and password-reset URLs return to the intended environment.
5. Create a Resend account and verify the sending domain for guardian email. Deploy the Edge Function from `supabase/functions/guardian-consent/index.ts`. `supabase/config.toml` disables platform JWT verification on that one function because guardian links are one-time tokens; its `request` operation independently checks a valid learner JWT.
6. Set Edge Function secrets `RESEND_API_KEY`, `GUARDIAN_FROM_EMAIL`, `APP_ORIGIN` (the exact origin serving the updated guardian screen), and optional `GUARDIAN_ALLOWED_ORIGINS` for exact preview origins. Hosted Supabase supplies its URL/service-role secret. **Never** place service-role or Resend secrets in GitHub public variables, Netlify browser variables, or `VITE_` environment variables.
7. Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (public/publishable values only) in your Netlify and GitHub Actions build configuration. Rebuild whenever changing them.
8. Test a confirmed adult account sign-up, login, forgotten-password recovery, progress sync across two browsers, and cross-account isolation. Then test an under-10 signup: guardian email appears, child cloud progress remains blocked, verification email is sent after first confirmed sign-in, unverified accounts remain pending, one-time approval link must be clicked by guardian, approved learner can sign in again. Test expired token, reused token, wrong email, and resend rate limits.
9. Attach official Facebook and Instagram URLs to the footer only after providing verified Wizpiko page URLs; current social icons are intentionally not linked to made-up profiles.

## Child safety and consent: not production-ready by email verification alone
Guardian email ownership alone is not necessarily verifiable parental consent under COPPA or other laws; the required mechanism and age threshold depend on the markets and personal data collected. **Do not enable unrestricted public child registration** until reviewed legal consent, verified adult authorization where required, retention/deletion rights, published Terms and Privacy Policy, appropriate anti-abuse controls, and support contact are implemented. This code enforces the requested under-10 guardian email gate but should not be represented as full legal compliance.

The guardian repair removes the old missing-profile RLS exception. Cloud progress
requires the learner's own protected active/verified profile. Review and migrate
legacy test accounts before relying on cloud sync; their progress rows are retained.

Account email confirmation and password recovery require external Supabase dashboard configuration and delivery. Code pushed to GitHub cannot automatically turn on these external services, deploy the function, or configure their secrets.

## Release verification
- Run `npm ci && npm test && npm run build`.
- Run `npm run test:guardian-db`; optionally run `npm run test:guardian-concurrency` with Docker for independent transaction races.
- Run `deno check supabase/functions/guardian-consent/index.ts`.
- Review the latest GitHub Actions run on PR #2.
- Confirm Netlify has deployed this development branch before previewing it.
- Inspect mobile layouts, account modal, avatar menu, all learner views, category/games and footer.
- Merge PR #2 into main **only after separate release approval**.
