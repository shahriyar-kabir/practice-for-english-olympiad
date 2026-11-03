export type AcademyLevel = 'starter' | 'beginner' | 'intermediate' | 'advanced';
export type AcademySkill = 'sounds' | 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing';

export type LessonResult = {
  score: number;
  correct: number;
  total: number;
  xp: number;
  completedAt: string;
};

export type AcademyProgress = {
  results: Record<string, LessonResult>;
  lastLessonId?: string;
};

export type LearningEvent = {
  id: string;
  title: string;
  kind: 'lesson' | 'crossword' | 'mcq' | 'classic';
  completedAt: string;
  xp: number;
  correct?: number;
  total?: number;
};
