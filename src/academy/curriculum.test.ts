import { describe, expect, it } from 'vitest';
import { academyLevels, isCurriculumSubject, learningPrograms, loadCurriculumLesson, mathsAnswerEqual, skillResultKey, taskCorrect } from '../../supabase/functions/_shared/curriculum/programs.ts';
import { cleanCertificateName } from '../certificates/types';
import { finishVerifiedSkill, mergeSkillDrafts, subjectSkillResults } from '../skillProgress';
import type { SkillDraft } from '../skillProgress';
import { mergeJourney } from '../cloudAccount';
import { learningSummary } from '../learningMetrics';
import type { JourneyProgress } from '../journey';

const subjects = ['english','maths','science'] as const;
const lessons = (await Promise.all(subjects.flatMap(subject=>academyLevels.flatMap(level=>learningPrograms[subject].skills.map(skill=>loadCurriculumLesson(subject,level,skill.id))))));
const math = lessons.filter(lesson=>lesson.subject==='maths');
const golden:Record<string,string[][]>={
  starter:[['5','6','12','2','7'],['2','3','3','2','1/4'],['8','4','8','blue','11'],['6','8','minute hand','4','5'],['5','bananas','5','red','5'],['5','7','4','4','3']],
  beginner:[['35','6','2','4','24'],['3/4','10','4','0.2','6'],['6','3','17','8','5x'],['10','12','80','200','25'],['4','5','9','1/2','3'],['4','6','11','35','8']],
  intermediate:[['8','6','6','16','12'],['3/4','230','60','14','192'],['5','8','2','5','29'],['10','4','24','160','10'],['2/3','3/5','6','7','1/4'],['48','400','4','600','20']],
  advanced:[['3','3','4','2','6'],['4','4','3','8','4'],['4','5','2','110','8'],['12','13','2','12','4'],['1/4','2','1/2','8/3','3'],['36','2','16','120','The sample reported improvement; causation is not established.']],
};
describe('English, Maths and Science twenty-question curricula',()=>{
  it('provides 1440 questions in 72 skills, with a teaching and practice path in every level',()=>{
    expect(lessons).toHaveLength(72);
    const ids=new Set<string>();
    for(const lesson of lessons){
      expect(lesson.tasks).toHaveLength(20);expect(lesson.teaching.length).toBeGreaterThanOrEqual(2);expect(lesson.examples.length).toBeGreaterThanOrEqual(2);
      expect(new Set(lesson.tasks.map(task=>task.prompt)).size,lesson.id).toBe(20);
      for(const task of lesson.tasks){expect(ids.has(task.id),task.id).toBe(false);ids.add(task.id);const answers=task.type==='fill'?task.answers:[task.answer];for(const answer of answers)expect(taskCorrect(task,answer),task.id).toBe(true);if(task.type==='match'){expect(task.pairs).toHaveLength(3);expect(task.options).toHaveLength(3);expect(new Set(task.options).size).toBe(3);expect(task.visual).toBeTruthy();}if(task.type==='choice'){expect(task.choices.length).toBeGreaterThanOrEqual(3);expect(new Set(task.choices).size).toBe(task.choices.length);expect(task.choices.filter(answer=>taskCorrect(task,answer))).toHaveLength(1);}}
    }
    expect(ids.size).toBe(1440);
  });
  it("checks Science's illustrated matching bank and server answer keys",()=>{
    for(const lesson of lessons.filter(item=>item.subject==='science')){
      const matches=lesson.tasks.filter(task=>task.type==='match');
      expect(matches).toHaveLength(4);
      expect(lesson.tasks.filter(task=>Boolean(task.visual))).toHaveLength(20);
      for(const task of matches)if(task.type==='match'){
        expect(taskCorrect(task,task.answer)).toBe(true);
        expect(taskCorrect(task,'["incorrect"]')).toBe(false);
      }
    }
  });
  it('checks each of the 120 Maths template starting cases against independently calculated answers',()=>{
    for(const level of academyLevels)for(const [at,skill] of learningPrograms.maths.skills.entries()){
      const lesson=math.find(item=>item.level===level&&item.skill===skill.id)!;
      expect(lesson.tasks.slice(0,5).map(task=>task.type==='fill'?task.answers[0]:task.answer)).toEqual(golden[level][at]);
    }
  });
  it('compares fractions and decimals exactly and accepts conventional written algebra',()=>{
    for(const [a,b] of [['1/2','2/4'],['1/2','0.5'],['0.3','3 / 10'],['-3','−3'],['1/2','½'],['5x','5 * x']])expect(mathsAnswerEqual(a,b)).toBe(true);
    for(const [a,b] of [['8/3','2.6666666667'],['1/2','1/0'],['1','Infinity'],['0.3','0.30001'],['5x','5x²']])expect(mathsAnswerEqual(a,b)).toBe(false);
  });
  it('does not accept a claimed subject or prototype as a published programme',async()=>{
    expect(isCurriculumSubject('science')).toBe(true);for(const id of ['constructor','__proto__','toString'])expect(isCurriculumSubject(id)).toBe(false);
    await expect(loadCurriculumLesson('english','starter','not-a-skill')).rejects.toThrow('not available');
  });
});
describe('Full-name certificates and saved skill progress',()=>{
  it('requires an explicit full name and retains international spelling',()=>{
    expect(cleanCertificateName('  Élise   O’Neill  ')).toBe('Élise O’Neill');expect(cleanCertificateName('单')).toBe('单');
    for(const value of ['','   ','1234','<script>','a\nb','a'.repeat(101)])expect(()=>cleanCertificateName(value)).toThrow();
  });
  it('keeps five-question history and XP separate from the new certificate results',()=>{
    const old={correct:5,total:5,score:100,xp:50,completedAt:'2026-10-01T12:00:00Z'};
    const original:JourneyProgress={records:{},academy:{results:{'starter-sounds':old}}};
    expect(subjectSkillResults(original,'english')).toEqual({});
    const lesson=lessons[0],now=new Date('2026-11-04T12:00:00Z');
    const verified={subject:lesson.subject,level:lesson.level,skill:lesson.skill,version:2,correct:16,total:20,score:80,completedAt:now.toISOString()};
    const completed=finishVerifiedSkill(original,lesson,verified,'attempt',now);
    expect(completed.academy?.results['starter-sounds']).toEqual(old);
    expect(subjectSkillResults(completed,'english')['starter-sounds']).toMatchObject({correct:16,total:20,score:80});
    expect(learningSummary(completed,now).xp).toBe(92);
    expect(finishVerifiedSkill(completed,lesson,verified,'attempt',now)).toBe(completed);
    expect(()=>finishVerifiedSkill(original,lesson,{...verified,total:5},'invalid',now)).toThrow('does not belong');
  });
  it('keeps both subjects’ untimed drafts and cannot restore a finished attempt',()=>{
    const draft:SkillDraft={subject:'english',level:'starter',skill:'sounds',version:2,attempt:'shared',answers:{a:'one'},checked:['a'],index:1,stage:'practice',updatedAt:10};
    const key=skillResultKey('english','starter','sounds'),other=skillResultKey('maths','starter','numbers');
    const merged=mergeJourney({records:{},skillDrafts:{[key]:draft}},{records:{},skillDrafts:{[key]:{...draft,answers:{b:'two'},checked:['b'],updatedAt:20},[other]:{...draft,subject:'maths',skill:'numbers'}}});
    expect(merged.skillDrafts?.[key].answers).toEqual({a:'one',b:'two'});expect(merged.skillDrafts?.[other]).toBeDefined();
    const completed=new Set([`skill:${key}:shared`]);expect(mergeSkillDrafts(merged.skillDrafts,{},completed)[key]).toBeUndefined();
    expect(mergeSkillDrafts(merged.skillDrafts,{},completed)[other]).toBeDefined();
  });
});
