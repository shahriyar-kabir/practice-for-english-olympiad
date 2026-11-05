import { choice, fill } from './tasks.ts';
import type { AcademyTask, LessonBody } from './tasks.ts';

export type PracticeRow = [prompt: string, answer: string, wrongA: string, wrongB: string, explanation: string, evidence?: string];
/** Original teaching is retained; each skill gains fifteen distinct, authored tasks. */
export function extendEnglish(lesson: LessonBody, prefix: string, rows: PracticeRow[], referencePrefix?: string): LessonBody {
  if (rows.length !== 15) throw new Error('Every expanded skill needs fifteen additional questions.');
  const tasks: AcademyTask[] = rows.map(([prompt, answer, wrongA, wrongB, explanation, evidence], index) => {
    const id = `${prefix}-${index + 6}`;
    if (index % 5 === 4) return fill(id, prompt + ' Type your answer.', [answer], explanation, evidence);
    const options = [answer, wrongA, wrongB];
    const rotation = index % 3;
    return choice(id, prompt, [...options.slice(rotation), ...options.slice(0, rotation)], answer, explanation, evidence);
  });
  return { ...lesson, tasks: [...lesson.tasks, ...tasks],
    ...(referencePrefix && lesson.passage ? { passage: referencePrefix + '\n\n' + lesson.passage } : {}),
    ...(referencePrefix && lesson.transcript ? { transcript: referencePrefix + '\n\n' + lesson.transcript } : {}),
  };
}
