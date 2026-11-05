import { academyLevels, lessonCatalog, levelDescriptions, levelLabels, skillLabels } from './englishCatalog.ts';
import type { AcademyLevel, AcademyTask, LessonBody } from './tasks.ts';

export const CURRICULUM_VERSION = 2;
export const QUESTIONS_PER_SKILL = 20;
export const CERTIFICATE_PASS_MARK = 80;
export type CurriculumSubject = keyof typeof learningPrograms;
export type SkillMeta = { id: string; title: string; label: string; description: string };
export type CurriculumLesson = LessonBody & { id: string; subject: CurriculumSubject; level: AcademyLevel; skill: string; title: string; description: string; version: number };
const mathsLabels = { numbers: 'Numbers & operations', fractions: 'Fractions, ratios & rates', algebra: 'Patterns & algebra', geometry: 'Shape, measure & space', data: 'Data & probability', reasoning: 'Reasoning & applications' };
const mathsDescriptions: Record<AcademyLevel, string> = {
  starter: 'Counting, sharing, shapes and your first patterns. Begin at any age.',
  beginner: 'Build arithmetic confidence and use numbers in everyday situations.',
  intermediate: 'Connect algebra, ratios, geometry and data through useful problems.',
  advanced: 'Explore functions, calculus foundations, vectors, matrices and statistical reasoning.',
};
export const learningPrograms = {
  english: { name: 'English', title: 'English Academy', description: 'Words, stories and useful communication.', levelDescriptions, skills: Object.entries(skillLabels).map(([id, label]) => ({ id, label })), load: async (level:AcademyLevel, skill:string):Promise<LessonBody> => (await englishLoaders[level]()).default[skill] },
  maths: { name: 'Mathematics', title: 'Maths Academy', description: 'Patterns, practical problems and mathematical ideas.', levelDescriptions: mathsDescriptions, skills: Object.entries(mathsLabels).map(([id, label]) => ({ id, label })), load: async (level:AcademyLevel, skill:string):Promise<LessonBody> => { const maths=await import('./maths.ts'); return maths.makeMathsLesson(level,skill as import('./maths.ts').MathsSkill); } },
};
export { academyLevels, levelLabels };
export function isCurriculumSubject(value: unknown): value is CurriculumSubject { return typeof value === 'string' && Object.hasOwn(learningPrograms,value); }
export function isCurriculumLevel(value: unknown): value is AcademyLevel { return typeof value === 'string' && academyLevels.includes(value as AcademyLevel); }
export function skillMeta(subject: CurriculumSubject, level: AcademyLevel): SkillMeta[] {
  return learningPrograms[subject].skills.map(skill => {
    const english = subject === 'english' ? lessonCatalog.find(item => item.level === level && item.skill === skill.id) : undefined;
    return { id: skill.id, label: skill.label, title: english?.title || `${levelLabels[level]} ${skill.label.toLowerCase()}`, description: english?.description || `Explore ${skill.label.toLowerCase()} through twenty untimed questions with clear explanations.` };
  });
}
const englishLoaders = {
  starter: () => import('./english/starter.ts'), beginner: () => import('./english/beginner.ts'),
  intermediate: () => import('./english/intermediate.ts'), advanced: () => import('./english/advanced.ts'),
};
export async function loadCurriculumLesson(subject: CurriculumSubject, level: AcademyLevel, skill: string): Promise<CurriculumLesson> {
  const meta = skillMeta(subject, level).find(item => item.id === skill);
  if (!meta) throw new Error('This skill is not available.');
  const body = await learningPrograms[subject].load(level,skill);
  if (!body || body.tasks.length !== QUESTIONS_PER_SKILL) throw new Error('The complete skill could not be loaded.');
  return { ...body, id: subject === 'english' ? `${level}-${skill}` : `${subject}-${level}-${skill}`, subject, level, skill, title: meta.title, description: meta.description, version: CURRICULUM_VERSION };
}
export function normalisePracticeAnswer(value: string, caseSensitive = false) {
  const answer = value.normalize('NFKC').replace(/[‘’]/g, "'").trim().replace(/\s+/g, ' ');
  return caseSensitive ? answer : answer.toLocaleLowerCase('en');
}
export function taskCorrect(task: AcademyTask, value: unknown): boolean {
  if (typeof value !== 'string' || !value.trim()) return false;
  if (task.type === 'choice') return value === task.answer;
  const answers = task.type === 'fill' ? task.answers : [task.answer];
  const sensitive = task.type === 'order' || task.type === 'fill' && Boolean(task.caseSensitive);
  if (task.id.startsWith('maths-') && task.type === 'fill') return answers.some(answer => mathsAnswerEqual(answer,value));
  return answers.some(answer => normalisePracticeAnswer(answer, sensitive) === normalisePracticeAnswer(value, sensitive));
}
/** Exact rational comparison accepts 2/4 and 0.5 without accepting rounded 8/3. */
export function mathsAnswerEqual(expected:string, submitted:string):boolean {
  const normal=(value:string)=>value.normalize('NFKC').replace(/−/g,'-').replace(/⁄/g,'/').replace(/[\s*]/g,'').toLowerCase();
  const rational=(raw:string):[bigint,bigint]|null=>{
    const parts=normal(raw).split('/'); if(parts.length>2)return null;
    const decimal=(value:string):[bigint,bigint]|null=>{
      if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)||value.length>400)return null;
      const negative=value.startsWith('-'), digits=value.replace(/^[+-]/,'').split('.');
      return [BigInt((negative?'-':'')+(digits[0]||'0')+(digits[1]||'')),10n**BigInt(digits[1]?.length||0)];
    };
    const left=decimal(parts[0]);if(!left)return null;if(parts.length===1)return left;
    const right=decimal(parts[1]);if(!right||right[0]===0n)return null;
    return [left[0]*right[1],left[1]*right[0]];
  };
  const a=rational(expected),b=rational(submitted);
  return a&&b?a[0]*b[1]===b[0]*a[1]:normal(expected)===normal(submitted);
}
export function skillResultKey(subject: CurriculumSubject, level: AcademyLevel, skill: string, version = CURRICULUM_VERSION) { return `v${version}:${subject}:${level}:${skill}`; }
