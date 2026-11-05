# Wizpiko for iPhone and iPad

The iOS app is built from the same reviewed learning engine as wizpiko.com, with its own bundled entry, mobile home, safe areas and bottom navigation. This branch does not deploy the website.

Current status: the owner explicitly approved uploading this app source to the existing public GitHub repository for a Mac cloud build. Local validation passes: 475 automated tests, mobile browser checks, TypeScript builds and native packaging checks. Xcode compilation runs in the iOS Actions workflow, which also checks that the simulator reaches its learning interface. Simulator builds are signed ad hoc for Keychain testing; the device archive stays unsigned. This is not yet a signed or installable iPhone app. The `app-account` backend function is staged, not deployed, and must be enabled before distribution.

## Included

- English and Maths: Starter, Beginner, Intermediate and Advanced; six skills and 20 untimed questions per skill.
- English word games and Mental Maths Trail with continuing levels.
- The same signed-in account, chosen avatar, saved progress, achievements, certificates and two missed-day streak grace period.
- Native Keychain session storage, light haptics, connection status, keyboard handling and external links in the system browser.
- Native PDF/image export through the iOS share sheet, including Save to Files; public certificate links stay on https://wizpiko.com.
- Password-confirmed in-app account deletion. The new `app-account` Edge Function must be active before distributing the app; deployment notes are in `docs/ios-release.md`.
- Branded icon/launch screen and a privacy manifest. No tracking, advertising, purchases, push notifications or unnecessary device permissions are added.

The app bundles its screens, fonts, questions and illustrations instead of loading the website. It requires Internet access for sign-in, account restoration, cloud saves, verified skill completion, certificates and contact delivery. An open lesson can retain its draft during a connection interruption; this is not a full offline account system. The native app starts with its own device cache, then restores the same cloud account.

## Cloud build — no local Xcode installation

Open the repository’s **Actions → Build Wizpiko for iPhone and iPad** run on the `feature/wizpiko-ios` branch. A macOS runner with Xcode 26 compiles the app. Successful runs provide:

- `Wizpiko-Simulator.app.zip`: the app for an iOS simulator on a Mac.
- `Wizpiko-Unsigned.xcarchive.zip`: the compiled iPhone/iPad archive, ready for an authorized signing step.
- An iPhone simulator screenshot when simulator capture succeeds, plus build logs.

An unsigned archive cannot be installed on an iPhone. Installing through TestFlight requires Apple Developer membership, a registered bundle ID and signing/provisioning credentials. The cloud build does not submit to Apple or publish to TestFlight/App Store. Artifacts expire after 14 days and can be rebuilt.

## Local development

From the repository root, run `npm ci`. Set the existing **public** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values in `.env.local`; never use a service-role or secret key in a frontend build. The cloud workflow uses the same existing repository variables as the website.

`npm run dev:ios` opens the mobile interface in a browser. `npm run ios:sync` builds and copies the app into the native project. `npm run ios:check` verifies packaging. On a Mac with Xcode, `npm run ios:open` opens `ios/App/App.xcodeproj`. Run `npm test` for the shared and mobile-specific tests.

Browser preview uses web storage and browser downloads. The installed app uses Keychain and UIKit exports. Those native paths are registered by `WizpikoViewController` in `AppDelegate.swift`, used by `SceneDelegate.swift`.

## Signing and public release

The proposed bundle ID is `com.wizpiko.app`, version 1.0.0, minimum iOS 16.4, with iPhone/iPad layouts. Confirm this identifier in the owner’s Apple Developer account before signing. Distribution is a separate owner-authorized step after review.

Email verification and password reset keep using the existing working Wizpiko website links. After completing them, return to the app and sign in. A `wizpiko://open?path=/maths-academy` URL can open a supported app route. Arbitrary credentials and external redirects are not accepted through app links. Associated domains/universal links are not enabled until an Apple team ID is available; no live domain file was changed.

Complete the App Store privacy and age-rating forms from the actual data used: account contact details, date of birth, user ID, learning history and user-submitted support messages. Select the intended audience and have the owner review any child-directed distribution requirements before submission. This build does not claim App Store approval.
