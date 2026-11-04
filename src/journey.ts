import type { AcademyProgress, LearningEvent } from './learningTypes';

export type GameMode = 'crossword' | 'mcq';
export type LevelRecord = { unlocked: number; completed: number; bestScore: number; xp: number };
export type GameSession = {
  key: string;
  /** Kept only for compatibility with older saved practice; never expires play. */
  endsAt?: number;
  index: number;
  answers: Record<number, string>; solved: string[];
  hints: Record<string, number[]>; startedAt: number;
  /** New sets have five questions; old sessions retain their original sequence. */
  questionCount?: number;
  groupStart?: number;
  completedGroups?: number[];
  contentVersion?: number;
};
export type JourneyProgress = {
  records: Record<string, LevelRecord>;
  session?: GameSession;
  /** Kept when old practice content is replaced; never interpreted as new answers. */
  retiredSessions?: GameSession[];
  activityDates?: string[];
  academy?: AcademyProgress;
  activityLog?: LearningEvent[];
  earnedBadges?: Record<string, string>;
  streakRecord?: number;
  completionIds?: string[];
};
export const JOURNEY_STORAGE = 'wizpiko-english-journey-v1';
export const emptyJourney = (): JourneyProgress => ({ records: {} });
export function readJourney(): JourneyProgress {
  try {
    const raw = JSON.parse(localStorage.getItem(JOURNEY_STORAGE) || '{}') as JourneyProgress;
    if (!raw || typeof raw !== 'object' || !raw.records || typeof raw.records !== 'object') return emptyJourney();
    return raw;
  } catch { return emptyJourney(); }
}
export function saveJourney(value: JourneyProgress): boolean {
  try { localStorage.setItem(JOURNEY_STORAGE, JSON.stringify(value)); return true; }
  catch { return false; }
}
