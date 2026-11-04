import { describe, expect, it } from 'vitest';
import type { JourneyProgress } from './EnglishJourney';
import type { LearningEvent } from './learningTypes';
import { LEARNING_LOG_LIMIT, learningAchievements, learningSummary, recordLearningCompletion } from './learningMetrics';

const now = new Date(2026, 10, 3, 12);
const completion = (id: string, day = '2026-11-03'): LearningEvent => ({ id, title: 'A real completed crossword', kind: 'crossword', completedAt: new Date(day + 'T10:00:00').toISOString(), xp: 25, correct: 8, total: 10 });

describe('Actual learning metrics and durable achievements', () => {
  it('keeps earlier collection completions and earned word milestones after content replacement', () => {
    const journey = { records: {} };
    const history = { solvedTotal: 0, completedTotal: 0, retiredSolvedTotal: 110, retiredCompletedTotal: 10 };
    const summary = learningSummary(journey, new Date('2026-11-04'), history);
    expect(summary.activitiesCompleted).toBe(10);
    expect(summary.gamesCompleted).toBe(10);
    const badges = learningAchievements(journey, new Date('2026-11-04'), history);
    expect(badges.filter(badge => ['classic-first-word','classic-crossword-explorer','classic-word-champion'].includes(badge.id)).every(badge => badge.earned)).toBe(true);
    expect(summary.xp).toBe(0);
  });

  it('sums saved lesson and game XP once, without adding activity-event XP', () => {
    const journey: JourneyProgress = {
      records: { 'kids:mcq': { completed: 2, unlocked: 3, bestScore: 80, xp: 70 } },
      academy: { results: { first: { correct: 3, total: 4, score: 75, xp: 30, completedAt: '2026-11-01T10:00:00Z' } } },
      activityLog: [completion('game')],
    };
    expect(learningSummary(journey, now)).toMatchObject({ xp: 100, gameXP: 70, lessonXP: 30, lessonsCompleted: 1, gamesCompleted: 2, activitiesCompleted: 3 });
  });
  it('does not count an unfinished session, unlocked levels, or empty lesson result as completion', () => {
    const journey: JourneyProgress = { records: { game: { completed: 0, unlocked: 1, bestScore: 0, xp: 0 } }, session: { key: 'game', endsAt: now.getTime() + 1000, startedAt: now.getTime(), index: 1, answers: { 0: 'CAT' }, solved: [], hints: {} }, academy: { results: { empty: { score: 0, correct: 0, total: 0, xp: 0, completedAt: now.toISOString() } } } };
    expect(learningSummary(journey, now)).toMatchObject({ activitiesCompleted: 0, xp: 0, activeDays: 0, streak: { current: 0 } });
    expect(learningAchievements(journey, now).every(badge => !badge.earned)).toBe(true);
  });
  it('excludes future or invalid lesson results from scores, XP and completion counts', () => {
    const result = { correct: 3, total: 4, score: 75, xp: 30, completedAt: now.toISOString() };
    const journey: JourneyProgress = { records: {}, academy: { results: {
      valid: result,
      future: { ...result, completedAt: '2999-01-01T10:00:00Z' },
      impossible: { ...result, correct: 8, score: 200 },
      invalidXP: { ...result, xp: -5 },
    } } };
    expect(learningSummary(journey, now)).toMatchObject({ lessonsCompleted: 1, lessonXP: 30, activitiesCompleted: 1 });
  });
  it('records a completed activity once and leaves its existing result XP unchanged', () => {
    const original: JourneyProgress = { records: { game: { completed: 1, unlocked: 2, bestScore: 80, xp: 25 } } };
    const next = recordLearningCompletion(original, completion('attempt-1'), now);
    expect(next.activityLog).toHaveLength(1);
    expect(next.activityDates).toEqual(['2026-11-03']);
    expect(next.streakRecord).toBe(1);
    expect(next.earnedBadges?.['first-activity']).toBe(completion('attempt-1').completedAt);
    expect(learningSummary(next, now).xp).toBe(25);
    expect(recordLearningCompletion(next, completion('attempt-1'), now)).toBe(next);
    expect(original.activityLog).toBeUndefined();
  });
  it('keeps longest streak and earned milestones after the current streak resets', () => {
    let journey: JourneyProgress = { records: {} };
    for (const day of ['2026-10-20', '2026-10-23', '2026-10-24']) journey = recordLearningCompletion(journey, completion(day, day), now);
    expect(journey.streakRecord).toBe(3);
    expect(journey.earnedBadges?.['streak-3']).toBeTruthy();
    journey = recordLearningCompletion(journey, completion('new-run'), now);
    expect(learningSummary(journey, now).streak).toMatchObject({ current: 1, longest: 3 });
    expect(learningAchievements(journey, now).find(badge => badge.id === 'streak-3')).toMatchObject({ earned: true, earnedAt: '2026-10-24T10:00:00.000Z' });
  });
  it('retains recorded badges when progress data is smaller after a restore', () => {
    const journey: JourneyProgress = { records: {}, streakRecord: 30, earnedBadges: { 'xp-500': '2026-09-01T12:00:00Z', retired: '2026-09-02T12:00:00Z' } };
    const next = recordLearningCompletion(journey, completion('new'), now);
    expect(next.earnedBadges?.['xp-500']).toBe('2026-09-01T12:00:00Z');
    expect(next.earnedBadges?.retired).toBe('2026-09-02T12:00:00Z');
    expect(learningSummary(next, now).streak.longest).toBe(30);
    expect(learningAchievements(next, now).find(badge => badge.id === 'xp-500')?.earned).toBe(true);
  });
  it('bounds the recent activity log without discarding historical streak records', () => {
    const activityLog = Array.from({ length: LEARNING_LOG_LIMIT }, (_, index) => completion('old-' + index));
    const next = recordLearningCompletion({ records: {}, activityLog, streakRecord: 40 }, completion('new'), now);
    expect(next.activityLog).toHaveLength(LEARNING_LOG_LIMIT);
    expect(next.activityLog?.at(-1)?.id).toBe('new');
    expect(next.streakRecord).toBe(40);
    expect(next.completionIds).toHaveLength(LEARNING_LOG_LIMIT + 1);
    expect(recordLearningCompletion(next, completion('old-0'), now)).toBe(next);
  });
  it('rejects a duplicate completion after it has left the recent log and after a restore', () => {
    const journey: JourneyProgress = { records: {}, completionIds: ['historic-attempt'], activityLog: [completion('recent-attempt')] };
    expect(recordLearningCompletion(journey, completion('historic-attempt'), now)).toBe(journey);
    const next = recordLearningCompletion(journey, completion('new-attempt'), now);
    expect(next.completionIds).toEqual(['historic-attempt', 'recent-attempt', 'new-attempt']);
  });
  it('includes actual original crossword completions and retains the original milestones', () => {
    const journey: JourneyProgress = { records: { game: { completed: 2, unlocked: 3, bestScore: 90, xp: 40 } } };
    expect(learningSummary(journey, now, { completedTotal: 3 })).toMatchObject({ gamesCompleted: 5, englishGamesCompleted: 2, classicCompleted: 3, activitiesCompleted: 5, xp: 40 });
    const original = learningAchievements(journey, now, { solvedTotal: 1, completedTotal: 1 }).filter(badge => badge.id.startsWith('classic-'));
    expect(original.map(badge => [badge.title, badge.earned])).toEqual([['First word', true], ['Crossword explorer', true], ['Word champion', false]]);
    expect(learningAchievements(journey, now, { completedTotal: 10 }).find(badge => badge.title === 'Word champion')?.earned).toBe(true);
  });
  it('retains all completed calendar days beyond the recent activity window', () => {
    const activityDates = Array.from({ length: 400 }, (_, index) => {
      const date = new Date(2025, 0, 1 + index, 12);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    });
    const next = recordLearningCompletion({ records: {}, activityDates }, completion('today'), now);
    expect(next.activityDates).toHaveLength(401);
    expect(learningSummary(next, now).activeDays).toBe(401);
  });
  it('rejects invalid, future, and empty completions without unlocking a day or badge', () => {
    const original: JourneyProgress = { records: {} };
    for (const invalid of [
      { ...completion('bad-time'), completedAt: 'not a date' },
      { ...completion('future'), completedAt: '2999-01-01T10:00:00Z' },
      { ...completion('empty'), total: 0, correct: 0 },
      { ...completion('bad-score'), correct: 11 },
      { ...completion('bad-xp'), xp: -1 },
    ]) expect(recordLearningCompletion(original, invalid, now)).toBe(original);
  });
  it('counts zero-correct completed attempts, rather than requiring a perfect score', () => {
    const next = recordLearningCompletion({ records: {} }, { ...completion('completed-low-score'), correct: 0 }, now);
    expect(next.activityDates).toEqual(['2026-11-03']);
    expect(next.earnedBadges?.['first-game']).toBeTruthy();
  });
});
