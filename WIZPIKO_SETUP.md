# Wizpiko — preview release and Supabase setup (October 2026)

## What this branch includes
- Clean public homepage and responsive original-brand logo, original robot mascot, eight subjects; English Practice active and all other subjects marked Coming soon
- Signed-in homepage; avatar dropdown; separate Profile, Progress, Achievements, Learning Streak, Learning Preferences, Guardian Settings and Help views
- Daily streak increases when a learner completes an activity, not just on login; achievements never disappear if a streak breaks
- Email/password sign-in modal, age-aware signup (nickname, DOB, learner email, password, confirmation), email confirmation flow, password recovery and guardian email approval for accounts under 10
- Original 10 beginner English crosswords and seven English practice categories preserved; actual question banks remain finite

## Deployment sequence — important
1. Keep the draft PR open until the workflow build and human QA pass. Do not merge into main as an unreviewed public child-registration rollout.
2. First run `supabase/student_progress.sql` in the Supabase SQL Editor (if not already applied). Then run `supabase/learner_accounts.sql`. Inspect the existing test accounts and their progress before changes. The trigger creates a protected learner profile for **new** Supabase Auth users. Until this migration and its anonymous readiness check are installed, **new sign-ups are intentionally paused**; previously registered test accounts can still sign in. Existing adult test accounts need a deliberate migration of nickname/DOB; do not invent their age or their consent.
3. In Supabase Authentication → Email provider, enable **Confirm Email** before public registration. Configure a custom SMTP/email service with a verified sending domain and working confirmation/reset email templates; Supabase's default email service is rate-limited and may not send to public users.
4. Set your production **Site URL** to `https://wizpiko.com` and configure authorized redirect URLs for the production site and explicitly used preview domain(s), including `https://phenomenal-sunshine-6e69fa.netlify.app`. Confirm both signup verification and password-reset URLs return to the intended environment.
5. Create a Resend account and verify the sending domain for guardian email. Deploy the Edge Function from `supabase/functions/guardian-consent/index.ts`. `supabase/config.toml` disables platform JWT verification on that one function because guardian links are one-time tokens; its `request` operation independently checks a valid learner JWT.
6. Set the Edge Function secrets `RESEND_API_KEY`, `GUARDIAN_FROM_EMAIL`, `APP_ORIGIN` (production domain), plus the Supabase URL/service-role secret provided by Supabase. **Never** place the service-role key or Resend secret in GitHub public variables, Netlify browser variables, or `VITE_` environment variables.
7. Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (public/publishable values only) in your Netlify and GitHub Actions build configuration. Rebuild whenever changing them.
8. Test a confirmed adult account sign-up, login, forgotten-password recovery, progress sync across two browsers, and cross-account isolation. Then test an under-10 signup: guardian email appears, child cloud progress remains blocked, verification email is sent after first confirmed sign-in, unverified accounts remain pending, one-time approval link must be clicked by guardian, approved learner can sign in again. Test expired token, reused token, wrong email, and resend rate limits.
9. Attach official Facebook and Instagram URLs to the footer only after providing verified Wizpiko page URLs; current social icons are intentionally not linked to made-up profiles.

## Child safety and consent: not production-ready by email verification alone
Guardian email ownership alone is not necessarily verifiable parental consent under COPPA or other laws; the required mechanism and age threshold depend on the markets and personal data collected. **Do not enable unrestricted public child registration** until reviewed legal consent, verified adult authorization where required, retention/deletion rights, published Terms and Privacy Policy, appropriate anti-abuse controls, and support contact are implemented. This code enforces the requested under-10 guardian email gate but should not be represented as full legal compliance.

A deliberate policy exception lets pre-existing test accounts *without* learner_profiles continue cloud sync. The `learner_accounts.sql` RLS policy blocks new pending learners but includes that legacy exception. Remove it after migrating old accounts and before public launch.

Account email confirmation and password recovery require external Supabase dashboard configuration and delivery. Code pushed to GitHub cannot automatically turn on these external services, deploy the function, or configure their secrets.

## Release verification
- Run `npm ci && npm test && npm run build`.
- Review the latest GitHub Actions run on PR #2.
- Confirm Netlify has deployed this development branch before previewing it.
- Inspect mobile layouts, account modal, avatar menu, all learner views, category/games and footer.
- Merge PR #2 into main **only after separate release approval**.
