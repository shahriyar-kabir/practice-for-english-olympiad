import type { AcademyLevel, AcademySkill } from '../learningTypes';

export type LessonMeta = {
  id: string;
  title: string;
  skill: AcademySkill;
  level: AcademyLevel;
  description: string;
  duration: string;
};

export const levelLabels: Record<AcademyLevel, string> = {
  starter: 'Starter', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced',
};
export const levelDescriptions: Record<AcademyLevel, string> = {
  starter: 'Letters, useful words and your first sentences. A fresh start at any age.',
  beginner: 'Build everyday language for messages, stories and conversations.',
  intermediate: 'Connect ideas, understand details and express your reasons.',
  advanced: 'Read critically and communicate with clarity, precision and purpose.',
};
export const skillLabels: Record<AcademySkill, string> = {
  sounds: 'Letters & sounds', vocabulary: 'Words & spelling', grammar: 'Grammar & sentences',
  reading: 'Reading & understanding', listening: 'Listening & speaking', writing: 'Writing & real life',
};
export const academyLevels = Object.keys(levelLabels) as AcademyLevel[];
export const academySkills = Object.keys(skillLabels) as AcademySkill[];

const entries: Record<AcademyLevel, [string, string][]> = {
  starter: [
    ['Meet the first sounds', 'Connect familiar letters with the beginnings of words.'],
    ['Words around us', 'Name everyday things and build simple words.'],
    ['Build a first sentence', 'Use I, you, is and are in complete sentences.'],
    ['A bag for the day', 'Find people, things and actions in a short story.'],
    ['Hello and thank you', 'Practise a greeting and understand a simple request.'],
    ['A friendly first message', 'Write a name, a greeting and a clear short message.'],
  ],
  beginner: [
    ['Two letters, one sound', 'Explore sh, ch and th, and read useful word pairs.'],
    ['Choose the useful word', 'Use words for places, routines and everyday plans.'],
    ['Today and yesterday', 'Choose verbs that show when something happens.'],
    ['A notice at the library', 'Read opening times, instructions and a small change.'],
    ['Making a simple plan', 'Listen for the time, place and things to bring.'],
    ['Send a helpful invitation', 'Make an invitation with a clear time and place.'],
  ],
  intermediate: [
    ['Listen to the word parts', 'Notice syllables, silent letters and useful endings.'],
    ['Words that work together', 'Choose natural word pairs and clues to meaning.'],
    ['Connect your ideas', 'Link reasons, contrasts and possible results.'],
    ['A greener shared garden', 'Separate facts, reasons and conclusions in a short article.'],
    ['Clarify before you act', 'Check a changed plan and ask a useful follow-up question.'],
    ['A clear request by email', 'Give context, make a polite request and suggest a next step.'],
  ],
  advanced: [
    ['Say what you mean', 'Explore stress, pauses and emphasis for clearer speech.'],
    ['Precise words, fair claims', 'Choose words that express the strength and limits of evidence.'],
    ['Shape a careful argument', 'Use conditionals, concession and precise reference.'],
    ['Read a claim critically', 'Examine evidence, limitations and a justified conclusion.'],
    ['Follow a balanced discussion', 'Identify a recommendation, a concern and the agreed next step.'],
    ['A concise recommendation', 'Organise evidence and propose a practical next step.'],
  ],
};

export const lessonCatalog: readonly LessonMeta[] = academyLevels.flatMap(level =>
  academySkills.map((skill, index) => ({
    id: `${level}-${skill}`, level, skill,
    title: entries[level][index][0], description: entries[level][index][1], duration: '5–8 min',
  })),
);
