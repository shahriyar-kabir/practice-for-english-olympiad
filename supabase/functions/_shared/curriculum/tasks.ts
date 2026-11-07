import type { LessonMeta } from './englishCatalog.ts';
export type AcademyLevel = 'starter' | 'beginner' | 'intermediate' | 'advanced';
export type AcademySkill = 'sounds' | 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing';

type TaskBase = {
  id: string;
  prompt: string;
  explanation: string;
  /** Exact supporting words in the lesson's passage or listening transcript. */
  evidence?: string;
  /** Optional accessible illustrated scene, rendered without external images. */
  visual?: string;
};
export type ChoiceTask = TaskBase & { type: 'choice'; choices: string[]; answer: string };
export type FillTask = TaskBase & { type: 'fill'; answers: string[]; placeholder?: string; caseSensitive?: boolean };
export type OrderTask = TaskBase & { type: 'order'; tokens: string[]; answer: string };
export type MatchTask = TaskBase & { type:'match'; pairs:{left:string;right:string}[]; options:string[]; answer:string };
export type AcademyTask = ChoiceTask | FillTask | OrderTask | MatchTask;
export type AcademyLesson = LessonMeta & {
  objective: string;
  teaching: string[];
  examples: { before: string; after: string }[];
  passage?: string;
  transcript?: string;
  speakingPractice?: string;
  tasks: AcademyTask[];
  recap: string;
};
export type LessonBody = Omit<AcademyLesson, keyof LessonMeta>;
export const choice = (id: string, prompt: string, choices: string[], answer: string, explanation: string, evidence?: string): ChoiceTask =>
  ({ id, type: 'choice', prompt, choices, answer, explanation, ...(evidence ? { evidence } : {}) });
export const fill = (id: string, prompt: string, answers: string[], explanation: string, evidence?: string, caseSensitive = false): FillTask =>
  ({ id, type: 'fill', prompt, answers, explanation, ...(evidence ? { evidence } : {}), ...(caseSensitive ? { caseSensitive } : {}) });
export const order = (id: string, prompt: string, tokens: string[], answer: string, explanation: string, evidence?: string): OrderTask =>
  ({ id, type: 'order', prompt, tokens, answer, explanation, ...(evidence ? { evidence } : {}) });
