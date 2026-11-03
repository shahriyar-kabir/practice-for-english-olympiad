import type { AcademyLevel } from '../learningTypes';
import { lessonCatalog } from './catalog';
import type { AcademyLesson, LessonBody } from './types';

const loaders: Record<AcademyLevel, () => Promise<{ default: Record<string, LessonBody> }>> = {
  starter: () => import('./levels/starter'),
  beginner: () => import('./levels/beginner'),
  intermediate: () => import('./levels/intermediate'),
  advanced: () => import('./levels/advanced'),
};
export async function loadLesson(id: string): Promise<AcademyLesson> {
  const meta = lessonCatalog.find(item => item.id === id);
  if (!meta) throw new Error('This lesson could not be found. Choose another lesson.');
  const module = await loaders[meta.level]();
  const body = module.default[meta.skill];
  if (!body) throw new Error('This lesson is not available yet. Please choose another.');
  return { ...meta, ...body };
}
