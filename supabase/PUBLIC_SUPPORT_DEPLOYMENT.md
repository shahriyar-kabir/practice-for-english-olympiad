# Public account lookup and contact delivery

This release prepares a public `public-support` Edge Function and two service-only
RPCs. Nothing in this directory deploys itself. Do not publish or apply the migration
before the requested copy review is approved.

## Behavior and privacy

- `POST {"action":"account-status","email":"person@example.com"}` returns only
  `{"exists":true}` or `{"exists":false}`. The server checks `auth.users` through
  `wizpiko_public_account_exists`; neither anonymous nor authenticated browser
  roles can call that RPC or read Auth user records.
- The existence response deliberately distinguishes registered email addresses.
  It is therefore public account enumeration by design, limited by both trusted
  client IP (20 lookups per 10-minute window) and target email (5 per 10 minutes).
  CORS is an origin allowlist, not authentication or bot protection. If abuse
  increases, add an ingress challenge before increasing these limits.
- `POST {"action":"contact","name":"Explorer","email":"person@example.com",
  "suggestion":"Please add more listening activities.","website":""}` sends a
  plain-text message to the fixed address `support@wizpiko.com`, with the validated
  visitor email as Reply-To. The browser cannot choose a recipient, sender or
  subject. It returns `{"accepted":true}` only after the selected transport
  confirms acceptance: SMTP must accept the fixed recipient and return a final
  `250` DATA response, or Resend must return HTTP 200 with a message ID. Provider
  acceptance is not a guarantee that a mailbox will deliver or display the message.
- Contact quotas are 3 submissions per IP per hour and 3 per email per day.
  Missing mail configuration returns HTTP 503. Honeypot submissions and invalid
  input return HTTP 400; they never receive a fake success response.
- Names are trimmed and must be 1–100 characters with no control characters;
  emails are trimmed/lowercased, at most 254 characters, and reject controls;
  suggestions are trimmed and must be 10–5,000 characters. Message line breaks
  and tabs are accepted. Unknown fields and a nonempty `website` are rejected.
  The body limit is 24,576 bytes.
- Rate bucket identities are salted SHA-256 hashes. Raw IPs, emails and contact
  messages are not stored in the limiter database. Contact content goes to the
  configured email provider and support mailbox. The handler does not log it.

## Configuration before deployment

1. Confirm the intended Supabase project and inspect its schema. Apply
   `supabase/migrations/20261104000000_public_support.sql` as project administrator
   after reviewing it. It creates only the private rate table and support RPCs;
   it does not alter learner/progress tables, existing accounts or Auth settings.
2. Configure only this function to accept unauthenticated requests:

   ```toml
   [functions.public-support]
   verify_jwt = false
   ```

   The snippet belongs in the deployment's Supabase function configuration.
   Do not change verification settings for unrelated functions.
3. Hosted Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
   Set `APP_ORIGIN` to the exact production HTTPS origin, for example
   `https://wizpiko.com`. Set `PUBLIC_SUPPORT_ALLOWED_ORIGINS` to a comma-separated
   list of any explicitly approved HTTPS preview origins. Wildcards, paths,
   `null` origins and missing Origin headers are rejected.
4. Generate a private random `PUBLIC_SUPPORT_RATE_LIMIT_SALT` of at least 32
   characters. Keep it in function secrets. Changing it resets effective quotas.
5. The runtime ingress **must overwrite** `cf-connecting-ip`, or overwrite
   `x-real-ip` when Cloudflare's header is unavailable. Do not deploy behind an
   ingress that trusts visitor-supplied values for these headers: that permits IP
   quota evasion. Requests without a syntactically valid trusted IP share one
   restricted `unknown-client` bucket. Validate the ingress behavior in staging.
6. The owner confirmed that **`support@wizpiko.com` has been created with
   SpaceMail**. Mailbox creation is complete. DNS readiness, authenticated SMTP
   operation and actual receipt have not been independently verified in this
   session; verify them with an approved controlled delivery test after deployment.
7. **Recommended: use the existing SpaceMail mailbox for outgoing contact mail.**
   Set these server-only function secrets:

   ```dotenv
   PUBLIC_SUPPORT_MAIL_TRANSPORT=smtp
   PUBLIC_SUPPORT_FROM_EMAIL=Wizpiko <support@wizpiko.com>
   PUBLIC_SUPPORT_SMTP_HOST=mail.spacemail.com
   PUBLIC_SUPPORT_SMTP_PORT=465
   PUBLIC_SUPPORT_SMTP_USERNAME=support@wizpiko.com
   PUBLIC_SUPPORT_SMTP_PASSWORD=<mailbox password supplied securely>
   ```

   SpaceMail documents this host, implicit SSL/TLS port and full-mailbox
   authentication for custom contact forms. Ensure SMTP access is enabled in
   SpaceMail Manager or webmail; it is enabled by default according to its guide.
   The configured sender address must match the authenticated mailbox. Certificate
   verification and TLS 1.2 or newer are mandatory. The adapter sets a 10-second
   deadline, bounds connection/greeting/socket waits and closes the active
   connection on every outcome. The visitor address is Reply-To only; both the
   envelope and message destination remain `support@wizpiko.com`. No SpaceMail API
   or additional email-provider account is required.

   **Optional alternative:** explicitly set `PUBLIC_SUPPORT_MAIL_TRANSPORT=resend`,
   configure `RESEND_API_KEY`, and set `PUBLIC_SUPPORT_FROM_EMAIL` to a sender
   verified with Resend. SMTP credentials are unused in that mode. An unset or
   unknown transport disables contact delivery with HTTP 503. Failure never
   switches transports or automatically resends an ambiguously accepted message.
   SMTP has no equivalent to the Resend idempotency key, so a timeout can mean
   acceptance is unknown; the function reports failure and performs no retry.

   Keep service-role, salt, mailbox-password and optional Resend values server-only,
   never in `VITE_` variables, tracked files, frontend bundles or terminal output.
   `supabase/.env.example` contains placeholders only. Supabase Auth's existing
   confirmation and password-reset SMTP settings are separate and remain unchanged.
8. Deploy `supabase/functions/public-support/index.ts` to the confirmed project
   after copy approval and backend credentials are available. The frontend uses
   its existing public Supabase URL/key; no service credential is needed there.

## Response/error contract

Both actions accept JSON over POST. Allowed-origin OPTIONS requests return 204.
Responses have `Cache-Control: no-store`; errors contain `{error,code}`.

| Status | Code | Meaning |
| --- | --- | --- |
| 400 | `invalid_input` | Invalid fields, unsupported action/fields, honeypot |
| 403 | `origin_not_allowed` | Missing or unapproved origin |
| 405 | `method_not_allowed` | Use POST |
| 413 | `payload_too_large` | Request exceeds body limit |
| 415 | `unsupported_media_type` | Send JSON |
| 429 | `rate_limited` | Quota exhausted; honor `Retry-After` seconds |
| 502 | `delivery_failed` | Provider did not confirm accepting the contact message |
| 503 | `service_unavailable` | Missing config, database error or unavailable lookup |

A malformed or unavailable lookup never returns `exists:false`. A failure never
returns `accepted:true`. The frontend must not label HTTP 429, network failures,
unavailable functions or invalid credentials alone as a nonexistent account.

## Validation

Run offline checks from the repository root:

```sh
npx vitest run src/cloudAccount.test.ts src/cloudAccount.hook.test.ts src/supportApi.test.ts supabase/functions/public-support/handler.test.ts supabase/functions/public-support/smtp.test.ts
node scripts/test-public-support.mjs
deno check --config supabase/functions/public-support/deno.json --frozen supabase/functions/public-support/index.ts
```

PGlite executes the actual migration and grant/lookup/quota checks, including a
migration rerun and a 20-request queued burst that accepts exactly 3. PGlite queues
transactions; this is not an independent multi-connection PostgreSQL concurrency
test. The SQL reserves all quota dimensions under transaction-scoped advisory
locks acquired in a consistent order, then writes only after all dimensions pass.
Run an additional two-connection burst in staging when validating the runtime.

The function-local `deno.json` and `deno.lock` pin Nodemailer 10.3.1 and its type
dependencies. The adapter uses Nodemailer's public SMTP connection and MIME
composition APIs so cancellation closes the active socket, including an in-flight
send. Unit tests inject the transport and open no SMTP connection. Native Deno
type checking and an offline import/MIME-composition/closed-transport check passed;
neither checks hosted connectivity or authenticates to the SpaceMail mailbox.

Official references checked on 2026-11-03:

- [SpaceMail client configuration](https://www.spaceship.com/knowledgebase/connect-spacemail-to-email-client/)
- [SpaceMail contact-form SMTP setup](https://www.spaceship.com/knowledgebase/how-to-set-up-contact-form-with-spacemail/)
- [Supabase npm and Node dependency support](https://supabase.com/docs/guides/functions/dependencies)
- [Supabase runtime restrictions](https://supabase.com/docs/guides/functions/limits)

Supabase documents that outgoing ports 25 and 587 are blocked. This adapter uses
465 with implicit TLS. Runtime/library compatibility is checked locally; actual
hosted outbound access and delivery still need the approved deployment test.

After deployment, verify allowed/disallowed preflights, known and nonexistent test
addresses, invalid input, exhausted quotas, missing-provider behavior and a
controlled contact delivery to the confirmed mailbox. Verify Reply-To and the
fixed destination in the delivered message. Do not use real learner addresses for
manual enumeration tests or send unsolicited contact emails.

Bucket cleanup can run as an administrator after the longest window is past:

```sql
delete from public.public_support_rate_buckets
where window_start + make_interval(secs => window_seconds) < now() - interval '1 day';
```

No cleanup schedule is created by this release.
