# Homepage and account content for owner review

**Status: local draft for approval before publication. This document does not record publication approval.**

This is the current user-facing copy from `SiteHeader.tsx`, `SiteFooter.tsx`, `WizpikoPortal.tsx`, `LearningStages.tsx`, `LearnerHub.tsx`, `learningMetrics.ts` and the relevant navigation/sign-out screens in `App.tsx`. Quoted wording is exact. Brackets identify real dynamic values, such as [name], [count], [score], [date], [level] and [skill]; they are not example accounts or invented statistics. The fixed totals of 24 English lessons and 10 original crosswords describe available content.

Review the wording and behavior below alongside [public information, support and account copy](content-review.md) and [the English curriculum and lesson interface](english-content-review.md). The shared FAQ answers and individual lesson titles/descriptions are reproduced in those documents rather than repeated here.

## Header, navigation and access

Brand alternative text: “Wizpiko — Think. Play. Shine.” Home action: “Wizpiko home”.

Main navigation: **Home · Subjects · Games · My Learning · About Us · Contact Us**. “My Learning” appears only when signed in and opens My Progress. Home opens the homepage; Subjects scrolls to the homepage subject cards; Games opens the existing crossword/MCQ practice games. English Practice and lesson actions open the English Academy. About Us and Contact Us open their public pages.

Search button: “Search”. Search field: “Search Wizpiko”, placeholder “Search…”. The current search routes contact/suggestion queries to Contact Us, privacy/safety to Privacy & Safety, help/support to Help Centre, crossword/quiz/MCQ/game to Games, and English/word/reading/spelling/grammar/listening/writing/lesson to English Academy. Other searches open a Coming soon page headed with [search query]. Mobile navigation labels are “Open navigation” and “Close navigation”.

Signed-out action: **Sign In**; while checking the account: **Checking…**. A signed-in learner sees their selected avatar and [name], falling back to “Learner”. The account dropdown shows [name], “Your learning space”, the six page names below, and **Sign Out**. My Learning Streak also shows its real positive streak count.

Starting a lesson, game, stage or account destination requires sign-in. The chosen destination is remembered so successful sign-in continues there. The fallback access screen says:

> Your learning space is waiting
>
> Sign in to open lessons, activities and your saved progress.

Actions: **Sign In · Back to Home**. Loading copy: “Getting your learning space ready…” and “Opening Sign In…”. Public information pages and Contact Us remain available without an account.

## Homepage

### Signed-out welcome

> Your world of curious minds
>
> Big dreams begin with little discoveries.
>
> Welcome to Wizpiko! A cheerful place to think, play and shine. Explore exciting subjects, build skills through fun practice and grow with every small achievement.

Action: **Explore Subjects** (scrolls to the subject cards).

### Signed-in welcome and learning dashboard

> Your next discovery starts here
>
> Welcome back, [name]!
>
> Make a little time for something wonderful. Pick up a lesson, try a challenge, and keep growing at your own pace.

Primary action: **Start learning**, or **Continue learning** when there is an unfinished last-opened lesson or completed learning. It opens the actual recommended lesson. The robot image alternative text is “Wizpiko, your cheerful robot learning companion”. A non-robot selected avatar also appears with “Your avatar”.

The streak action shows “[count] active-day streak” and one of:

- “A discovery made today!”
- “Paused — your next activity can keep it going”
- “A little practice keeps your spark going”
- “Complete an activity to start your spark”

Four clickable figures use saved learning: **Total XP · Lessons completed · Active-day streak · Milestones earned**. They open My Progress, My Learning Streak or My Achievements as appropriate. No sample learner totals are supplied.

| Dashboard area | Exact wording and dynamic content |
| --- | --- |
| Next lesson | “One little step today”; “Continue your learning” for an unfinished last-opened lesson, otherwise “Your next discovery”. Shows “[level] · [skill]”, [lesson title], [lesson description], and “5–8 min · Ready when you are” or “5–8 min · Best score [score]%”. Actions: “Start this lesson”, “Continue lesson”, or “Revisit this lesson”. |
| Progress | “Every discovery counts”; “Your learning journey”; “[count] / 24”; “English lessons completed”; “[count] original words discovered · [count] of 10 crosswords completed”. Action: “See my progress”. The ring represents completed catalog lessons, not estimated proficiency. |
| Recommendations | “Find your next spark”; “Real English lessons at your chosen starting point. Every level stays open to you.” Action: “Explore English”. Cards show “[skill] · [level]”, the actual lesson title/description, “5–8 min”, and “Completed” when applicable. |
| Games | “A little play, a lot to discover”; “Mix your lessons with an English game.” “Classic crosswords” / “10 original puzzles · [count] completed” opens the original crosswords. “English practice games” / “Choose a level, then try a crossword or quiz” opens Games, separately from Academy lessons. |
| Achievement preview | “Little wins worth celebrating”; “[count] milestones earned so far.” or “Your first badge is waiting for you.” Action: “View all”. Three real badges are shown, with earned badges first. Statuses: “Earned!” / “Keep exploring”. |
| Optional learning tip | “Curiosity has no age limit. Start with the basics or try something new — choose what feels right for you.” Hidden when Helpful learning tips is off. |

Recommendation behavior: prefer an unfinished last-opened lesson; otherwise select an incomplete lesson at the learner’s chosen level, favoring selected skills. Completed lessons are available to revisit. Unfinished lesson answers are not saved as a draft; returning reopens that lesson at Learn. The default homepage recommendation level is Beginner when no preference is saved. Full lesson copy is in the [English review](english-content-review.md).

### Shared homepage sections

Feature strip:

- **Fun Practice** — “Interactive games and activities”
- **Track Progress** — “See your growth and achievements”
- **Build Confidence** — “Learn at your own pace”

Subject heading: **Explore Our Subjects**. Introduction: “Discover new ways to learn, practise and grow.”

| Subject | Exact description | Status |
| --- | --- | --- |
| English Practice | Read, play, practise and build language skills. | Let's play! |
| Mathematics | Numbers, patterns and problem-solving adventures. | Coming soon |
| Physics | Explore motion, energy and the way things work. | Coming soon |
| Science | Discover the world through questions and curiosity. | Coming soon |
| Chemistry | Discover elements, reactions and experiments. | Coming soon |
| Informatics | Build logical thinking and coding confidence. | Coming soon |
| Artificial Intelligence | Explore creative ideas and future technology. | Coming soon |
| And More | More exciting subjects are on the way! | Coming soon |

A Coming soon page is headed “[subject]” and says: “Something wonderful is coming soon! For now, enjoy English Practice.” Actions: **Explore English Practice · Back home**. In the current navigation, a signed-out click requests sign-in before opening that destination.

## Learning stages

> For every curious mind
>
> Learning for every age
>
> From first discoveries to lifelong interests, find something you enjoy. Start wherever you feel comfortable.

| Stage | Exact description | Current Academy starting suggestion |
| --- | --- | --- |
| KG & Early Years | First discoveries through play | Starter |
| Primary | Build foundations with fun activities | Beginner |
| Middle School | Explore ideas and make connections | Intermediate |
| Secondary & Higher Secondary | Grow skills and take on new challenges | Intermediate |
| College & University | Discover new possibilities | Advanced |
| Adults & Lifelong Learners | Stay curious. Keep learning. | Starter |

Footer note: “New to a subject? You can start with the basics at any age.” Action: **Explore learning**. Stages suggest a freely changeable level; they impose no age restriction.

## Account pages: shared navigation and messages

Account sidebar and dropdown names: **My Profile · My Progress · My Achievements · My Learning Streak · Learning Preferences · Help & Support**.

Sidebar: **Back to Home**; [name]; [age label]; “Little steps. Big possibilities.”; “Your next discovery is waiting.”; **Keep learning**; **Sign Out**. The six page actions stay available in a compact grid on mobile. Every page starts with “Your learning space”.

Age labels are “Little explorer” (up to 5), “Young explorer” (6–8), “Junior learner” (9–12), “Trailblazer” (13–15), “Senior learner” (16+), or “Learning explorer” without a usable birth date. These labels do not restrict lessons.

Save feedback: **Saving…**; “Your changes are saved.” A failed save displays the returned account error, with fallback “Unable to save changes. Please try again.” Name/avatar and preference changes are saved through the signed-in profile action.

### My Profile

Introduction: “A little about you and the way you like to learn.”

Banner: “Hello, curious mind!”; [name]; “[age label] · [level]”. The fallback level label is Beginner.

**About you**

“Your display name appears in your learning space.” Fields: **Display name · Account email · Date of birth**. Email and birth date are read-only. A missing birth date reads “Not provided”; the correction note says “Contact support if this needs a correction.” Name length is 2–40 characters. Action: **Save profile**.

**Choose your companion**

“Pick the avatar that feels like you. You can change it anytime.” Choices: **girl · boy · robot · panda · cat**; accessible action: “Choose [avatar] avatar”. Selecting an avatar saves it. Note: “Your companion stays with you across your learning pages.”

### My Progress

Introduction: “Every lesson and every small discovery adds up.” Figures: **Total XP · Lessons completed · Practice games completed · Active-day streak**. Game counts include completed original crosswords as well as saved English game levels; lesson and game XP are summed without counting activity-log XP a second time.

**Your English skills**

“Scores come from lessons you have completed.” The six skill rows use the names listed under Preferences. Each says “[score]% average” or “Ready to explore”. Averages use saved completed lesson scores for that skill. Action: **Explore English**.

**Classic crossword discoveries**

“Your original ten puzzles, always ready to play.” Figures: “[count] / [total] words”; “[count] of 10 crosswords completed”. Action: **Continue practice** (opens the original crosswords).

**Recent learning**

Shows actual activity titles, [date], optional “[correct]/[total] correct”, and “Completed”. Classic activity shows “[count] words discovered”; it does not invent an accuracy percentage. If only older lesson results exist, rows show [lesson title], “[date] · [score]%” and **Revisit**. The empty state is:

> Your story starts here
>
> Finish a lesson or a practice game and see your real progress grow.

Action: **Start learning**.

### My Achievements

Introduction: “Celebrate the milestones you have really earned.”

Banner: “Every little win matters”; “[count] milestones to be proud of” or “Your first milestone is waiting”; “Earn badges through completed learning. Once earned, they stay yours.”

These are the actual badge names and descriptions in `learningMetrics.ts`:

| Badge | Exact description |
| --- | --- |
| First word | Discover your first word in an original crossword. |
| Crossword explorer | Complete your first original crossword. |
| Word champion | Complete all ten original crosswords. |
| First discovery | Complete your first learning activity. |
| Lesson explorer | Finish your first English lesson. |
| Building momentum | Complete three different English lessons. |
| Game explorer | Complete your first English game. |
| Level explorer | Unlock a new English challenge level. |
| 3-day spark | Complete activities on three days in one learning streak. |
| 7-day glow | Build a learning streak with seven active days. |
| Steady explorer | Build a learning streak with fourteen active days. |
| Learning champion | Build a learning streak with thirty active days. |
| 100 XP | Earn 100 XP from completed lessons and games. |
| 500 XP | Earn 500 XP from completed lessons and games. |
| 1,000 XP | Earn 1,000 XP from completed lessons and games. |

Status: “Earned”, optionally “Earned · [date]”, or “Keep exploring”. Locked badges display a lock. Original-word/crossword badges remain derived from actual classic progress; recorded badge awards and best streaks remain available after the current streak ends.

### My Learning Streak

Introduction: “A little practice, a growing habit. Keep your spark alive.” Banner: “Your learning rhythm”; “[count] active-day streak”. Conditional message:

- Completed today: “You made time for a discovery today. Well done!”
- Paused with grace remaining: “Your streak is paused. Complete an activity to continue it within [count] day.” / “… within [count] days.”
- Final grace day: “Your streak is paused. Complete an activity to continue it today.”
- Active, not completed today: “A little learning today keeps your spark going.”
- No current streak: “Complete an activity to start a fresh learning streak.”

Action: **Discover something else** after today’s completion, otherwise **Keep my spark going**. Figures: **Current streak · Best streak · Active learning days**.

Calendar: [month year], “Sun · Mon · Tue · Wed · Thu · Fri · Sat”; controls “Previous month” / “Next month” (future months disabled); legend “A learning activity was completed”. Accessible dates identify “activity completed” and “today” where appropriate.

**A habit with room to breathe**

“Only days with completed activities count. Opening Wizpiko or starting an unfinished lesson does not add a day.”

**Two missed days of breathing room**

“Your next completed activity can bridge up to two fully missed calendar days. Missed days never add to your streak.”

**Your streak milestones**: “3 active days”, “7 active days”, “14 active days”, “30 active days”, each with “Earned” or “One step at a time”. Note: “Your best streak and earned badges remain when a new streak starts.”

Behavior: one completed calendar day contributes one active day. Gaps of up to two fully missed calendar days can be bridged; the third fully missed day ends the current streak. Opening a page alone does not count. XP and recorded badges are retained.

### Learning Preferences

Introduction: “Choose a starting point and make learning feel like you.”

**Your learning starting point**

“Choose by confidence and interests. Every level is open at every age.”

| Level | Exact helper text |
| --- | --- |
| Starter | First words and sounds |
| Beginner | Build a steady foundation |
| Intermediate | Connect and explore ideas |
| Advanced | Stretch your English skills |

**What would you like to explore?**

“Pick your favorite skills to shape your recommendations.” Selectable skills: **Letters & sounds · Words & spelling · Grammar & sentences · Reading & understanding · Listening & speaking · Writing & real life**.

**Make yourself comfortable**

| Preference | Exact description | Default / current effect |
| --- | --- | --- |
| Learning sounds | Play optional sounds during practice. | Off; controls classic practice chimes. Explicit Listen actions in Academy remain learner-operated. |
| Playful animations | Add a little movement to your learning space. | On; turning off applies the site’s reduced-motion mode. |
| Helpful learning tips | Show gentle hints and useful practice tips. | On; controls the homepage learning tip. |
| Reduce motion | Keep movement and transitions to a minimum. | Off; turning on applies reduced-motion mode. |

Footer: “Your preferences are saved to your account.” Action: **Save preferences**. Level defaults to Beginner in this form. Saved level/skills shape homepage recommendations; all levels remain open. Changes take effect after saving. No reminder schedule or guardian controls are presented.

### Help & Support

Introduction: “Find a helpful answer and get back to your next discovery.”

> A little help along the way
>
> What can we help you discover?
>
> Search the answers below for learning, your account, and saved progress.

Search placeholder: “Search help topics…”; accessible name: “Search help topics”. Heading: **Helpful answers**. The expandable answers come from the same shared FAQ as the [Help Centre review](content-review.md#help-centre); this page searches question and answer text. Contact links inside answers open Contact Us.

No-match state: **No matching answers yet**; “Try words such as “progress”, “password”, or “streak”.”

Contact card: **Still need a hand?**; “Send the Wizpiko team a question about your learning or account.” Action: **Contact us**, opening the actual Contact Us page.

## Sign out

Dialog accessible title: “Sign out?”

> See you soon! 🌟
>
> Your saved progress will be waiting when you sign in again.

Actions: **Keep learning** (dismisses) and **Sign Out** (signs out and returns Home). The dialog can also be closed. This is a confirmation of sign-out, not publication approval.

## Footer

Brand alternative text: “Wizpiko — Think. Play. Shine.” Description: “A cheerful place to explore, practise and grow with curiosity.”

| Group | Exact links |
| --- | --- |
| Platform | Home · Subjects · My Progress (signed in only) |
| Support | Help Centre · Privacy & Safety · Account Guide · Contact Us |
| Company | About Us · Our Mission |
| Follow Us | Facebook icon; accessible name “Wizpiko on Facebook” |

Facebook opens https://www.facebook.com/wizpiko2026 in a new tab. Copyright: “© [year] Wizpiko.” Information and contact links open the actual public pages; there is no Instagram link.
