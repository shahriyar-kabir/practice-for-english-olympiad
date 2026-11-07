import type { ComponentType, Dispatch, SetStateAction } from 'react';
import type { JourneyProgress } from './journey';

export type SubjectGameScreenProps = {
  journey: JourneyProgress;
  onJourney: Dispatch<SetStateAction<JourneyProgress>>;
  onHome: () => void;
  onLegacy: () => void;
};

/** Add future subjects here; each screen loads only when its branch is opened. */
export const gameSubjects = [
  { id: 'english', title: 'English', game: 'Word adventures', symbol: 'Aa',
    description: 'Discover words, solve crosswords and play short language quizzes.',
    tags: ['Word puzzles', 'Five-question quizzes'],
    load: () => import('./EnglishGamesScreen') as Promise<{ default: ComponentType<SubjectGameScreenProps> }> },
  { id: 'maths', title: 'Maths', game: 'Mental Maths Trail', symbol: '7+3',
    description: 'Think it through, choose an answer and follow a trail with no final level.',
    tags: ['Mental calculation', 'Five-question quizzes'],
    load: () => import('./MathsMentalGame') as Promise<{ default: ComponentType<SubjectGameScreenProps> }> },
  { id: 'science', title: 'Science', game: 'Science Discovery Trail', symbol: '🔬',
    description: 'Explore the natural world with picture clues and bite-sized science questions.',
    tags: ['Science discoveries', 'Five-question quizzes'],
    load: () => import('./ScienceDiscoveryGame') as Promise<{ default: ComponentType<SubjectGameScreenProps> }> },
] as const;
export type GameSubjectId = typeof gameSubjects[number]['id'];
export function isGameSubject(value: unknown): value is GameSubjectId {
  return gameSubjects.some(subject => subject.id === value);
}
