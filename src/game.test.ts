import { afterEach, describe, expect, it, vi } from 'vitest';
import { puzzles, type Puzzle } from './data/puzzles';
import { buildCells, cellAt, entryContains, initialProgress, readProgress, saveProgress, STORAGE_KEY } from './game';

const sample: Puzzle = {
  id: 'sample', title: 'Sample', category: 'Test', emoji: '🌱', color: '#254f43', description: '',
  rows: 3, cols: 3,
  entries: [
    { id: '1-across', number: 1, direction: 'across', row: 1, col: 0, answer: 'CAT', clue: 'A pet.' },
    { id: '2-down', number: 2, direction: 'down', row: 0, col: 1, answer: 'MAP', clue: 'Helps you navigate.' },
  ],
  wordBank: ['CAT', 'MAP'],
};

afterEach(() => vi.unstubAllGlobals());

describe('crossword placement', () => {
  it('maps across and down entries to their exact grid coordinates', () => {
    expect(cellAt(sample.entries[0], 2)).toEqual({ row: 1, col: 2 });
    expect(cellAt(sample.entries[1], 2)).toEqual({ row: 2, col: 1 });
    expect(entryContains(sample.entries[0], 1, 1)).toBe(true);
    expect(entryContains(sample.entries[0], 1, 3)).toBe(false);
    expect(entryContains(sample.entries[0], 0, 1)).toBe(false);
    expect(entryContains(sample.entries[1], 2, 1)).toBe(true);
    expect(entryContains(sample.entries[1], 3, 1)).toBe(false);
  });

  it('merges intersections and reveals solved letters without completing the crossing word', () => {
    const cells = buildCells(sample, { solved: ['1-across'], hints: {} });
    expect(cells.size).toBe(5);
    expect(cells.get('1-1')).toMatchObject({ letter: 'A', solved: true, hinted: false });
    expect(cells.get('1-1')?.entries.map((entry) => entry.id)).toEqual(['1-across', '2-down']);
    expect(cells.get('0-1')).toMatchObject({ letter: '', solved: false, number: 2 });
    expect(cells.get('2-1')).toMatchObject({ letter: '', solved: false });
  });

  it('reveals hinted letters and lets solved crossings take precedence over hint styling', () => {
    const cells = buildCells(sample, { solved: ['1-across'], hints: { '2-down': [0, 1] } });
    expect(cells.get('0-1')).toMatchObject({ letter: 'M', hinted: true, solved: false });
    expect(cells.get('1-1')).toMatchObject({ letter: 'A', hinted: false, solved: true });
    expect(cells.get('2-1')?.letter).toBe('');
  });

  it('returns independent initial progress objects', () => {
    const first = initialProgress();
    first.solved.push('1-across');
    first.hints['1-across'] = [0];
    expect(initialProgress()).toEqual({ solved: [], hints: {} });
  });
});

describe('saved progress', () => {
  it('round-trips valid progress', () => {
    let saved = '';
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => saved),
      setItem: vi.fn((_key: string, value: string) => { saved = value; }),
    });
    const puzzle = puzzles[0];
    const progress = { [puzzle.id]: { solved: [puzzle.entries[0].id], hints: { [puzzle.entries[1].id]: [0, 1] } } };
    expect(saveProgress(progress)).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(progress));
    expect(readProgress()).toEqual(progress);
  });

  it('filters unknown puzzles, invalid IDs, duplicate solutions, and invalid hint positions', () => {
    const puzzle = puzzles[0];
    const entry = puzzle.entries[0];
    vi.stubGlobal('localStorage', {
      getItem: () => JSON.stringify({
        unknown: { solved: ['1-across'], hints: {} },
        [puzzle.id]: {
          solved: [entry.id, entry.id, 'not-a-clue', 3, null],
          hints: {
            [entry.id]: [2, 0, 0, -1, 0.2, '1', null, entry.answer.length, 100],
            'not-a-clue': [0],
          },
        },
        [puzzles[1].id]: 'invalid progress',
      }),
    });
    expect(readProgress()).toEqual({ [puzzle.id]: { solved: [entry.id], hints: { [entry.id]: [0, 2] } } });
  });

  it.each(['not JSON', 'null', '[]', '4', '"hello"'])('ignores invalid saved data: %s', (saved) => {
    vi.stubGlobal('localStorage', { getItem: () => saved });
    expect(readProgress()).toEqual({});
  });

  it('accepts an empty save and malformed optional fields without crashing', () => {
    vi.stubGlobal('localStorage', { getItem: () => null });
    expect(readProgress()).toEqual({});
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ [puzzles[0].id]: { solved: {}, hints: [] } }) });
    expect(readProgress()).toEqual({ [puzzles[0].id]: { solved: [], hints: {} } });
  });

  it('keeps the game usable when storage is unavailable or full', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('Storage denied'); },
      setItem: () => { throw new Error('Quota exceeded'); },
    });
    expect(readProgress()).toEqual({});
    expect(saveProgress({})).toBe(false);
    vi.stubGlobal('localStorage', undefined);
    expect(readProgress()).toEqual({});
    expect(saveProgress({})).toBe(false);
  });
});
