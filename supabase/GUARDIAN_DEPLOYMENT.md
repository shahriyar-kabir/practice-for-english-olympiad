# Guardian consent repair

Source: [draft PR #3](https://github.com/shahriyar-kabir/practice-for-english-olympiad/pull/3),
targeting the learning-hub branch. GitHub Actions passed. Netlify automatically
published the updated frontend at
<https://deploy-preview-3--phenomenal-sunshine-6e69fa.netlify.app>.
The new preview currently requires Netlify access (HTTP 401); its deployed
guardian route could not be validated from this environment.
The Supabase function, database migration and secrets remain undeployed.

## Inspected source and live-access status

The signup implementation is on `feature/wizpiko-complete-learning-hub`, inspected
at `ded562b2aec2c486e1e31d1eed998032b7cc5fea`. The prepared main checkout contains
only the earlier crossword site. Inspected `AccountDialog.tsx`, `cloudAccount.ts`,
`learnerData.ts`, both existing SQL setup scripts, `supabase/config.toml`, the
previous function, build workflow, and setup instructions before changing code.

The supplied live signup URL is
`https://6ae3d7c7cdebb41f49d7cfe4--phenomenal-sunshine-6e69fa.netlify.app/`.
It initially returned HTTP 401 with Netlify edge-access protection. A later recheck
succeeded, and the deployed bundle `assets/index-BUZdhftq.js` confirmed the exact
request contract and project **`fjmyfcpzfrkozplylygd`**, at
`https://fjmyfcpzfrkozplylygd.supabase.co`.

The live OPTIONS request reproduced HTTP **404**, with
`{"code":"NOT_FOUND","message":"Requested function was not found"}`.
The anonymous registration-readiness RPC returns true. Public Auth settings report
`disable_signup:false` and **`mailer_autoconfirm:true`**, so actual learner email
ownership is not currently verified. Confirm Email must be enabled before the
repaired function will send guardian requests. Existing automatically confirmed
test accounts need deliberate review/reverification; changing the setting does
not retroactively verify their inboxes.

The live anonymous OpenAPI request returns 401; protected learner/approval table
requests return permission errors. Full columns, constraints, grants, policies,
triggers and migration history require project-owner inspection. A zero-row
anonymous progress request succeeds, so the deployed grants may differ from the
checked-in baseline; no learner rows were requested. The migration must be checked
against the actual administrative schema before deployment.

`https://wizpiko.com` serves the older frontend without Supabase/signup code.
GitHub repository build-variable reads return HTTP 403. No Supabase administrative
credentials or Resend key is configured here. Consequently no migration, function,
secret or production frontend was deployed. The draft PR's automatic Netlify
preview contains the new frontend; live email/signup completion remains untested.

## Contract and behavior

The existing frontend contract is preserved: JSON POST to
`/functions/v1/guardian-consent`, `{ "action": "request" }`, with public `apikey`
and `Authorization: Bearer <learner access token>`. Success is
`{ "ok": true, "message": "Guardian email sent.", "expires_at": "..." }`;
failures include `error`, `code`, and a non-sensitive `request_id`.

OPTIONS returns 204 for configured exact origins without requiring credentials.
The request action calls Supabase Auth to verify the session and requires a
confirmed non-anonymous email and checks that project email auto-confirmation is
disabled. Otherwise it pauses sends with a meaningful 503 error. Only that user's protected pending profile can
request an email; the browser cannot specify another learner, recipient, consent
status, or redirect. The function uses server-side Resend credentials only.

Email links open the updated frontend at `/#guardian-consent?token=<capability>`.
The token fragment is removed before rendering and kept only in component memory;
it is never stored with the learner session. Opening a link only performs a
read-only JSON `{action:"inspect",token}` request. Approval and rejection require
explicit JSON `{action:"approve"|"reject",token}` submissions. Approve additionally
requires a guardian acknowledgment in the UI. These token operations do not
require a learner login. Default Supabase gateways may rewrite HTML as plain text,
so the primary guardian screen is hosted by the frontend. Read-only GET and POST
form support remain for older links/custom-domain deployments.

Tokens contain 256 random bits; only SHA-256 hashes are stored. They expire after
24 hours, are single-use, and are bound to the learner and the recorded guardian
address. Resending invalidates previous live tokens immediately. Only a token
whose email was accepted by Resend and whose delivery state was committed can be
used. Failures/timeouts never grant consent. An ambiguous provider response may
deliver an unusable link; the learner must wait and resend. Resend idempotency keys
prevent duplicate messages for the same reservation.

Profile locks serialize resend/approve/reject; a recipient advisory lock protects
shared limits. Abuse limits: one attempt per learner per 10 minutes, five attempts
per learner per rolling 24 hours, twenty per recipient per rolling 24 hours.
Failed deliveries count toward all limits. HTTP 429 carries `Retry-After`.
Application logs omit provider responses, raw tokens, bearer tokens, email
addresses, and secrets. Legacy GET `?token=` URLs can still enter infrastructure
access logs; new emails use the fragment route and old unconsumed links are
invalidated by this migration.

## Schema changes

Apply `migrations/20261031000000_guardian_consent.sql` after the existing
`student_progress.sql` and `learner_accounts.sql` baselines are confirmed installed.

- `learner_profiles.guardian_rejected_at`: protected terminal rejection marker.
- `guardian_approvals.status`, `sent_at`, `consumed_at`, `rejected_at`: delivery and
  decision lifecycle; existing `approved_at` remains the approval audit timestamp.
- Recipient/time index for abuse-limit queries.
- Four fixed-search-path, service-role-only security-definer RPCs:
  `guardian_consent_reserve`, `guardian_consent_delivery`,
  `guardian_consent_inspect`, `guardian_consent_decide`.
- Approval changes pending to verified and sets `consent_at` atomically with token
  consumption. Rejection keeps pending, sets the rejection marker, consumes the
  token, and blocks resends. There is no automatic approval or rejection reset.
- Existing unconsumed links are invalidated. Existing completed approvals are
  preserved; no learner is automatically activated by the migration.
- RLS stays enabled. Token-table access and RPC execution are revoked from public,
  anonymous and authenticated clients. Safe profile edit grants remain unchanged.
- The legacy missing-profile progress exception is removed. Read/insert/update
  now require the user's own active or verified protected profile. Pre-existing
  test accounts without profiles need an administrator-reviewed profile migration
  before cloud sync resumes; do not invent their DOB or consent. Existing progress
  rows are retained.

Do not rerun the older baseline SQL after this migration: it would restore the
legacy policies. Use `inspect_guardian_schema.sql` to inspect actual columns,
policies, grants, triggers, and RPCs first. Inspect existing accounts and progress
privately to plan the legacy-account migration; do not export PII into review logs.

## Required configuration and deployment

This work is authorized for deployment, but needs the actual project and access.
Use the Supabase URL/public key from the **actual signup build**, not a guessed
project. Confirm the live schema against `inspect_guardian_schema.sql`; if it
differs from the baseline, reconcile the migration before applying it. The two old
baseline files are not CLI migration history: do not blindly run `supabase db push`
or mark existing migrations applied without reviewing the remote history.

1. Grant secure Supabase administration access (`SUPABASE_ACCESS_TOKEN` for CLI
   deployment and project-owner SQL access) to project `fjmyfcpzfrkozplylygd`.
2. Apply the reviewed migration to that project through the SQL Editor or your
   established migration workflow. Record the migration in that workflow.
3. Set hosted Edge Function secrets using an ignored, permission-restricted file
   based on `.env.example`:
   - `RESEND_API_KEY`: Resend sending key, never a `VITE_` value.
   - `GUARDIAN_FROM_EMAIL`: sender at a Resend-verified domain.
   - `APP_ORIGIN`: exact HTTPS origin serving the **updated** guardian frontend.
     The older production build cannot handle the new review route.
   - `GUARDIAN_ALLOWED_ORIGINS`: optional comma-separated exact signup/preview
     origins, including the supplied versioned Netlify URL when it is used. No
     wildcard, suffix matching, or arbitrary request-provided redirects.
   Hosted Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; do not
   put them or the Resend key in browser builds. The browser uses only
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` public values.
4. After confirming the project, deploy from the repository root:

   ```sh
   supabase secrets set --env-file /path/to/ignored/guardian.env --project-ref fjmyfcpzfrkozplylygd
   supabase functions deploy guardian-consent --project-ref fjmyfcpzfrkozplylygd
   supabase functions list --project-ref fjmyfcpzfrkozplylygd
   ```

   `config.toml` sets `verify_jwt=false` only for this function so OPTIONS and
   guardian capabilities reach it. Authenticated send operations validate JWTs
   themselves. This does not disable RLS or Supabase Auth email confirmation.
5. Deploy the frontend containing the guardian hash route to `APP_ORIGIN` and
   configure the public Supabase build values. Guardian recipients must be able
   to open this URL; Netlify team-login protection can prevent that. Grant intended
   test guardians access or provide an accessible preview through the normal
   hosting access controls. No access restriction was changed by this repair.
6. Keep Supabase email confirmation enabled and configure its working SMTP,
   Site URL and allowed callback URLs. Verify the protected learner creation
   trigger and registration-readiness RPC are installed. Email ownership is the
   existing gate; broader consent requirements remain as documented in setup.

## Validation and remaining manual checks

Local commands:

```sh
npm ci
npm test
npm run test:guardian-db
npm run test:guardian-concurrency # optional: local Docker, isolated PostgreSQL 17
npm run build
deno check supabase/functions/guardian-consent/index.ts
```

Completed: **191 Vitest tests**, SQL/RLS tests, independent PostgreSQL concurrency
tests, production build, Deno typecheck, and browser scenarios for pending,
missing-profile, verified, approval, rejection, expired and reused links. No real
signup or email was submitted during live frontend inspection.

SQL tests run the real PostgreSQL engine in a discarded PGlite database with only
Supabase Auth schema/roles stubbed. They cover delivery, resend rotation, expiry,
replay, rejection, changed guardian email, auth prerequisites, limits, table/RPC
grants, and pending/missing-profile/cross-account progress RLS. Independent
PostgreSQL 17 connections also passed concurrent send, approve-versus-reject, and
recipient-limit races; the Docker test publishes no ports and removes its container.
Handler/SQL integration tests exercise the complete local send/inspect/decision
flow with only Auth verification and Resend transport mocked. Handler tests cover
the exact payload, authentication, CORS, input limits, token hashing, secret
boundaries, provider failures, read-only inspection and explicit decisions.

After deployment, use controlled test accounts and an inbox owned by the tester:

1. From the actual signup origin, confirm OPTIONS is 204 and returns that exact
   `Access-Control-Allow-Origin`; hostile origins must receive 403. Anonymous send
   and forged/expired learner JWTs must fail.
2. Register a new under-10 learner, confirm the learner email, and sign in. Verify
   the profile is pending and direct PostgREST progress writes are denied. Check
   that the guardian email arrives from the verified sender.
3. Open the email in a separate signed-out browser. Confirm its URL fragment is
   cleared, inspection leaves the profile pending, and no decision occurs until a
   guardian explicitly acts. Approve, then sign the learner out/in; verify both
   profile and cloud progress are enabled only for that learner.
4. In separate accounts test explicit rejection (still blocked), replay, expiry,
   wrong/changed recipient binding, resend after cooldown (older link unusable),
   immediate resend (429), provider failure, and cross-account isolation.
5. Confirm an adult account and password recovery still work without the guardian
   email gate. Verify deployed logs contain only non-sensitive request identifiers.

Real signup confirmation, email delivery, deployed CORS, frontend hosting and
remote schema validation remain pending until the missing access is provided.
