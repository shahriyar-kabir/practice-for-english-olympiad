import { describe, expect, it } from 'vitest';
import { practicePaths, questionsForPractice, wordsForPractice } from './practiceLibrary';

describe('original Wizpiko practice collection', () => {
  it('retains saved-record path identifiers without age or timer eligibility labels', () => {
    expect(practicePaths.map(path => path.id)).toEqual([
      'beginners', 'kids', 'small-starts', 'juniors', 'high-flyers', 'trailblazers', 'seniors',
    ]);
    expect(new Set(practicePaths.map(path => path.name)).size).toBe(7);
    for (const path of practicePaths) {
      expect(path.name.trim()).not.toBe('');
      expect(path.description.trim().length).toBeGreaterThan(20);
      expect(`${path.name} ${path.description}`).not.toMatch(/olympiad|ages?\s*\d|grades?\s*\d|\d+\s*(?:minutes|seconds)|50.question/i);
      expect(path.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(path.icon.trim()).not.toBe('');
    }
  });

  it('provides 210 distinct contextual clues that fit the crossword generator', () => {
    const allClues: string[] = [];
    for (const path of practicePaths) {
      const words = wordsForPractice(path.id);
      expect(words).toHaveLength(30);
      expect(new Set(words.map(item => item.word)).size).toBe(30);
      for (const item of words) {
        expect(item.word).toMatch(/^[A-Z]{3,16}$/);
        expect(item.clue.trim()).toBe(item.clue);
        expect(item.clue.length).toBeGreaterThan(20);
        allClues.push(item.clue);
      }
    }
    expect(allClues).toHaveLength(210);
    expect(new Set(allClues).size).toBe(210);
  });

  it('provides 70 fully keyed four-option questions with useful explanations', () => {
    const ids: string[] = [];
    for (const path of practicePaths) {
      const questions = questionsForPractice(path.id);
      expect(questions).toHaveLength(10);
      for (const question of questions) {
        expect(question.id.startsWith(path.id + '-')).toBe(true);
        ids.push(question.id);
        expect(question.prompt.trim().length).toBeGreaterThan(20);
        expect(question.options).toHaveLength(4);
        // Capitalisation is intentionally contrasted in the first-sentence task.
        expect(new Set(question.options.map(option => option.trim())).size).toBe(4);
        expect(question.options.every(option => option.trim().length > 0)).toBe(true);
        expect(question.options.filter(option => option === question.correct)).toHaveLength(1);
        expect(question.explanation.trim().length).toBeGreaterThan(30);
      }
    }
    expect(ids).toHaveLength(70);
    expect(new Set(ids).size).toBe(70);
  });
});
