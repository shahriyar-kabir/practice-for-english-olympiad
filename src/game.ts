import { puzzles, type Entry, type Puzzle } from './data/puzzles';

export type PuzzleProgress = {
  solved: string[];
  hints: Record<string, number[]>;
};

export type Progress = Record<string, PuzzleProgress>;

export const STORAGE_KEY = 'wordsprout-progress-v1';

// IDs/counts alone identify retired history. No former clues or layouts ship.
const retiredPuzzleCounts: Readonly<Record<string, number>> = {
  'animal-friends': 10, 'in-the-classroom': 11, 'food-and-drinks': 11,
  'our-natural-world': 11, opposites: 11, 'action-words': 12,
  'around-the-house': 11, 'travel-and-transport': 11,
  'time-and-calendar': 11, 'english-word-skills': 11,
};

/** Historical answers stay separate from the current collection and its score. */
export function retiredClassicSummary(progress: Progress) {
  let solvedWords = 0, completedPuzzles = 0;
  for (const [id, count] of Object.entries(retiredPuzzleCounts)) {
    const solved = new Set((Array.isArray(progress[id]?.solved) ? progress[id].solved : [])
      .filter(value => typeof value === 'string' && /^\d{1,3}-(across|down)$/.test(value))).size;
    solvedWords += Math.min(count, solved);
    if (solved >= count) completedPuzzles++;
  }
  return { solvedWords, completedPuzzles, totalWords: 110, totalPuzzles: 10 };
}

export function initialProgress(): PuzzleProgress {
  return { solved: [], hints: {} };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Restore current play plus recognized retired history without mixing answers. */
export function readProgress(): Progress {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (!isRecord(saved)) return {};
    const progress: Progress = {};

    for (const puzzle of puzzles) {
      const candidate = saved[puzzle.id];
      if (!isRecord(candidate)) continue;
      const entries = new Map(puzzle.entries.map((entry) => [entry.id, entry]));
      const solved = Array.isArray(candidate.solved)
        ? [...new Set(candidate.solved.filter((id): id is string => typeof id === 'string' && entries.has(id)))]
        : [];
      const hints: Record<string, number[]> = {};

      if (isRecord(candidate.hints)) {
        for (const entry of puzzle.entries) {
          const positions = candidate.hints[entry.id];
          if (!Array.isArray(positions)) continue;
          const valid = [...new Set(positions.filter((position): position is number =>
            typeof position === 'number' && Number.isInteger(position) && position >= 0 && position < entry.answer.length,
          ))].sort((a, b) => a - b);
          if (valid.length) hints[entry.id] = valid;
        }
      }

      progress[puzzle.id] = { solved, hints };
    }

    for (const id of Object.keys(retiredPuzzleCounts)) {
      const candidate = saved[id];
      if (!isRecord(candidate)) continue;
      const entryId = (value: unknown): value is string => typeof value === 'string' && /^\d{1,3}-(across|down)$/.test(value);
      const solved = Array.isArray(candidate.solved) ? [...new Set(candidate.solved.filter(entryId))] : [];
      const hints: Record<string, number[]> = {};
      if (isRecord(candidate.hints)) {
        for (const [entry, positions] of Object.entries(candidate.hints)) {
          if (!entryId(entry) || !Array.isArray(positions)) continue;
          const valid = [...new Set(positions.filter((position): position is number =>
            Number.isInteger(position) && typeof position === 'number' && position >= 0 && position < 64))].sort((a, b) => a - b);
          if (valid.length) hints[entry] = valid;
        }
      }
      progress[id] = { solved, hints };
    }

    return progress;
  } catch {
    // Private browsing, disabled storage, and damaged saves must never block play.
    return {};
  }
}

export function saveProgress(progress: Progress): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function cellAt(entry: Entry, index: number): { row: number; col: number } {
  return {
    row: entry.row + (entry.direction === 'down' ? index : 0),
    col: entry.col + (entry.direction === 'across' ? index : 0),
  };
}

export function entryContains(entry: Entry, row: number, col: number): boolean {
  return entry.direction === 'across'
    ? row === entry.row && col >= entry.col && col < entry.col + entry.answer.length
    : col === entry.col && row >= entry.row && row < entry.row + entry.answer.length;
}

export type CrosswordCell = {
  row: number;
  col: number;
  number?: number;
  letter: string;
  solved: boolean;
  hinted: boolean;
  entries: Entry[];
};

/** Intersections share one cell; either solved word makes that letter visible. */
export function buildCells(puzzle: Puzzle, progress: PuzzleProgress = initialProgress()): Map<string, CrosswordCell> {
  const cells = new Map<string, CrosswordCell>();
  const solved = new Set(progress.solved);

  for (const entry of puzzle.entries) {
    const isSolved = solved.has(entry.id);
    const hintPositions = new Set(progress.hints[entry.id] ?? []);

    for (let index = 0; index < entry.answer.length; index++) {
      const { row, col } = cellAt(entry, index);
      const key = `${row}-${col}`;
      const cell = cells.get(key) ?? { row, col, letter: '', solved: false, hinted: false, entries: [] };
      const isHinted = hintPositions.has(index);

      if (index === 0) cell.number = cell.number === undefined ? entry.number : Math.min(cell.number, entry.number);
      if (isSolved || isHinted) cell.letter = entry.answer[index];
      cell.solved = cell.solved || isSolved;
      cell.hinted = !cell.solved && (cell.hinted || isHinted);
      cell.entries.push(entry);
      cells.set(key, cell);
    }
  }

  return cells;
}
