import { CURRICULUM_VERSION, learningPrograms, skillResultKey } from '../supabase/functions/_shared/curriculum/programs.ts';
import type { CurriculumLesson, CurriculumSubject } from '../supabase/functions/_shared/curriculum/programs.ts';
import type { JourneyProgress } from './journey';
import type { AcademyLevel, LessonResult } from './learningTypes';
import type { VerifiedSkillResult } from './certificates/api';
import { recordLearningCompletion } from './learningMetrics';

export type SkillDraft = { subject: CurriculumSubject; level: AcademyLevel; skill: string; version: number; attempt: string; answers: Record<string,string>; checked: string[]; checkedCorrect?: Record<string,boolean>; index: number; stage: 'learn' | 'practice' | 'review'; updatedAt: number };
export type SkillDrafts = Record<string, SkillDraft>;
export const skillCompletionId = (key: string, attempt: string) => `skill:${key}:${attempt}`;
export function mergeSkillDrafts(a: SkillDrafts = {}, b: SkillDrafts = {}, completed = new Set<string>()): SkillDrafts {
  const result: SkillDrafts = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (!/^v\d+:[a-z][a-z0-9-]*:(starter|beginner|intermediate|advanced):[a-z-]+$/.test(key)) continue;
    const drafts = [a[key], b[key]].filter(draft => draft && typeof draft.attempt === 'string' && !completed.has(skillCompletionId(key,draft.attempt)) && typeof draft.updatedAt === 'number' && Number.isFinite(draft.updatedAt) && draft.answers && typeof draft.answers==='object' && Array.isArray(draft.checked)).sort((x,y) => y.updatedAt-x.updatedAt);
    const latest = drafts[0], other = drafts[1];
    if (!latest) continue;
    result[key] = other?.attempt === latest.attempt ? { ...latest, answers: { ...other.answers, ...latest.answers }, checked: [...new Set([...other.checked, ...latest.checked])], checkedCorrect: { ...other.checkedCorrect, ...latest.checkedCorrect } } : latest;
  }
  return result;
}
export function subjectSkillResults(journey: JourneyProgress, subject: CurriculumSubject): Record<string,LessonResult> {
  const results: Record<string,LessonResult> = {};
  for (const level of ['starter','beginner','intermediate','advanced'] as AcademyLevel[]) for (const skill of learningPrograms[subject].skills) {
    const result = journey.academy?.results[skillResultKey(subject,level,skill.id)];
    if (result?.total === 20) results[subject === 'english' ? `${level}-${skill.id}` : `${subject}-${level}-${skill.id}`] = result;
  }
  return results;
}
export function finishVerifiedSkill(journey: JourneyProgress, lesson: CurriculumLesson, result: VerifiedSkillResult, attempt: string, now = new Date(), attemptCorrect=result.correct): JourneyProgress {
  const key = skillResultKey(lesson.subject,lesson.level,lesson.skill), id = skillCompletionId(key,attempt);
  if (journey.completionIds?.includes(id)) return journey;
  if (result.subject !== lesson.subject || result.level !== lesson.level || result.skill !== lesson.skill || result.version !== CURRICULUM_VERSION || result.total !== 20 || !Number.isInteger(result.correct) || result.correct < 0 || result.correct > 20 || !Number.isInteger(attemptCorrect) || attemptCorrect<0 || attemptCorrect>20) throw new Error('This result does not belong to the current skill.');
  const previous = journey.academy?.results[key], xp = 10 + result.correct*2;
  const verified: LessonResult = { score: result.correct*5, correct: result.correct, total: 20, xp, completedAt: result.completedAt };
  const drafts = { ...journey.skillDrafts }; delete drafts[key];
  return recordLearningCompletion({ ...journey, skillDrafts: drafts, academy: { ...journey.academy, results: { ...journey.academy?.results, [key]: verified }, lastLessonId: lesson.id } }, {
    id, title: `${learningPrograms[lesson.subject].name} · ${lesson.title}`, kind: 'lesson', subject: lesson.subject, level: lesson.level, completedAt: now.toISOString(), xp: Math.max(0,xp-(previous?.xp || 0)), correct: attemptCorrect, total:20,
  }, now);
}

/** Correctness of checked questions in the current, unfinished attempt. */
export function skillAttemptProgress(draft?: SkillDraft) {
  const checked=[...new Set(draft?.checked||[])];
  const grade=draft?.checkedCorrect||{};
  const graded=checked.filter(id=>typeof grade[id]==='boolean');
  return {checked:checked.length, graded:graded.length, correct:graded.filter(id=>grade[id]).length};
}
