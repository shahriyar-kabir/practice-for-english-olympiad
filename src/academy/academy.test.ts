import { describe, expect, it } from 'vitest';
import { academyLevels, academySkills, lessonCatalog } from './catalog';
import { loadLesson } from './loadLessons';
import { acceptedAnswers, completeAcademyLesson, isTaskCorrect, MAX_LESSON_XP, normalizeAnswer, scoreLesson } from './progress';
import type { LessonAnswers } from './progress';
import type { AcademyLesson } from './types';
import { learningSummary } from '../learningMetrics';
import type { JourneyProgress } from '../journey';

const lessons = await Promise.all(lessonCatalog.map(item => loadLesson(item.id)));
const allCorrect = (lesson: AcademyLesson): LessonAnswers => Object.fromEntries(lesson.tasks.map(task => [task.id, acceptedAnswers(task)[0]]));
const scoreAnswers = (lesson: AcademyLesson, correct: number): LessonAnswers => Object.fromEntries(lesson.tasks.map((task, index) => [task.id, index < correct ? acceptedAnswers(task)[0] : 'An incorrect response']));
const completionTime = '2026-01-02T12:00:00.000Z';

describe('The complete English curriculum', () => {
  it('provides four open learning levels, six skills per level and 24 unique lessons', () => {
    expect(academyLevels).toEqual(['starter', 'beginner', 'intermediate', 'advanced']);
    expect(academySkills).toEqual(['sounds', 'vocabulary', 'grammar', 'reading', 'listening', 'writing']);
    expect(lessons).toHaveLength(24);
    expect(new Set(lessons.map(lesson => lesson.id)).size).toBe(24);
    for (const level of academyLevels) {
      expect(lessons.filter(lesson => lesson.level === level).map(lesson => lesson.skill)).toEqual(academySkills);
    }
  });

  it('loads all level modules through the lazy loader and retains the catalog metadata', async () => {
    for (const item of lessonCatalog) {
      expect(await loadLesson(item.id)).toMatchObject(item);
    }
    await expect(loadLesson('unknown-reading')).rejects.toThrow('could not be found');
    await expect(loadLesson('__proto__')).rejects.toThrow('could not be found');
  });

  it('has real teaching, examples, recaps and twenty practice tasks in every lesson', () => {
    const ids: string[] = [];
    for (const lesson of lessons) {
      expect(lesson.id).toBe(`${lesson.level}-${lesson.skill}`);
      expect(lesson.objective.length).toBeGreaterThan(35);
      expect(lesson.teaching.length).toBeGreaterThanOrEqual(2);
      expect(lesson.teaching.every(paragraph => paragraph.length > 70)).toBe(true);
      expect(lesson.examples.length).toBeGreaterThanOrEqual(2);
      expect(lesson.examples.every(example => example.before.trim() && example.after.trim())).toBe(true);
      expect(lesson.recap.length).toBeGreaterThan(50);
      expect(lesson.tasks).toHaveLength(20);
      for (const task of lesson.tasks) {
        ids.push(task.id);
        expect(task.id).toMatch(/^[a-z]{2}-[a-z]-(?:[1-9]|1[0-9]|20)$/);
        expect(task.prompt.trim().length).toBeGreaterThan(15);
        expect(task.explanation.trim().length, task.id).toBeGreaterThan(15);
      }
    }
    expect(ids).toHaveLength(480);
    expect(new Set(ids).size).toBe(480);
  });

  it('keeps every keyed answer valid and every choice unambiguous', () => {
    for (const lesson of lessons) for (const task of lesson.tasks) {
      for (const answer of acceptedAnswers(task)) {
        expect(answer.trim().length, task.id).toBeGreaterThan(0);
        expect(isTaskCorrect(task, answer), task.id).toBe(true);
      }
      expect(isTaskCorrect(task, '__not_an_answer__'), task.id).toBe(false);
      expect(isTaskCorrect(task, undefined), task.id).toBe(false);
      expect(isTaskCorrect(task, '  '), task.id).toBe(false);
      if (task.type === 'choice') {
        expect(task.choices.length, task.id).toBeGreaterThanOrEqual(3);
        expect(new Set(task.choices).size, task.id).toBe(task.choices.length);
        expect(task.choices.filter(choice => choice === task.answer), task.id).toHaveLength(1);
        for (const distractor of task.choices.filter(choice => choice !== task.answer)) {
          expect(isTaskCorrect(task, distractor), task.id).toBe(false);
        }
      }
      if (task.type === 'order') {
        expect([...task.tokens].sort(), task.id).toEqual(task.answer.split(' ').sort());
      }
    }
  });

  it('grounds every reading and listening answer in exact supporting text', () => {
    for (const lesson of lessons.filter(item => item.skill === 'reading' || item.skill === 'listening')) {
      const source = lesson.skill === 'reading' ? lesson.passage : lesson.transcript;
      expect(source?.length).toBeGreaterThan(70);
      for (const task of lesson.tasks) {
        expect(task.evidence?.length, task.id).toBeGreaterThan(3);
        expect(source, task.id).toContain(task.evidence);
      }
      if (lesson.skill === 'listening') {
        expect(lesson.speakingPractice?.length).toBeGreaterThan(40);
        expect(`${lesson.teaching.join(' ')} ${lesson.speakingPractice}`).toMatch(/not (record|automatically|analyse)|not.*grad|not.*assess/);
      }
    }
  });

  it('keeps genuine skill progression instead of repeating the same material across levels', () => {
    for (const skill of academySkills) {
      const skillLessons = lessons.filter(lesson => lesson.skill === skill);
      expect(new Set(skillLessons.map(lesson => lesson.objective)).size).toBe(4);
      expect(new Set(skillLessons.map(lesson => lesson.teaching.join(' '))).size).toBe(4);
      expect(new Set(skillLessons.map(lesson => lesson.tasks[0].prompt)).size).toBe(4);
    }
  });
});

describe('Meaningful answer checking', () => {
  it('accepts harmless spacing and apostrophe differences, while preserving punctuation', () => {
    expect(normalizeAnswer('  TEN   O’CLOCK  ')).toBe("ten o'clock");
    const task = lessons.find(lesson => lesson.id === 'beginner-writing')!.tasks[3];
    expect(isTaskCorrect(task, '  Can   you come?  ')).toBe(true);
    expect(isTaskCorrect(task, 'Can you come.')).toBe(false);
    expect(isTaskCorrect(task, 'can you come?')).toBe(false);
  });

  it('checks capitalization when teaching capitalization and ignores it for ordinary fills', () => {
    const nameTask = lessons.find(lesson => lesson.id === 'starter-writing')!.tasks[1];
    expect(isTaskCorrect(nameTask, 'Alex')).toBe(true);
    expect(isTaskCorrect(nameTask, 'alex')).toBe(false);
    expect(isTaskCorrect(nameTask, 'ALEX')).toBe(false);
    const ordinaryFill = lessons.find(lesson => lesson.id === 'starter-reading')!.tasks[1];
    expect(isTaskCorrect(ordinaryFill, '  RED ')).toBe(true);
  });

  it('scores actual answers in all 24 lessons without rewarding omitted answers', () => {
    for (const lesson of lessons) {
      expect(scoreLesson(lesson, allCorrect(lesson))).toEqual({ correct: 20, total: 20, score: 100, xp: MAX_LESSON_XP });
      expect(scoreLesson(lesson, scoreAnswers(lesson, 3))).toEqual({ correct: 3, total: 20, score: 15, xp: 16 });
      expect(scoreLesson(lesson, {})).toMatchObject({ correct: 0, total: 20, score: 0 });
      expect(() => completeAcademyLesson({ records: {} }, lesson, {})).toThrow('Answer each');
    }
  });
});

describe('Saved lesson progress and retry XP', () => {
  const lesson = lessons[0];
  it('records a zero-correct completed lesson, bounded XP, a real activity day and earned lesson badge', () => {
    const original: JourneyProgress = { records: {} };
    const saved = completeAcademyLesson(original, lesson, scoreAnswers(lesson, 0), completionTime);
    expect(saved.result).toEqual({ correct: 0, total: 20, score: 0, xp: 10, completedAt: completionTime });
    expect(saved.delta).toBe(10);
    expect(saved.journey.academy?.lastLessonId).toBe(lesson.id);
    expect(saved.journey.activityLog?.[0]).toMatchObject({ kind: 'lesson', correct: 0, total: 20, xp: 10 });
    expect(saved.journey.earnedBadges?.['first-lesson']).toBe(completionTime);
    expect(saved.journey.activityDates).toHaveLength(1);
    expect(learningSummary(saved.journey).lessonsCompleted).toBe(1);
    expect(learningSummary(saved.journey).xp).toBe(10);
    expect(original).toEqual({ records: {} });
  });

  it('retains the best result and grants only improvement XP across retries', () => {
    const first = completeAcademyLesson({ records: {} }, lesson, scoreAnswers(lesson, 2), completionTime);
    expect(first.delta).toBe(14);
    const same = completeAcademyLesson(first.journey, lesson, scoreAnswers(lesson, 2), '2026-01-03T12:00:00.000Z');
    expect(same.delta).toBe(0);
    expect(same.result).toEqual(first.result);
    expect(same.journey.activityLog?.at(-1)?.xp).toBe(0);
    const lower = completeAcademyLesson(same.journey, lesson, scoreAnswers(lesson, 0), '2026-01-04T12:00:00.000Z');
    expect(lower.delta).toBe(0);
    expect(lower.result).toEqual(first.result);
    const better = completeAcademyLesson(lower.journey, lesson, allCorrect(lesson), '2026-01-05T12:00:00.000Z');
    expect(better.delta).toBe(36);
    expect(better.result).toMatchObject({ score: 100, correct: 20, total: 20, xp: 50 });
    expect(learningSummary(better.journey)).toMatchObject({ lessonXP: 50, lessonsCompleted: 1 });
    expect(better.journey.activityLog?.reduce((sum, event) => sum + event.xp, 0)).toBe(50);
  });

  it('does not farm XP from the same answers, many retries or duplicate completion submission', () => {
    let journey: JourneyProgress = { records: {} };
    let awarded = 0;
    for (let index = 0; index < 20; index++) {
      const saved = completeAcademyLesson(journey, lesson, allCorrect(lesson), completionTime);
      awarded += saved.delta; journey = saved.journey;
    }
    expect(awarded).toBe(50);
    expect(journey.activityLog).toHaveLength(1);
    expect(journey.academy?.results[lesson.id].xp).toBe(50);
  });

  it('keeps existing games and other lesson results when merging a completion', () => {
    const original: JourneyProgress = { records: { game: { unlocked: 3, completed: 2, bestScore: 90, xp: 100 } }, academy: { results: { other: { score: 100, correct: 20, total: 20, xp: 50, completedAt: completionTime } } } };
    const saved = completeAcademyLesson(original, lesson, allCorrect(lesson), completionTime);
    expect(saved.journey.records).toBe(original.records);
    expect(saved.journey.academy?.results.other).toBe(original.academy?.results.other);
    expect(learningSummary(saved.journey).xp).toBe(200);
    expect(original.academy?.results[lesson.id]).toBeUndefined();
  });

  it('rejects incomplete attempts, blank answers and invalid or future completion dates', () => {
    const answers = allCorrect(lesson);
    delete answers[lesson.tasks[0].id];
    expect(() => completeAcademyLesson({ records: {} }, lesson, answers, completionTime)).toThrow('Answer each');
    answers[lesson.tasks[0].id] = '   ';
    expect(() => completeAcademyLesson({ records: {} }, lesson, answers, completionTime)).toThrow('Answer each');
    for (const time of ['invalid', '2999-01-01T00:00:00.000Z']) {
      expect(() => completeAcademyLesson({ records: {} }, lesson, allCorrect(lesson), time)).toThrow('completion time');
    }
  });
});
