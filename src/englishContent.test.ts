import { describe, expect, it } from 'vitest';
import { categories, makeCrossword, makeQuestions, wordsFor } from './englishContent';

describe('Wizpiko English Academy', () => {
  it('keeps saved path IDs while displaying the original Wizpiko skill paths', () => {
    expect(categories.map(c => c.name)).toEqual(['Word Sprouts', 'Everyday Explorer', 'Story Sparks', 'Conversation Corner', 'Meaning Makers', 'Idea Builders', 'Clear Communicators']);
  });
  it('keeps each MCQ group small even when a caller requests an old 50-question count', () => {
    expect(makeQuestions(categories[0].id, 1, 50)).toHaveLength(5);
    expect(makeQuestions(categories[0].id, 1, 3)).toHaveLength(3);
    expect(makeQuestions(categories[0].id, 1)).toEqual(makeQuestions(categories[0].id, 1));
  });
  for (const category of categories) {
    it('prepares five answerable four-option MCQs for ' + category.name, () => {
      const questions = makeQuestions(category.id, 1);
      expect(questions).toHaveLength(5);
      expect(new Set(questions.map(q => q.id)).size).toBe(5);
      for (const question of questions) {
        expect(question.options).toHaveLength(4);
        expect(new Set(question.options).size).toBe(4);
        expect(question.options).toContain(question.correct);
        expect(question.explanation).not.toBe('');
      }
    });
    it('generates valid intersecting word cells for ' + category.name, () => {
      const glossary = wordsFor(category.id);
      for (let level = 1; level <= 8; level++) {
        const puzzle = makeCrossword(category.id, level);
        expect(puzzle.entries.length).toBeGreaterThan(0);
        const grid = new Map<string, string>();
        for (const entry of puzzle.entries) {
          expect(glossary.some(word => word.word === entry.word)).toBe(true);
          expect(entry.row).toBeGreaterThanOrEqual(0);
          expect(entry.col).toBeGreaterThanOrEqual(0);
          for (let i = 0; i < entry.word.length; i++) {
            const row = entry.row + (entry.direction === 'down' ? i : 0);
            const col = entry.col + (entry.direction === 'across' ? i : 0);
            expect(row).toBeLessThan(puzzle.rows);
            expect(col).toBeLessThan(puzzle.cols);
            const key = row + ':' + col;
            const prior = grid.get(key);
            if (prior) expect(prior).toBe(entry.word[i]);
            grid.set(key, entry.word[i]);
          }
        }
      }
    });
  }
});
