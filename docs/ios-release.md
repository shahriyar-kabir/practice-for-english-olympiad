# iOS app release record and backend setup

This is a separate app-development branch based on website release `d1ac7d1a71500b34f8aa2dff593c03bad0686030`. Do not merge it into website production merely to build the app. iOS development and cloud compilation do not authorize publishing an App Store listing or sending emails.

The owner approved publishing the app source to the existing **public** repository, `shahriyar-kabir/practice-for-english-olympiad`, for the Mac cloud build. That authorization covers the iOS branch and its build. Website production and Apple submission are separate release steps. The new account-deletion function is staged and has not been deployed.

## Native setup

Dependencies are pinned in `package.json` and `package-lock.json`. Capacitor 8.6.0 uses Swift Package Manager; `npx cap sync ios` regenerates the package references. No CocoaPods install is needed. The cloud job selects Xcode 26.2 on macOS 15 and compiles simulator and unsigned device archives. No Apple credentials are required: the simulator app is signed ad hoc to exercise Keychain, while the device archive remains unsigned. The smoke check explicitly uses the installed iOS 18.6 runtime. The iOS 26.2 cloud simulator stalled in its own first-boot data migration before app installation, so it is not used for this readiness check.

A debug-only startup marker requires the app to reach the learning interface. On a simulator, it also checks a Keychain save/read cycle using a unique temporary item and removes that item afterward. It never changes the learner-session item. This check is excluded from release builds. Failure captures bounded diagnostics instead of accepting a screenshot of an error screen.

All native screens and content are bundled. The normal website entry remains `src/main.tsx`; iOS uses `ios.html` and `src/mobile/main.tsx`. Shared App accepts optional mobile chrome/home renderers. The website uses its existing renderers by default. Native fetch uses Capacitor’s HTTPS transport, preserving the website’s CORS allowlist. There is no remote server URL, cleartext exception, analytics SDK or service-role key in the app.

Sessions are written to Keychain with `WhenUnlockedThisDeviceOnly`; JavaScript keeps only an in-memory copy. Writes are serialized, and login waits for the secure write before remounting the account. Remember me off is in-memory only. Logout clears the native session. Learning caches stay scoped to their account. Account deletion also removes that account’s local cache.

Certificate exports use the existing verified certificate data, render the same design, then present UIKit’s activity sheet. The native plugin accepts only bounded PDF/PNG data, validates signatures and confines temporary files to its own directory. Public certificate sharing is opt-in, remains revocable and uses the website URL.

## In-app account deletion

`supabase/functions/app-account` is a narrow, JWT-protected endpoint with no database migration. The handler resolves the current Auth user, requires explicit `DELETE` confirmation and reauthenticates that same user with their current password. It revokes sessions before asking the Auth admin API to delete the verified actor. A client-provided account ID/email is ignored. Existing cascading foreign keys remove profile, progress, graded results and certificates; verify them before enabling this endpoint. Previously downloaded documents or support emails are not recalled by account deletion.

Deploy only `app-account` with `verify_jwt=true`, using the existing Supabase runtime keys and `APP_ORIGIN=https://wizpiko.com`. No new secret is needed, and no credential should be read or printed. Confirm an unauthenticated request is rejected and the allowed-origin preflight succeeds. Do not delete a real account for a smoke test. The destructive path is verified with injected test backends.

## TestFlight handoff

The owner has a MacBook but insufficient space to install Xcode. Use the cloud pipeline to compile. For an installable TestFlight build, obtain the non-secret Apple team ID and confirm Developer Program enrollment. Keep distribution certificates, their password, provisioning profiles and App Store Connect API private keys in the repository’s protected Actions secrets, never in chat or source. Configure and verify the signing/export job only when those are available. Until then, share the unsigned artifact and screenshots for review; do not call it an installable IPA.

The final App Store release needs owner-approved listing text/screenshots, privacy disclosures, age rating, support/privacy URLs and an Apple review account. None of these should change the current website release or its working mail configuration implicitly.

## Validation

The shared and mobile tests pass (475 tests). Both normal website and iOS TypeScript/Vite builds pass. `ios:check` confirms bundled screens, native plugin registration, Keychain, HTTPS-only configuration, privacy manifest membership and brand assets. Deno checks pass for the staged account-deletion function. The 58 browser checks cover signed-in/guest layouts at 320, 390, 430 and 820 pixels plus landscape, chosen avatars, lazy question banks, English/Maths courses, game branches, certificates, deletion confirmation/error handling and sign-in gates. These use synthetic account data and mocked services.

The [native cloud build](https://github.com/shahriyar-kabir/practice-for-english-olympiad/actions/runs/42156909932), source `3c76e75dd56bb2ec4f096b47b79a1c29a81be4d8`, compiled the Swift app and passed native launch on iOS 18.6, including its real Keychain save/read check. A native iPhone screenshot is included in its artifacts. A successful startup check is narrower than full device acceptance: sign-in, certificate share sheets, accessibility and account deletion still need a signed-device/TestFlight test before distribution.

Read-only production schema inspection confirms CASCADE foreign keys from learner profiles, student progress, graded skill results and certificates to Auth users. No real account was deleted and no email was sent.
