import { describe, expect, it } from 'vitest';
import { makeMentalRound, mentalBand } from './mathsMental';
import type { MentalKind, MentalQuestion } from './mathsMental';

function number(value: string) {
  const parts = value.replace('−', '-').split('/').map(Number);
  return parts.length === 2 ? parts[0] / parts[1] : parts[0];
}
function expected(q: MentalQuestion): number {
  const [a, b, c] = q.operands;
  switch (q.kind) {
    case 'add': return a + b;
    case 'subtract': return a - b;
    case 'multiply': return a * b;
    case 'divide': return a / b;
    case 'missing': return b - a;
    case 'square': return a ** 2;
    case 'order': return a + b * c;
    case 'signed': return a + b;
    case 'fraction': return (a + b) / c;
    case 'percent': return a / 100 * b;
    case 'decimal': return a / 10 + b / 10;
    case 'equation': return (c - b) / a;
    case 'ratio': return c / (a + b) * a;
    case 'pattern': return a + b * 3;
  }
}

describe('untimed mental Maths question bank', () => {
  it('checks 21,000 generated answers and distractors across every difficulty boundary', () => {
    const kinds = new Set<MentalKind>();
    for (const level of ['1','5','6','15','16','30','31','50','51','75','76','100','101','900719925474099312345']) {
      for (let seed = 0; seed < 300; seed++) {
        const questions = makeMentalRound(level, 'invariant-' + seed);
        expect(questions).toHaveLength(5);
        expect(new Set(questions.map(q => q.id)).size).toBe(5);
        expect(new Set(questions.map(q => q.prompt)).size).toBe(5);
        for (const q of questions) {
          kinds.add(q.kind);
          const answer = expected(q);
          expect(number(q.answer)).toBeCloseTo(answer, 10);
          expect(q.choices).toHaveLength(4);
          expect(q.choices.filter(choice => Math.abs(number(choice) - answer) < 1e-9)).toHaveLength(1);
          expect(new Set(q.choices.map(number)).size).toBe(4);
          expect(q.choices.every(choice => Number.isFinite(number(choice)))).toBe(true);
          expect(Math.abs(answer)).toBeLessThanOrEqual(225);
          if (q.kind !== 'signed') expect(q.choices.every(choice => number(choice) >= 0)).toBe(true);
          if (Number(level) <= 5) expect(Math.abs(answer)).toBeLessThanOrEqual(20);
        }
      }
    }
    expect(kinds.size).toBe(14);
  },30_000);
  it('uses stable snapshots for a round and fresh variations for a new attempt', () => {
    expect(makeMentalRound('51', 'saved-attempt')).toEqual(makeMentalRound('51', 'saved-attempt'));
    expect(makeMentalRound('51', 'fresh-attempt')).not.toEqual(makeMentalRound('51', 'saved-attempt'));
  });
  it('keeps huge levels on the mental mix without increasing number sizes', () => {
    expect(mentalBand('999999999999999999999999999999999999').name).toBe('Mental mix');
    expect(makeMentalRound('999999999999999999999999999999999999', 'forever')).toHaveLength(5);
  });
  it('introduces topics progressively without limiting starting points by age', () => {
    expect(mentalBand('1').name).toBe('Number sparks');
    expect(mentalBand('16').kinds).toContain('multiply');
    expect(mentalBand('51').kinds).toContain('fraction');
    expect(mentalBand('76').kinds).toContain('ratio');
  });
});
