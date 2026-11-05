import { extendEnglish } from '../extend.ts';
import { extra, references } from './beginnerExtra.ts';
import { choice, fill, order } from '../tasks.ts';
import type { LessonBody } from '../tasks.ts';

const lessons: Record<string, LessonBody> = {
  sounds: {
    objective: 'Recognise sh, ch and th in words and compare short vowel spellings.',
    teaching: [
      'Sometimes two letters work together to represent one sound. Sh begins ship, ch begins chip, and th begins thin. These pairs are called digraphs. Th has a different sound in this; both uses are normal.',
      'Changing a vowel can change a word: ship and shop differ in their middle letter and vowel sound. Say each example slowly. Accents vary; use the printed word as a spelling clue.',
    ],
    examples: [{ before: 'sh + ip', after: 'ship: sh works together.' }, { before: 'chip → chop', after: 'Changing i to o changes the word.' }],
    tasks: [
      choice('be-s-1', 'Which word begins with sh?', ['chip', 'ship', 'thin'], 'ship', 'The first two letters of ship are sh.'),
      fill('be-s-2', 'Write the two missing letters: _ _ip. The word is chip.', ['ch'], 'Chip starts with the letter pair ch.'),
      choice('be-s-3', 'Match thin to its beginning letter pair.', ['sh', 'ch', 'th'], 'th', 'Thin begins with th.'),
      choice('be-s-4', 'Change the middle letter of ship from i to o. Which word do you make?', ['shop', 'stop', 'shape'], 'shop', 'Sh + o + p spells shop.'),
      order('be-s-5', 'Build the word fish using these letter groups.', ['sh', 'f', 'i'], 'f i sh', 'Fish is f + i + sh. The sh sound comes at the end this time.'),
    ],
    recap: 'Look for sh, ch and th at the beginnings and ends of words. Letter pairs help you read in useful chunks.',
  },
  vocabulary: {
    objective: 'Choose everyday words for places, routines and plans.',
    teaching: [
      'Context helps you choose a word. You borrow a book from a library, buy food at a market, and wait for a bus at a bus stop.',
      'Some useful word pairs belong together: make a plan, catch a bus, and brush your teeth. Learn the whole phrase as well as the meaning of each word.',
    ],
    examples: [{ before: 'A place to borrow books', after: 'a library' }, { before: 'A useful phrase', after: 'We make a plan.' }],
    tasks: [
      choice('be-v-1', 'Where would you usually borrow a book?', ['A library', 'A bus stop', 'A bakery'], 'A library', 'Libraries lend books for people to read and return.'),
      fill('be-v-2', 'Complete the phrase: ___ your teeth. Use brush, catch or make.', ['brush'], 'Brush your teeth is the usual phrase for cleaning them with a toothbrush.'),
      choice('be-v-3', 'We need bread and fruit. Which place fits this plan?', ['A swimming pool', 'A food market', 'A station platform'], 'A food market', 'A food market is a place to buy bread, fruit and other food.'),
      fill('be-v-4', 'Complete the phrase: Let us ___ a plan. Use do or make.', ['make'], 'The natural phrase is make a plan.'),
      order('be-v-5', 'Put the words in order.', ['bus.', 'catch', 'the', 'We'], 'We catch the bus.', 'Catch the bus means get on the bus for a journey.'),
    ],
    recap: 'Learn words with a useful phrase: borrow a book, brush your teeth, make a plan and catch the bus.',
  },
  grammar: {
    objective: 'Use time clues to choose present simple and past simple verbs.',
    teaching: [
      'Use the present simple for a routine: I walk every day. With he, she or one name, many verbs add s: Noor walks every day.',
      'Use the past simple for a finished time: Yesterday I walked. Many past verbs add ed, but some change: go becomes went. Time clues such as every day and yesterday help you choose.',
    ],
    examples: [{ before: 'Every day', after: 'She walks to the park.' }, { before: 'Yesterday', after: 'She went to the park.' }],
    tasks: [
      choice('be-g-1', 'Choose the routine: Every morning, Sam ___ breakfast.', ['eat', 'eats', 'ate'], 'eats', 'Sam is one person. In this present simple routine, eat becomes eats.'),
      fill('be-g-2', 'Yesterday I ___ to the park. Use the past form of go.', ['went'], 'Go has the irregular past form went.'),
      choice('be-g-3', 'Which time phrase clearly signals a finished past time?', ['Every day', 'Usually', 'Last night'], 'Last night', 'Last night names a time that has already finished.'),
      fill('be-g-4', 'Complete with the past form of play: We ___ a game yesterday.', ['played'], 'Play is regular: add ed to make played.'),
      order('be-g-5', 'Build a sentence about a daily routine.', ['every', 'I', 'day.', 'read'], 'I read every day.', 'I read every day. describes a routine. The phrase every day comes together.'),
    ],
    recap: 'Check the time clue, then match the verb: routines use the present simple; finished past events use the past simple.',
  },
  reading: {
    objective: 'Read a notice for times, instructions and a changed arrangement.',
    teaching: [
      'Notices help people act. Look for the heading, then find practical details such as the day, time, place and things you need.',
      'Words such as instead show a change. Check the whole notice before deciding what to do. All the answers in this lesson come from the notice.',
    ],
    examples: [{ before: 'Opens at 10:00', after: 'Arrive at or after 10:00.' }, { before: 'Room B instead of Room A', after: 'The new place is Room B.' }],
    passage: 'Riverside Library notice: On Saturday, the library opens at 10:00 instead of 9:00 because staff are moving shelves. The free reading group begins at 11:00 in Room B. Bring your library card. You do not need to book a place. The library closes at 16:00.',
    tasks: [
      choice('be-r-1', 'What time does the library open on Saturday?', ['9:00', '10:00', '11:00'], '10:00', 'The new opening time is 10:00; 9:00 is the time it replaces.', 'opens at 10:00 instead of 9:00'),
      choice('be-r-2', 'Why is the opening time different?', ['Staff are moving shelves.', 'The reading group is cancelled.', 'The building is closed all day.'], 'Staff are moving shelves.', 'The notice gives moving shelves as the reason.', 'because staff are moving shelves'),
      fill('be-r-3', 'Which room will the reading group use? Write the letter.', ['B', 'Room B'], 'The reading group begins in Room B.', 'in Room B'),
      choice('be-r-4', 'What must you bring?', ['A booking letter', 'Your library card', 'A new shelf'], 'Your library card', 'The instruction is to bring your library card.', 'Bring your library card.'),
      choice('be-r-5', 'Which statement is correct?', ['You must book before Saturday.', 'The group costs money.', 'You can join without booking.'], 'You can join without booking.', 'The notice says no booking is needed, and the group is free.', 'You do not need to book a place.'),
    ],
    recap: 'You found the changed time, the reason, the room and what to bring. Reading the full notice prevents a mistaken plan.',
  },
  listening: {
    objective: 'Find the time, meeting place and items to bring in a short invitation.',
    teaching: [
      'Before listening, decide what you need to know: when, where and what to bring. You can replay the message and use the transcript at any time.',
      'To check a plan, repeat the important detail as a question: “At ten, by the main gate?” Speaking practice here is optional and is not recorded or automatically assessed.',
    ],
    examples: [{ before: 'A plan', after: 'Meet at ten by the main gate.' }, { before: 'Checking a detail', after: 'By the main gate, right?' }],
    transcript: 'Hi, it is Amira. Let us meet at the park on Sunday at ten in the morning. Wait by the main gate, not the café. Bring water and a hat. If it rains, I will call you before nine.',
    speakingPractice: 'Say a reply aloud: “Sunday at ten, by the main gate. I will bring water and a hat.” Then practise asking “What will we do if it rains?”',
    tasks: [
      choice('be-l-1', 'Which day is the meeting?', ['Saturday', 'Monday', 'Sunday'], 'Sunday', 'Amira says to meet on Sunday.', 'on Sunday'),
      fill('be-l-2', 'What time in the morning will they meet? Write a number or the word.', ['10', 'ten', '10:00'], 'The meeting is at ten in the morning.', 'at ten in the morning'),
      choice('be-l-3', 'Where should the listener wait?', ['At the café', 'By the main gate', 'At home'], 'By the main gate', 'Amira specifically says the main gate, not the café.', 'Wait by the main gate, not the café.'),
      choice('be-l-4', 'What should the listener bring?', ['Water and a hat', 'A book and a pen', 'An umbrella and a bag'], 'Water and a hat', 'Both water and a hat are named in the message.', 'Bring water and a hat.'),
      choice('be-l-5', 'What will Amira do if it rains?', ['Meet at the café at nine', 'Call before nine', 'Arrive an hour late'], 'Call before nine', 'Amira promises to call before nine if it rains; no new meeting place is given.', 'If it rains, I will call you before nine.'),
    ],
    recap: 'You listened for practical details and a backup action. Repeat a time and place aloud to check a plan.',
  },
  writing: {
    objective: 'Organise a short invitation with the activity, day, time and place.',
    teaching: [
      'A helpful invitation tells the reader what will happen, when and where. Add a friendly question or ask for a reply. Keep each sentence clear.',
      'Use on with a day, at with a clock time, and a question mark for a direct question. These tasks check specific choices; the final suggested message is for your own self-review.',
    ],
    examples: [{ before: 'Day and time', after: 'Come on Saturday at two.' }, { before: 'Complete invitation', after: 'Hi, Ben! Join our reading group on Saturday at two in the library. Can you come? From, Jo.' }],
    tasks: [
      choice('be-w-1', 'Which detail is missing? “Join our reading group on Saturday in the library.”', ['The activity', 'The place', 'The time'], 'The time', 'We know the activity, day and place, but not the clock time.'),
      fill('be-w-2', 'Use on or at: We will meet ___ Saturday.', ['on'], 'Use on with a day: on Saturday.'),
      fill('be-w-3', 'Use on or at: The group starts ___ two o’clock.', ['at'], 'Use at with a clock time: at two o’clock.'),
      order('be-w-4', 'Build a friendly question asking for a reply.', ['come?', 'you', 'Can'], 'Can you come?', 'Can you come? is a direct question, so it ends with a question mark.'),
      choice('be-w-5', 'Choose the most helpful invitation.', ['Meet me sometime.', 'Join our reading group on Saturday at two in the library.', 'The library is nice.'], 'Join our reading group on Saturday at two in the library.', 'This invitation includes the activity, day, time and place.'),
    ],
    recap: 'Self-practice: invite someone to an activity. Check for what, when, where and a reply question. Compare with the model; no free-writing score is assigned.',
  },
};
for (const skill of Object.keys(lessons)) {
  const short = ({ sounds: 's', vocabulary: 'v', grammar: 'g', reading: 'r', listening: 'l', writing: 'w' } as Record<string, string>)[skill];
  lessons[skill] = extendEnglish(lessons[skill], 'be-' + short, extra[skill], references[skill as keyof typeof references]);
}
export default lessons;
