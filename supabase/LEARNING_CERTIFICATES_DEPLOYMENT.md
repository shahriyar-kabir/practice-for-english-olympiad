# Learning certificates — release preparation

**Authorization:** the owner said “done” for the reviewed batch on 5 November 2026. Apply these steps for the approved release.

The frontend requires the new schema and both functions. Apply backend changes first during the authorized release, verify them, then publish the frontend through the existing GitHub Pages workflow.

1. Inspect the linked project and pending migrations without printing secret values. Review and apply `migrations/20261104225407_learning_certificates.sql` with the approved Supabase CLI/project workflow. Do not reset the database or apply unrelated pending work.
2. Confirm `APP_ORIGIN` is `https://wizpiko.com`. Optional `LEARNING_ALLOWED_ORIGINS` is a comma-separated exact origin list for authorized previews. The Supabase runtime supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`; the service role must never be put in the frontend.
3. Deploy `learning-certificates` with JWT verification enabled, as recorded in `config.toml`. It also resolves the live Auth user and rejects anonymous Auth sessions.
4. Deploy `certificate-verification` with JWT verification disabled, as recorded in `config.toml`. It accepts only token-based public reads. It exposes no claim, grade, list or ownership mutation actions.
5. Verify private records cannot be read directly with anon/authenticated roles, a missing/invalid session is rejected, an unqualified claim fails, and an invalid/private public token returns 404. Use a designated test account for any approved end-to-end release test.
6. Publish the website only after those checks. Confirm English/Maths lessons, My Certificates, full-name preview, downloads and root-query verification links. The canonical public URL is `https://wizpiko.com/?certificate=<token>` so the static host serves HTTP 200 to browsers and sharing services. A certificate-specific rich social preview is not implemented; the link opens the verifiable certificate page.

The migration creates a private, RLS-enabled `wizpiko_learning` schema with programme requirements, graded results and certificates. The API RPCs use `SECURITY INVOKER`; execution is granted only to service role. The public function returns an explicit safe projection, never an owner ID or private learning/account details. Sharing uses a revocable random UUID token and no-store responses.

No new SMTP configuration is required. Leave the existing working public-support delivery and confirmation email branding unchanged. Do not send a contact or account email as part of deployment without a specifically authorized test.

For rollback, restore the prior frontend and disable the new functions as appropriate. Keep earned certificate data; do not drop the schema as a routine rollback.
