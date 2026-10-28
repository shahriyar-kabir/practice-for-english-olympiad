# Wizpiko — simple email/password accounts (preview only)

## Sign-up and sign-in
- Users may practise as guests.
- Students or guardians may choose **Sign up** with email address, password, and password confirmation, then **Sign in** with the same credentials.
- Passwords are handled by **Supabase Authentication**; the Wizpiko app does not keep passwords in progress tables.
- Cloud progress is stored in `public.student_progress` with Row Level Security (see `supabase/student_progress.sql`). Sign out removes cached user progress on that device.
- Magic links, OTPs, Google OAuth, and custom SMTP are **not required for this controlled preview**.

## Configure Supabase
1. Set up `public.student_progress` and its RLS policies from `supabase/student_progress.sql`.
2. In **Authentication → Sign In / Providers → Email**, enable Email provider and allow new user sign-ups.
3. **For adult-only testing**, disable **Confirm Email**. This allows Supabase to return a logged-in session immediately after registration.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the public Supabase URL and public publishable/anon key in both Netlify and GitHub Actions build environments; rebuild the preview to apply.
5. Open the Netlify preview → Sign in / Sign up → Sign up → register a new adult test account → verify that My account appears. Check the progress table, complete an activity, then sign into a second browser.

## IMPORTANT: NOT READY FOR PUBLIC CHILD ACCOUNTS
With Confirm Email disabled, a person can register an email address they do not own. No verified password reset or account recovery is available without a configured email-delivery provider. Do **not** use this setup for publicly accessible student registration as is. Before enabling for children, restore email verification, configure reliable email delivery and recovery, add appropriate parental-consent checks and account deletion, review privacy requirements, and test anti-abuse limits. The registration checkbox is not verified parental consent.

## Content and release
- Seven English age levels, timed crosswords and 50-question MCQ practice, XP, progress and achievements.
- Existing 10 original Beginner crosswords remain available.
- Crossword and question banks are finite and remixed—not indefinitely unique.
- All work remains on the draft development PR; confirm build, responsive UI and live sign-in/progress tests before merging to main.
