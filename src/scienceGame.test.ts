import { describe,expect,it } from 'vitest';
import { makeScienceRound, scienceBand } from './scienceGame';
import { academyLevels, learningPrograms, loadCurriculumLesson, taskCorrect } from '../supabase/functions/_shared/curriculum/programs';

describe('Science Academy and Discovery Trail',()=>{
 it('has six skills and all four open learning levels',async()=>{
  expect(learningPrograms.science.skills).toHaveLength(6);
  for(const level of academyLevels){
   const lessons=await Promise.all(learningPrograms.science.skills.map(skill=>loadCurriculumLesson('science',level,skill.id)));
   expect(lessons).toHaveLength(6);
   for(const lesson of lessons) {
    expect(lesson.tasks).toHaveLength(20);
    expect(new Set(lesson.tasks.map(task=>task.id)).size).toBe(20);
    for(const task of lesson.tasks){
     expect(task.visual).toBeTruthy();
     expect(taskCorrect(task,task.type==='fill'?task.answers[0]:task.answer)).toBe(true);
     if(task.type==='match'){
      expect(task.pairs).toHaveLength(3);
      expect(task.options).toHaveLength(3);
      expect(taskCorrect(task,'[]')).toBe(false);
     }
    }
   }
  }
 });
 it('creates valid and varied saved-game-friendly five-question rounds',()=>{
  for(const level of ['1','10','16','30','31','51','60','61','101','999999','1000000000000']){
   const questions=makeScienceRound(level,'science-seed');
   expect(questions).toHaveLength(5);
   expect(new Set(questions.map(q=>q.id)).size).toBe(5);
   for(const question of questions){
    expect(question.choices).toHaveLength(4);
    expect(new Set(question.choices).size).toBe(4);
    expect(question.choices).toContain(question.answer);
    expect(question.explanation.length).toBeGreaterThan(15);
    expect(question.hint.length).toBeGreaterThan(15);
   }
   expect(makeScienceRound(level,'science-seed')).toEqual(questions);
  }
  expect(scienceBand('1').stage).toBe('starter');
  expect(scienceBand('101').stage).toBe('advanced');
 });
});