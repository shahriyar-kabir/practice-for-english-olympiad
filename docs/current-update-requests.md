# Current batch — subject learning, games and certificates

Status: DEPLOYMENT AUTHORIZED. After reviewing the changes and certificate seal, the owner said “done” on 5 November 2026. This authorizes publication of the reviewed Maths games, homepage amendments, 20-question skills and certificates through the existing Supabase and GitHub Pages release workflow.

The current deliverables are [maths-content-review.md](maths-content-review.md) and [maths-game-review.md](maths-game-review.md), plus the local Games hub and Mental Maths Trail implementation. The full 12-level, 200-unit, 8,000-question curriculum remains an authoring proposal. Its question quantities are not implemented inventory.

The mental game uses five-question rounds, four choices, hints, answer explanations and a four-correct progression rule. Difficulty grows through friendly arithmetic, fractions, percentages, ratios and short equations; later levels mix these mental skills with bounded numbers. No timers, no fixed final level, and no claim that every generated question is globally unique. Preserve English progress, account isolation, avatar selection, streak grace days and fast initial loading.

The latest “done” authorizes this batch. Keep the reviewed certificate requirement of at least 80% in every skill and full-name entry before issuance.

Follow-up deliverables are recorded in [learning-and-certificates-review.md](learning-and-certificates-review.md):

- Balance homepage type sizes; redesign the age/stage chooser with explicit English and Maths choices; give unpublished subject cards their own information pages.
- English and Maths each have four levels, six skills per level and 20 questions per skill: 480 questions per subject, 960 total. No timer. Five-question groups within each skill.
- Require at least 80% (16/20) in **every** skill for that subject/level certificate. This threshold was explicitly selected by the owner. Preserve old progress but do not treat old five-question results as certificate qualification.
- Ask for the learner’s full name before issuing; preview it first. Save the certificate in My Certificates, with PDF/image downloads and optional public sharing, including LinkedIn.
- Remove the issuer text, move the ribbon seal to the right and curve both WIZPIKO and ACHIEVEMENT. The latest correction spaces the lower lettering around the circle.
- Keep question banks and downloads out of the initial homepage load. Preserve avatars, account isolation, two missed streak grace days and the working contact/email settings.

The certificate schema and functions must deploy before the website. Review database tests use a disposable database; review browser tests mock external services. Deployment does not authorize sending contact emails or publishing social posts.

---

# Previous portal/practice batch — historical authorization

Status: deployment authorized. The owner said **done**, then **continue deploying**, after listing this batch. The earlier hold is satisfied. Implementation and verification are in progress before publication.

Requested changes:

- Bring the signed-in homepage and account pages closer to the supplied visual references. Prominently show the saved chosen avatar on the homepage and keep it consistent in the header, account menu and profile.
- Preserve the existing two-missed-day streak grace period, earned progress and achievements.
- Keep loading lightweight and smooth on desktop and mobile.
- Replace the Olympiad-style practice hub with a distinct Wizpiko design and newly authored names, copy, questions and puzzles. The practice library, themed word puzzles and hub layout are being replaced together.
- Make all puzzles and MCQs untimed. MCQs should be presented in small groups; the working default is five questions per group.
- Remove visible support email addresses and mailto links from website pages while preserving delivery from Contact Us to the existing support inbox. The separate, working confirmation-email template is unchanged.

This document supersedes the previous release-authorization record for the new batch. Publication will use the existing GitHub Pages deployment after checks pass. Existing SMTP and live confirmation-email settings are preserved.
