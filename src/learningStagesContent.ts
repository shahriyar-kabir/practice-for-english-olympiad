import type { AcademyLevel } from './learningTypes';

export const learningStages = [
  { id: 'early-years', title: 'KG & Early Years', description: 'Discover through play', introduction: 'Start with small discoveries: a word, a number, a shape or a question about the world.', recommendedLevel: 'starter' },
  { id: 'primary', title: 'Primary', description: 'Build strong foundations', introduction: 'Build confidence with words, numbers and new ideas. Choose a subject and take one small step at a time.', recommendedLevel: 'beginner' },
  { id: 'middle-school', title: 'Middle School', description: 'Connect ideas', introduction: 'Look for patterns, compare ideas and explore how things work. Follow the subject that makes you curious.', recommendedLevel: 'intermediate' },
  { id: 'secondary', title: 'Secondary & Higher Secondary', description: 'Think a little deeper', introduction: 'Strengthen your reasoning and explore useful connections across language, mathematics, science and technology.', recommendedLevel: 'intermediate' },
  { id: 'college-university', title: 'College & University', description: 'Explore new possibilities', introduction: 'Revisit a foundation, practise a skill or explore a new interest. Your next discovery can start in any subject.', recommendedLevel: 'advanced' },
  { id: 'lifelong-learners', title: 'Adults & Lifelong Learners', description: 'Keep your curiosity growing', introduction: 'Learn for everyday life, a personal goal or the joy of discovering something new. Start wherever you feel comfortable.', recommendedLevel: 'starter' },
] as const satisfies readonly { id: string; title: string; description: string; introduction: string; recommendedLevel: AcademyLevel }[];
export type LearningStageId = typeof learningStages[number]['id'];
