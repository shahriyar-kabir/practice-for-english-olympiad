import type { JourneyProgress } from './journey';
import type { LearningEvent, LessonResult } from './learningTypes';
import { dayKey, learningStreak, validActivityDays } from './learnerData';
import { allSubjectGameStats } from './subjectGameProgress';

export const LEARNING_LOG_LIMIT = 240;
export type ClassicLearningStats = { solvedTotal?: number; completedTotal?: number; retiredSolvedTotal?: number; retiredCompletedTotal?: number };

export type LearningAchievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
};

const nonnegative = (value: number | undefined) => Number.isFinite(value) ? Math.max(0, value || 0) : 0;
const count = (value: number | undefined) => Math.floor(nonnegative(value));

function completedEvents(journey: JourneyProgress, now: Date): LearningEvent[] {
  const seen = new Set<string>();
  return (Array.isArray(journey.activityLog) ? journey.activityLog : []).filter(event => {
    if (!event || typeof event.id !== 'string' || !event.id.trim() || seen.has(event.id) ||
        !['lesson', 'crossword', 'mcq', 'classic'].includes(event.kind) ||
        typeof event.completedAt !== 'string' || !Number.isFinite(Date.parse(event.completedAt)) ||
        Date.parse(event.completedAt) > now.getTime()) return false;
    seen.add(event.id);
    return true;
  }).sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt));
}

/** Only completed, internally valid results contribute to dashboard learning metrics. */
export function completedLessonResults(journey: JourneyProgress, now = new Date()): Record<string, LessonResult> {
  return Object.fromEntries(Object.entries(journey.academy?.results || {}).filter(([id, result]) =>
    id.trim() && result && typeof result.completedAt === 'string' &&
    Number.isFinite(Date.parse(result.completedAt)) && Date.parse(result.completedAt) <= now.getTime() &&
    Number.isInteger(result.total) && result.total > 0 && Number.isInteger(result.correct) &&
    result.correct >= 0 && result.correct <= result.total &&
    Number.isFinite(result.score) && result.score >= 0 && result.score <= 100 &&
    Number.isFinite(result.xp) && result.xp >= 0));
}

export function learningSummary(journey: JourneyProgress, now = new Date(), classic: ClassicLearningStats = {}) {
  const lessons = Object.values(completedLessonResults(journey, now));
  const records = Object.values(journey.records || {}).filter(record => record && typeof record === 'object');
  const events = completedEvents(journey, now);
  const lessonXP = lessons.reduce((sum, result) => sum + nonnegative(result.xp), 0);
  const subjectStats = allSubjectGameStats(journey.subjectGames);
  const gameXP = records.reduce((sum, record) => sum + nonnegative(record.xp), 0) + subjectStats.xp;
  const lessonsCompleted = lessons.length;
  const englishGamesCompleted = records.reduce((sum, record) => sum + count(record.completed), 0);
  const classicCompleted = count(classic.completedTotal) + count(classic.retiredCompletedTotal);
  const gamesCompleted = englishGamesCompleted + classicCompleted + subjectStats.practised;
  const dates = validActivityDays([
    ...(Array.isArray(journey.activityDates) ? journey.activityDates : []),
    ...events.map(event => dayKey(new Date(event.completedAt))),
    ...lessons.map(result => dayKey(new Date(result.completedAt))),
  ], now);
  const streak = learningStreak(dates, now);
  streak.longest = Math.max(streak.longest, count(journey.streakRecord));
  return {
    xp: lessonXP + gameXP,
    lessonXP,
    gameXP,
    lessonsCompleted,
    gamesCompleted,
    englishGamesCompleted,
    subjectGamesCompleted: subjectStats.practised,
    subjectLevelsPassed: subjectStats.passed,
    classicCompleted,
    activitiesCompleted: lessonsCompleted + gamesCompleted,
    activeDays: dates.length,
    activityDates: dates,
    streak,
    lastActivity: events[events.length - 1] || null,
  };
}

export function learningAchievements(journey: JourneyProgress, now = new Date(), classic: ClassicLearningStats = {}): LearningAchievement[] {
  const summary = learningSummary(journey, now, classic);
  const events = completedEvents(journey, now);
  const definitions = [
    { id: 'classic-first-word', title: 'First word', description: 'Discover your first word in a Wizpiko word puzzle.', icon: '🔤', done: count(classic.solvedTotal) + count(classic.retiredSolvedTotal) > 0 },
    { id: 'classic-crossword-explorer', title: 'Crossword explorer', description: 'Complete your first Wizpiko word puzzle.', icon: '🧭', done: summary.classicCompleted > 0 },
    { id: 'classic-word-champion', title: 'Word champion', description: 'Complete ten word puzzles.', icon: '👑', done: summary.classicCompleted >= 10 },
    { id: 'first-activity', title: 'First discovery', description: 'Complete your first learning activity.', icon: '✨', done: summary.activitiesCompleted > 0 || events.length > 0 },
    { id: 'first-lesson', title: 'Lesson explorer', description: 'Finish your first English lesson.', icon: '📖', done: summary.lessonsCompleted > 0 },
    { id: 'three-lessons', title: 'Building momentum', description: 'Complete three different English lessons.', icon: '🌱', done: summary.lessonsCompleted >= 3 },
    { id: 'first-game', title: 'Game explorer', description: 'Complete your first learning game.', icon: '🧩', done: summary.gamesCompleted > 0 || events.some(event => event.kind !== 'lesson') },
    { id: 'level-explorer', title: 'Level explorer', description: 'Reach a new challenge level.', icon: '🚀', done: summary.subjectLevelsPassed > 0 || Object.values(journey.records || {}).some(record => record?.unlocked > 1) },
    { id: 'streak-3', title: '3-day spark', description: 'Complete activities on three days in one learning streak.', icon: '🔥', done: summary.streak.longest >= 3 },
    { id: 'streak-7', title: '7-day glow', description: 'Build a learning streak with seven active days.', icon: '🌟', done: summary.streak.longest >= 7 },
    { id: 'streak-14', title: 'Steady explorer', description: 'Build a learning streak with fourteen active days.', icon: '🏅', done: summary.streak.longest >= 14 },
    { id: 'streak-30', title: 'Learning champion', description: 'Build a learning streak with thirty active days.', icon: '🏆', done: summary.streak.longest >= 30 },
    { id: 'xp-100', title: '100 XP', description: 'Earn 100 XP from completed lessons and games.', icon: '⭐', done: summary.xp >= 100 },
    { id: 'xp-500', title: '500 XP', description: 'Earn 500 XP from completed lessons and games.', icon: '🚀', done: summary.xp >= 500 },
    { id: 'xp-1000', title: '1,000 XP', description: 'Earn 1,000 XP from completed lessons and games.', icon: '💎', done: summary.xp >= 1000 },
  ];
  return definitions.map(({ done, ...definition }) => ({
    ...definition,
    earned: done || Boolean(journey.earnedBadges?.[definition.id]),
    earnedAt: journey.earnedBadges?.[definition.id] || null,
  }));
}

/** Call only after an activity is complete and its lesson/game result is merged. */
export function recordLearningCompletion(journey: JourneyProgress, event: LearningEvent, now = new Date()): JourneyProgress {
  if (!event || typeof event.id !== 'string' || !event.id.trim() || typeof event.title !== 'string' || !event.title.trim() ||
      !['lesson', 'crossword', 'mcq', 'classic'].includes(event.kind) ||
      typeof event.completedAt !== 'string' || !Number.isFinite(Date.parse(event.completedAt)) || Date.parse(event.completedAt) > now.getTime() ||
      !Number.isFinite(event.xp) || event.xp < 0 ||
      (event.total !== undefined && (!Number.isInteger(event.total) || event.total <= 0)) ||
      (event.correct !== undefined && (!Number.isInteger(event.correct) || event.correct < 0 || (event.total !== undefined && event.correct > event.total)))) return journey;
  const previousEvents = completedEvents(journey, now);
  const completionIds = new Set([
    ...(Array.isArray(journey.completionIds) ? journey.completionIds.filter(id => typeof id === 'string' && id.trim()) : []),
    ...previousEvents.map(previous => previous.id),
  ]);
  if (completionIds.has(event.id)) return journey;
  completionIds.add(event.id);
  const allEvents = [...previousEvents, event].sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt));
  const next: JourneyProgress = {
    ...journey,
    activityLog: allEvents.slice(-LEARNING_LOG_LIMIT),
    // The display log is bounded; completion IDs and calendar history remain durable.
    completionIds: [...completionIds],
    activityDates: validActivityDays([...(Array.isArray(journey.activityDates) ? journey.activityDates : []), dayKey(new Date(event.completedAt))], now),
  };
  const summary = learningSummary(next, now);
  next.streakRecord = Math.max(count(journey.streakRecord), summary.streak.longest);
  const earnedBadges = { ...journey.earnedBadges };
  for (const achievement of learningAchievements(next, now)) {
    if (achievement.earned && !earnedBadges[achievement.id]) earnedBadges[achievement.id] = event.completedAt;
  }
  next.earnedBadges = earnedBadges;
  return next;
}
