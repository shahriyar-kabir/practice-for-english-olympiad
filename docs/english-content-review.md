# English Academy curriculum and copy review

Status: local review draft. This curriculum and interface copy require owner review before publication. Nothing in this document records publication approval.

Scope: 24 short English lessons, four freely selectable levels, six skills per level and 120 controlled practice tasks. Level choice is based on confidence and experience, never age. Adult beginners are explicitly welcome. There is no mandatory lesson timer. Estimated lesson length is 5–8 minutes; learners can take longer.

This document reproduces the exact teaching, model examples, passages/transcripts, speaking directions, questions, displayed choices, accepted answers, explanations, supporting evidence and recaps from the local lesson source. Correct answers are visible here for editorial review; learners see them after checking their own answer. Review the teaching for accuracy, inclusion, progression, clarity and suitability before release.

## Reviewer decisions still required

- Approve or edit the 24 lessons and 120 answer keys below.
- Approve the level names and skill names, including the welcome for adult beginners.
- Approve the exact interface copy and learner flow below.
- Confirm the controlled-writing scope and optional, ungraded speaking practice are clear.
- Confirm British English examples, 24-hour notice times, and normal accent variation fit the intended audience.
- Approve publication separately after reviewing the integrated local preview. Local implementation and passing tests are not publication approval.

## Levels and skills

| Level | Learner description |
| --- | --- |
| Starter | Letters, useful words and your first sentences. A fresh start at any age. |
| Beginner | Build everyday language for messages, stories and conversations. |
| Intermediate | Connect ideas, understand details and express your reasons. |
| Advanced | Read critically and communicate with clarity, precision and purpose. |

- Letters & sounds (`sounds`)
- Words & spelling (`vocabulary`)
- Grammar & sentences (`grammar`)
- Reading & understanding (`reading`)
- Listening & speaking (`listening`)
- Writing & real life (`writing`)

Every level has one substantive introduction for each skill. These 24 lessons establish an initial curriculum; completing a level does not certify proficiency, a CEFR level or mastery.

## Learner interface copy and flow

Navigation: “All subjects”, “English Academy”, “English lessons”.

Landing hero: “A little learning, every day”; “Your English. Your starting point.”; “Build confidence through short lessons, clear examples and practice that makes sense. Start fresh or stretch your skills.”; “Every level is open to everyone. Adult beginners are welcome.”

Progress panel: completed count out of “24 lessons”; “One small step adds up.”; remaining count followed by “lessons to explore at your own pace”. The count comes from saved completed lessons, not pages opened.

Continue card: “Your first small step” before a completion, otherwise “Continue learning”. The title and level/skill labels come from the catalog. It prefers an unfinished last-opened lesson, otherwise the first incomplete lesson at the selected level. There is no persisted answer draft; an unfinished lesson reopens at Learn. The action reads “Start learning”, “Continue learning”, or “Review lesson” when all lessons at that level are completed.

Level chooser: “Find your starting point”; “Choose by confidence and experience. Change level whenever you like.”; “Selected” / “Choose level”. Skills heading: “[Level] skills”; “Six ways to grow. Every lesson includes teaching, five practice tasks and a review.” Cards show the exact lesson titles and descriptions below, “5–8 min · No timer”, and “Best [score]%” after completion.

Games panel: “A little play, too?”; “Explore practice games or revisit the original 10 crosswords.”; “Practice games”; “Original 10 crosswords”. These callbacks preserve access to the existing games.

The lesson steps are “Learn” → “Practice” → “Review” → “Complete”. Lesson heading: “[Level] · [Skill]”, the exact catalog title, and “About 5–8 min · Take as long as you need”.

Learn screen: “Start with the idea”; the exact objective and teaching below; two model examples; optional passage/transcript and optional speaking directions. Footer: “Five short tasks. You can return to these notes.” Button: “Let’s practise”.

Reading panel: “Read the passage”. Listening panel: “Listen or read the transcript”; “Browser-generated speech. Replay if helpful, or read the same words below.” Explicit buttons: “Listen” / “Stop audio”. Audio never autoplays. If synthesis is unavailable: “Audio is unavailable in this browser. Read the transcript, or read it aloud at your own pace.” Playback failure: “Audio could not play. You can read the complete transcript below.” The full transcript remains visible in Learn and Practice.

Speaking panel: “Try it aloud”; the exact lesson directions; “Optional self-practice. Your voice is not recorded or graded.” No microphone access, recording or pronunciation scoring is implemented.

Practice screen: “Practice [number] of 5”; “No timer”; one exact prompt below. Choices are shown with radio controls. Fill tasks show “Your answer” and “Type your answer”. Ordinary fills: “Take your time. Extra spaces and letter case do not affect the answer.” Capitalization task: “Use the correct capital letter. Letter case is checked.” Ordering tasks: “Choose each tile in order. Select a tile in your answer to remove it.”; “Your sentence or word will appear here”; “Clear answer”. Tile selections support repeated tokens by position.

Action: “Check answer”. A checked response is locked for that attempt. Feedback reads “You’ve got it” for a correct response or “A useful one to review” for an incorrect response, then shows the accepted answer where needed and the exact explanation below. Supporting passages use “From the text: …”. Buttons: “Next question”, then “Review my practice”. Optional notes: “Look back at the lesson notes”.

Review screen: “Make it stick”; “Your practice, explained”; “You answered [correct] of 5 correctly. Take a moment to review, then complete the lesson to save your result.” Each prompt is shown with “Correct” / “Review”, “Your answer: …”, the keyed answer where needed, explanation and supporting evidence. “Keep this with you” introduces the exact recap. Footer: “Best scores stay saved. Repeating a score earns no extra XP.” Action: “Complete lesson”. Results and activity are saved only on this action.

Completion screen: “Another step forward”; “Lesson complete!”; “You’ve practised [skill]. Keep going at your own pace.” Metrics: “This practice”, “Best score”, “+[delta] XP”, “Progress earned” / “Best result kept”. When XP grows: “Lesson XP grows only when your best score improves, up to 50 XP per lesson.” When it does not: “You keep your best score and XP. Improve your score to earn the remaining lesson XP.” The exact recap appears under “Your next real-life step”. Actions: “Next lesson”, “Explore lessons”, “Practise again”, “Try practice games”, “Original 10 crosswords”. Next lesson chooses another incomplete skill in the same level; all levels remain freely selectable.

Lesson loading: “Opening your lesson…”; “Getting your examples and practice ready.” Failure: “Let’s try that again”; “We could not open this lesson. Try again, or choose another lesson.”; “Try again”; “Choose a lesson”. Completion failure: “Your lesson could not be completed. Please try again.”

## Scoring and saved progress

- Five tasks per lesson, one point for each correct checked answer. Percentage = rounded correct ÷ total × 100.
- All five tasks need nonblank responses before completion. An incorrect response remains an attempted response. A completed lesson can have zero correct answers; the review explains what to practise.
- First completed attempt awards 10 completion XP plus 8 XP for each correct answer: 10, 18, 26, 34, 42 or 50 XP.
- Save the best percentage and its corresponding correct/total result. Lesson XP is capped at 50. Later attempts award only the positive difference between earned XP and saved lesson XP. Equal or lower scores award zero XP; repeating the same answers cannot farm XP.
- A later, real completed review can record an activity day while awarding zero XP. Double submission of the same completion ID is deduplicated. The activity event is recorded only after merging the saved lesson result, allowing true lesson badges and streaks.
- Ordinary fill responses tolerate letter case, repeated spaces and straight/curly apostrophe differences. The Starter name-copy task explicitly checks capitals. Choices match exact displayed options; ordered sentences retain punctuation and capitals. All listed fill variants below are accepted.
- Progress is passed through the existing JourneyProgress/onJourney contract and does not invent an account or save an in-progress answer draft. Classic game records remain intact.

## Sample learner walkthrough: Starter reading

1. From English Academy, select Starter and Reading & understanding, then “A bag for the day”. No age check or prerequisite applies.
2. Learn presents the objective “Find who, what and where in a short everyday story.”, two teaching paragraphs, two examples and the full Mina passage reproduced below.
3. Select “Let’s practise”. Answer the five tasks in sequence. Example: select “Mina” for question 1 and select “Check answer”; feedback says “You’ve got it”, explains the first sentence and quotes “Mina has a red bag.” The passage stays available to check.
4. Answer red, A book and a pen, By a tree, and Mina walks home. Each response receives its own explanation. Select “Review my practice” after question 5.
5. Review shows all five prompts, the responses, correct labels, explanations and quoted evidence, plus the exact recap. Select “Complete lesson”.
6. On a first perfect attempt, completion shows 5/5 this practice, best score 100%, +50 XP, and the real-life recap. A retry with the same answers shows +0 XP and keeps the best result. The learner can move to another skill, choose any level, or open the existing practice games.

## Exact curriculum copy and answer keys

## Starter

Letters, useful words and your first sentences. A fresh start at any age.

### Meet the first sounds

Lesson ID: `starter-sounds` · Letters & sounds · 5–8 min

Card description: Connect familiar letters with the beginnings of words.

**Objective**

Match m, s, b and c to familiar words, then blend a short word.

**Teaching copy**

A letter has a name and can represent a sound. The letter m begins moon. The letter s begins sun. Say the words slowly and notice the first sound.

Blend sounds to read a short word: c–a–t makes cat. In cat, c has the /k/ sound. Some letters have other sounds in other words; we are learning these examples first.

**Model examples**

- m + oon → moon begins with m.
- c – a – t → Blend the sounds: cat.

**Five practice tasks and feedback**

#### 1. Which letter begins moon?

Task ID: `st-s-1` · choice

Displayed choices:

- A. s
- B. m
- C. b

Correct answer: **m**

Feedback: Moon begins with the /m/ sound, written m.

#### 2. Match the letter s to a word that begins with it.

Task ID: `st-s-2` · choice

Displayed choices:

- A. bag
- B. cat
- C. sun

Correct answer: **sun**

Feedback: Sun begins with s. Bag begins with b, and cat begins with c.

#### 3. Write the missing first letter: _ag. The word is bag.

Task ID: `st-s-3` · fill

Accepted answer: `b`

Letter case: ignored.

Feedback: Bag is spelled b–a–g, so the missing letter is b.

#### 4. Blend c–a–t. Which word do you make?

Task ID: `st-s-4` · choice

Displayed choices:

- A. cap
- B. cat
- C. bag

Correct answer: **cat**

Feedback: The three letters c, a and t make cat.

#### 5. Put these letters in order to spell sun.

Task ID: `st-s-5` · order

Displayed tiles (initial order): `n`, `s`, `u`

Correct order: **s u n**

Feedback: Sun is spelled s–u–n. Try saying the word as you point to each letter.

**Recap / real-life next step**

You matched beginning sounds and built cat and sun. Look for m, s, b and c in words around you.

### Words around us

Lesson ID: `starter-vocabulary` · Words & spelling · 5–8 min

Card description: Name everyday things and build simple words.

**Objective**

Recognise useful everyday words and spell a short word.

**Teaching copy**

Words name things and actions. A book is something you read. A cup can hold a drink. A door lets you enter or leave a room.

An action word tells what someone does. Read and sit are actions. Say a new word, picture its meaning, and use it in a short sentence.

**Model examples**

- book → I read a book.
- cup → My cup holds water.

**Five practice tasks and feedback**

#### 1. Which thing do you read?

Task ID: `st-v-1` · choice

Displayed choices:

- A. A cup
- B. A book
- C. A door

Correct answer: **A book**

Feedback: A book contains words or pictures to read.

#### 2. Match cup to its use.

Task ID: `st-v-2` · choice

Displayed choices:

- A. Holding a drink
- B. Opening a room
- C. Wearing on a foot

Correct answer: **Holding a drink**

Feedback: A cup is a container for a drink.

#### 3. Complete the word for something you open to enter a room: d_ _r.

Task ID: `st-v-3` · fill

Accepted answers: `oo`, `door`

Letter case: ignored.

Feedback: Door is spelled d–o–o–r. The two missing letters are oo.

#### 4. Which word is an action?

Task ID: `st-v-4` · choice

Displayed choices:

- A. table
- B. bag
- C. sit

Correct answer: **sit**

Feedback: Sit tells what a person does. Table and bag name things.

#### 5. Put these letters in order to spell pen.

Task ID: `st-v-5` · order

Displayed tiles (initial order): `e`, `n`, `p`

Correct order: **p e n**

Feedback: Pen is spelled p–e–n. You can use a pen to write.

**Recap / real-life next step**

You learned book, cup, door, sit and pen. Try naming three everyday things you can see.

### Build a first sentence

Lesson ID: `starter-grammar` · Grammar & sentences · 5–8 min

Card description: Use I, you, is and are in complete sentences.

**Objective**

Make a complete sentence with a person or thing and a matching verb.

**Teaching copy**

A sentence expresses a complete idea. Begin with a capital letter and finish a statement with a full stop. “I am ready.” is a sentence.

Use am with I, are with you, and is with one person or thing: I am here. You are kind. The bag is blue.

**Model examples**

- I + am + ready → I am ready.
- The bag + is + blue → The bag is blue.

**Five practice tasks and feedback**

#### 1. Choose the word: I ___ happy.

Task ID: `st-g-1` · choice

Displayed choices:

- A. is
- B. am
- C. are

Correct answer: **am**

Feedback: Use am with I: I am happy.

#### 2. Complete the sentence: You ___ kind.

Task ID: `st-g-2` · fill

Accepted answer: `are`

Letter case: ignored.

Feedback: Use are with you: You are kind.

#### 3. Choose the complete sentence.

Task ID: `st-g-3` · choice

Displayed choices:

- A. The bag.
- B. Is blue.
- C. The bag is blue.

Correct answer: **The bag is blue.**

Feedback: This tells us what the bag is like. The other choices leave the idea unfinished.

#### 4. Build a sentence.

Task ID: `st-g-4` · order

Displayed tiles (initial order): `ready.`, `am`, `I`

Correct order: **I am ready.**

Feedback: The usual order is the person, the verb, then the rest: I am ready.

#### 5. Which sentence uses a capital letter and a full stop?

Task ID: `st-g-5` · choice

Displayed choices:

- A. i am here
- B. I am here.
- C. I am here

Correct answer: **I am here.**

Feedback: Start with a capital I and end the statement with a full stop.

**Recap / real-life next step**

I am, you are, and one thing is. A capital letter and a full stop help readers see a complete sentence.

### A bag for the day

Lesson ID: `starter-reading` · Reading & understanding · 5–8 min

Card description: Find people, things and actions in a short story.

**Objective**

Find who, what and where in a short everyday story.

**Teaching copy**

Read a short text once for the main idea. Read it again to find a name, an object or a place. You can return to the text as often as you need.

A detail is a small piece of information in the text. Choose what the text says, even if another answer could happen in a different story.

**Model examples**

- Mina has a red bag. → Who? Mina. What colour? Red.
- She sits by the door. → Where? By the door.

**Reading passage**

Mina has a red bag. She puts a book and a pen in it. Mina walks to the park. She sits by a tree and reads her book. Then she walks home.

**Five practice tasks and feedback**

#### 1. Who has the bag?

Task ID: `st-r-1` · choice

Displayed choices:

- A. Mina
- B. Sam
- C. Ali

Correct answer: **Mina**

Feedback: The first sentence names Mina as the person with the bag.

Exact supporting words: “Mina has a red bag.”

#### 2. What colour is the bag? Write one word.

Task ID: `st-r-2` · fill

Accepted answer: `red`

Letter case: ignored.

Feedback: The text says Mina has a red bag.

Exact supporting words: “red bag”

#### 3. What does Mina put in the bag?

Task ID: `st-r-3` · choice

Displayed choices:

- A. A cup and a hat
- B. A book and a pen
- C. A toy and a ball

Correct answer: **A book and a pen**

Feedback: The second sentence names both objects.

Exact supporting words: “a book and a pen”

#### 4. Where does Mina read?

Task ID: `st-r-4` · choice

Displayed choices:

- A. By a tree
- B. In a shop
- C. On a bus

Correct answer: **By a tree**

Feedback: Mina sits by a tree and reads her book.

Exact supporting words: “She sits by a tree and reads her book.”

#### 5. What happens last?

Task ID: `st-r-5` · choice

Displayed choices:

- A. Mina puts a book in her bag.
- B. Mina walks to the park.
- C. Mina walks home.

Correct answer: **Mina walks home.**

Feedback: Then introduces the final action: she walks home.

Exact supporting words: “Then she walks home.”

**Recap / real-life next step**

You found the person, colour, objects, place and final action by checking the text.

### Hello and thank you

Lesson ID: `starter-listening` · Listening & speaking · 5–8 min

Card description: Practise a greeting and understand a simple request.

**Objective**

Understand a greeting, a name and a polite request; practise speaking them.

**Teaching copy**

Listen for a few useful words rather than trying to remember everything. Hello begins a conversation. Please makes a request polite. Thank you shows appreciation.

Use Listen if your browser supports speech, or read the transcript. Listening answers are checked against the same words. Speaking practice is for you to try; this lesson does not record or grade your voice.

**Model examples**

- A greeting → Hello! My name is Leo.
- A polite request → Please pass the book. Thank you.

**Listening transcript (same text used for browser speech)**

Hello! My name is Leo. Please pass the blue book. Thank you. Let us read together.

**Optional speaking practice**

Read aloud: “Hello! My name is … . Please pass the book. Thank you.” Use your own name. Take your time and repeat if you wish.

**Five practice tasks and feedback**

#### 1. Which word begins the greeting?

Task ID: `st-l-1` · choice

Displayed choices:

- A. Goodbye
- B. Sorry
- C. Hello

Correct answer: **Hello**

Feedback: The speaker begins with Hello.

Exact supporting words: “Hello!”

#### 2. What is the speaker’s name?

Task ID: `st-l-2` · fill

Accepted answer: `Leo`

Letter case: ignored.

Feedback: The speaker says, “My name is Leo.”

Exact supporting words: “My name is Leo.”

#### 3. Which book does the speaker ask for?

Task ID: `st-l-3` · choice

Displayed choices:

- A. The red book
- B. The blue book
- C. The green book

Correct answer: **The blue book**

Feedback: Listen or read for the colour blue.

Exact supporting words: “the blue book”

#### 4. Which word makes the request polite?

Task ID: `st-l-4` · choice

Displayed choices:

- A. book
- B. blue
- C. Please

Correct answer: **Please**

Feedback: Please makes “pass the blue book” a polite request.

Exact supporting words: “Please pass the blue book.”

#### 5. Build the final suggestion.

Task ID: `st-l-5` · order

Displayed tiles (initial order): `together.`, `read`, `Let`, `us`

Correct order: **Let us read together.**

Feedback: The speaker suggests reading together.

Exact supporting words: “Let us read together.”

**Recap / real-life next step**

You picked out a name and a request. Try a greeting, please and thank you in a real conversation.

### A friendly first message

Lesson ID: `starter-writing` · Writing & real life · 5–8 min

Card description: Write a name, a greeting and a clear short message.

**Objective**

Build a friendly short message with a name and clear punctuation.

**Teaching copy**

A short message can start with Hello and a name. Say why you are writing in a simple sentence. Finish with your own name so the reader knows who wrote it.

Use a capital letter for a person’s name and for I. Put a full stop at the end of a statement. These controlled tasks check specific words; your own extra writing is self-practice.

**Model examples**

- A friendly opening → Hello, Noor!
- A short message → I have your book. From, Alex.

**Five practice tasks and feedback**

#### 1. Which opening uses the name correctly?

Task ID: `st-w-1` · choice

Displayed choices:

- A. hello, noor
- B. Hello, Noor!
- C. hello Noor

Correct answer: **Hello, Noor!**

Feedback: Hello begins with a capital letter, and Noor is a name so it also begins with a capital.

#### 2. Copy this name with a capital letter: alex

Task ID: `st-w-2` · fill

Accepted answer: `Alex`

Letter case: checked exactly.

Feedback: Names begin with a capital letter: Alex. Letter case is checked in this task.

#### 3. Build a clear message.

Task ID: `st-w-3` · order

Displayed tiles (initial order): `book.`, `your`, `have`, `I`

Correct order: **I have your book.**

Feedback: I have your book. tells the reader one complete idea.

#### 4. Which mark ends this statement: I am here_

Task ID: `st-w-4` · choice

Displayed choices:

- A. ?
- B. .
- C. ,

Correct answer: **.**

Feedback: A full stop ends this statement.

#### 5. Finish the friendly closing: Thank ___!

Task ID: `st-w-5` · fill

Accepted answer: `you`

Letter case: ignored.

Feedback: Thank you! is a friendly way to show appreciation.

**Recap / real-life next step**

Self-practice: write “Hello” to someone, add one useful sentence and sign your name. Compare your capitals and full stops with the examples; no automatic free-writing grade is given.

## Beginner

Build everyday language for messages, stories and conversations.

### Two letters, one sound

Lesson ID: `beginner-sounds` · Letters & sounds · 5–8 min

Card description: Explore sh, ch and th, and read useful word pairs.

**Objective**

Recognise sh, ch and th in words and compare short vowel spellings.

**Teaching copy**

Sometimes two letters work together to represent one sound. Sh begins ship, ch begins chip, and th begins thin. These pairs are called digraphs. Th has a different sound in this; both uses are normal.

Changing a vowel can change a word: ship and shop differ in their middle letter and vowel sound. Say each example slowly. Accents vary; use the printed word as a spelling clue.

**Model examples**

- sh + ip → ship: sh works together.
- chip → chop → Changing i to o changes the word.

**Five practice tasks and feedback**

#### 1. Which word begins with sh?

Task ID: `be-s-1` · choice

Displayed choices:

- A. chip
- B. ship
- C. thin

Correct answer: **ship**

Feedback: The first two letters of ship are sh.

#### 2. Write the two missing letters: _ _ip. The word is chip.

Task ID: `be-s-2` · fill

Accepted answer: `ch`

Letter case: ignored.

Feedback: Chip starts with the letter pair ch.

#### 3. Match thin to its beginning letter pair.

Task ID: `be-s-3` · choice

Displayed choices:

- A. sh
- B. ch
- C. th

Correct answer: **th**

Feedback: Thin begins with th.

#### 4. Change the middle letter of ship from i to o. Which word do you make?

Task ID: `be-s-4` · choice

Displayed choices:

- A. shop
- B. stop
- C. shape

Correct answer: **shop**

Feedback: Sh + o + p spells shop.

#### 5. Build the word fish using these letter groups.

Task ID: `be-s-5` · order

Displayed tiles (initial order): `sh`, `f`, `i`

Correct order: **f i sh**

Feedback: Fish is f + i + sh. The sh sound comes at the end this time.

**Recap / real-life next step**

Look for sh, ch and th at the beginnings and ends of words. Letter pairs help you read in useful chunks.

### Choose the useful word

Lesson ID: `beginner-vocabulary` · Words & spelling · 5–8 min

Card description: Use words for places, routines and everyday plans.

**Objective**

Choose everyday words for places, routines and plans.

**Teaching copy**

Context helps you choose a word. You borrow a book from a library, buy food at a market, and wait for a bus at a bus stop.

Some useful word pairs belong together: make a plan, catch a bus, and brush your teeth. Learn the whole phrase as well as the meaning of each word.

**Model examples**

- A place to borrow books → a library
- A useful phrase → We make a plan.

**Five practice tasks and feedback**

#### 1. Where would you usually borrow a book?

Task ID: `be-v-1` · choice

Displayed choices:

- A. A library
- B. A bus stop
- C. A bakery

Correct answer: **A library**

Feedback: Libraries lend books for people to read and return.

#### 2. Complete the phrase: ___ your teeth. Use brush, catch or make.

Task ID: `be-v-2` · fill

Accepted answer: `brush`

Letter case: ignored.

Feedback: Brush your teeth is the usual phrase for cleaning them with a toothbrush.

#### 3. We need bread and fruit. Which place fits this plan?

Task ID: `be-v-3` · choice

Displayed choices:

- A. A swimming pool
- B. A food market
- C. A station platform

Correct answer: **A food market**

Feedback: A food market is a place to buy bread, fruit and other food.

#### 4. Complete the phrase: Let us ___ a plan. Use do or make.

Task ID: `be-v-4` · fill

Accepted answer: `make`

Letter case: ignored.

Feedback: The natural phrase is make a plan.

#### 5. Put the words in order.

Task ID: `be-v-5` · order

Displayed tiles (initial order): `bus.`, `catch`, `the`, `We`

Correct order: **We catch the bus.**

Feedback: Catch the bus means get on the bus for a journey.

**Recap / real-life next step**

Learn words with a useful phrase: borrow a book, brush your teeth, make a plan and catch the bus.

### Today and yesterday

Lesson ID: `beginner-grammar` · Grammar & sentences · 5–8 min

Card description: Choose verbs that show when something happens.

**Objective**

Use time clues to choose present simple and past simple verbs.

**Teaching copy**

Use the present simple for a routine: I walk every day. With he, she or one name, many verbs add s: Noor walks every day.

Use the past simple for a finished time: Yesterday I walked. Many past verbs add ed, but some change: go becomes went. Time clues such as every day and yesterday help you choose.

**Model examples**

- Every day → She walks to the park.
- Yesterday → She went to the park.

**Five practice tasks and feedback**

#### 1. Choose the routine: Every morning, Sam ___ breakfast.

Task ID: `be-g-1` · choice

Displayed choices:

- A. eat
- B. eats
- C. ate

Correct answer: **eats**

Feedback: Sam is one person. In this present simple routine, eat becomes eats.

#### 2. Yesterday I ___ to the park. Use the past form of go.

Task ID: `be-g-2` · fill

Accepted answer: `went`

Letter case: ignored.

Feedback: Go has the irregular past form went.

#### 3. Which time phrase clearly signals a finished past time?

Task ID: `be-g-3` · choice

Displayed choices:

- A. Every day
- B. Usually
- C. Last night

Correct answer: **Last night**

Feedback: Last night names a time that has already finished.

#### 4. Complete with the past form of play: We ___ a game yesterday.

Task ID: `be-g-4` · fill

Accepted answer: `played`

Letter case: ignored.

Feedback: Play is regular: add ed to make played.

#### 5. Build a sentence about a daily routine.

Task ID: `be-g-5` · order

Displayed tiles (initial order): `every`, `I`, `day.`, `read`

Correct order: **I read every day.**

Feedback: I read every day. describes a routine. The phrase every day comes together.

**Recap / real-life next step**

Check the time clue, then match the verb: routines use the present simple; finished past events use the past simple.

### A notice at the library

Lesson ID: `beginner-reading` · Reading & understanding · 5–8 min

Card description: Read opening times, instructions and a small change.

**Objective**

Read a notice for times, instructions and a changed arrangement.

**Teaching copy**

Notices help people act. Look for the heading, then find practical details such as the day, time, place and things you need.

Words such as instead show a change. Check the whole notice before deciding what to do. All the answers in this lesson come from the notice.

**Model examples**

- Opens at 10:00 → Arrive at or after 10:00.
- Room B instead of Room A → The new place is Room B.

**Reading passage**

Riverside Library notice: On Saturday, the library opens at 10:00 instead of 9:00 because staff are moving shelves. The free reading group begins at 11:00 in Room B. Bring your library card. You do not need to book a place. The library closes at 16:00.

**Five practice tasks and feedback**

#### 1. What time does the library open on Saturday?

Task ID: `be-r-1` · choice

Displayed choices:

- A. 9:00
- B. 10:00
- C. 11:00

Correct answer: **10:00**

Feedback: The new opening time is 10:00; 9:00 is the time it replaces.

Exact supporting words: “opens at 10:00 instead of 9:00”

#### 2. Why is the opening time different?

Task ID: `be-r-2` · choice

Displayed choices:

- A. Staff are moving shelves.
- B. The reading group is cancelled.
- C. The building is closed all day.

Correct answer: **Staff are moving shelves.**

Feedback: The notice gives moving shelves as the reason.

Exact supporting words: “because staff are moving shelves”

#### 3. Which room will the reading group use? Write the letter.

Task ID: `be-r-3` · fill

Accepted answers: `B`, `Room B`

Letter case: ignored.

Feedback: The reading group begins in Room B.

Exact supporting words: “in Room B”

#### 4. What must you bring?

Task ID: `be-r-4` · choice

Displayed choices:

- A. A booking letter
- B. Your library card
- C. A new shelf

Correct answer: **Your library card**

Feedback: The instruction is to bring your library card.

Exact supporting words: “Bring your library card.”

#### 5. Which statement is correct?

Task ID: `be-r-5` · choice

Displayed choices:

- A. You must book before Saturday.
- B. The group costs money.
- C. You can join without booking.

Correct answer: **You can join without booking.**

Feedback: The notice says no booking is needed, and the group is free.

Exact supporting words: “You do not need to book a place.”

**Recap / real-life next step**

You found the changed time, the reason, the room and what to bring. Reading the full notice prevents a mistaken plan.

### Making a simple plan

Lesson ID: `beginner-listening` · Listening & speaking · 5–8 min

Card description: Listen for the time, place and things to bring.

**Objective**

Find the time, meeting place and items to bring in a short invitation.

**Teaching copy**

Before listening, decide what you need to know: when, where and what to bring. You can replay the message and use the transcript at any time.

To check a plan, repeat the important detail as a question: “At ten, by the main gate?” Speaking practice here is optional and is not recorded or automatically assessed.

**Model examples**

- A plan → Meet at ten by the main gate.
- Checking a detail → By the main gate, right?

**Listening transcript (same text used for browser speech)**

Hi, it is Amira. Let us meet at the park on Sunday at ten in the morning. Wait by the main gate, not the café. Bring water and a hat. If it rains, I will call you before nine.

**Optional speaking practice**

Say a reply aloud: “Sunday at ten, by the main gate. I will bring water and a hat.” Then practise asking “What will we do if it rains?”

**Five practice tasks and feedback**

#### 1. Which day is the meeting?

Task ID: `be-l-1` · choice

Displayed choices:

- A. Saturday
- B. Monday
- C. Sunday

Correct answer: **Sunday**

Feedback: Amira says to meet on Sunday.

Exact supporting words: “on Sunday”

#### 2. What time in the morning will they meet? Write a number or the word.

Task ID: `be-l-2` · fill

Accepted answers: `10`, `ten`, `10:00`

Letter case: ignored.

Feedback: The meeting is at ten in the morning.

Exact supporting words: “at ten in the morning”

#### 3. Where should the listener wait?

Task ID: `be-l-3` · choice

Displayed choices:

- A. At the café
- B. By the main gate
- C. At home

Correct answer: **By the main gate**

Feedback: Amira specifically says the main gate, not the café.

Exact supporting words: “Wait by the main gate, not the café.”

#### 4. What should the listener bring?

Task ID: `be-l-4` · choice

Displayed choices:

- A. Water and a hat
- B. A book and a pen
- C. An umbrella and a bag

Correct answer: **Water and a hat**

Feedback: Both water and a hat are named in the message.

Exact supporting words: “Bring water and a hat.”

#### 5. What will Amira do if it rains?

Task ID: `be-l-5` · choice

Displayed choices:

- A. Meet at the café at nine
- B. Call before nine
- C. Arrive an hour late

Correct answer: **Call before nine**

Feedback: Amira promises to call before nine if it rains; no new meeting place is given.

Exact supporting words: “If it rains, I will call you before nine.”

**Recap / real-life next step**

You listened for practical details and a backup action. Repeat a time and place aloud to check a plan.

### Send a helpful invitation

Lesson ID: `beginner-writing` · Writing & real life · 5–8 min

Card description: Make an invitation with a clear time and place.

**Objective**

Organise a short invitation with the activity, day, time and place.

**Teaching copy**

A helpful invitation tells the reader what will happen, when and where. Add a friendly question or ask for a reply. Keep each sentence clear.

Use on with a day, at with a clock time, and a question mark for a direct question. These tasks check specific choices; the final suggested message is for your own self-review.

**Model examples**

- Day and time → Come on Saturday at two.
- Complete invitation → Hi, Ben! Join our reading group on Saturday at two in the library. Can you come? From, Jo.

**Five practice tasks and feedback**

#### 1. Which detail is missing? “Join our reading group on Saturday in the library.”

Task ID: `be-w-1` · choice

Displayed choices:

- A. The activity
- B. The place
- C. The time

Correct answer: **The time**

Feedback: We know the activity, day and place, but not the clock time.

#### 2. Use on or at: We will meet ___ Saturday.

Task ID: `be-w-2` · fill

Accepted answer: `on`

Letter case: ignored.

Feedback: Use on with a day: on Saturday.

#### 3. Use on or at: The group starts ___ two o’clock.

Task ID: `be-w-3` · fill

Accepted answer: `at`

Letter case: ignored.

Feedback: Use at with a clock time: at two o’clock.

#### 4. Build a friendly question asking for a reply.

Task ID: `be-w-4` · order

Displayed tiles (initial order): `come?`, `you`, `Can`

Correct order: **Can you come?**

Feedback: Can you come? is a direct question, so it ends with a question mark.

#### 5. Choose the most helpful invitation.

Task ID: `be-w-5` · choice

Displayed choices:

- A. Meet me sometime.
- B. Join our reading group on Saturday at two in the library.
- C. The library is nice.

Correct answer: **Join our reading group on Saturday at two in the library.**

Feedback: This invitation includes the activity, day, time and place.

**Recap / real-life next step**

Self-practice: invite someone to an activity. Check for what, when, where and a reply question. Compare with the model; no free-writing score is assigned.

## Intermediate

Connect ideas, understand details and express your reasons.

### Listen to the word parts

Lesson ID: `intermediate-sounds` · Letters & sounds · 5–8 min

Card description: Notice syllables, silent letters and useful endings.

**Objective**

Recognise syllables, common silent letters and word endings.

**Teaching copy**

A syllable is a spoken beat. Teacher usually has two syllables: teach-er. Wonderful usually has three: won-der-ful. Clapping the beats can help you break a longer word into parts.

Spelling and sound do not always match one letter at a time. The k in know and the b in lamb are normally silent. The ending ed can sound different: wanted has an extra syllable, while walked does not. Pronunciations can vary by accent.

**Model examples**

- teacher → teach-er: two syllables
- know → The k is written but normally not pronounced.

**Five practice tasks and feedback**

#### 1. In the usual pronunciation teach-er, how many syllables does teacher have?

Task ID: `in-s-1` · choice

Displayed choices:

- A. One
- B. Two
- C. Three

Correct answer: **Two**

Feedback: Teach-er has two spoken beats.

#### 2. Which letter is normally silent in know?

Task ID: `in-s-2` · fill

Accepted answer: `k`

Letter case: ignored.

Feedback: The k is silent; know begins with an /n/ sound.

#### 3. Which letter is normally silent in lamb?

Task ID: `in-s-3` · choice

Displayed choices:

- A. l
- B. a
- C. b

Correct answer: **b**

Feedback: The final b is normally not pronounced in lamb.

#### 4. Which past-tense word normally adds an extra syllable to its base word?

Task ID: `in-s-4` · choice

Displayed choices:

- A. walked
- B. wanted
- C. helped

Correct answer: **wanted**

Feedback: Want becomes want-ed, with an extra syllable. Walked and helped do not add one.

#### 5. Put these syllable parts in order to build wonderful.

Task ID: `in-s-5` · order

Displayed tiles (initial order): `ful`, `won`, `der`

Correct order: **won der ful**

Feedback: Wonderful can be broken into won-der-ful, three useful spoken parts.

**Recap / real-life next step**

Break longer words into syllables and check familiar silent-letter patterns. A written letter is not always a separate sound.

### Words that work together

Lesson ID: `intermediate-vocabulary` · Words & spelling · 5–8 min

Card description: Choose natural word pairs and clues to meaning.

**Objective**

Use common word partnerships, prefixes and context clues.

**Teaching copy**

A collocation is a common word partnership, such as make a decision or heavy rain. Learning the pair makes it easier to choose a natural phrase.

Word parts and surrounding sentences can help with meaning. Un- often means not, as in unfair. Context can suggest a meaning, but check a dictionary when precision matters.

**Model examples**

- decision → make a decision
- un- + fair → unfair: not fair

**Five practice tasks and feedback**

#### 1. Choose the natural phrase: ___ a decision.

Task ID: `in-v-1` · choice

Displayed choices:

- A. Do
- B. Make
- C. Take up

Correct answer: **Make**

Feedback: Make a decision is a common English word partnership.

#### 2. Complete the phrase: ___ rain. Use heavy or strong.

Task ID: `in-v-2` · fill

Accepted answer: `heavy`

Letter case: ignored.

Feedback: Heavy rain is the usual phrase for a large amount of rain.

#### 3. In unfair, what does un- mean?

Task ID: `in-v-3` · choice

Displayed choices:

- A. Again
- B. Before
- C. Not

Correct answer: **Not**

Feedback: Un- often adds the meaning not. Unfair means not fair.

#### 4. “The path was narrow, so we walked one behind another.” What does narrow most likely mean?

Task ID: `in-v-4` · choice

Displayed choices:

- A. Not wide
- B. Very long
- C. Well lit

Correct answer: **Not wide**

Feedback: Walking one behind another suggests the path does not have much width.

#### 5. Choose the word that fits: We need to ___ a problem, not create another one. Use solve or spend.

Task ID: `in-v-5` · fill

Accepted answer: `solve`

Letter case: ignored.

Feedback: Solve a problem means find an answer or a way to deal with it.

**Recap / real-life next step**

Notice whole phrases, useful prefixes and context clues. Then use the new word in your own sentence.

### Connect your ideas

Lesson ID: `intermediate-grammar` · Grammar & sentences · 5–8 min

Card description: Link reasons, contrasts and possible results.

**Objective**

Connect a reason, a contrast and a possible future result.

**Teaching copy**

Because introduces a reason: We stayed inside because it rained. Although introduces a contrast: Although it rained, we went out. The link tells your reader how the ideas relate.

For a real future possibility, use if + present simple, then will + base verb: If it rains, we will stay inside. Do not normally put will in the if part of this pattern.

**Model examples**

- Reason → I took a coat because it was cold.
- Possible result → If the shop opens, we will buy bread.

**Five practice tasks and feedback**

#### 1. Choose the reason link: We took water ___ it was hot.

Task ID: `in-g-1` · choice

Displayed choices:

- A. although
- B. because
- C. unless

Correct answer: **because**

Feedback: The heat explains why we took water, so because fits.

#### 2. Choose although or because: ___ it was raining, we enjoyed the walk.

Task ID: `in-g-2` · fill

Accepted answer: `Although`

Letter case: ignored.

Feedback: Although marks the contrast between rain and enjoying the walk.

#### 3. Choose the usual first conditional form.

Task ID: `in-g-3` · choice

Displayed choices:

- A. If it will rain, we stay in.
- B. If it rains, we will stay in.
- C. If it rained, we will stayed in.

Correct answer: **If it rains, we will stay in.**

Feedback: Use present simple after if and will plus a base verb for this future possibility.

#### 4. Build a sentence with a reason.

Task ID: `in-g-4` · order

Displayed tiles (initial order): `late.`, `because`, `walked`, `the`, `We`, `bus`, `was`

Correct order: **We walked because the bus was late.**

Feedback: Because connects walking to its reason: the bus was late.

#### 5. Which sentence shows a contrast?

Task ID: `in-g-5` · choice

Displayed choices:

- A. We left because it was late.
- B. Although the task was difficult, we finished it.
- C. If we finish, we will leave.

Correct answer: **Although the task was difficult, we finished it.**

Feedback: Although highlights that finishing happened despite the difficulty.

**Recap / real-life next step**

Choose the relationship first: because for a reason, although for contrast, and if for a condition.

### A greener shared garden

Lesson ID: `intermediate-reading` · Reading & understanding · 5–8 min

Card description: Separate facts, reasons and conclusions in a short article.

**Objective**

Distinguish a reported fact, a reason and a supported conclusion.

**Teaching copy**

A short article can mix observations and opinions. An observation reports what happened. An opinion or proposal says what someone thinks should happen.

A sensible conclusion stays within the evidence. A result in one place can support trying an idea elsewhere, but it does not prove that the same result will happen everywhere.

**Model examples**

- Observation → Twenty people visited on Sunday.
- Cautious conclusion → The event may be worth trying again.

**Reading passage**

Last spring, volunteers turned an unused corner of Brook Street into a shared garden. They added six planting boxes and a rainwater tank. By July, twelve households were growing vegetables there. Volunteers say the garden gives neighbours a reason to meet. However, two boxes dried out during a hot week because nobody had agreed a watering rota. The group now plans a shared rota before adding more boxes. The organisers suggest that another street could try a small garden, then review how well it works.

**Five practice tasks and feedback**

#### 1. Which statement is a reported fact from the article?

Task ID: `in-r-1` · choice

Displayed choices:

- A. Every street needs a garden.
- B. Twelve households were growing vegetables by July.
- C. Gardening is the best hobby.

Correct answer: **Twelve households were growing vegetables by July.**

Feedback: This is a specific event reported in the text; the other choices are broad opinions.

Exact supporting words: “By July, twelve households were growing vegetables there.”

#### 2. How many planting boxes did volunteers add? Write a number or word.

Task ID: `in-r-2` · fill

Accepted answers: `6`, `six`

Letter case: ignored.

Feedback: The article says they added six planting boxes.

Exact supporting words: “six planting boxes”

#### 3. Why did two boxes dry out?

Task ID: `in-r-3` · choice

Displayed choices:

- A. There was no agreed watering rota.
- B. The rainwater tank was stolen.
- C. Nobody planted vegetables.

Correct answer: **There was no agreed watering rota.**

Feedback: The text links the drying boxes to a hot week and no agreed watering rota.

Exact supporting words: “because nobody had agreed a watering rota”

#### 4. What will the group do before adding more boxes?

Task ID: `in-r-4` · choice

Displayed choices:

- A. Close the garden
- B. Agree a shared rota
- C. Move to another street

Correct answer: **Agree a shared rota**

Feedback: The group plans a shared rota as its next step.

Exact supporting words: “plans a shared rota before adding more boxes”

#### 5. Which conclusion is best supported?

Task ID: `in-r-5` · choice

Displayed choices:

- A. A small trial with a review could help another street decide.
- B. All gardens always succeed.
- C. Watering plans are unnecessary.

Correct answer: **A small trial with a review could help another street decide.**

Feedback: The organisers recommend trying a small garden and reviewing it, not assuming guaranteed success.

Exact supporting words: “try a small garden, then review how well it works”

**Recap / real-life next step**

You checked exact details and kept the conclusion close to the evidence. Look for both benefits and practical limitations.

### Clarify before you act

Lesson ID: `intermediate-listening` · Listening & speaking · 5–8 min

Card description: Check a changed plan and ask a useful follow-up question.

**Objective**

Follow a changed plan and ask a precise clarification question.

**Teaching copy**

A speaker may correct a detail partway through a message. Words such as actually, instead and changed signal that you should update your plan.

A useful clarification question names the missing detail. Repeat the change in your own words, then ask one focused question. Audio and the transcript carry the same information; speaking is optional self-practice.

**Model examples**

- A correction → Actually, meet at three instead of two.
- A focused question → Which entrance should we use?

**Listening transcript (same text used for browser speech)**

This is Daniel with an update about Friday’s workshop. We originally planned to use the main hall, but it is being repaired. Please come to Room Four upstairs instead. The start time is still half past two. Bring a notebook; we will provide the materials. There is a lift beside reception. I have not yet confirmed when the workshop will finish, so I will send that detail tomorrow.

**Optional speaking practice**

Say: “So we are meeting in Room Four at half past two. Could you confirm the finish time when you know it?” Listen to your own clarity; the website does not analyse your speech.

**Five practice tasks and feedback**

#### 1. Which part of the plan has changed?

Task ID: `in-l-1` · choice

Displayed choices:

- A. The day
- B. The room
- C. The start time

Correct answer: **The room**

Feedback: The main hall is replaced by Room Four. The time is still the same.

Exact supporting words: “come to Room Four upstairs instead”

#### 2. Which room should participants use? Write the number or word.

Task ID: `in-l-2` · fill

Accepted answers: `4`, `four`, `Room Four`, `Room 4`

Letter case: ignored.

Feedback: The new location is Room Four upstairs.

Exact supporting words: “Room Four upstairs”

#### 3. What is provided?

Task ID: `in-l-3` · choice

Displayed choices:

- A. Notebooks
- B. Transport
- C. Materials

Correct answer: **Materials**

Feedback: Participants bring a notebook; the organisers provide materials.

Exact supporting words: “we will provide the materials”

#### 4. Which detail has not been confirmed?

Task ID: `in-l-4` · choice

Displayed choices:

- A. The finish time
- B. The new room
- C. The location of the lift

Correct answer: **The finish time**

Feedback: Daniel explicitly says the finish time is not yet confirmed.

Exact supporting words: “I have not yet confirmed when the workshop will finish”

#### 5. Which follow-up question asks for the missing information?

Task ID: `in-l-5` · choice

Displayed choices:

- A. Is the workshop on Friday?
- B. What time will the workshop finish?
- C. Should we bring a notebook?

Correct answer: **What time will the workshop finish?**

Feedback: The message already answers the day and notebook questions; the finish time remains unknown.

Exact supporting words: “I will send that detail tomorrow”

**Recap / real-life next step**

Notice corrections, keep the unchanged details, and ask specifically about what is still unknown.

### A clear request by email

Lesson ID: `intermediate-writing` · Writing & real life · 5–8 min

Card description: Give context, make a polite request and suggest a next step.

**Objective**

Structure a polite email that explains a problem and requests a next step.

**Teaching copy**

Make a request easy to understand. Use a specific subject, explain the situation briefly, then say what help you need. Include a useful deadline or next step if it is relevant.

“Could you please…” is a polite request. Be direct about the action you need without adding unrelated information. The exercises check controlled sentences; the suggested full email is for self-review.

**Model examples**

- Specific subject → Request for the workshop notes
- Context + request → I missed Friday’s workshop because I was unwell. Could you please send me the notes?

**Five practice tasks and feedback**

#### 1. Which subject best fits an email asking for workshop notes?

Task ID: `in-w-1` · choice

Displayed choices:

- A. Hello!!!
- B. Request for Friday’s workshop notes
- C. Something

Correct answer: **Request for Friday’s workshop notes**

Feedback: A specific subject tells the reader the purpose before they open the email.

#### 2. Build a polite request.

Task ID: `in-w-2` · order

Displayed tiles (initial order): `notes?`, `please`, `you`, `send`, `Could`, `the`

Correct order: **Could you please send the notes?**

Feedback: Could you please + base verb is a polite request pattern.

#### 3. Choose because or although: I missed the workshop ___ I was unwell.

Task ID: `in-w-3` · fill

Accepted answer: `because`

Letter case: ignored.

Feedback: Being unwell is the reason for missing the workshop.

#### 4. Which sentence gives a useful next step?

Task ID: `in-w-4` · choice

Displayed choices:

- A. Everything is terrible.
- B. Please send the notes by Thursday so I can prepare.
- C. I have many unrelated stories.

Correct answer: **Please send the notes by Thursday so I can prepare.**

Feedback: This names the action, a deadline and a reason.

#### 5. Choose the clearest order for a short request email.

Task ID: `in-w-5` · choice

Displayed choices:

- A. Request → unrelated story → subject
- B. Subject → greeting → brief context → request → thanks
- C. Thanks → long story → no request

Correct answer: **Subject → greeting → brief context → request → thanks**

Feedback: This sequence helps the reader understand the purpose and act on the request.

**Recap / real-life next step**

Self-practice: write a short request with a subject, context, clear action and thanks. Model: “Hello, Kim. I missed Friday’s workshop because I was unwell. Could you please send the notes by Thursday so I can prepare? Thank you, Alex.” Compare the structure yourself; free writing is not automatically graded.

## Advanced

Read critically and communicate with clarity, precision and purpose.

### Say what you mean

Lesson ID: `advanced-sounds` · Letters & sounds · 5–8 min

Card description: Explore stress, pauses and emphasis for clearer speech.

**Objective**

Use stress, meaningful pauses and emphasis to make an intended meaning clearer.

**Teaching copy**

English speech groups words into meaningful chunks. A short pause can help listeners follow a contrast or a list. Strong emphasis can draw attention to a correction: “I asked for the BLUE folder” contrasts blue with another colour.

Some words change stress with their grammatical role. In many standard accents, the noun record stresses the first syllable (REcord), while the verb stresses the second (reCORD). Accent differences are normal; clarity and intended meaning matter more than copying one accent.

**Model examples**

- A correction → We need the BLUE folder, not the green one.
- Noun and verb → Keep a REcord. Please reCORD the result.

**Five practice tasks and feedback**

#### 1. “I asked for the BLUE folder.” What is the emphasis most likely correcting?

Task ID: `ad-s-1` · choice

Displayed choices:

- A. The colour
- B. The number of folders
- C. The time of the request

Correct answer: **The colour**

Feedback: Emphasising blue contrasts that colour with a different one.

#### 2. In “Keep a record”, which stress pattern is common for the noun?

Task ID: `ad-s-2` · choice

Displayed choices:

- A. reCORD
- B. REcord
- C. Both syllables must always be unstressed

Correct answer: **REcord**

Feedback: The noun commonly stresses the first syllable. Pronunciation can vary by accent.

#### 3. In “Please record the result”, which stress pattern is common for the verb?

Task ID: `ad-s-3` · choice

Displayed choices:

- A. REcord
- B. Neither syllable
- C. reCORD

Correct answer: **reCORD**

Feedback: The verb commonly stresses the second syllable.

#### 4. Which marked pause best separates the two sides of a contrast? A slash shows the pause.

Task ID: `ad-s-4` · choice

Displayed choices:

- A. The plan is simple / but it needs careful timing.
- B. The / plan is simple but it needs careful timing.
- C. The plan is simple but it needs / careful timing.

Correct answer: **The plan is simple / but it needs careful timing.**

Feedback: A pause before but helps signal the contrast between simplicity and careful timing.

#### 5. To correct “borrowed” in “I bought the book, not borrowed it”, which verb should you emphasise? Write one word.

Task ID: `ad-s-5` · fill

Accepted answer: `bought`

Letter case: ignored.

Feedback: Emphasise bought to make the contrast with borrowed clear.

**Recap / real-life next step**

Self-practice: read the examples aloud with the marked emphasis. Try a different emphasis and notice how the intended contrast changes. Your voice is not recorded or graded.

### Precise words, fair claims

Lesson ID: `advanced-vocabulary` · Words & spelling · 5–8 min

Card description: Choose words that express the strength and limits of evidence.

**Objective**

Select precise language that matches the strength and limits of evidence.

**Teaching copy**

Words express degrees of certainty. Suggests is cautious; proves is much stronger. A small survey may suggest a pattern without proving that it applies to everyone.

Precision also means choosing the right relationship. Correlation means two things vary together; it does not by itself establish that one caused the other. Replace vague claims with specific quantities, groups and limits when those details are known.

**Model examples**

- Too strong for a small survey → The survey suggests a preference among these respondents.
- More precise → 18 of the 30 respondents preferred the earlier session.

**Five practice tasks and feedback**

#### 1. A survey of ten volunteers found a preference. Which verb is most appropriately cautious?

Task ID: `ad-v-1` · choice

Displayed choices:

- A. Proves
- B. Guarantees
- C. Suggests

Correct answer: **Suggests**

Feedback: A small volunteer sample can suggest a pattern, but cannot guarantee a universal conclusion.

#### 2. Complete: Two things changing together shows correlation, not necessarily ___. Use causation or certainty.

Task ID: `ad-v-2` · fill

Accepted answer: `causation`

Letter case: ignored.

Feedback: Correlation alone does not establish that one factor causes the other.

#### 3. Which wording is most precise?

Task ID: `ad-v-3` · choice

Displayed choices:

- A. Everyone loved it.
- B. 18 of 30 respondents preferred the earlier session.
- C. People sort of liked things.

Correct answer: **18 of 30 respondents preferred the earlier session.**

Feedback: This gives a count, a defined group and a specific preference.

#### 4. A result is preliminary. What does preliminary mean?

Task ID: `ad-v-4` · choice

Displayed choices:

- A. Final and beyond question
- B. Early and subject to further checking
- C. Intentionally false

Correct answer: **Early and subject to further checking**

Feedback: Preliminary findings come before a fuller investigation or final decision.

#### 5. Which revision avoids overstating “This method always works”?

Task ID: `ad-v-5` · choice

Displayed choices:

- A. This method can work in the conditions tested.
- B. This method never fails anywhere.
- C. This method guarantees success for everyone.

Correct answer: **This method can work in the conditions tested.**

Feedback: Can and the stated limit keep the claim close to the evidence.

**Recap / real-life next step**

Match certainty to evidence. Prefer precise counts and defined groups, and distinguish association from cause.

### Shape a careful argument

Lesson ID: `advanced-grammar` · Grammar & sentences · 5–8 min

Card description: Use conditionals, concession and precise reference.

**Objective**

Use concession, hypothetical conditions and clear reference in an argument.

**Teaching copy**

Concession recognises a point before qualifying it: “Although the trial was small, the findings are useful.” For a hypothetical present or future situation, a common pattern is if + past simple, then would + base verb.

A pronoun should have a clear reference. If “it” could refer to two different things, repeat the intended noun. Keep comparisons parallel so readers can see exactly what is being compared.

**Model examples**

- Hypothetical condition → If we had more time, we would test another option.
- Clear reference → The report compares the two plans. The cheaper plan needs more staff.

**Five practice tasks and feedback**

#### 1. Choose the conventional hypothetical form.

Task ID: `ad-g-1` · choice

Displayed choices:

- A. If we have more time, we would tested it.
- B. If we had more time, we would test it.
- C. If we would have time, we tested it.

Correct answer: **If we had more time, we would test it.**

Feedback: Use past simple in the if part and would plus the base verb in the result.

#### 2. Choose although or because: ___ the sample was small, the results offered a useful starting point.

Task ID: `ad-g-2` · fill

Accepted answer: `Although`

Letter case: ignored.

Feedback: Although acknowledges a limitation while allowing a useful result.

#### 3. “The tutor discussed the report with the assistant after she arrived.” Which revision makes the intended reference to the assistant clear?

Task ID: `ad-g-3` · choice

Displayed choices:

- A. The tutor discussed it after she arrived.
- B. After the assistant arrived, the tutor discussed the report with her.
- C. After she arrived, it was discussed with her.

Correct answer: **After the assistant arrived, the tutor discussed the report with her.**

Feedback: Naming the assistant in the arrival clause removes the uncertainty about who arrived.

#### 4. Build a concise contrast sentence.

Task ID: `ad-g-4` · order

Displayed tiles (initial order): `limited.`, `useful,`, `evidence`, `but`, `is`, `The`

Correct order: **The evidence is useful, but limited.**

Feedback: But links a useful quality with its limitation in one clear sentence.

#### 5. Which comparison is grammatically parallel?

Task ID: `ad-g-5` · choice

Displayed choices:

- A. The task requires planning carefully and to check results.
- B. The task requires careful planning and thorough checking.
- C. The task requires to plan and checking.

Correct answer: **The task requires careful planning and thorough checking.**

Feedback: Planning and checking use matching noun forms, making the comparison easier to follow.

**Recap / real-life next step**

A careful argument can acknowledge a limitation, explore a hypothetical situation and keep every reference clear.

### Read a claim critically

Lesson ID: `advanced-reading` · Reading & understanding · 5–8 min

Card description: Examine evidence, limitations and a justified conclusion.

**Objective**

Evaluate a short claim by checking the study design, limitations and justified next step.

**Teaching copy**

Critical reading asks who took part, what was measured and what comparisons were made. A positive result may be useful while still leaving important questions unanswered.

Distinguish what the evidence shows from what the writer recommends. A limited trial can justify a larger comparison without proving that an intervention caused the improvement.

**Model examples**

- A limitation → Participants volunteered, so the group may not represent everyone.
- A proportionate next step → Test with a larger comparison group.

**Reading passage**

A community centre tested a ten-minute reading session before its evening workshops. Thirty volunteers took part for four weeks. Twenty-two reported that they found it easier to concentrate afterwards. However, there was no comparison group, and concentration was measured only through participants’ own reports. The organiser described the result as promising, but said it did not establish that reading caused the improvement. She recommended a larger trial that compares similar groups and includes an independent concentration task before changing every workshop.

**Five practice tasks and feedback**

#### 1. What outcome was actually measured?

Task ID: `ad-r-1` · choice

Displayed choices:

- A. Participants’ own reports of concentration
- B. Exam scores measured by an independent team
- C. Everyone’s long-term reading ability

Correct answer: **Participants’ own reports of concentration**

Feedback: The article says concentration was measured only through self-reports.

Exact supporting words: “measured only through participants’ own reports”

#### 2. How many volunteers reported easier concentration? Write a number or words.

Task ID: `ad-r-2` · fill

Accepted answers: `22`, `twenty-two`, `twenty two`

Letter case: ignored.

Feedback: Twenty-two of the thirty volunteers reported the improvement.

Exact supporting words: “Twenty-two reported”

#### 3. Which limitation makes a causal claim especially difficult?

Task ID: `ad-r-3` · choice

Displayed choices:

- A. The session lasted ten minutes.
- B. There was no comparison group.
- C. The centre held evening workshops.

Correct answer: **There was no comparison group.**

Feedback: Without a comparable group that did not receive the session, other explanations remain possible.

Exact supporting words: “there was no comparison group”

#### 4. Which conclusion is justified?

Task ID: `ad-r-4` · choice

Displayed choices:

- A. Reading definitely improves concentration for everyone.
- B. The self-reports are promising but do not establish cause.
- C. The trial proves reading has no effect.

Correct answer: **The self-reports are promising but do not establish cause.**

Feedback: The organiser explicitly distinguishes a promising result from proof of causation.

Exact supporting words: “it did not establish that reading caused the improvement”

#### 5. What next step does the organiser recommend?

Task ID: `ad-r-5` · choice

Displayed choices:

- A. Change every workshop immediately.
- B. Stop collecting evidence.
- C. Run a larger comparison trial with an independent task.

Correct answer: **Run a larger comparison trial with an independent task.**

Feedback: The proposed next trial addresses the lack of comparison and reliance on self-report.

Exact supporting words: “a larger trial that compares similar groups and includes an independent concentration task”

**Recap / real-life next step**

You separated a reported improvement from proof of cause, identified design limits and selected a proportionate next step.

### Follow a balanced discussion

Lesson ID: `advanced-listening` · Listening & speaking · 5–8 min

Card description: Identify a recommendation, a concern and the agreed next step.

**Objective**

Follow a discussion by separating a proposal, a concern and an agreed decision.

**Teaching copy**

In a discussion, speakers may support the same goal but disagree about how to achieve it. Listen for proposals, reasons, concerns and the final agreement rather than treating every suggestion as a decision.

A useful spoken summary gives the agreed action, the person responsible and the review point. You can replay the synthetic audio or read the transcript; your own summary is optional and is not automatically graded.

**Model examples**

- Proposal versus decision → “We could extend hours” is a suggestion; “We agreed to try Fridays” is a decision.
- Useful summary → Jo will check the rota, and we will review attendance after a month.

**Listening transcript (same text used for browser speech)**

Priya: We could open the study room every evening to help people who work during the day. Omar: I support longer access, but we do not yet have enough volunteers for every evening. Could we start with Fridays? Priya: That is a reasonable trial. Let us open until eight on Fridays for one month. Omar: Agreed. I will check the volunteer rota this week. Priya: Then we will review attendance and volunteer feedback before deciding whether to add another evening.

**Optional speaking practice**

Summarise aloud in two sentences. Model: “The team agreed to open until eight on Fridays for a month. Omar will check the rota, and they will review attendance and volunteer feedback before expanding.” Compare the action, person and review point yourself.

**Five practice tasks and feedback**

#### 1. What is Priya’s original proposal?

Task ID: `ad-l-1` · choice

Displayed choices:

- A. Close the room earlier.
- B. Open the study room every evening.
- C. Open only on Fridays forever.

Correct answer: **Open the study room every evening.**

Feedback: Her first suggestion is every evening; the final trial is narrower.

Exact supporting words: “open the study room every evening”

#### 2. What concern does Omar raise?

Task ID: `ad-l-2` · choice

Displayed choices:

- A. The room has no books.
- B. People do not work in the daytime.
- C. There are not enough volunteers for every evening.

Correct answer: **There are not enough volunteers for every evening.**

Feedback: Omar supports longer access but names volunteer availability as the constraint.

Exact supporting words: “we do not yet have enough volunteers for every evening”

#### 3. On which day will the trial run?

Task ID: `ad-l-3` · fill

Accepted answers: `Friday`, `Fridays`

Letter case: ignored.

Feedback: They agree on Fridays for one month, until eight.

Exact supporting words: “until eight on Fridays for one month”

#### 4. Who will check the volunteer rota?

Task ID: `ad-l-4` · choice

Displayed choices:

- A. Priya
- B. Omar
- C. No one is assigned

Correct answer: **Omar**

Feedback: Omar says he will check the rota this week.

Exact supporting words: “Omar: Agreed. I will check the volunteer rota this week.”

#### 5. What will inform the decision about another evening?

Task ID: `ad-l-5` · choice

Displayed choices:

- A. Only the original suggestion
- B. Attendance and volunteer feedback
- C. An automatic daily expansion

Correct answer: **Attendance and volunteer feedback**

Feedback: The team will review both attendance and volunteer feedback before expanding.

Exact supporting words: “review attendance and volunteer feedback”

**Recap / real-life next step**

Track how a proposal becomes a practical trial. A clear summary preserves the decision, responsibility and review point.

### A concise recommendation

Lesson ID: `advanced-writing` · Writing & real life · 5–8 min

Card description: Organise evidence and propose a practical next step.

**Objective**

Build a concise recommendation that connects evidence, a limitation and an action.

**Teaching copy**

A useful recommendation names the decision, gives relevant evidence and recognises a limitation. Then it proposes a feasible action and says how success will be reviewed.

Prefer a specific, proportionate claim to an absolute promise. Remove repeated ideas and vague openings. These tasks check editing decisions and controlled sentences; a longer recommendation needs human review.

**Model examples**

- Vague → Replace “It is my opinion that perhaps we should do a thing” with “I recommend a one-month trial.”
- Evidence + action → Requests increased, but staffing is limited. Trial one extra evening, then review attendance and costs.

**Five practice tasks and feedback**

#### 1. Which opening states a recommendation most directly?

Task ID: `ad-w-1` · choice

Displayed choices:

- A. There are many things in the world.
- B. I recommend a one-month trial of Friday evening opening.
- C. It may be interesting to perhaps think about something.

Correct answer: **I recommend a one-month trial of Friday evening opening.**

Feedback: This identifies the action, day and trial length immediately.

#### 2. Which evidence is most relevant to a proposal for later opening?

Task ID: `ad-w-2` · choice

Displayed choices:

- A. The walls are painted blue.
- B. Sixteen recent requests asked for access after six.
- C. The building has a long name.

Correct answer: **Sixteen recent requests asked for access after six.**

Feedback: Requests for later access directly relate to the proposed opening time.

#### 3. Choose however or therefore: Demand has increased. ___, staffing remains limited.

Task ID: `ad-w-3` · fill

Accepted answer: `However`

Letter case: ignored.

Feedback: However introduces a limitation that contrasts with increased demand.

#### 4. Build a practical review step.

Task ID: `ad-w-4` · order

Displayed tiles (initial order): `one`, `Review`, `after`, `attendance`, `month.`

Correct order: **Review attendance after one month.**

Feedback: A specific review measure and time make the trial easier to evaluate.

#### 5. Which final sentence is proportionate to a small trial?

Task ID: `ad-w-5` · choice

Displayed choices:

- A. This guarantees success for every centre.
- B. If attendance and staffing support it, consider another evening.
- C. Expand everywhere regardless of the results.

Correct answer: **If attendance and staffing support it, consider another evening.**

Feedback: Expansion depends on relevant evidence rather than an unsupported guarantee.

**Recap / real-life next step**

Self-practice: write 80–120 words recommending a small improvement. Include evidence, a limitation, an action and a review point. Model: “I recommend opening until eight on Fridays for one month. Sixteen recent requests asked for access after six. However, volunteer staffing remains limited. Trial one additional evening and review attendance, costs and volunteer feedback after the month. If the results support it, consider another evening.” Use the checklist yourself; no automatic essay grade is given.

## Local validation and review boundary

Automated checks cover all 24 lazy-loaded lessons, all 120 unique task IDs, keyed answers and distractors, ordering-token consistency, exact reading/listening evidence, capitalization behavior, partial/full scoring, preservation of saved game/lesson results, required answers, invalid completion dates, best-score retention and bounded retry XP. These checks establish implementation consistency; they do not replace the owner’s curriculum and publication review.

Local validation on 3 November 2026:

- `npm test -- src/academy/academy.test.ts`: 14 curriculum, scoring and progress tests passed.
- `npm test`: 326 tests passed across 12 files at the time of this review draft.
- `npm run build`: TypeScript and the production build passed; the four lesson levels remain separate lazy-loaded chunks.
- `node src/academy/browserQA.mjs`, with local Vite running on port 4177: all 24 full learner flows passed, with 125 checked tasks including a repeated lesson. The repeated perfect attempt earned zero extra XP; all 24 first perfect completions totalled exactly 1,200 XP.
- Native Chromium checks confirmed four selectable levels, six skill cards, the adult-beginner welcome, working practice-games and original-crosswords callbacks, no browser exceptions, and no horizontal overflow at desktop width 1,440 or mobile width 390. Explicit Listen correctly fell back to the complete transcript when browser speech was unavailable, and mobile listening practice also fitted the screen. Desktop, mobile landing and mobile practice screenshots were inspected locally.

The browser check mounts the real Academy component with local in-memory Journey callbacks. It creates no account, sends no email and makes no application data writes to an external service. Root application authentication and cloud synchronization are validated separately during integration.

Review status: awaiting owner copy review. Publication status: not published by this work.
