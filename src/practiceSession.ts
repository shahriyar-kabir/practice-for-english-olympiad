import type { GameMode, GameSession, JourneyProgress } from './journey';

export const MCQ_SET_SIZE = 5;
export const PRACTICE_CONTENT_VERSION = 2;

/** The former deadline never limits a current-version practice session. */
export function preparePracticeSession(key: string, mode: GameMode, saved?: GameSession, now = Date.now()): GameSession {
  if (!saved || saved.key !== key || saved.contentVersion !== PRACTICE_CONTENT_VERSION) return {
    key, contentVersion: PRACTICE_CONTENT_VERSION, startedAt: now,
    index: 0, answers: {}, solved: [], hints: {},
    ...(mode === 'mcq' ? { questionCount: MCQ_SET_SIZE, groupStart: 0 } : {}),
  };
  if (mode !== 'mcq') return { ...saved };
  const index = Math.max(0, Math.min(MCQ_SET_SIZE - 1, saved.index || 0));
  const earlierMissing = Array.from({ length: index }, (_, offset) => offset).find(index => saved.answers[index] === undefined);
  return { ...saved, questionCount: MCQ_SET_SIZE, groupStart: 0, index: earlierMissing ?? index };
}

/** Do not reinterpret old answer strings against replacement questions/clues. */
export function startPractice(journey: JourneyProgress, key: string, mode: GameMode, now = Date.now()) {
  const old = journey.session;
  const retired = !!old && old.contentVersion !== PRACTICE_CONTENT_VERSION;
  const archives = [...(journey.retiredSessions || [])];
  if (retired) {
    const existingIndex = archives.findIndex(item => item.key === old.key && item.startedAt === old.startedAt);
    if (existingIndex === -1) archives.push(old);
    else {
      const previous = archives[existingIndex];
      const hints = { ...previous.hints, ...old.hints };
      for (const id of Object.keys(hints)) hints[id] = [...new Set([...(previous.hints[id] || []), ...(old.hints[id] || [])])];
      archives[existingIndex] = { ...previous, ...old, index: Math.max(previous.index, old.index),
        answers: { ...previous.answers, ...old.answers }, solved: [...new Set([...previous.solved, ...old.solved])], hints };
    }
  }
  return {
    archived: retired,
    journey: {
      ...journey,
      ...(retired ? { retiredSessions: archives } : {}),
      session: preparePracticeSession(key, mode, old, now),
    } satisfies JourneyProgress,
  };
}

export function practiceGroup(session: GameSession) {
  const indices = Array.from({ length: MCQ_SET_SIZE }, (_, index) => index);
  const answered = indices.filter(index => session.answers[index] !== undefined).length;
  return { start: 0, end: MCQ_SET_SIZE, indices, answered, complete: answered === MCQ_SET_SIZE };
}

export function mcqCompletion(session: GameSession, correctAnswers: readonly string[]) {
  const group = practiceGroup(session);
  if (!group.complete || correctAnswers.length !== MCQ_SET_SIZE || session.contentVersion !== PRACTICE_CONTENT_VERSION) return null;
  const correctCount = group.indices.filter(index => session.answers[index] === correctAnswers[index]).length;
  return { score: Math.round(correctCount / MCQ_SET_SIZE * 100), xp: correctCount * 2,
    correctCount, total: MCQ_SET_SIZE, id: `game:${session.key}:${session.startedAt}` };
}
