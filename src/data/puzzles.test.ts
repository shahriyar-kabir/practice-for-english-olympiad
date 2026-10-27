import { describe, expect, it } from 'vitest';
import { puzzles, type Puzzle } from './puzzles';

function cellsFor(puzzle: Puzzle) {
  const cells = new Map<string, { letter: string; entries: string[]; directions: string[] }>();
  for (const entry of puzzle.entries) {
    const dr = entry.direction === 'down' ? 1 : 0;
    const dc = entry.direction === 'across' ? 1 : 0;
    [...entry.answer].forEach((letter, index) => {
      const key = `${entry.row + dr * index},${entry.col + dc * index}`;
      const existing = cells.get(key);
      if (existing) {
        expect(existing.letter, `${puzzle.title}: conflicting crossing at ${key}`).toBe(letter);
        expect(existing.directions, `${puzzle.title}: words overlap in the same direction`).not.toContain(entry.direction);
        existing.entries.push(entry.id);
        existing.directions.push(entry.direction);
      } else {
        cells.set(key, { letter, entries: [entry.id], directions: [entry.direction] });
      }
    });
  }
  return cells;
}

describe('crosswords from the supplied English Olympiad document', () => {
  it('contains all ten puzzles and 110 words with unique puzzle IDs', () => {
    expect(puzzles).toHaveLength(10);
    expect(puzzles.reduce((count, puzzle) => count + puzzle.entries.length, 0)).toBe(110);
    expect(new Set(puzzles.map(puzzle => puzzle.id)).size).toBe(10);
    expect(puzzles.map(puzzle => puzzle.title)).toEqual([
      'Animal Friends', 'In the Classroom', 'Food and Drinks', 'Our Natural World',
      'Opposites', 'Action Words', 'Around the House', 'Travel and Transport',
      'Time and Calendar', 'English Word Skills',
    ]);
  });

  describe.each(puzzles)('$title', (puzzle) => {
    it('matches every clue answer to one and only one word-bank word', () => {
      expect(puzzle.entries.length).toBeGreaterThanOrEqual(10);
      expect(new Set(puzzle.entries.map(entry => entry.id)).size).toBe(puzzle.entries.length);
      expect(new Set(puzzle.wordBank).size).toBe(puzzle.wordBank.length);
      expect([...puzzle.wordBank].sort()).toEqual(puzzle.entries.map(entry => entry.answer).sort());
      for (const entry of puzzle.entries) {
        expect(entry.clue.trim().length).toBeGreaterThan(0);
        expect(entry.answer).toMatch(/^[A-Z]+$/);
        expect(entry.id).toBe(`${entry.number}-${entry.direction}`);
      }
    });

    it('numbers starts in reading order and shares numbering only at the same starting cell', () => {
      const starts = new Map<string, number>();
      const numberedCells = new Map<number, string>();
      for (const entry of puzzle.entries) {
        expect(Number.isInteger(entry.number)).toBe(true);
        expect(entry.number).toBeGreaterThan(0);
        const key = `${entry.row},${entry.col}`;
        if (starts.has(key)) expect(starts.get(key)).toBe(entry.number);
        if (numberedCells.has(entry.number)) expect(numberedCells.get(entry.number)).toBe(key);
        starts.set(key, entry.number);
        numberedCells.set(entry.number, key);
      }
      const orderedStarts = [...starts].sort(([a], [b]) => {
        const [ar, ac] = a.split(',').map(Number);
        const [br, bc] = b.split(',').map(Number);
        return ar - br || ac - bc;
      });
      expect(orderedStarts.map(([, number]) => number)).toEqual(orderedStarts.map((_, index) => index + 1));
    });

    it('keeps every letter in bounds and gives intersections matching letters', () => {
      expect(Number.isInteger(puzzle.rows) && puzzle.rows > 0).toBe(true);
      expect(Number.isInteger(puzzle.cols) && puzzle.cols > 0).toBe(true);
      const cells = cellsFor(puzzle);
      for (const key of cells.keys()) {
        const [row, col] = key.split(',').map(Number);
        expect(Number.isInteger(row) && row >= 0 && row < puzzle.rows).toBe(true);
        expect(Number.isInteger(col) && col >= 0 && col < puzzle.cols).toBe(true);
      }
      expect([...cells.values()].some(cell => cell.entries.length > 1)).toBe(true);
      for (const entry of puzzle.entries) {
        const dr = entry.direction === 'down' ? 1 : 0;
        const dc = entry.direction === 'across' ? 1 : 0;
        expect(cells.has(`${entry.row - dr},${entry.col - dc}`)).toBe(false);
        expect(cells.has(`${entry.row + dr * entry.answer.length},${entry.col + dc * entry.answer.length}`)).toBe(false);
      }
    });

    it('connects every used cell into a single crossword', () => {
      const cells = cellsFor(puzzle);
      const visited = new Set<string>();
      const queue = [cells.keys().next().value!];
      while (queue.length) {
        const key = queue.pop()!;
        if (visited.has(key) || !cells.has(key)) continue;
        visited.add(key);
        const [row, col] = key.split(',').map(Number);
        queue.push(`${row - 1},${col}`, `${row + 1},${col}`, `${row},${col - 1}`, `${row},${col + 1}`);
      }
      expect(visited.size).toBe(cells.size);
    });
  });
});
