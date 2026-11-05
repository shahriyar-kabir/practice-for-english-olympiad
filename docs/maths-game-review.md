# Wizpiko Games — Maths game review

Status: prepared locally for owner review. No push or deployment is authorized. This game is separate from the larger [Maths curriculum proposal](maths-content-review.md); the proposed 8,000-question course library has not been implemented.

## The two branches

The Games menu opens a subject playroom with exactly two available branches:

| Branch | Game | What learners do |
| --- | --- | --- |
| English | Word adventures | Keep the existing word puzzles, crosswords and five-question language quizzes. Existing English drafts, unlocked levels and XP remain saved. |
| Maths | Mental Maths Trail | Solve short mental calculations by selecting one of four answers. There is no fixed final level. |

Guests can see both subject cards. Opening either branch requires sign-in and returns them to their selected branch afterwards. The homepage Mathematics card opens the Maths game and says “Games available”; it does not claim that the full Maths course library is ready.

## Maths round

1. Choose a starting point or continue the saved level.
2. Play five multiple-choice questions, one at a time, with four options each.
3. Ask for a hint when needed. There is no countdown, expiry or speed bonus.
4. Check the chosen answer immediately. The correct answer and an explanation appear before continuing.
5. Review all five answers and their explanations after finishing the round.
6. Get at least four correct to advance one level. Otherwise, try a fresh round at that level.

The proposed four-of-five rule is part of this reviewable implementation. A completed round counts as learning even when fewer than four answers are correct. Opening a game, requesting hints or answering only part of a round does not create a completed activity or streak day.

## The mental calculation trail

| Levels | Theme | Skills and example answers |
| --- | --- | --- |
| 1–5 | Number sparks | Number bonds, addition and subtraction with answers up to 20, missing numbers, explicit counting patterns. Example: `8 + ? = 13` → **5**. |
| 6–15 | Everyday numbers | Larger sums and differences, friendly 2, 5 and 10 times tables, matching exact division, missing numbers and patterns. Example: `60 ÷ 5` → **12**. |
| 16–30 | Table explorer | Times tables through 12, exact division, squares through 15² and arithmetic connections. Example: `12 × 8` → **96**. |
| 31–50 | Mental connections | Two-step calculations, order of operations, signed numbers, patterns and short equations. Example: `7 + 4 × 6` → **31**. |
| 51–75 | Fraction finder | Friendly fractions with common denominators, percentages, tenths and arithmetic connections. Example: `25% of 80` → **20**; think “one quarter”. |
| 76–100 | Number navigator | Ratios, fractions, percentages, decimals, equations and patterns. Example: `35 shared in the ratio 2:3` → first share **14**. |
| 101 onwards | Mental mix | Varied rounds combining the established mental skills. Levels continue, while number sizes stay manageable. Example: `3x + 5 = 26` → **x = 7**. |

The game generates a new round for each new attempt. Level counters use decimal strings so they continue beyond JavaScript's safe integer range. There is no configured last level. The combinations are finite and familiar ideas can recur; this is continuing practice, not a claim of infinitely many unique mathematical problems. Difficulty does not grow into unwieldy calculations. Higher mathematics belongs in the proposed lesson library, where written reasoning and interactive models can support it.

Four starting points are open to every learner: level 1, level 16, level 51 and level 101. Choosing a later starting point does not award earlier completions, badges or XP. Age does not restrict the choice.

## Saved progress and rewards

- Save each checked answer, hint and exact question snapshot. Unfinished rounds can resume after leaving, reloading or a long break, including a two-day pause.
- Keep Maths drafts separate from the existing English draft. Switching subjects preserves both.
- Add completed Maths rounds to the shared learning calendar, recent activity and achievements. Keep the existing two-missed-day streak grace period. Previously earned badges and XP stay safe.
- Award two XP per correct answer toward the best result for each level, up to ten XP per level. A replay awards only the improvement in that best result. Replaying a perfect level does not duplicate XP.
- Merge per-level best results across devices. Completion IDs prevent an old cloud draft from resurrecting a finished round. Existing account ownership rules keep different learners' progress separate.
- Show Maths levels practised, levels passed, current level and XP in My Progress. An ongoing game has no overall completion percentage.

## Future subjects and loading

Subject metadata and the corresponding screen loader are registered in one file, `src/gameSubjects.ts`. The subject route validation, Games cards and lazy screen selection use this registry. A new subject can reuse the round/progress helpers and shared learning events without putting its questions into the homepage bundle.

The initial homepage loads neither the Maths generator nor the English game engine. Opening the public Games cards still loads neither private engine. Maths uses lightweight text, icons and CSS illustrations, with no extra image downloads or animation loop. The game performs no per-question network request; progress uses the existing debounced account synchronization.

## Validation completed locally

- Production build and strict TypeScript checks passed with the repository deployment base used for the browser preview.
- All 441 tests in 18 test files passed, including the existing English library, account, email-service and streak tests. Independent arithmetic checks covered 21,000 generated questions at difficulty boundaries and at a level beyond the safe integer range.
- All 73 local browser checks passed, covering 320, 390, 900 and 1440 pixel viewports, answer feedback, hints, passing/retrying, separate English/Maths drafts, shared progress, guest sign-in return, huge level counters and a second device resuming a snapshot after 48 hours.
- No browser exceptions, console errors, failed assets or unexpected external calls were recorded. All account endpoints were mocked; no live email or contact submission was sent.
- The Maths screen/generator is approximately 6 KB compressed and loads only when its branch opens. The public hub is approximately 1 KB compressed. Browser resource checks confirmed that the initial homepage and public Games hub load neither private game engine. Shared account/progress support adds approximately 2.5 KB compressed to the initial JavaScript compared with the previous preview build.
- Desktop and mobile screenshots are saved in `/workspace/output/wizpiko-maths-games/`. The detailed browser report is `/workspace/work/wizpiko-maths-game-checks/artifacts/results.json`.

These are local validation results, not a production network-speed guarantee. No release commit, push or deployment has been made for this batch.
