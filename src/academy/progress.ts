import type { JourneyProgress } from '../journey';
import { recordLearningCompletion } from '../learningMetrics';
import type { LessonResult } from '../learningTypes';
import type { AcademyLesson, AcademyTask } from './types';

export type LessonAnswers = Record<string, string>;
export const MAX_LESSON_XP = 50;
const COMPLETION_XP = 10;

/** Preserve punctuation for the punctuation tasks; tolerate spacing and apostrophe style. */
export function normalizeAnswer(value: string, caseSensitive = false): string {
  const normalized = value.normalize('NFKC').replace(/[‘’]/g, "'").trim().replace(/\s+/g, ' ');
  return caseSensitive ? normalized : normalized.toLocaleLowerCase('en');
}

export function acceptedAnswers(task: AcademyTask): string[] {
  return task.type === 'fill' ? task.answers : task.type === 'match' ? [task.pairs.map(pair=>pair.left+' → '+pair.right).join(' · ')] : [task.answer];
}

export function isTaskCorrect(task: AcademyTask, answer: string | undefined): boolean {
  if (typeof answer !== 'string' || !answer.trim()) return false;
  // A choice must match one of the displayed choices exactly. Case is part of some choices.
  if (task.type === 'choice') return answer === task.answer;
  if (task.type === 'match') { try { const selected=JSON.parse(answer);return Array.isArray(selected)&&selected.length===task.pairs.length&&selected.every((value,index)=>value===task.pairs[index].right); } catch { return false; } }
  const caseSensitive = task.type === 'order' || (task.type === 'fill' && Boolean(task.caseSensitive));
  return acceptedAnswers(task).some(accepted => normalizeAnswer(accepted, caseSensitive) === normalizeAnswer(answer, caseSensitive));
}

export function scoreLesson(lesson: AcademyLesson, answers: LessonAnswers) {
  const total = lesson.tasks.length;
  const correct = lesson.tasks.filter(task => isTaskCorrect(task, answers[task.id])).length;
  const score = total > 0 ? Math.round(correct / total * 100) : 0;
  const xp = total > 0 ? COMPLETION_XP + Math.round((MAX_LESSON_XP - COMPLETION_XP) * correct / total) : 0;
  return { total, correct, score, xp };
}

/** Called once after all answers and explanations have been reviewed. */
export function completeAcademyLesson(
  journey: JourneyProgress,
  lesson: AcademyLesson,
  answers: LessonAnswers,
  completedAt = new Date().toISOString(),
) {
  if (!lesson.tasks.length || lesson.tasks.some(task => !answers[task.id]?.trim())) {
    throw new Error('Answer each practice question before completing the lesson.');
  }
  const completedDate = new Date(completedAt);
  if (!Number.isFinite(completedDate.getTime()) || completedDate.getTime() > Date.now()) {
    throw new Error('This completion time is invalid. Please try again.');
  }
  const attempt = scoreLesson(lesson, answers);
  const previous = journey.academy?.results[lesson.id];
  const previousXP = previous && Number.isFinite(previous.xp) ? Math.min(MAX_LESSON_XP, Math.max(0, previous.xp)) : 0;
  const improves = !previous || attempt.score > previous.score;
  const xp = Math.max(previousXP, attempt.xp);
  const delta = xp - previousXP;
  const result: LessonResult = improves
    ? { ...attempt, xp, completedAt }
    : { ...previous, xp };
  const next: JourneyProgress = {
    ...journey,
    academy: {
      ...journey.academy,
      results: { ...journey.academy?.results, [lesson.id]: result },
      lastLessonId: lesson.id,
    },
  };
  // A real review can count toward an active day; XP still comes only from a best-score improvement.
  const updated = recordLearningCompletion(next, {
    id: `lesson:${lesson.id}:${completedAt}`,
    title: lesson.title,
    kind: 'lesson',
    completedAt,
    xp: delta,
    correct: attempt.correct,
    total: attempt.total,
  });
  return { journey: updated, result, attempt, delta };
}
