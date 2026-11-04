import { describe, expect, it } from 'vitest';
import { MCQ_SET_SIZE, PRACTICE_CONTENT_VERSION, mcqCompletion, practiceGroup, preparePracticeSession, startPractice } from './practiceSession';
import type { GameSession, JourneyProgress } from './journey';

const key = 'beginners:mcq:1';
const oldSession = (patch: Partial<GameSession> = {}): GameSession => ({
  key, startedAt: 100, endsAt: 101, index: 0, answers: {}, solved: [], hints: {}, ...patch,
});

describe('untimed short practice sessions', () => {
  it('starts five-question current-content sets without a deadline', () => {
    const session = preparePracticeSession(key, 'mcq', undefined, 1000);
    expect(session.questionCount).toBe(MCQ_SET_SIZE);
    expect(session.contentVersion).toBe(PRACTICE_CONTENT_VERSION);
    expect(session.endsAt).toBeUndefined();
    expect(practiceGroup(session).indices).toEqual([0, 1, 2, 3, 4]);
  });
  it('resumes a current-version expired crossword with its words and hints', () => {
    const saved = oldSession({ contentVersion: 2, key: 'beginners:crossword:1', solved: ['CAT'], hints: { word: [0, 2] } });
    expect(preparePracticeSession(saved.key, 'crossword', saved, 999999)).toEqual(saved);
  });
  it('resumes current-version MCQ answers even after an old deadline passes', () => {
    const saved = oldSession({ contentVersion: 2, questionCount: 5, index: 3, answers: { 0: 'A', 1: 'B', 2: 'C' } });
    const session = preparePracticeSession(key, 'mcq', saved, 999999);
    expect(session.answers).toEqual(saved.answers);
    expect(session.startedAt).toBe(100);
    expect(session.index).toBe(3);
  });
  it('archives all old fifty-question answers rather than grading them against new content', () => {
    const answers = Object.fromEntries(Array.from({ length: 42 }, (_, index) => [index, 'old answer ' + index]));
    const old = oldSession({ index: 42, answers });
    const journey: JourneyProgress = { records: { [key]: { unlocked: 8, completed: 7, xp: 450, bestScore: 90 } },
      session: old, streakRecord: 15, earnedBadges: { badge: '2026-11-01' } };
    const prepared = startPractice(journey, key, 'mcq', 999999);
    expect(prepared.archived).toBe(true);
    expect(prepared.journey.retiredSessions).toEqual([old]);
    expect(prepared.journey.session).toMatchObject({ contentVersion: 2, questionCount: 5, index: 0, answers: {}, startedAt: 999999 });
    expect(prepared.journey.records).toBe(journey.records);
    expect(prepared.journey.streakRecord).toBe(15);
    expect(prepared.journey.earnedBadges).toBe(journey.earnedBadges);
    expect(journey.session).toEqual(old);
  });
  it('archives old crossword solutions and hints before replacing the clues', () => {
    const old = oldSession({ key: 'beginners:crossword:1', solved: ['CAT', 'DOG'], hints: { word: [0, 2] } });
    const next = startPractice({ records: {}, session: old }, old.key, 'crossword');
    expect(next.journey.retiredSessions?.[0]).toEqual(old);
    expect(next.journey.session?.solved).toEqual([]);
    expect(next.journey.session?.hints).toEqual({});
  });
  it('keeps both snapshots when the same old attempt was partially archived on another device', () => {
    const old = oldSession({ answers: { 1: 'second' }, solved: ['DOG'], hints: { word: [2] }, index: 1 });
    const previous = oldSession({ answers: { 0: 'first' }, solved: ['CAT'], hints: { word: [0] } });
    const prepared = startPractice({ records: {}, session: old, retiredSessions: [previous] }, key, 'mcq');
    expect(prepared.journey.retiredSessions).toHaveLength(1);
    expect(prepared.journey.retiredSessions?.[0]).toMatchObject({ answers: { 0: 'first', 1: 'second' }, index: 1 });
    expect(prepared.journey.retiredSessions?.[0].solved).toEqual(['CAT', 'DOG']);
    expect(prepared.journey.retiredSessions?.[0].hints).toEqual({ word: [0, 2] });
  });
  it('never completes a partially answered set or skips an earlier merged gap', () => {
    const session = preparePracticeSession(key, 'mcq');
    session.answers = { 4: 'E' }; session.index = 4;
    expect(mcqCompletion(session, ['A', 'B', 'C', 'D', 'E'])).toBeNull();
    expect(preparePracticeSession(key, 'mcq', session).index).toBe(0);
  });
  it('records manual five-question completion with a stable final-attempt marker', () => {
    const session = preparePracticeSession(key, 'mcq', undefined, 1000);
    session.answers = { 0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'wrong' };
    expect(mcqCompletion(session, ['A', 'B', 'C', 'D', 'E'])).toEqual({
      score: 80, xp: 8, total: 5, correctCount: 4, id: 'game:beginners:mcq:1:1000',
    });
  });
  it('refuses to grade old-content answer strings against current answer keys', () => {
    expect(mcqCompletion(oldSession({ answers: { 0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E' } }), ['A', 'B', 'C', 'D', 'E'])).toBeNull();
  });
});
