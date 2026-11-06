import { describe, expect, it } from 'vitest';
import { makeMentalRound } from './mathsMental';
import { advanceSubjectRound, answerSubjectRound, compareGameLevels, finishSubjectRound, formatGameLevel, gameLevel, mergeSubjectGames, nextGameLevel, readSubjectGame, startSubjectRound, subjectGameStats, subjectRoundId } from './subjectGameProgress';
import { completeSubjectGame } from './subjectGameLearning';
import { learningAchievements, learningSummary } from './learningMetrics';
import { mergeJourney } from './cloudAccount';
import type { JourneyProgress } from './journey';

const now = new Date('2026-11-04T12:00:00Z');
function attempt(level = '1', correct = 5, id = 'round-one') {
  let progress = startSubjectRound(undefined, level, makeMentalRound(level, id), now.getTime() - 1000, id);
  for (let index = 0; index < 5; index++) {
    const q = progress.session!.questions[index];
    progress = answerSubjectRound(progress, index < correct ? q.answer : q.choices.find(c => c !== q.answer)!, now.getTime());
    if (index < 4) progress = advanceSubjectRound(progress, now.getTime());
  }
  return progress;
}

describe('Maths and future subject game progress', () => {
  it('increments decimal level strings beyond the numeric precision limit', () => {
    expect(nextGameLevel('9007199254740992')).toBe('9007199254740993');
    expect(nextGameLevel('999999999999999999999999')).toBe('1000000000000000000000000');
    expect(compareGameLevels('9007199254740993', '9007199254740992')).toBe(1);
    expect(formatGameLevel('12345678901234567890')).toBe('12,345,678,901,234,567,890');
    expect(gameLevel('00017')).toBe('17');
    for (const invalid of [0, -1, 1.2, Infinity, '1e9', null, '__proto__']) expect(gameLevel(invalid)).toBe('1');
  });
  it('does not award progress or XP for a newly opened or unfinished round', () => {
    const progress = startSubjectRound(undefined, '101', makeMentalRound('101', 'start'));
    expect(finishSubjectRound(progress)).toBeNull();
    expect(subjectGameStats(progress)).toMatchObject({ practised: 0, passed: 0, xp: 0, level: '101' });
  });
  it('locks each checked answer, rejects invalid choices and advances to an unanswered question', () => {
    const progress = startSubjectRound(undefined, '1', makeMentalRound('1', 'start'));
    expect(answerSubjectRound(progress, 'not a choice')).toBe(progress);
    const answered = answerSubjectRound(progress, progress.session!.questions[0].answer);
    expect(answerSubjectRound(answered, answered.session!.questions[0].choices[0])).toBe(answered);
    expect(advanceSubjectRound(answered).session?.index).toBe(1);
  });
  it.each([0, 3, 4, 5])('uses 4 of 5 to advance and keeps a %s-correct completed round', correct => {
    const finished = finishSubjectRound(attempt('1', correct), now.getTime())!;
    expect(finished.result).toMatchObject({ correct, total: 5, xp: correct * 2, passed: correct >= 4 });
    expect(finished.progress.level).toBe(correct >= 4 ? '2' : '1');
    expect(finished.progress.session).toBeUndefined();
    expect(subjectGameStats(finished.progress).practised).toBe(1);
  });
  it('awards only best-score improvements on replay and preserves the stronger result', () => {
    const initial = finishSubjectRound(attempt('16', 4))!.progress;
    const better = finishSubjectRound({ ...attempt('16', 5, 'better'), best: initial.best })!;
    expect(better.result.xp).toBe(2);
    const lower = finishSubjectRound({ ...attempt('16', 1, 'lower'), best: better.progress.best })!;
    expect(lower.result.xp).toBe(0);
    expect(subjectGameStats(lower.progress)).toMatchObject({ xp: 10, practised: 1, passed: 1 });
  });
  it('resumes exact questions, answers and hints after two days without an expiry', () => {
    let progress = startSubjectRound(undefined, '51', makeMentalRound('51', 'saved'), now.getTime() - 172800000, 'saved');
    progress = answerSubjectRound(progress, progress.session!.questions[0].answer);
    progress.session!.hints = [0];
    const restored = readSubjectGame(JSON.parse(JSON.stringify(progress)));
    const resumed = startSubjectRound(restored, '51', makeMentalRound('51', 'new'));
    expect(resumed.session).toEqual(restored.session);
    expect(resumed.session?.answers[0]).toBe(progress.session?.questions[0].answer);
    expect(resumed.session).not.toHaveProperty('endsAt');
  });
  it('rejects malformed saved questions, choices and out-of-range results', () => {
    const progress = attempt();
    const malformed = JSON.parse(JSON.stringify(progress));
    malformed.session.questions[0].choices = ['same', 'same'];
    malformed.best = { 0: 5, 1: 7, 2: -1, 3: 2.5, 4: 5 };
    expect(readSubjectGame(malformed).session).toBeUndefined();
    expect(readSubjectGame(malformed).best).toEqual({ 4: 5 });
  });
  it('merges best results and same-attempt answers without mixing subjects or English drafts', () => {
    const round = attempt('51', 4);
    const left = { ...round, best: { '1': 3, '51': 4 }, session: { ...round.session!, answers: { 0: round.session!.answers[0] }, hints: [0], updatedAt: 100 } };
    const right = { ...round, best: { '1': 5, '16': 5 }, session: { ...round.session!, answers: { 1: round.session!.answers[1] }, hints: [1], updatedAt: 200 } };
    const english = { key: 'beginners:mcq:1', startedAt: 7, index: 1, answers: { 0: 'word' }, solved: [], hints: {} };
    const merged = mergeJourney({ records: {}, session: english, subjectGames: { maths: left } }, { records: {}, subjectGames: { maths: right, physics: readSubjectGame(undefined) } });
    expect(merged.session).toEqual(english);
    expect(merged.subjectGames?.maths.best).toEqual({ '1': 5, '16': 5, '51': 4 });
    expect(merged.subjectGames?.maths.session?.answers).toEqual({ 0: round.session!.answers[0], 1: round.session!.answers[1] });
    expect(merged.subjectGames?.maths.session?.hints).toEqual([0, 1]);
    expect(merged.subjectGames).toHaveProperty('physics');
  });
  it('cannot resurrect a completed draft from a stale offline device', () => {
    const stale = attempt();
    const finished = completeSubjectGame({ records: {}, subjectGames: { maths: stale } }, 'maths', 'round-one', now);
    const merged = mergeJourney({ records: {}, subjectGames: { maths: stale } }, finished);
    expect(merged.subjectGames?.maths.session).toBeUndefined();
    expect(subjectGameStats(merged.subjectGames?.maths)).toMatchObject({ xp: 10, passed: 1 });
  });
  it('records one completed round, awards shared badges and retains grace days and English XP', () => {
    const original: JourneyProgress = { records: { 'english:mcq': { completed: 1, unlocked: 2, bestScore: 80, xp: 20 } }, activityDates: ['2026-11-01'], subjectGames: { maths: attempt() } };
    const finished = completeSubjectGame(original, 'maths', 'round-one', now);
    expect(finished.activityLog).toHaveLength(1);
    expect(finished.activityLog?.[0]).toMatchObject({ subject: 'maths', level: '1', correct: 5, total: 5, xp: 10 });
    expect(finished.completionIds).toContain(subjectRoundId('maths', 'round-one'));
    expect(completeSubjectGame(finished, 'maths', 'round-one', now)).toBe(finished);
    expect(learningSummary(finished, now)).toMatchObject({ xp: 30, englishGamesCompleted: 1, subjectGamesCompleted: 1, activitiesCompleted: 2, streak: { current: 2 } });
    expect(learningAchievements(finished, now).find(b => b.id === 'level-explorer')?.earned).toBe(true);
    expect(learningSummary(finished, new Date('2026-11-06T12:00:00Z')).streak).toMatchObject({ current: 2, paused: true });
  });
  it('does not double Maths XP when two devices finish the same level', () => {
    const a = completeSubjectGame({ records: {}, subjectGames: { maths: attempt('1', 5, 'a') } }, 'maths', 'a', now);
    const b = completeSubjectGame({ records: {}, subjectGames: { maths: attempt('1', 4, 'b') } }, 'maths', 'b', now);
    const merged = mergeJourney(a, b);
    expect(learningSummary(merged, now)).toMatchObject({ xp: 10, subjectGamesCompleted: 1, subjectLevelsPassed: 1 });
  });
  it('keeps different subject rounds separate and filters unsafe subject keys', () => {
    const raw = JSON.parse('{"__proto__":{},"constructor":{},"maths":{}}');
    expect(Object.keys(mergeSubjectGames(raw, {}, new Set()))).toEqual(['maths']);
    const a = attempt('1', 5, 'same-id');
    const merged = mergeSubjectGames({ maths: a, physics: a }, {}, new Set([subjectRoundId('maths', 'same-id')]));
    expect(merged.maths.session).toBeUndefined();
    expect(merged.physics.session?.id).toBe('same-id');
  });
});


describe('Switching Maths levels without losing work',()=>{
  it('parks an active Level 17 round after the first question and restores its exact answers and hints',()=>{
    const saved=startSubjectRound(undefined,'17',makeMentalRound('17','first'),1000,'first');
    const q=saved.session!.questions[0];
    const first=answerSubjectRound(saved,q.answer,2000);
    first.session!.hints=[0];
    const switched=startSubjectRound(first,'1',makeMentalRound('1','other'),3000,'other');
    expect(switched.session?.level).toBe('1');
    expect(switched.level).toBe('17'); // Never regress the highest selected/unlocked level
    expect(switched.pausedSessions?.['17']?.answers[0]).toBe(q.answer);
    const restored=startSubjectRound(readSubjectGame(JSON.parse(JSON.stringify(switched))),'17',makeMentalRound('17','unused'),4000,'unused');
    expect(restored.session?.id).toBe('first');
    expect(restored.session?.questions).toEqual(first.session?.questions);
    expect(restored.session?.answers).toEqual(first.session?.answers);
    expect(restored.session?.hints).toEqual([0]);
    expect(restored.pausedSessions?.['1']?.id).toBe('other');
    expect(restored.level).toBe('17');
  });
  it('preserves four checked answers when switching and then restoring the saved level',()=>{
    let progress=startSubjectRound(undefined,'17',makeMentalRound('17','four'),1000,'four');
    for(let index=0;index<4;index++){
      progress=answerSubjectRound(progress,progress.session!.questions[index].answer,1001+index);
      progress=advanceSubjectRound(progress,1005+index);
    }
    expect(Object.keys(progress.session!.answers)).toHaveLength(4);
    const switched=startSubjectRound(progress,'16',makeMentalRound('16','different'),3000,'different');
    const restored=startSubjectRound(switched,'17',makeMentalRound('17','unused'),4000,'unused');
    expect(Object.keys(restored.session!.answers)).toHaveLength(4);
    expect(restored.session!.index).toBe(4);
  });
  it('keeps paused sessions and best results after completing a lower level',()=>{
    let saved=startSubjectRound(undefined,'17',makeMentalRound('17','advanced'),1000,'advanced');
    saved=answerSubjectRound(saved,saved.session!.questions[0].answer,1200);
    const low=startSubjectRound(saved,'1',makeMentalRound('1','low'),1300,'low');
    let current=low;
    for(let i=0;i<5;i++){
      current=answerSubjectRound(current,current.session!.questions[i].answer,1400+i);
      if(i<4)current=advanceSubjectRound(current,1500+i);
    }
    const completed=finishSubjectRound(current,1600)!.progress;
    expect(completed.level).toBe('17');
    expect(completed.best['1']).toBe(5);
    expect(completed.pausedSessions?.['17']?.answers[0]).toBe(saved.session!.questions[0].answer);
    const resumed=startSubjectRound(completed,'17',makeMentalRound('17','unused'),1700,'unused');
    expect(resumed.session?.id).toBe('advanced');
  });
  it('merges active and paused sessions across devices and filters completed rounds',()=>{
    const initial=startSubjectRound(undefined,'17',makeMentalRound('17','held'),1000,'held');
    const answered=answerSubjectRound(initial,initial.session!.questions[0].answer,1100);
    const switched=startSubjectRound(answered,'1',makeMentalRound('1','new'),1200,'new');
    const synced=mergeSubjectGames({maths:switched},{maths:answered},new Set()).maths;
    expect(synced.session?.level).toBe('1');
    expect(synced.pausedSessions?.['17']?.id).toBe('held');
    expect(synced.pausedSessions?.['17']?.answers[0]).toBe(answered.session?.answers[0]);
    const done=mergeSubjectGames({maths:switched},{maths:answered},new Set([subjectRoundId('maths','held')])).maths;
    expect(done.pausedSessions?.['17']).toBeUndefined();
  });
  it('ignores invalid paused sessions while retaining valid saved levels',()=>{
    const a=startSubjectRound(undefined,'16',makeMentalRound('16','a'),1000,'a');
    const b=startSubjectRound(a,'17',makeMentalRound('17','b'),2000,'b');
    const raw=JSON.parse(JSON.stringify(b));
    raw.pausedSessions.invalid=raw.pausedSessions['16'];
    raw.pausedSessions['99']={...raw.pausedSessions['16'],level:'16'};
    const parsed=readSubjectGame(raw);
    expect(Object.keys(parsed.pausedSessions||{})).toEqual(['16']);
  });
});
