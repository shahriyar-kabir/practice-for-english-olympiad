import QuestionSpeaker from '../QuestionSpeaker';
import {playLearningSound,readQuestion,stopQuestion} from '../learningAudio';
import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { ArrowLeft, ArrowRight, Award, BookOpen, Calculator, Check, CheckCircle2, Headphones, Lightbulb, MessageCircle, PencilLine, RotateCcw, Sparkles, SpellCheck, Volume2, XCircle } from 'lucide-react';
import type { JourneyProgress } from '../journey';
import type { AcademyLevel } from '../learningTypes';
import { academyLevels, CURRICULUM_VERSION, learningPrograms, levelLabels, loadCurriculumLesson, skillMeta, skillResultKey, taskCorrect } from '../../supabase/functions/_shared/curriculum/programs.ts';
import type { CurriculumLesson, CurriculumSubject } from '../../supabase/functions/_shared/curriculum/programs.ts';
import { finishVerifiedSkill, skillAttemptProgress, subjectSkillResults } from '../skillProgress';
import type { SkillDraft } from '../skillProgress';
import { submitSkill } from '../certificates/api';
import type { VerifiedSkillResult } from '../certificates/api';
import { PracticeTask } from './PracticeTask';
import { acceptedAnswers } from './progress';
import './academy.css';

type Props = { subject: CurriculumSubject; journey: JourneyProgress; onJourney: Dispatch<SetStateAction<JourneyProgress>>; onHome: () => void; onGames: () => void; onCertificates: () => void; onSelectLevel: (level?: AcademyLevel) => void; initialLevel?: AcademyLevel; initialLessonId?: string };
const icons: Record<string, typeof BookOpen> = { sounds: Volume2, vocabulary: SpellCheck, grammar: MessageCircle, reading: BookOpen, listening: Headphones, writing: PencilLine, numbers: Calculator, fractions: Calculator, algebra: Lightbulb, geometry: Sparkles, data: BookOpen, reasoning: MessageCircle };
const colours = ['purple','orange','blue','green','pink','teal'];
const lessonId = (subject: CurriculumSubject, level: AcademyLevel, skill: string) => subject === 'english' ? `${level}-${skill}` : `${subject}-${level}-${skill}`;
function initialSelection(subject: CurriculumSubject, initialLevel: AcademyLevel, id?: string) {
  for (const level of academyLevels) for (const skill of learningPrograms[subject].skills) if (lessonId(subject,level,skill.id) === id) return { level, skill: skill.id };
  return { level: initialLevel, skill: null };
}

export default function LearningAcademy({ subject, journey, onJourney, onHome, onGames, onCertificates, onSelectLevel, initialLevel, initialLessonId }: Props) {
  const initial = initialSelection(subject,initialLevel||'starter',initialLessonId), programme = learningPrograms[subject];
  const level:AcademyLevel=initial.level; const [activeSkill,setActiveSkill] = useState<string|null>(initial.skill);
  const [lesson,setLesson] = useState<CurriculumLesson|null>(null), [error,setError] = useState(''), [reload,setReload] = useState(0);
  const [pending,setPending] = useState(false), [complete,setComplete] = useState<(VerifiedSkillResult&{attemptCorrect:number})|null>(null);
  const [speaking,setSpeaking] = useState(false), [audioNotice,setAudioNotice] = useState('');
  const alive = useRef(true), heading = useRef<HTMLHeadingElement>(null);
  const results = subjectSkillResults(journey,subject), selected = skillMeta(subject,level);
  const completedCount = Object.keys(results).length, skillCount=programme.skills.length, totalSkills=skillCount*academyLevels.length;
  const passed = selected.filter(meta => (results[lessonId(subject,level,meta.id)]?.score || 0) >= 80).length;
  const key = activeSkill ? skillResultKey(subject,level,activeSkill) : '';
  const draft = journey.skillDrafts?.[key];
  const stage = draft?.stage || 'learn', index = Math.max(0,Math.min(19,draft?.index || 0));
  const task = lesson?.tasks[index], answer = task ? draft?.answers?.[task.id] || '' : '';
  const checked = !!task && Boolean(draft?.checked?.includes(task.id));

  useEffect(() => { alive.current=true; return () => { alive.current=false; if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }; },[]);
  useEffect(() => {
    if (!activeSkill) { setLesson(null); return; }
    let cancelled=false; setLesson(null); setError(''); setComplete(null); setSpeaking(false); setAudioNotice('');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    loadCurriculumLesson(subject,level,activeSkill).then(value => {
      if(cancelled)return; setLesson(value);
      const now=Date.now(), attempt=globalThis.crypto?.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`;
      onJourney(previous => {
        const saved=previous.skillDrafts?.[key];
        if(saved?.version===CURRICULUM_VERSION && saved.subject===subject && saved.level===level && saved.skill===activeSkill && saved.answers && Array.isArray(saved.checked))return previous;
        const next:SkillDraft={subject,level,skill:activeSkill,version:CURRICULUM_VERSION,attempt,answers:{},checked:[],index:0,stage:'learn',updatedAt:now};
        return {...previous,skillDrafts:{...previous.skillDrafts,[key]:next}};
      });
    }).catch(() => {if(!cancelled)setError('We could not open this skill. Please try again.');});
    return () => {cancelled=true;};
  },[subject,level,activeSkill,reload]);
  useEffect(() => {heading.current?.focus({preventScroll:true});},[lesson,stage,index,complete]);

  function edit(patch: Partial<SkillDraft>) {
    if(!draft || pending)return;
    onJourney(previous => {
      const saved=previous.skillDrafts?.[key]; if(saved?.attempt!==draft.attempt)return previous;
      return {...previous,skillDrafts:{...previous.skillDrafts,[key]:{...saved,...patch,updatedAt:Date.now()}}};
    });
  }
  function open(skill:string){setComplete(null);setActiveSkill(skill);window.scrollTo(0,0);}
  function back(){if('speechSynthesis' in window)window.speechSynthesis.cancel();setSpeaking(false);setActiveSkill(null);setError('');setComplete(null);window.scrollTo(0,0);}
  function listen(){
    if(speaking){stopQuestion();setSpeaking(false);return;}
    if(!lesson?.transcript)return;
    if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){setAudioNotice('Audio is unavailable. Read the same words in the transcript.');return;}
    setSpeaking(true);readQuestion(lesson.transcript,error=>{if(alive.current){setSpeaking(false);if(error)setAudioNotice(error);}});
  }
  async function finish(){
    if(!lesson||!draft||pending||lesson.tasks.some(item=>!draft.answers[item.id]?.trim()||!draft.checked.includes(item.id)))return;
    setPending(true);setError('');
    try{
      const saved=await submitSkill(subject,level,lesson.skill,draft.answers);
      if(!alive.current)return;
      onJourney(previous=>finishVerifiedSkill(previous,lesson,saved.result,draft.attempt,new Date(),saved.attempt.correct));setComplete({...saved.result,attemptCorrect:saved.attempt.correct});
      if('speechSynthesis' in window)window.speechSynthesis.cancel();setSpeaking(false);
    }catch(cause){if(alive.current)setError(cause instanceof Error?cause.message:'Your answers are saved. Please try again.');}
    finally{if(alive.current)setPending(false);}
  }
  function retry(){
    if(!lesson)return;const now=Date.now(), attempt=globalThis.crypto?.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`;
    onJourney(previous=>({...previous,skillDrafts:{...previous.skillDrafts,[key]:{subject,level,skill:lesson.skill,version:CURRICULUM_VERSION,attempt,answers:{},checked:[],index:0,stage:'learn',updatedAt:now}}}));
    setComplete(null);setError('');
  }
  const topbar=<div className="ea-topbar"><button className="ea-text-button" type="button" disabled={pending} onClick={activeSkill?back:initialLevel?()=>onSelectLevel(undefined):onHome}><ArrowLeft size={17}/>{activeSkill?`${programme.name} skills`:initialLevel?'Back to levels':'All subjects'}</button><span><BookOpen size={17}/>{programme.title}</span></div>;
  if(!activeSkill&&!initialLevel)return <section className="ea-page" aria-label={programme.title}>{topbar}
    <header className="ea-hero"><div><span className="ea-eyebrow"><Sparkles size={15}/>A little learning, every day</span><h1 ref={heading} tabIndex={-1}>Your {programme.name}.<br/><span>Your starting point.</span></h1><p>{programme.description} Learn through clear teaching and twenty questions for every skill.</p><p className="ea-welcome">Every level is open at every age. Choose by confidence.</p></div><div className="ea-progress-card"><span className="ea-progress-icon"><BookOpen size={32}/></span><strong>{completedCount}<small> / {totalSkills} skills</small></strong><p>Twenty questions, one skill at a time.</p><progress max={totalSkills} value={completedCount} aria-label={`${completedCount} of ${totalSkills} skills completed`}/><span>Your earlier practice and XP stay saved.</span></div></header>
    <div className="ea-section-heading"><h2>Find your starting point</h2><p>Choose a level to explore its skills.</p></div><div className="ea-levels" role="group" aria-label="Choose a learning level">{academyLevels.map((item,at)=><button type="button" key={item} className={`ea-level $`} aria-pressed={false} onClick={()=>onSelectLevel(item)}><span className="ea-level-number">0{at+1}</span><strong>{levelLabels[item]}</strong><small>{programme.levelDescriptions[item]}</small><span className="ea-level-status">'Explore skills'</span></button>)}</div>
  </section>;
  if(!activeSkill)return <section className="ea-page" aria-label={programme.title}>{topbar}
    <header className="ea-level-page-heading"><span className="ea-eyebrow">CHOOSE A SKILL</span><h1>{levelLabels[level]} skills</h1><p>{programme.name} · Select a skill to learn and practise 20 questions.</p></header>
    <section className="ea-certificate-progress"><Award size={30}/><div><h2>Your {levelLabels[level]} certificate</h2><p>{passed} of {skillCount} skills at 80% or above. Finish all 20 questions in each skill and score at least 16/20 in every skill.</p></div><button type="button" className="ea-button ea-secondary" onClick={onCertificates}>{passed===skillCount?'Create my certificate':'My certificates'}<ArrowRight size={17}/></button></section>
    <div className="ea-section-heading"><h2>{levelLabels[level]} skills</h2><p>{skillCount} ways to grow. Each skill includes teaching, 20 questions and a review.</p></div><div className="ea-skills">{selected.map((meta,at)=>{const Icon=icons[meta.id]||BookOpen;const result=results[lessonId(subject,level,meta.id)], saved=journey.skillDrafts?.[skillResultKey(subject,level,meta.id)], attemptProgress=skillAttemptProgress(saved);return <button type="button" key={meta.id} className={`ea-skill ea-${colours[at]}`} onClick={()=>open(meta.id)}><span className="ea-skill-icon"><Icon size={25}/></span><span className="ea-skill-label">{meta.label}</span><h3>{meta.title}</h3><p>{meta.description}</p><span className="ea-skill-foot"><span>20 questions</span><span className="ea-skill-score">{result && <span className="ea-skill-best"><CheckCircle2 size={14}/>Best {result.score}%</span>}{saved && attemptProgress.graded>0 && <span className="ea-skill-current">Current: {attemptProgress.correct}/{attemptProgress.graded} correct so far</span>}{saved && <span className="ea-skill-resume">Resume skill</span>}{!saved&&!result&&<ArrowRight size={18}/>}</span></span></button>;})}</div>
    <aside className="ea-game-links"><div><h2>A little play, too?</h2><p>Keep practising with short games and your saved game progress.</p></div><button type="button" className="ea-button ea-secondary" onClick={onGames}>Explore games<ArrowRight size={17}/></button></aside>
  </section>;
  if(!lesson||!draft&&!complete)return <section className="ea-page">{topbar}<div className="ea-panel ea-loading" role={error?'alert':'status'}><BookOpen size={35}/><h1>{error?'Let’s try again':'Preparing your skill…'}</h1><p>{error||'Getting the examples and twenty questions ready.'}</p>{error&&<button type="button" className="ea-button" onClick={()=>setReload(value=>value+1)}>Try again</button>}</div></section>;
  const reference=(lesson.passage||lesson.transcript)?<aside className="ea-reference" aria-label={lesson.transcript?'Listening transcript':'Reading passage'}><div className="ea-row"><h3>{lesson.transcript?'Listen or read the transcript':'Read the passage'}</h3>{lesson.transcript&&<button className="ea-button ea-secondary" onClick={listen}><Volume2 size={17}/>{speaking?'Stop audio':'Listen'}</button>}</div>{lesson.transcript&&<p className="ea-small">Browser speech or the same written transcript. Speaking practice is optional and is not recorded or graded.</p>}<p className="ea-passage">{lesson.passage||lesson.transcript}</p>{audioNotice&&<p role="status">{audioNotice}</p>}</aside>:null;
  const correct=lesson.tasks.filter(item=>taskCorrect(item,draft?.answers[item.id])).length;
  return <section className="ea-page ea-lesson-page">{topbar}<header className="ea-lesson-heading"><span className="ea-eyebrow">{levelLabels[level]} · {programme.skills.find(item=>item.id===activeSkill)?.label}</span><h1>{lesson.title}</h1><p>20 questions · Your progress saves automatically</p></header>
    {!complete&&<ol className="ea-steps" aria-label="Skill progress">{['learn','practice','review'].map((step,at)=><li key={step} className={['learn','practice','review'].indexOf(stage)>=at?'active':''} aria-current={stage===step?'step':undefined}><span>{at+1}</span>{step[0].toUpperCase()+step.slice(1)}</li>)}</ol>}
    {complete?<div className="ea-panel ea-completion"><span className="ea-completion-icon"><CheckCircle2 size={42}/></span><span className="ea-eyebrow">Another step forward</span><h2 tabIndex={-1} ref={heading}>Skill complete!</h2><p>{complete.attemptCorrect}/20 correct this time · Best {complete.score}%</p><p>{complete.score>=80?'Your best result meets the certificate requirement.':'Reach 16/20 in this skill to meet the certificate requirement. You can practise again.'}</p><div className="ea-actions"><button type="button" className="ea-button" onClick={back}>Explore skills<ArrowRight size={17}/></button><button type="button" className="ea-button ea-secondary" onClick={onCertificates}>My certificates</button><button type="button" className="ea-text-button" onClick={retry}><RotateCcw size={15}/>Practise again</button></div></div>:stage==='learn'?<div className="ea-panel"><span className="ea-eyebrow"><Lightbulb size={15}/>Start with the idea</span><h2 tabIndex={-1} ref={heading}>{lesson.objective}</h2><div className="ea-teaching">{lesson.teaching.map(text=><p key={text}>{text}</p>)}</div><div className="ea-examples">{lesson.examples.map(example=><div key={example.before}><span>{example.before}</span><ArrowRight size={17}/><strong>{example.after}</strong></div>)}</div>{reference}{lesson.speakingPractice&&<aside className="ea-speaking"><h3>Try it aloud</h3><p>{lesson.speakingPractice}</p></aside>}<div className="ea-panel-actions"><p>Your answers save as you go.</p><button type="button" className="ea-button" onClick={()=>edit({stage:'practice'})}>Let’s practise<ArrowRight size={17}/></button></div></div>:stage==='practice'&&task?<div className="ea-practice-layout"><div className="ea-panel ea-practice-panel"><div className="ea-row"><span className="ea-eyebrow">Question {index+1} of 20</span>{index>0&&<button type="button" className="ea-text-button" onClick={()=>edit({index:index-1})}><ArrowLeft size={14}/>Previous question</button>}</div><progress className="ea-task-progress" max={20} value={draft?.checked.length||0} aria-label="Questions reviewed"/><div className="wz-question-heading"><h2 tabIndex={-1} ref={heading}>{task.prompt}</h2><QuestionSpeaker text={task.prompt+(task.type==='choice'?' Choices: '+task.choices.join('. '):'')}/></div><form onSubmit={event=>{event.preventDefault();if(answer.trim()&&!checked){playLearningSound(taskCorrect(task,answer)?'correct':'retry');edit({checked:[...(draft?.checked||[]),task.id],checkedCorrect:{...draft?.checkedCorrect,[task.id]:taskCorrect(task,answer)}});}}}><PracticeTask key={task.id} task={task} answer={answer} disabled={checked} onAnswer={value=>edit({answers:{...draft?.answers,[task.id]:value}})}/>{!checked&&<button className="ea-button ea-check-answer" disabled={!answer.trim()}>Check answer<Check size={17}/></button>}</form>{checked&&<div className={`ea-feedback ${taskCorrect(task,answer)?'correct':'try-again'}`} role="status"><strong>{taskCorrect(task,answer)?'You’ve got it':'A useful one to review'}</strong><p>Answer: <b>{acceptedAnswers(task)[0]}</b></p><p>{task.explanation}</p>{task.evidence&&<blockquote>From the text: “{task.evidence}”</blockquote>}<button type="button" className="ea-button" onClick={()=>edit(index===19?{stage:'review'}:{index:index+1})}>{index===19?'Review my practice':'Next question'}<ArrowRight size={17}/></button></div>}<details className="ea-notes"><summary>Look back at the lesson notes</summary>{lesson.teaching.map(text=><p key={text}>{text}</p>)}</details><p className="ea-small">Your unfinished skill stays saved if you leave.</p></div>{reference&&<div>{reference}</div>}</div>:<div className="ea-panel"><span className="ea-eyebrow">Make it stick</span><h2 tabIndex={-1} ref={heading}>Your practice, explained</h2><p>{correct} of 20 correct. Review the answers, then save your verified skill result.</p><ol className="ea-review-list">{lesson.tasks.map((item,at)=>{const isCorrect=taskCorrect(item,draft?.answers[item.id]);return <li key={item.id}><strong>{at+1}. {item.prompt}</strong><div className="ea-review-answer-row"><p>Your answer: {draft?.answers[item.id]}</p><span className={`ea-review-answer-result ${isCorrect?'is-correct':'is-incorrect'}`} role="img" aria-label={isCorrect?'Correct answer':'Incorrect answer'}>{isCorrect?<CheckCircle2 size={22} aria-hidden="true"/>:<XCircle size={22} aria-hidden="true"/>}</span></div><p>Answer: <b>{acceptedAnswers(item)[0]}</b></p><p>{item.explanation}</p></li>})}</ol><div className="ea-recap"><h3>Keep this with you</h3><p>{lesson.recap}</p></div>{error&&<p className="ea-save-error" role="alert">{error}</p>}<div className="ea-panel-actions"><p>One verified result. No repeated XP for the same best score.</p><button type="button" className="ea-button" onClick={()=>{void finish();}} disabled={pending}>{pending?'Saving verified result…':'Complete skill'}<CheckCircle2 size={17}/></button></div></div>}
  </section>;
}
