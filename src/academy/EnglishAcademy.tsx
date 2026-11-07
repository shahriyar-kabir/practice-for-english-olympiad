import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Clock3, Headphones, Lightbulb, MessageCircle, PencilLine, RotateCcw, Sparkles, SpellCheck, Volume2, X } from 'lucide-react';
import type { JourneyProgress } from '../journey';
import type { AcademyLevel, AcademySkill } from '../learningTypes';
import { academyLevels, academySkills, lessonCatalog, levelDescriptions, levelLabels, skillLabels } from './catalog';
import { loadLesson } from './loadLessons';
import { acceptedAnswers, completeAcademyLesson, isTaskCorrect, scoreLesson } from './progress';
import type { LessonAnswers } from './progress';
import type { AcademyLesson, AcademyTask } from './types';
import './academy.css';

export type EnglishAcademyProps = {
  journey: JourneyProgress;
  onJourney: (value: JourneyProgress) => void;
  onHome: () => void;
  onClassic: () => void;
  onPracticeGames: () => void;
  initialLevel?: AcademyLevel;
  initialLessonId?: string;
};
type Stage = 'learn' | 'practice' | 'review' | 'complete';
const stageLabels: Record<Stage, string> = { learn: 'Learn', practice: 'Practice', review: 'Review', complete: 'Complete' };
const stages: Stage[] = ['learn', 'practice', 'review', 'complete'];
const skillIcons = { sounds: Volume2, vocabulary: SpellCheck, grammar: MessageCircle, reading: BookOpen, listening: Headphones, writing: PencilLine };
const skillColours: Record<AcademySkill, string> = { sounds: 'purple', vocabulary: 'orange', grammar: 'blue', reading: 'green', listening: 'pink', writing: 'teal' };

function ReferenceText({ lesson, onListen, speaking, speechNotice }: { lesson: AcademyLesson; onListen: () => void; speaking: boolean; speechNotice: string }) {
  if (!lesson.passage && !lesson.transcript) return null;
  return <aside className="ea-reference" aria-label={lesson.transcript ? 'Listening transcript' : 'Reading passage'}>
    <div className="ea-row"><h3>{lesson.transcript ? 'Listen or read the transcript' : 'Read the passage'}</h3>
      {lesson.transcript && <button className="ea-button ea-secondary" onClick={onListen}><Volume2 size={17} /> {speaking ? 'Stop audio' : 'Listen'}</button>}
    </div>
    {lesson.transcript && <p className="ea-small">Browser-generated speech. Replay if helpful, or read the same words below.</p>}
    <p className="ea-passage">{lesson.passage || lesson.transcript}</p>
    {speechNotice && <p className="ea-small" role="status">{speechNotice}</p>}
  </aside>;
}

function PracticeTask({ task, answer, onAnswer, disabled }: { task: AcademyTask; answer: string; onAnswer: (value: string) => void; disabled: boolean }) {
  const [selectedTokens, setSelectedTokens] = useState<number[]>([]);
  useEffect(() => { setSelectedTokens([]); }, [task.id]);
  if (task.type === 'choice') return <fieldset className="ea-choices" disabled={disabled}>
    <legend className="ea-sr-only">{task.prompt}</legend>
    {task.choices.map((value, index) => <label className={`ea-choice ${answer === value ? 'selected' : ''}`} key={value}>
      <input type="radio" name={task.id} value={value} checked={answer === value} onChange={() => onAnswer(value)} />
      <span className="ea-choice-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{value}</span>
    </label>)}
  </fieldset>;
  if (task.type === 'fill') return <label className="ea-answer-label">Your answer
    <input className="ea-answer-input" autoComplete="off" autoCapitalize="none" spellCheck={false} value={answer} disabled={disabled} placeholder={task.placeholder || 'Type your answer'} onChange={event => onAnswer(event.target.value)} aria-describedby={`${task.id}-hint`} />
    <small id={`${task.id}-hint`}>{task.caseSensitive ? 'Use the correct capital letter. Letter case is checked.' : 'Take your time. Extra spaces and letter case do not affect the answer.'}</small>
  </label>;
  // This legacy English screen has no Science matching tasks.
  if (task.type === 'match') return null;
  function updateTokens(next: number[]) {
    setSelectedTokens(next);
    if (task.type === 'order') onAnswer(next.map(index => task.tokens[index]).join(' '));
  }
  return <div className="ea-order">
    <p className="ea-small">Choose each tile in order. Select a tile in your answer to remove it.</p>
    <div className="ea-order-answer" aria-label="Your ordered answer">
      {selectedTokens.length ? selectedTokens.map((index, position) => <button key={index} disabled={disabled} type="button" onClick={() => updateTokens(selectedTokens.filter((_, item) => item !== position))} aria-label={`Remove ${task.tokens[index]} from position ${position + 1}`}>{task.tokens[index]} <X size={12} aria-hidden="true" /></button>) : <span>Your sentence or word will appear here</span>}
    </div>
    <div className="ea-token-bank" aria-label="Available tiles">{task.tokens.map((token, index) => <button key={index} type="button" disabled={disabled || selectedTokens.includes(index)} onClick={() => updateTokens([...selectedTokens, index])} aria-label={`Add ${token}`}>{token}</button>)}</div>
    <button className="ea-text-button" type="button" disabled={disabled || !selectedTokens.length} onClick={() => updateTokens([])}><RotateCcw size={14} /> Clear answer</button>
  </div>;
}

export default function EnglishAcademy({ journey, onJourney, onHome, onClassic, onPracticeGames, initialLevel = 'starter', initialLessonId }: EnglishAcademyProps) {
  const [level, setLevel] = useState<AcademyLevel>(lessonCatalog.find(item => item.id === initialLessonId)?.level || initialLevel);
  const [activeId, setActiveId] = useState<string | null>(initialLessonId || null);
  const [lesson, setLesson] = useState<AcademyLesson | null>(null);
  const [loadError, setLoadError] = useState('');
  const [loadRetry, setLoadRetry] = useState(0);
  const [stage, setStage] = useState<Stage>('learn');
  const [taskIndex, setTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<LessonAnswers>({});
  const [checked, setChecked] = useState(false);
  const [completion, setCompletion] = useState<ReturnType<typeof completeAcademyLesson> | null>(null);
  const [saveError, setSaveError] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [speechNotice, setSpeechNotice] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const savedRef = useRef(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const results = journey.academy?.results || {};
  const selectedLessons = lessonCatalog.filter(item => item.level === level);
  const lastLesson = lessonCatalog.find(item => item.id === journey.academy?.lastLessonId && !results[item.id]);
  const suggestedLesson = lastLesson || selectedLessons.find(item => !results[item.id]) || selectedLessons[0];
  const completedCount = lessonCatalog.filter(item => Boolean(results[item.id])).length;

  useEffect(() => {
    setLevel(lessonCatalog.find(item => item.id === initialLessonId)?.level || initialLevel);
    setActiveId(initialLessonId || null);
  }, [initialLevel, initialLessonId]);

  useEffect(() => {
    if (!activeId) { setLesson(null); return; }
    let cancelled = false;
    setLesson(null); setLoadError(''); setStage('learn'); setAnswers({}); setTaskIndex(0); setChecked(false); setCompletion(null); setSaveError(''); setSpeechNotice(''); setSpeaking(false); savedRef.current = false;
    loadLesson(activeId).then(value => { if (!cancelled) { setLesson(value); setLevel(value.level); } }).catch(() => { if (!cancelled) setLoadError('We could not open this lesson. Try again, or choose another lesson.'); });
    return () => { cancelled = true; };
  }, [activeId, loadRetry]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [stage, taskIndex, lesson, activeId]);

  useEffect(() => () => {
    speechRef.current = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, [activeId]);

  function stopAudio() {
    speechRef.current = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }
  function listen() {
    if (speaking) { stopAudio(); return; }
    if (!lesson?.transcript) return;
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setSpeechNotice('Audio is unavailable in this browser. Read the transcript, or read it aloud at your own pace.'); return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lesson.transcript);
    utterance.lang = 'en-GB'; utterance.rate = .85;
    speechRef.current = utterance;
    utterance.onend = () => { if (speechRef.current === utterance) { speechRef.current = null; setSpeaking(false); } };
    utterance.onerror = event => {
      if (speechRef.current !== utterance) return;
      speechRef.current = null; setSpeaking(false);
      if (event.error !== 'canceled' && event.error !== 'interrupted') setSpeechNotice('Audio could not play. You can read the complete transcript below.');
    };
    setSpeechNotice(''); setSpeaking(true); window.speechSynthesis.speak(utterance);
  }
  function openLesson(id: string) {
    stopAudio(); setActiveId(id);
    onJourney({ ...journey, academy: { results, ...journey.academy, lastLessonId: id } });
  }
  function returnToLessons() { stopAudio(); setActiveId(null); }
  function finish() {
    if (!lesson || savedRef.current) return;
    savedRef.current = true;
    try {
      const saved = completeAcademyLesson(journey, lesson, answers);
      onJourney(saved.journey); setCompletion(saved); setStage('complete'); setSaveError(''); stopAudio();
    } catch {
      savedRef.current = false; setSaveError('Your lesson could not be completed. Please try again.');
    }
  }
  function retry() {
    stopAudio(); setAnswers({}); setTaskIndex(0); setChecked(false); setCompletion(null); setStage('learn'); savedRef.current = false;
  }

  const topbar = <div className="ea-topbar"><button className="ea-text-button" onClick={activeId ? returnToLessons : onHome}><ArrowLeft size={17} /> {activeId ? 'English lessons' : 'All subjects'}</button><span><BookOpen size={17} /> English Academy</span></div>;
  if (!activeId) return <section className="ea-page" aria-label="English Academy">
    {topbar}
    <header className="ea-hero">
      <div><span className="ea-eyebrow"><Sparkles size={15} /> A little learning, every day</span><h1 tabIndex={-1} ref={headingRef}>Your English.<br /><span>Your starting point.</span></h1><p>Build confidence through short lessons, clear examples and practice that makes sense. Start fresh or stretch your skills.</p><p className="ea-welcome">Every level is open to everyone. Adult beginners are welcome.</p></div>
      <div className="ea-progress-card"><span className="ea-progress-icon"><BookOpen size={32} /></span><strong>{completedCount} <small>/ 24 lessons</small></strong><p>One small step adds up.</p><progress max={24} value={completedCount} aria-label={`${completedCount} of 24 lessons completed`} /><span>{24 - completedCount} lessons to explore at your own pace</span></div>
    </header>
    <section className="ea-continue" aria-label="Continue learning"><div><span className="ea-eyebrow">{completedCount ? 'Continue learning' : 'Your first small step'}</span><h2>{suggestedLesson.title}</h2><p>{levelLabels[suggestedLesson.level]} · {skillLabels[suggestedLesson.skill]} · No timer</p></div><button className="ea-button" onClick={() => openLesson(suggestedLesson.id)}>{results[suggestedLesson.id] ? 'Review lesson' : completedCount ? 'Continue learning' : 'Start learning'} <ArrowRight size={18} /></button></section>
    <div className="ea-section-heading"><h2>Find your starting point</h2><p>Choose by confidence and experience. Change level whenever you like.</p></div>
    <div className="ea-levels" role="group" aria-label="Choose a learning level">{academyLevels.map((item, index) => <button key={item} className={`ea-level ${item === level ? 'selected' : ''}`} aria-pressed={item === level} onClick={() => setLevel(item)}><span className="ea-level-number">0{index + 1}</span><strong>{levelLabels[item]}</strong><small>{levelDescriptions[item]}</small><span className="ea-level-status">{item === level ? <><Check size={14} /> Selected</> : 'Choose level'}</span></button>)}</div>
    <div className="ea-section-heading"><h2>{levelLabels[level]} skills</h2><p>Six ways to grow. Every lesson includes teaching, five practice tasks and a review.</p></div>
    <div className="ea-skills">{academySkills.map(skill => {
      const item = selectedLessons.find(entry => entry.skill === skill)!;
      const Icon = skillIcons[skill]; const result = results[item.id];
      return <button key={skill} className={`ea-skill ea-${skillColours[skill]}`} onClick={() => openLesson(item.id)}><span className="ea-skill-icon"><Icon size={25} /></span><span className="ea-skill-label">{skillLabels[skill]}</span><h3>{item.title}</h3><p>{item.description}</p><span className="ea-skill-foot"><span><Clock3 size={14} /> {item.duration} · No timer</span>{result ? <span><CheckCircle2 size={14} /> Best {result.score}%</span> : <ArrowRight size={18} />}</span></button>;
    })}</div>
    <aside className="ea-game-links"><div><h2>A little play, too?</h2><p>Try five-question sets or discover ten newly written Wizpiko word puzzles.</p></div><div className="ea-actions"><button className="ea-button ea-secondary" onClick={onPracticeGames}>Practice games <ArrowRight size={16} /></button><button className="ea-text-button" onClick={onClassic}>Wizpiko word puzzles <ArrowRight size={16} /></button></div></aside>
  </section>;

  if (!lesson) return <section className="ea-page">{topbar}<div className="ea-panel ea-loading" role={loadError ? 'alert' : 'status'}><BookOpen size={36} /><h1>{loadError ? 'Let’s try that again' : 'Opening your lesson…'}</h1><p>{loadError || 'Getting your examples and practice ready.'}</p>{loadError && <div className="ea-actions"><button className="ea-button" onClick={() => setLoadRetry(value => value + 1)}>Try again</button><button className="ea-button ea-secondary" onClick={returnToLessons}>Choose a lesson</button></div>}</div></section>;
  const task = lesson.tasks[taskIndex];
  const score = scoreLesson(lesson, answers);
  const nextLesson = lessonCatalog.find(item => item.level === lesson.level && item.id !== lesson.id && !results[item.id]);
  const reference = <ReferenceText lesson={lesson} onListen={listen} speaking={speaking} speechNotice={speechNotice} />;
  return <section className="ea-page ea-lesson-page">
    {topbar}
    <header className="ea-lesson-heading"><span className="ea-eyebrow">{levelLabels[lesson.level]} · {skillLabels[lesson.skill]}</span><h1>{lesson.title}</h1><p><Clock3 size={15} /> About {lesson.duration} · Take as long as you need</p></header>
    <ol className="ea-steps" aria-label="Lesson progress">{stages.map((item, index) => <li key={item} className={stages.indexOf(stage) >= index ? 'active' : ''} aria-current={item === stage ? 'step' : undefined}><span>{stages.indexOf(stage) > index ? <Check size={15} /> : index + 1}</span>{stageLabels[item]}</li>)}</ol>
    {stage === 'learn' && <div className="ea-panel">
      <span className="ea-eyebrow"><Lightbulb size={15} /> Start with the idea</span><h2 ref={headingRef} tabIndex={-1}>{lesson.objective}</h2>
      <div className="ea-teaching">{lesson.teaching.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
      <div className="ea-examples">{lesson.examples.map(example => <div key={example.before}><span>{example.before}</span><ArrowRight size={18} /><strong>{example.after}</strong></div>)}</div>
      {reference}
      {lesson.speakingPractice && <aside className="ea-speaking"><h3><MessageCircle size={18} /> Try it aloud</h3><p>{lesson.speakingPractice}</p><p className="ea-small">Optional self-practice. Your voice is not recorded or graded.</p></aside>}
      <div className="ea-panel-actions"><p>Five short tasks. You can return to these notes.</p><button className="ea-button" onClick={() => { stopAudio(); setStage('practice'); }}>Let’s practise <ArrowRight size={18} /></button></div>
    </div>}
    {stage === 'practice' && <div className="ea-practice-layout"><div className="ea-panel ea-practice-panel">
      <div className="ea-row"><span className="ea-eyebrow">Practice {taskIndex + 1} of {lesson.tasks.length}</span><span className="ea-small">No timer</span></div><progress className="ea-task-progress" max={lesson.tasks.length} value={taskIndex} aria-label={`${taskIndex} of ${lesson.tasks.length} questions reviewed`} />
      <h2 ref={headingRef} tabIndex={-1}>{task.prompt}</h2>
      <form onSubmit={event => { event.preventDefault(); if (answers[task.id]?.trim() && !checked) setChecked(true); }}>
        <PracticeTask key={task.id} task={task} answer={answers[task.id] || ''} disabled={checked} onAnswer={answer => setAnswers(previous => ({ ...previous, [task.id]: answer }))} />
        {!checked && <button className="ea-button ea-check-answer" type="submit" disabled={!answers[task.id]?.trim()}>Check answer <Check size={17} /></button>}
      </form>
      {checked && <div className={`ea-feedback ${isTaskCorrect(task, answers[task.id]) ? 'correct' : 'try-again'}`} role="status"><strong>{isTaskCorrect(task, answers[task.id]) ? <><CheckCircle2 size={19} /> You’ve got it</> : <><Lightbulb size={19} /> A useful one to review</>}</strong>{!isTaskCorrect(task, answers[task.id]) && <p>Answer: <b>{acceptedAnswers(task)[0]}</b></p>}<p>{task.explanation}</p>{task.evidence && <blockquote>From the text: “{task.evidence}”</blockquote>}<button className="ea-button" onClick={() => { if (taskIndex + 1 < lesson.tasks.length) { setTaskIndex(index => index + 1); setChecked(false); } else { stopAudio(); setStage('review'); } }}>{taskIndex + 1 < lesson.tasks.length ? 'Next question' : 'Review my practice'} <ArrowRight size={17} /></button></div>}
      <details className="ea-notes"><summary>Look back at the lesson notes</summary>{lesson.teaching.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{lesson.examples.map(example => <p key={example.before}><b>{example.before}:</b> {example.after}</p>)}</details>
    </div>{(lesson.passage || lesson.transcript) && <div>{reference}</div>}</div>}
    {stage === 'review' && <div className="ea-panel">
      <span className="ea-eyebrow">Make it stick</span><h2 ref={headingRef} tabIndex={-1}>Your practice, explained</h2><p>You answered {score.correct} of {score.total} correctly. Take a moment to review, then complete the lesson to save your result.</p>
      <ol className="ea-review-list">{lesson.tasks.map((item, index) => <li key={item.id}><div className="ea-row"><strong>{index + 1}. {item.prompt}</strong><span className={isTaskCorrect(item, answers[item.id]) ? 'ea-correct-label' : 'ea-review-label'}>{isTaskCorrect(item, answers[item.id]) ? 'Correct' : 'Review'}</span></div><p>Your answer: {answers[item.id]}</p>{!isTaskCorrect(item, answers[item.id]) && <p>Answer: <b>{acceptedAnswers(item)[0]}</b></p>}<p>{item.explanation}</p>{item.evidence && <blockquote>From the text: “{item.evidence}”</blockquote>}</li>)}</ol>
      <div className="ea-recap"><h3>Keep this with you</h3><p>{lesson.recap}</p></div>
      {saveError && <p role="alert">{saveError}</p>}<div className="ea-panel-actions"><p>Best scores stay saved. Repeating a score earns no extra XP.</p><button className="ea-button" onClick={finish}>Complete lesson <CheckCircle2 size={18} /></button></div>
    </div>}
    {stage === 'complete' && completion && <div className="ea-panel ea-completion">
      <span className="ea-completion-icon"><CheckCircle2 size={42} /></span><span className="ea-eyebrow">Another step forward</span><h2 ref={headingRef} tabIndex={-1}>Lesson complete!</h2><p>You’ve practised {skillLabels[lesson.skill].toLowerCase()}. Keep going at your own pace.</p>
      <div className="ea-result-grid"><div><strong>{completion.attempt.correct}/{completion.attempt.total}</strong><span>This practice</span></div><div><strong>{completion.result.score}%</strong><span>Best score</span></div><div><strong>+{completion.delta} XP</strong><span>{completion.delta ? 'Progress earned' : 'Best result kept'}</span></div></div>
      <p className="ea-small">{completion.delta ? 'Lesson XP grows only when your best score improves, up to 50 XP per lesson.' : 'You keep your best score and XP. Improve your score to earn the remaining lesson XP.'}</p>
      <div className="ea-recap"><h3>Your next real-life step</h3><p>{lesson.recap}</p></div>
      <div className="ea-actions">{nextLesson && <button className="ea-button" onClick={() => openLesson(nextLesson.id)}>Next lesson <ArrowRight size={18} /></button>}<button className="ea-button ea-secondary" onClick={returnToLessons}>Explore lessons</button><button className="ea-text-button" onClick={retry}><RotateCcw size={16} /> Practise again</button></div>
      <div className="ea-game-footer"><button className="ea-text-button" onClick={onPracticeGames}>Try practice games</button><button className="ea-text-button" onClick={onClassic}>Wizpiko word puzzles</button></div>
    </div>}
  </section>;
}
