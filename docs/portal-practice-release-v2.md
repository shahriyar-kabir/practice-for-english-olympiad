# Portal and practice update — 4 November 2026

The owner authorized publication by saying “done”, followed by “continue deploying”. This batch uses the existing GitHub Pages site at https://wizpiko.com/.

## Resulting experience

- The signed-in home shows the learner’s saved avatar prominently, using the same five illustrated choices in the header, account menu, profile and sidebar. The portal and account screens use the supplied blue and colourful visual direction, with real saved activity rather than illustrative statistics.
- The Wizpiko Playroom replaces the former numbered, age-category practice grid with seven skill and interest paths. The library has 70 newly authored MCQs and 210 contextual clues. The separate collection has ten newly authored themed crosswords and 110 words. Full content is recorded in [practice-content-review-v2.md](practice-content-review-v2.md) and [original-word-puzzles-review.md](original-word-puzzles-review.md).
- Puzzles and MCQs have no countdown or expiry. MCQ rounds contain five questions, with feedback after each answer and a result after all five are answered. An older saved draft is retained separately rather than interpreting its answers against replacement content.
- Earlier word-puzzle progress is kept under its original IDs. Historical completions still contribute to lifetime activity and achievements; new puzzles start with their own IDs and progress.
- Two fully missed calendar days remain available before a streak ends. The streak pauses during grace. Completed activity grows the streak; signing in alone does not. Existing XP, longest streaks and earned badges are retained.
- Website pages refer people to Contact Us without displaying the support email or a mailto link. The working contact delivery, SMTP credentials and live confirmation-email template are unchanged.

## Validation

- 391 unit/content tests pass across 15 files, including migration/resume, cloud merge, lifetime progress and streak grace boundaries.
- TypeScript and Vite production build pass.
- Main JavaScript is about 104 KB gzip; the English practice library loads separately at 24.01 KB gzip. The shared five-avatar WebP is 110,936 bytes. The two primary text fonts are preloaded. Saved-account restoration uses a reserved loading view and header space to prevent a guest-home flash. No new animation library or runtime dependency is added.
- No support address appears in generated website JavaScript. Contact form requests still use the existing support endpoint.
- Browser checks pass at 1440, 900, 390 and 320 px, including all saved avatars, six account pages, five-question completion, untimed resume, old saves, guest gates and contact responses. No runtime errors or unmocked backend requests occurred.
- A synthetic 390 px mobile check measured layout shift (CLS) of about 0.015 both locally and with 4× CPU slowdown / 120 ms latency / 200 KB/s download. This is a local diagnostic, not a promise of field performance.
- GitHub Actions and live deployment checks are recorded in the release PR after completion.

The historical review documents from the previous release describe that release. This document and the linked v2 content reviews describe the replacement practice collection.
