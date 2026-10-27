# Wizpiko — setup and launch checklist

## Implemented in the redesign branch
- Homepage and branding, multi-subject navigation, mobile-ready English game screens.
- Seven age categories with crossword and 50-question MCQ challenges, countdowns, XP, unlockable levels, checkpoints and feedback.
- Beginner original ten crosswords retained; redesigned word bank and both Across/Down clue columns visible.
- Progress and achievements redesigned; optional account panel.
- Email magic-link and Google authentication, backed by Supabase if configured.

## Important content limits
The crosswords rotate and recombine words from age-specific curated vocabulary banks. MCQs vary questions and answers using finite curated source material. Levels have no fixed cap, but unique questions are NOT unlimited. Sustained Olympiad-standard content requires more reviewed banks, curriculum mapping, and testing. Do not promise nonrepeating infinite content.

## Activate cloud accounts (administrator)
1. Create a Supabase project.
2. Run supabase/student_progress.sql in its SQL Editor to enable authenticated user-owned records with RLS.
3. In Authentication > URL Configuration, set Site URL https://wizpiko.com and add the same URL with trailing slash to redirect allowlist. Add www variant if used.
4. Enable Email magic-link sign-in and configure reliable email delivery. Google login requires configuring Google provider and authorized OAuth callback in Supabase.
5. GitHub > Settings > Secrets and variables > Actions > Variables:
   VITE_SUPABASE_URL = HTTPS Supabase project URL
   VITE_SUPABASE_ANON_KEY = PUBLIC anon/publishable key, never the service_role secret.
6. GitHub Pages workflow passes those values into the npm build. Redeploy to activate.

Public browser keys are visible by design. RLS policies are essential, along with rate limiting and anti-abuse measures.

## Global children's platform: do before activating public accounts
The current permission checkbox is NOT verified parental consent. Before launching accounts to children, obtain jurisdiction-specific legal review, publish a complete privacy policy and terms, design an appropriate parent/guardian verification process and data deletion procedure, minimize learner data, and test provider/age restrictions. Guest play is available meanwhile.

## Validate and publish
Run npm ci, npm test, and npm run build. Verify responsive layouts, game completion, 50-MCQ question flow, resume and login across devices. The live wizpiko.com website is not updated until the feature pull request is merged into main.
