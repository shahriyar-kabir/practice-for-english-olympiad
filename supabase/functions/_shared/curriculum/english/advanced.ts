import { extendEnglish } from '../extend.ts';
import { extra, references } from './advancedExtra.ts';
import { choice, fill, order } from '../tasks.ts';
import type { LessonBody } from '../tasks.ts';

const lessons: Record<string, LessonBody> = {
  sounds: {
    objective: 'Use stress, meaningful pauses and emphasis to make an intended meaning clearer.',
    teaching: [
      'English speech groups words into meaningful chunks. A short pause can help listeners follow a contrast or a list. Strong emphasis can draw attention to a correction: “I asked for the BLUE folder” contrasts blue with another colour.',
      'Some words change stress with their grammatical role. In many standard accents, the noun record stresses the first syllable (REcord), while the verb stresses the second (reCORD). Accent differences are normal; clarity and intended meaning matter more than copying one accent.',
    ],
    examples: [{ before: 'A correction', after: 'We need the BLUE folder, not the green one.' }, { before: 'Noun and verb', after: 'Keep a REcord. Please reCORD the result.' }],
    tasks: [
      choice('ad-s-1', '“I asked for the BLUE folder.” What is the emphasis most likely correcting?', ['The colour', 'The number of folders', 'The time of the request'], 'The colour', 'Emphasising blue contrasts that colour with a different one.'),
      choice('ad-s-2', 'In “Keep a record”, which stress pattern is common for the noun?', ['reCORD', 'REcord', 'Both syllables must always be unstressed'], 'REcord', 'The noun commonly stresses the first syllable. Pronunciation can vary by accent.'),
      choice('ad-s-3', 'In “Please record the result”, which stress pattern is common for the verb?', ['REcord', 'Neither syllable', 'reCORD'], 'reCORD', 'The verb commonly stresses the second syllable.'),
      choice('ad-s-4', 'Which marked pause best separates the two sides of a contrast? A slash shows the pause.', ['The plan is simple / but it needs careful timing.', 'The / plan is simple but it needs careful timing.', 'The plan is simple but it needs / careful timing.'], 'The plan is simple / but it needs careful timing.', 'A pause before but helps signal the contrast between simplicity and careful timing.'),
      fill('ad-s-5', 'To correct “borrowed” in “I bought the book, not borrowed it”, which verb should you emphasise? Write one word.', ['bought'], 'Emphasise bought to make the contrast with borrowed clear.'),
    ],
    recap: 'Self-practice: read the examples aloud with the marked emphasis. Try a different emphasis and notice how the intended contrast changes. Your voice is not recorded or graded.',
  },
  vocabulary: {
    objective: 'Select precise language that matches the strength and limits of evidence.',
    teaching: [
      'Words express degrees of certainty. Suggests is cautious; proves is much stronger. A small survey may suggest a pattern without proving that it applies to everyone.',
      'Precision also means choosing the right relationship. Correlation means two things vary together; it does not by itself establish that one caused the other. Replace vague claims with specific quantities, groups and limits when those details are known.',
    ],
    examples: [{ before: 'Too strong for a small survey', after: 'The survey suggests a preference among these respondents.' }, { before: 'More precise', after: '18 of the 30 respondents preferred the earlier session.' }],
    tasks: [
      choice('ad-v-1', 'A survey of ten volunteers found a preference. Which verb is most appropriately cautious?', ['Proves', 'Guarantees', 'Suggests'], 'Suggests', 'A small volunteer sample can suggest a pattern, but cannot guarantee a universal conclusion.'),
      fill('ad-v-2', 'Complete: Two things changing together shows correlation, not necessarily ___. Use causation or certainty.', ['causation'], 'Correlation alone does not establish that one factor causes the other.'),
      choice('ad-v-3', 'Which wording is most precise?', ['Everyone loved it.', '18 of 30 respondents preferred the earlier session.', 'People sort of liked things.'], '18 of 30 respondents preferred the earlier session.', 'This gives a count, a defined group and a specific preference.'),
      choice('ad-v-4', 'A result is preliminary. What does preliminary mean?', ['Final and beyond question', 'Early and subject to further checking', 'Intentionally false'], 'Early and subject to further checking', 'Preliminary findings come before a fuller investigation or final decision.'),
      choice('ad-v-5', 'Which revision avoids overstating “This method always works”?', ['This method can work in the conditions tested.', 'This method never fails anywhere.', 'This method guarantees success for everyone.'], 'This method can work in the conditions tested.', 'Can and the stated limit keep the claim close to the evidence.'),
    ],
    recap: 'Match certainty to evidence. Prefer precise counts and defined groups, and distinguish association from cause.',
  },
  grammar: {
    objective: 'Use concession, hypothetical conditions and clear reference in an argument.',
    teaching: [
      'Concession recognises a point before qualifying it: “Although the trial was small, the findings are useful.” For a hypothetical present or future situation, a common pattern is if + past simple, then would + base verb.',
      'A pronoun should have a clear reference. If “it” could refer to two different things, repeat the intended noun. Keep comparisons parallel so readers can see exactly what is being compared.',
    ],
    examples: [{ before: 'Hypothetical condition', after: 'If we had more time, we would test another option.' }, { before: 'Clear reference', after: 'The report compares the two plans. The cheaper plan needs more staff.' }],
    tasks: [
      choice('ad-g-1', 'Choose the conventional hypothetical form.', ['If we have more time, we would tested it.', 'If we had more time, we would test it.', 'If we would have time, we tested it.'], 'If we had more time, we would test it.', 'Use past simple in the if part and would plus the base verb in the result.'),
      fill('ad-g-2', 'Choose although or because: ___ the sample was small, the results offered a useful starting point.', ['Although'], 'Although acknowledges a limitation while allowing a useful result.'),
      choice('ad-g-3', '“The tutor discussed the report with the assistant after she arrived.” Which revision makes the intended reference to the assistant clear?', ['The tutor discussed it after she arrived.', 'After the assistant arrived, the tutor discussed the report with her.', 'After she arrived, it was discussed with her.'], 'After the assistant arrived, the tutor discussed the report with her.', 'Naming the assistant in the arrival clause removes the uncertainty about who arrived.'),
      order('ad-g-4', 'Build a concise contrast sentence.', ['limited.', 'useful,', 'evidence', 'but', 'is', 'The'], 'The evidence is useful, but limited.', 'But links a useful quality with its limitation in one clear sentence.'),
      choice('ad-g-5', 'Which comparison is grammatically parallel?', ['The task requires planning carefully and to check results.', 'The task requires careful planning and thorough checking.', 'The task requires to plan and checking.'], 'The task requires careful planning and thorough checking.', 'Planning and checking use matching noun forms, making the comparison easier to follow.'),
    ],
    recap: 'A careful argument can acknowledge a limitation, explore a hypothetical situation and keep every reference clear.',
  },
  reading: {
    objective: 'Evaluate a short claim by checking the study design, limitations and justified next step.',
    teaching: [
      'Critical reading asks who took part, what was measured and what comparisons were made. A positive result may be useful while still leaving important questions unanswered.',
      'Distinguish what the evidence shows from what the writer recommends. A limited trial can justify a larger comparison without proving that an intervention caused the improvement.',
    ],
    examples: [{ before: 'A limitation', after: 'Participants volunteered, so the group may not represent everyone.' }, { before: 'A proportionate next step', after: 'Test with a larger comparison group.' }],
    passage: 'A community centre tested a ten-minute reading session before its evening workshops. Thirty volunteers took part for four weeks. Twenty-two reported that they found it easier to concentrate afterwards. However, there was no comparison group, and concentration was measured only through participants’ own reports. The organiser described the result as promising, but said it did not establish that reading caused the improvement. She recommended a larger trial that compares similar groups and includes an independent concentration task before changing every workshop.',
    tasks: [
      choice('ad-r-1', 'What outcome was actually measured?', ['Participants’ own reports of concentration', 'Exam scores measured by an independent team', 'Everyone’s long-term reading ability'], 'Participants’ own reports of concentration', 'The article says concentration was measured only through self-reports.', 'measured only through participants’ own reports'),
      fill('ad-r-2', 'How many volunteers reported easier concentration? Write a number or words.', ['22', 'twenty-two', 'twenty two'], 'Twenty-two of the thirty volunteers reported the improvement.', 'Twenty-two reported'),
      choice('ad-r-3', 'Which limitation makes a causal claim especially difficult?', ['The session lasted ten minutes.', 'There was no comparison group.', 'The centre held evening workshops.'], 'There was no comparison group.', 'Without a comparable group that did not receive the session, other explanations remain possible.', 'there was no comparison group'),
      choice('ad-r-4', 'Which conclusion is justified?', ['Reading definitely improves concentration for everyone.', 'The self-reports are promising but do not establish cause.', 'The trial proves reading has no effect.'], 'The self-reports are promising but do not establish cause.', 'The organiser explicitly distinguishes a promising result from proof of causation.', 'it did not establish that reading caused the improvement'),
      choice('ad-r-5', 'What next step does the organiser recommend?', ['Change every workshop immediately.', 'Stop collecting evidence.', 'Run a larger comparison trial with an independent task.'], 'Run a larger comparison trial with an independent task.', 'The proposed next trial addresses the lack of comparison and reliance on self-report.', 'a larger trial that compares similar groups and includes an independent concentration task'),
    ],
    recap: 'You separated a reported improvement from proof of cause, identified design limits and selected a proportionate next step.',
  },
  listening: {
    objective: 'Follow a discussion by separating a proposal, a concern and an agreed decision.',
    teaching: [
      'In a discussion, speakers may support the same goal but disagree about how to achieve it. Listen for proposals, reasons, concerns and the final agreement rather than treating every suggestion as a decision.',
      'A useful spoken summary gives the agreed action, the person responsible and the review point. You can replay the synthetic audio or read the transcript; your own summary is optional and is not automatically graded.',
    ],
    examples: [{ before: 'Proposal versus decision', after: '“We could extend hours” is a suggestion; “We agreed to try Fridays” is a decision.' }, { before: 'Useful summary', after: 'Jo will check the rota, and we will review attendance after a month.' }],
    transcript: 'Priya: We could open the study room every evening to help people who work during the day. Omar: I support longer access, but we do not yet have enough volunteers for every evening. Could we start with Fridays? Priya: That is a reasonable trial. Let us open until eight on Fridays for one month. Omar: Agreed. I will check the volunteer rota this week. Priya: Then we will review attendance and volunteer feedback before deciding whether to add another evening.',
    speakingPractice: 'Summarise aloud in two sentences. Model: “The team agreed to open until eight on Fridays for a month. Omar will check the rota, and they will review attendance and volunteer feedback before expanding.” Compare the action, person and review point yourself.',
    tasks: [
      choice('ad-l-1', 'What is Priya’s original proposal?', ['Close the room earlier.', 'Open the study room every evening.', 'Open only on Fridays forever.'], 'Open the study room every evening.', 'Her first suggestion is every evening; the final trial is narrower.', 'open the study room every evening'),
      choice('ad-l-2', 'What concern does Omar raise?', ['The room has no books.', 'People do not work in the daytime.', 'There are not enough volunteers for every evening.'], 'There are not enough volunteers for every evening.', 'Omar supports longer access but names volunteer availability as the constraint.', 'we do not yet have enough volunteers for every evening'),
      fill('ad-l-3', 'On which day will the trial run?', ['Friday', 'Fridays'], 'They agree on Fridays for one month, until eight.', 'until eight on Fridays for one month'),
      choice('ad-l-4', 'Who will check the volunteer rota?', ['Priya', 'Omar', 'No one is assigned'], 'Omar', 'Omar says he will check the rota this week.', 'Omar: Agreed. I will check the volunteer rota this week.'),
      choice('ad-l-5', 'What will inform the decision about another evening?', ['Only the original suggestion', 'Attendance and volunteer feedback', 'An automatic daily expansion'], 'Attendance and volunteer feedback', 'The team will review both attendance and volunteer feedback before expanding.', 'review attendance and volunteer feedback'),
    ],
    recap: 'Track how a proposal becomes a practical trial. A clear summary preserves the decision, responsibility and review point.',
  },
  writing: {
    objective: 'Build a concise recommendation that connects evidence, a limitation and an action.',
    teaching: [
      'A useful recommendation names the decision, gives relevant evidence and recognises a limitation. Then it proposes a feasible action and says how success will be reviewed.',
      'Prefer a specific, proportionate claim to an absolute promise. Remove repeated ideas and vague openings. These tasks check editing decisions and controlled sentences; a longer recommendation needs human review.',
    ],
    examples: [{ before: 'Vague', after: 'Replace “It is my opinion that perhaps we should do a thing” with “I recommend a one-month trial.”' }, { before: 'Evidence + action', after: 'Requests increased, but staffing is limited. Trial one extra evening, then review attendance and costs.' }],
    tasks: [
      choice('ad-w-1', 'Which opening states a recommendation most directly?', ['There are many things in the world.', 'I recommend a one-month trial of Friday evening opening.', 'It may be interesting to perhaps think about something.'], 'I recommend a one-month trial of Friday evening opening.', 'This identifies the action, day and trial length immediately.'),
      choice('ad-w-2', 'Which evidence is most relevant to a proposal for later opening?', ['The walls are painted blue.', 'Sixteen recent requests asked for access after six.', 'The building has a long name.'], 'Sixteen recent requests asked for access after six.', 'Requests for later access directly relate to the proposed opening time.'),
      fill('ad-w-3', 'Choose however or therefore: Demand has increased. ___, staffing remains limited.', ['However'], 'However introduces a limitation that contrasts with increased demand.'),
      order('ad-w-4', 'Build a practical review step.', ['one', 'Review', 'after', 'attendance', 'month.'], 'Review attendance after one month.', 'A specific review measure and time make the trial easier to evaluate.'),
      choice('ad-w-5', 'Which final sentence is proportionate to a small trial?', ['This guarantees success for every centre.', 'If attendance and staffing support it, consider another evening.', 'Expand everywhere regardless of the results.'], 'If attendance and staffing support it, consider another evening.', 'Expansion depends on relevant evidence rather than an unsupported guarantee.'),
    ],
    recap: 'Self-practice: write 80–120 words recommending a small improvement. Include evidence, a limitation, an action and a review point. Model: “I recommend opening until eight on Fridays for one month. Sixteen recent requests asked for access after six. However, volunteer staffing remains limited. Trial one additional evening and review attendance, costs and volunteer feedback after the month. If the results support it, consider another evening.” Use the checklist yourself; no automatic essay grade is given.',
  },
};
for (const skill of Object.keys(lessons)) {
  const short = ({ sounds: 's', vocabulary: 'v', grammar: 'g', reading: 'r', listening: 'l', writing: 'w' } as Record<string, string>)[skill];
  lessons[skill] = extendEnglish(lessons[skill], 'ad-' + short, extra[skill], references[skill as keyof typeof references]);
}
export default lessons;
