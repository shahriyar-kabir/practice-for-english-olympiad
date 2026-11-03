import { choice, fill, order } from '../types';
import type { LessonBody } from '../types';

const lessons: Record<string, LessonBody> = {
  sounds: {
    objective: 'Recognise syllables, common silent letters and word endings.',
    teaching: [
      'A syllable is a spoken beat. Teacher usually has two syllables: teach-er. Wonderful usually has three: won-der-ful. Clapping the beats can help you break a longer word into parts.',
      'Spelling and sound do not always match one letter at a time. The k in know and the b in lamb are normally silent. The ending ed can sound different: wanted has an extra syllable, while walked does not. Pronunciations can vary by accent.',
    ],
    examples: [{ before: 'teacher', after: 'teach-er: two syllables' }, { before: 'know', after: 'The k is written but normally not pronounced.' }],
    tasks: [
      choice('in-s-1', 'In the usual pronunciation teach-er, how many syllables does teacher have?', ['One', 'Two', 'Three'], 'Two', 'Teach-er has two spoken beats.'),
      fill('in-s-2', 'Which letter is normally silent in know?', ['k'], 'The k is silent; know begins with an /n/ sound.'),
      choice('in-s-3', 'Which letter is normally silent in lamb?', ['l', 'a', 'b'], 'b', 'The final b is normally not pronounced in lamb.'),
      choice('in-s-4', 'Which past-tense word normally adds an extra syllable to its base word?', ['walked', 'wanted', 'helped'], 'wanted', 'Want becomes want-ed, with an extra syllable. Walked and helped do not add one.'),
      order('in-s-5', 'Put these syllable parts in order to build wonderful.', ['ful', 'won', 'der'], 'won der ful', 'Wonderful can be broken into won-der-ful, three useful spoken parts.'),
    ],
    recap: 'Break longer words into syllables and check familiar silent-letter patterns. A written letter is not always a separate sound.',
  },
  vocabulary: {
    objective: 'Use common word partnerships, prefixes and context clues.',
    teaching: [
      'A collocation is a common word partnership, such as make a decision or heavy rain. Learning the pair makes it easier to choose a natural phrase.',
      'Word parts and surrounding sentences can help with meaning. Un- often means not, as in unfair. Context can suggest a meaning, but check a dictionary when precision matters.',
    ],
    examples: [{ before: 'decision', after: 'make a decision' }, { before: 'un- + fair', after: 'unfair: not fair' }],
    tasks: [
      choice('in-v-1', 'Choose the natural phrase: ___ a decision.', ['Do', 'Make', 'Take up'], 'Make', 'Make a decision is a common English word partnership.'),
      fill('in-v-2', 'Complete the phrase: ___ rain. Use heavy or strong.', ['heavy'], 'Heavy rain is the usual phrase for a large amount of rain.'),
      choice('in-v-3', 'In unfair, what does un- mean?', ['Again', 'Before', 'Not'], 'Not', 'Un- often adds the meaning not. Unfair means not fair.'),
      choice('in-v-4', '“The path was narrow, so we walked one behind another.” What does narrow most likely mean?', ['Not wide', 'Very long', 'Well lit'], 'Not wide', 'Walking one behind another suggests the path does not have much width.'),
      fill('in-v-5', 'Choose the word that fits: We need to ___ a problem, not create another one. Use solve or spend.', ['solve'], 'Solve a problem means find an answer or a way to deal with it.'),
    ],
    recap: 'Notice whole phrases, useful prefixes and context clues. Then use the new word in your own sentence.',
  },
  grammar: {
    objective: 'Connect a reason, a contrast and a possible future result.',
    teaching: [
      'Because introduces a reason: We stayed inside because it rained. Although introduces a contrast: Although it rained, we went out. The link tells your reader how the ideas relate.',
      'For a real future possibility, use if + present simple, then will + base verb: If it rains, we will stay inside. Do not normally put will in the if part of this pattern.',
    ],
    examples: [{ before: 'Reason', after: 'I took a coat because it was cold.' }, { before: 'Possible result', after: 'If the shop opens, we will buy bread.' }],
    tasks: [
      choice('in-g-1', 'Choose the reason link: We took water ___ it was hot.', ['although', 'because', 'unless'], 'because', 'The heat explains why we took water, so because fits.'),
      fill('in-g-2', 'Choose although or because: ___ it was raining, we enjoyed the walk.', ['Although'], 'Although marks the contrast between rain and enjoying the walk.'),
      choice('in-g-3', 'Choose the usual first conditional form.', ['If it will rain, we stay in.', 'If it rains, we will stay in.', 'If it rained, we will stayed in.'], 'If it rains, we will stay in.', 'Use present simple after if and will plus a base verb for this future possibility.'),
      order('in-g-4', 'Build a sentence with a reason.', ['late.', 'because', 'walked', 'the', 'We', 'bus', 'was'], 'We walked because the bus was late.', 'Because connects walking to its reason: the bus was late.'),
      choice('in-g-5', 'Which sentence shows a contrast?', ['We left because it was late.', 'Although the task was difficult, we finished it.', 'If we finish, we will leave.'], 'Although the task was difficult, we finished it.', 'Although highlights that finishing happened despite the difficulty.'),
    ],
    recap: 'Choose the relationship first: because for a reason, although for contrast, and if for a condition.',
  },
  reading: {
    objective: 'Distinguish a reported fact, a reason and a supported conclusion.',
    teaching: [
      'A short article can mix observations and opinions. An observation reports what happened. An opinion or proposal says what someone thinks should happen.',
      'A sensible conclusion stays within the evidence. A result in one place can support trying an idea elsewhere, but it does not prove that the same result will happen everywhere.',
    ],
    examples: [{ before: 'Observation', after: 'Twenty people visited on Sunday.' }, { before: 'Cautious conclusion', after: 'The event may be worth trying again.' }],
    passage: 'Last spring, volunteers turned an unused corner of Brook Street into a shared garden. They added six planting boxes and a rainwater tank. By July, twelve households were growing vegetables there. Volunteers say the garden gives neighbours a reason to meet. However, two boxes dried out during a hot week because nobody had agreed a watering rota. The group now plans a shared rota before adding more boxes. The organisers suggest that another street could try a small garden, then review how well it works.',
    tasks: [
      choice('in-r-1', 'Which statement is a reported fact from the article?', ['Every street needs a garden.', 'Twelve households were growing vegetables by July.', 'Gardening is the best hobby.'], 'Twelve households were growing vegetables by July.', 'This is a specific event reported in the text; the other choices are broad opinions.', 'By July, twelve households were growing vegetables there.'),
      fill('in-r-2', 'How many planting boxes did volunteers add? Write a number or word.', ['6', 'six'], 'The article says they added six planting boxes.', 'six planting boxes'),
      choice('in-r-3', 'Why did two boxes dry out?', ['There was no agreed watering rota.', 'The rainwater tank was stolen.', 'Nobody planted vegetables.'], 'There was no agreed watering rota.', 'The text links the drying boxes to a hot week and no agreed watering rota.', 'because nobody had agreed a watering rota'),
      choice('in-r-4', 'What will the group do before adding more boxes?', ['Close the garden', 'Agree a shared rota', 'Move to another street'], 'Agree a shared rota', 'The group plans a shared rota as its next step.', 'plans a shared rota before adding more boxes'),
      choice('in-r-5', 'Which conclusion is best supported?', ['A small trial with a review could help another street decide.', 'All gardens always succeed.', 'Watering plans are unnecessary.'], 'A small trial with a review could help another street decide.', 'The organisers recommend trying a small garden and reviewing it, not assuming guaranteed success.', 'try a small garden, then review how well it works'),
    ],
    recap: 'You checked exact details and kept the conclusion close to the evidence. Look for both benefits and practical limitations.',
  },
  listening: {
    objective: 'Follow a changed plan and ask a precise clarification question.',
    teaching: [
      'A speaker may correct a detail partway through a message. Words such as actually, instead and changed signal that you should update your plan.',
      'A useful clarification question names the missing detail. Repeat the change in your own words, then ask one focused question. Audio and the transcript carry the same information; speaking is optional self-practice.',
    ],
    examples: [{ before: 'A correction', after: 'Actually, meet at three instead of two.' }, { before: 'A focused question', after: 'Which entrance should we use?' }],
    transcript: 'This is Daniel with an update about Friday’s workshop. We originally planned to use the main hall, but it is being repaired. Please come to Room Four upstairs instead. The start time is still half past two. Bring a notebook; we will provide the materials. There is a lift beside reception. I have not yet confirmed when the workshop will finish, so I will send that detail tomorrow.',
    speakingPractice: 'Say: “So we are meeting in Room Four at half past two. Could you confirm the finish time when you know it?” Listen to your own clarity; the website does not analyse your speech.',
    tasks: [
      choice('in-l-1', 'Which part of the plan has changed?', ['The day', 'The room', 'The start time'], 'The room', 'The main hall is replaced by Room Four. The time is still the same.', 'come to Room Four upstairs instead'),
      fill('in-l-2', 'Which room should participants use? Write the number or word.', ['4', 'four', 'Room Four', 'Room 4'], 'The new location is Room Four upstairs.', 'Room Four upstairs'),
      choice('in-l-3', 'What is provided?', ['Notebooks', 'Transport', 'Materials'], 'Materials', 'Participants bring a notebook; the organisers provide materials.', 'we will provide the materials'),
      choice('in-l-4', 'Which detail has not been confirmed?', ['The finish time', 'The new room', 'The location of the lift'], 'The finish time', 'Daniel explicitly says the finish time is not yet confirmed.', 'I have not yet confirmed when the workshop will finish'),
      choice('in-l-5', 'Which follow-up question asks for the missing information?', ['Is the workshop on Friday?', 'What time will the workshop finish?', 'Should we bring a notebook?'], 'What time will the workshop finish?', 'The message already answers the day and notebook questions; the finish time remains unknown.', 'I will send that detail tomorrow'),
    ],
    recap: 'Notice corrections, keep the unchanged details, and ask specifically about what is still unknown.',
  },
  writing: {
    objective: 'Structure a polite email that explains a problem and requests a next step.',
    teaching: [
      'Make a request easy to understand. Use a specific subject, explain the situation briefly, then say what help you need. Include a useful deadline or next step if it is relevant.',
      '“Could you please…” is a polite request. Be direct about the action you need without adding unrelated information. The exercises check controlled sentences; the suggested full email is for self-review.',
    ],
    examples: [{ before: 'Specific subject', after: 'Request for the workshop notes' }, { before: 'Context + request', after: 'I missed Friday’s workshop because I was unwell. Could you please send me the notes?' }],
    tasks: [
      choice('in-w-1', 'Which subject best fits an email asking for workshop notes?', ['Hello!!!', 'Request for Friday’s workshop notes', 'Something'], 'Request for Friday’s workshop notes', 'A specific subject tells the reader the purpose before they open the email.'),
      order('in-w-2', 'Build a polite request.', ['notes?', 'please', 'you', 'send', 'Could', 'the'], 'Could you please send the notes?', 'Could you please + base verb is a polite request pattern.'),
      fill('in-w-3', 'Choose because or although: I missed the workshop ___ I was unwell.', ['because'], 'Being unwell is the reason for missing the workshop.'),
      choice('in-w-4', 'Which sentence gives a useful next step?', ['Everything is terrible.', 'Please send the notes by Thursday so I can prepare.', 'I have many unrelated stories.'], 'Please send the notes by Thursday so I can prepare.', 'This names the action, a deadline and a reason.'),
      choice('in-w-5', 'Choose the clearest order for a short request email.', ['Request → unrelated story → subject', 'Subject → greeting → brief context → request → thanks', 'Thanks → long story → no request'], 'Subject → greeting → brief context → request → thanks', 'This sequence helps the reader understand the purpose and act on the request.'),
    ],
    recap: 'Self-practice: write a short request with a subject, context, clear action and thanks. Model: “Hello, Kim. I missed Friday’s workshop because I was unwell. Could you please send the notes by Thursday so I can prepare? Thank you, Alex.” Compare the structure yourself; free writing is not automatically graded.',
  },
};
export default lessons;
