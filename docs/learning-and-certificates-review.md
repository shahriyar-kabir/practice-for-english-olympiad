# Subject learning and certificate review

The owner approved publication of this reviewed batch with “done” on 5 November 2026. It includes the Maths game already described in [maths-game-review.md](maths-game-review.md). The original [Maths content proposal](maths-content-review.md) describes a larger future curriculum; its 8,000-question count is not the implemented inventory.

## Homepage

Homepage section titles, cards, descriptions and metadata use a more consistent reading scale. The six age/stage cards select a starting suggestion and then offer English or Maths. Selecting an age does not open English automatically. Every ability level remains available to every age.

Physics, Science, Chemistry, Informatics, Artificial Intelligence and And More each open a public subject overview with four topic areas and a curiosity note. Planned subjects have generic navigation and a suggestion link. Guests can browse these pages; lessons and games require sign-in.

## Question inventory

| Subject | Levels | Skills per level | Questions per skill | Total |
| --- | --- | --- | --- | --- |
| English | Starter, Beginner, Intermediate, Advanced | 6 | 20 | 480 |
| Mathematics | Starter, Beginner, Intermediate, Advanced | 6 | 20 | 480 |

English skills cover sounds, vocabulary, grammar, reading, listening and writing. Maths skills cover numbers, fractions, algebra, geometry, data and reasoning. Advanced Maths introduces topics such as logarithms, calculus, matrices, vectors and statistics. This is a broad foundation across four ability groups, not a complete university Maths syllabus.

Each skill has teaching, worked examples, four groups of five questions and a review. Most tasks are MCQs; typed and word-order tasks are used where appropriate. Answers include explanations. There is no timer. Work can be resumed. Maths comparisons accept exact equivalent fractions and terminating decimals without accepting a rounded approximation to a nonterminating answer.

The shared subject registry and course component allow future subjects to use the same levels, grading and certificate flow. Future subjects still need authored content and corresponding backend programme records before publication.

## Certificate rules and flow

Learners answer all 20 questions in all six skills at a level and need at least 16 correct (80%) in each skill. The server grades the canonical questions and stores the best result. An overall average cannot compensate for an unpassed skill. Previous five-question lessons, games, XP and badges stay saved separately and do not qualify as 20-question results.

My Certificates lives in the signed-in profile navigation. A qualifying learner selects Create certificate, enters a full name into a blank field and checks the preview before issuing. The confirmed name becomes the certificate’s fixed name. There is one certificate per learner, subject, level and curriculum version.

Certificates begin private. Owners can download a landscape PDF or PNG. Enabling public sharing produces a verification link and sharing links for LinkedIn, Facebook and X, plus native sharing where supported. The public record includes the certificate name, subject, level, issue date and achievement requirements; email, date of birth, answers and account IDs are excluded. Making a certificate private disables its previous link. Downloaded copies cannot be recalled.

The white, navy and gold design has the seal on the right and no “Issued by Wizpiko” block. The seal has a gold rosette, navy ribbon, central W and curved WIZPIKO/ACHIEVEMENT labels. SVG previews and PDF/image downloads share the same drawing instructions.

## Loading and validation

The homepage does not load English/Maths question banks or PDF rendering code. Course content is split by subject/level. The redesigned stage chooser replaces the old large stage sprite with small icons. No production dependency was added.

Validation artifacts are in `/workspace/work/wizpiko-certificates-checks/`: automated tests, a strict production build, Deno checks, disposable SQL permission/qualification tests, desktop/mobile browser checks, download samples and screenshots. Browser services are mocked; no live account, email, certificate or social post is created by these checks. Deployment steps are staged in [the backend release notes](../supabase/LEARNING_CERTIFICATES_DEPLOYMENT.md).

Completed checks for this review: 463 automated tests across 21 files; 88 browser checks with no browser exceptions, unexpected network requests or failed static assets; four disposable-database check groups; strict TypeScript/Vite build; and Deno type checks for both function entry points. The downloaded PDF was opened with `pdfinfo` as a valid single-page A4 landscape document. The seal was visually inspected in both the SVG preview and downloaded image. Desktop and mobile screenshots are available in `/workspace/output/wizpiko-update-review/`.
