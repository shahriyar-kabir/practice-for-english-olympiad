import type { JourneyProgress } from './journey';
import { recordLearningCompletion } from './learningMetrics';
import { finishSubjectRound, readSubjectGame, subjectRoundId } from './subjectGameProgress';

/** One completed round updates the result, calendar, badges and durable ID together. */
export function completeSubjectGame(journey: JourneyProgress, subject: string, attempt: string, now = new Date()): JourneyProgress {
  const progress = readSubjectGame(journey.subjectGames?.[subject]);
  if (progress.session?.id !== attempt || journey.completionIds?.includes(subjectRoundId(subject, attempt))) return journey;
  const finished = finishSubjectRound(progress, now.getTime());
  if (!finished) return journey;
  const { result } = finished;
  return recordLearningCompletion({ ...journey, subjectGames: { ...journey.subjectGames, [subject]: finished.progress } }, {
    id: subjectRoundId(subject, attempt), subject, level: result.level,
    title: `${subject === 'maths' ? 'Maths · Mental Maths Trail' : subject === 'science' ? 'Science · Discovery Trail' : subject} · Level ${result.level}`,
    kind: 'mcq', xp: result.xp, correct: result.correct, total: result.total, completedAt: now.toISOString(),
  }, now);
}
