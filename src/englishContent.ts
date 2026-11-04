import { MCQ_SET_SIZE } from './practiceSession';
import { practicePaths, wordsForPractice, questionsForPractice } from './practiceLibrary';
import type { PracticePathId } from './practiceLibrary';

/** Original Wizpiko skill paths. IDs stay stable to retain earned progress. */
export const categories = practicePaths;
export type CategoryId = PracticePathId;
export type WordClue = { word: string; clue: string };
const wordLists = Object.fromEntries(categories.map(path => [path.id, wordsForPractice(path.id)])) as Record<CategoryId, WordClue[]>;
export function wordsFor(id: CategoryId): WordClue[] { return wordLists[id]; }
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const result = [...items]; let value = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    const j = value % (i + 1); [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export type MCQuestion = { id: string; prompt: string; options: string[]; correct: string; explanation: string };
export function makeQuestions(id: CategoryId, level: number, count = MCQ_SET_SIZE): MCQuestion[] {
  const size = Math.max(0, Math.min(MCQ_SET_SIZE, Math.floor(Number.isFinite(count) ? count : MCQ_SET_SIZE)));
  const seed = level * 9397 + categories.findIndex(path => path.id === id) * 307 + 71;
  return seededShuffle(questionsForPractice(id), seed).slice(0, size).map((question, index) => ({
    ...question,
    id: `${question.id}:${level}`,
    options: seededShuffle(question.options, seed + index * 31),
  }));
}
export type PlacedWord = WordClue & { row: number; col: number; direction: 'across' | 'down'; number: number; id: string };
export type GeneratedCrossword = { rows: number; cols: number; entries: PlacedWord[]; bank: string[] };
export function makeCrossword(id: CategoryId, level: number): GeneratedCrossword {
  const source = seededShuffle(wordLists[id], level * 1039 + 337).filter(x => /^[A-Z]+$/.test(x.word) && x.word.length < 17);
  const size = 25;
  const grid = new Map<string, { letter: string; directions: ('across' | 'down')[] }>();
  const placed: Omit<PlacedWord, 'number' | 'id'>[] = [];
  const at = (r: number, c: number) => grid.get(r + ':' + c);
  function canPlace(word: string, row: number, col: number, dir: 'across' | 'down', requireCross: boolean) {
    const dr = dir === 'down' ? 1 : 0, dc = dir === 'across' ? 1 : 0;
    if (row < 1 || col < 1 || row + dr * (word.length - 1) >= size - 1 || col + dc * (word.length - 1) >= size - 1) return -1;
    if (at(row - dr, col - dc) || at(row + dr * word.length, col + dc * word.length)) return -1;
    let crosses = 0;
    for (let k = 0; k < word.length; k++) {
      const r = row + dr * k, c = col + dc * k, cell = at(r, c);
      if (cell) {
        if (cell.letter !== word[k] || cell.directions.includes(dir)) return -1;
        crosses++;
      } else if (dir === 'across' ? at(r - 1, c) || at(r + 1, c) : at(r, c - 1) || at(r, c + 1)) return -1;
    }
    return requireCross && !crosses ? -1 : crosses;
  }
  function add(entry: WordClue, r: number, c: number, dir: 'across' | 'down') {
    placed.push({ ...entry, row: r, col: c, direction: dir });
    for (let i = 0; i < entry.word.length; i++) {
      const rr = r + (dir === 'down' ? i : 0), cc = c + (dir === 'across' ? i : 0);
      const key = rr + ':' + cc, cell = grid.get(key);
      grid.set(key, { letter: entry.word[i], directions: cell ? [...cell.directions, dir] : [dir] });
    }
  }
  const first = source[0];
  add(first, 12, Math.floor((size - first.word.length) / 2), 'across');
  for (const entry of source.slice(1)) {
    if (placed.length >= 7) break;
    const candidates: { r: number; c: number; dir: 'across' | 'down'; score: number }[] = [];
    for (const prior of placed) {
      const dir = prior.direction === 'across' ? 'down' : 'across';
      for (let i = 0; i < entry.word.length; i++) for (let j = 0; j < prior.word.length; j++) {
        if (entry.word[i] !== prior.word[j]) continue;
        const r = prior.row + (prior.direction === 'down' ? j : 0) - (dir === 'down' ? i : 0);
        const c = prior.col + (prior.direction === 'across' ? j : 0) - (dir === 'across' ? i : 0);
        const score = canPlace(entry.word, r, c, dir, true);
        if (score >= 1) candidates.push({ r, c, dir, score });
      }
    }
    candidates.sort((a, b) => b.score - a.score || (Math.abs(a.r - 12) + Math.abs(a.c - 12)) - (Math.abs(b.r - 12) + Math.abs(b.c - 12)));
    if (candidates.length) add(entry, candidates[0].r, candidates[0].c, candidates[0].dir);
  }
  const positions = [...grid.keys()].map(x => x.split(':').map(Number));
  const minR = Math.max(0, Math.min(...positions.map(p => p[0])) - 1), minC = Math.max(0, Math.min(...positions.map(p => p[1])) - 1);
  const maxR = Math.max(...positions.map(p => p[0])) + 1, maxC = Math.max(...positions.map(p => p[1])) + 1;
  const entries = placed.map((p, index) => ({ ...p, row: p.row - minR, col: p.col - minC, number: index + 1, id: level + '-' + index }));
  return { rows: maxR - minR + 1, cols: maxC - minC + 1, entries, bank: seededShuffle(entries.map(e => e.word), level * 456 + 83) };
}
