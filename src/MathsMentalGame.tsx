import QuestionSpeaker from './QuestionSpeaker';
import {playLearningSound} from './learningAudio';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Infinity as InfinityIcon, Lightbulb, Play, Sparkles, Star } from 'lucide-react';
import type { SubjectGameScreenProps } from './gameSubjects';
import { makeMentalRound, mentalBand } from './mathsMental';
import { advanceSubjectRound, answerSubjectRound, finishSubjectRound, formatGameLevel, readSubjectGame, startSubjectRound, subjectGameStats } from './subjectGameProgress';
import type { SubjectGameProgress } from './subjectGameProgress';
import { completeSubjectGame } from './subjectGameLearning';
import './subject-games.css';

type RoundResult = NonNullable<ReturnType<typeof finishSubjectRound>>['result'];
const startingPoints = [
  { level: '1', title: 'Number sparks', detail: 'Counting, adding & taking away', symbol: '+' },
  { level: '16', title: 'Table explorer', detail: 'Times tables, division & squares', symbol: '×' },
  { level: '51', title: 'Fraction finder', detail: 'Fractions, percentages & tenths', symbol: '½' },
  { level: '101', title: 'Mental mix', detail: 'A little of everything', symbol: '∞' },
];

export default function MathsMentalGame({ journey, onJourney, onHome }: SubjectGameScreenProps) {
  const progress = readSubjectGame(journey.subjectGames?.maths);
  const stats = subjectGameStats(progress), session = progress.session;
  const band = mentalBand(session?.level || progress.level);
  const [result, setResult] = useState<RoundResult | null>(null);
  // Opening Maths always displays the chooser; a stored session is never auto-opened.
  const [showRound, setShowRound] = useState(false);
  const [customLevel, setCustomLevel] = useState('');
  const pausedRounds=Object.values(progress.pausedSessions||{}).sort((a,b)=>b.updatedAt-a.updatedAt);
  const resumeRound=session||pausedRounds[0];
  const heading = useRef<HTMLHeadingElement>(null);
  const finishing = useRef<string | null>(null);
  const question = session?.questions[session.index];
  const answered = session ? Object.keys(session.answers).length : 0;
  const choice = session?.answers[session.index];
  const checked = choice !== undefined;
  useEffect(() => { if (session && showRound) heading.current?.focus(); }, [session?.id, session?.index, showRound]);

  function start(level = progress.level) {
    setResult(null); finishing.current = null;
    const now=Date.now(), id=globalThis.crypto?.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`;
    const questions=makeMentalRound(level,id);
    onJourney(current=>{
      const saved=readSubjectGame(current.subjectGames?.maths);
      const next=startSubjectRound(saved,level,questions,now,id);
      if(next===saved)return current;
      return {...current,subjectGames:{...current.subjectGames,maths:next}};
    });
    setShowRound(true);
    window.scrollTo({top:0,behavior:'instant'});
  }
  function goToLevels(){
    setShowRound(false);
    window.scrollTo({top:0,behavior:'instant'});
  }
  function updateRound(update: (value: SubjectGameProgress) => SubjectGameProgress) {
    onJourney(current => {
      const saved = readSubjectGame(current.subjectGames?.maths);
      if (!session || saved.session?.id !== session.id) return current;
      return { ...current, subjectGames: { ...current.subjectGames, maths: update(saved) } };
    });
  }
  function showHint() {
    updateRound(saved => {
      if (!saved.session || saved.session.hints.includes(saved.session.index)) return saved;
      const now = Date.now();
      return { ...saved, updatedAt: now, session: { ...saved.session, hints: [...saved.session.hints, saved.session.index], updatedAt: now } };
    });
  }
  function finish() {
    if (!session || finishing.current === session.id) return;
    const now = new Date(), finished = finishSubjectRound(progress, now.getTime());
    if (!finished) return;
    finishing.current = session.id;
    onJourney(current => completeSubjectGame(current, 'maths', session.id, now));
    setResult(finished.result);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  return <div className="sg-page mm-page">
    <div className="sg-topline"><button type="button" onClick={onHome}><ArrowLeft size={17} /> All games</button><span>Maths <ChevronRight size={14} /> Mental Maths Trail</span></div>
    {result ? <>
      <header className="mm-result-header"><span className="mm-result-star" aria-hidden="true">{result.passed ? '🌟' : '🌱'}</span><span className="sg-kicker">LEVEL {formatGameLevel(result.level)} COMPLETE</span><h1>{result.passed ? 'A little win. A new level!' : 'Good thinking. Keep exploring!'}</h1><p>{result.correct} of {result.total} correct · {result.xp > 0 ? `+${result.xp} XP` : 'Your best XP is already saved'}</p><p>{result.passed ? `Level ${formatGameLevel(progress.level)} is ready when you are.` : 'Get 4 of 5 right to move on. Try a fresh round whenever you like.'}</p><div className="mm-result-actions"><button type="button" className="sg-primary" onClick={() => start()}>{result.passed ? 'Play next level' : 'Try a fresh round'} <ArrowRight size={18} /></button><button type="button" className="sg-secondary" onClick={() => {setResult(null);goToLevels();}}>Choose a starting point</button></div></header>
      <section className="mm-review" aria-label="Round answers and explanations"><div className="sg-section-title"><h2>Your thinking toolkit</h2><span>Every answer, explained</span></div>{result.questions.map((q, index) => <article className="mm-review-item" key={q.id}><span className={`mm-review-mark${result.answers[index] === q.answer ? ' is-correct' : ''}`} aria-label={result.answers[index] === q.answer ? 'Correct' : 'Review'}>{result.answers[index] === q.answer ? <Check size={18} /> : <Lightbulb size={18} />}</span><div><span className="sg-kicker">{q.topic}</span><h3>{q.prompt}</h3><p><strong>Answer: {q.answer}</strong>{result.answers[index] !== q.answer && <span> · You chose {result.answers[index]}</span>}</p><p>{q.explanation}</p></div></article>)}</section>
    </> : showRound && session && question ? <>
      <nav className="mm-inround-nav" aria-label="Maths round navigation"><button type="button" className="sg-secondary" onClick={goToLevels}><ArrowLeft size={16}/> Back to Maths Levels</button><span>Your unfinished answers are saved</span></nav>
      <div className="mm-round-heading"><div><span className="sg-kicker">{band.name}</span><h1>Level {formatGameLevel(session.level)}</h1></div><span className="mm-no-rush"><Sparkles size={16} /> Take your time</span></div>
      <div className="mm-round-progress"><span>Question {session.index + 1} of {session.questions.length}</span><div aria-label={`${answered} of 5 questions answered`}>{session.questions.map((q, index) => <span key={q.id} className={session.answers[index] !== undefined ? 'is-done' : index === session.index ? 'is-current' : ''} aria-hidden="true">{session.answers[index] !== undefined ? <Check size={12} /> : index + 1}</span>)}</div></div>
      <section className="mm-question-card" aria-labelledby="mental-question"><span className="mm-topic">{question.topic}</span><div className="wz-question-heading"><h2 id="mental-question" ref={heading} tabIndex={-1}>{question.prompt}</h2><QuestionSpeaker text={question.prompt+' Choices: '+question.choices.join('. ')}/></div><p className="mm-question-help">Work it out in your head, then choose an answer.</p>
        <div className="mm-choices" role="group" aria-label="Answer choices">{question.choices.map((answer, index) => <button type="button" key={answer} disabled={checked} className={`${checked && answer === question.answer ? 'is-correct' : ''}${checked && answer === choice && answer !== question.answer ? ' is-try' : ''}`} onClick={() => {playLearningSound(answer===question.answer?'correct':'retry');updateRound(saved => answerSubjectRound(saved, answer));}}><span aria-hidden="true">{String.fromCharCode(65 + index)}</span><strong>{answer}</strong>{checked && answer === question.answer && <Check size={20} aria-label="Correct answer" />}</button>)}</div>
        {checked ? <div className={`mm-feedback${choice === question.answer ? ' is-correct' : ''}`} role="status"><strong>{choice === question.answer ? 'You found it!' : `Good try! The answer is ${question.answer}.`}</strong><p>{question.explanation}</p></div> : session.hints.includes(session.index) ? <div className="mm-hint" role="status"><Lightbulb size={19} /><p>{question.hint}</p></div> : <button type="button" className="mm-hint-button" onClick={showHint}><Lightbulb size={17} /> A little hint</button>}
        {checked && <div className="mm-next"><button type="button" className="sg-primary" onClick={answered === 5 ? finish : () => updateRound(saved => advanceSubjectRound(saved))}>{answered === 5 ? 'See my round' : 'Next question'} <ArrowRight size={18} /></button></div>}
      </section><p className="sg-footnote">Your round saves as you go. You can leave and return later.</p>
    </> : <>
      {resumeRound&&<section className="mm-resume-chooser" aria-label="Saved Maths sessions">
        <div><span className="sg-kicker">PICK UP OR START SOMETHING NEW</span>
          <h1>Your Maths adventure</h1>
          <p>You have an unfinished Level {formatGameLevel(resumeRound.level)} round. Your answers are saved when you choose another level.</p>
        </div>
        <div className="mm-resume-actions">
          <button type="button" className="sg-primary" onClick={()=>start(resumeRound.level)}><Play size={17}/> Resume Level {formatGameLevel(resumeRound.level)}</button>
          <button type="button" className="sg-secondary" onClick={()=>document.getElementById('mm-starting-points')?.scrollIntoView({behavior:'smooth',block:'start'})}>Choose a starting level <ArrowRight size={17}/></button>
        </div>
        {pausedRounds.length>0&&<div className="mm-paused-list"><strong>Other saved rounds</strong><div>{pausedRounds.map(round=><button type="button" key={round.id} onClick={()=>start(round.level)}>Level {formatGameLevel(round.level)} · {Object.keys(round.answers).length}/5 answered <ArrowRight size={14}/></button>)}</div></div>}
      </section>}
      <section className="mm-hero"><div><span className="sg-kicker">MATHS GAMES · JUST YOU & YOUR THINKING</span><h1>Small sums.<br /><span>Bright ideas.</span><br />An endless trail.</h1><p>Five questions. Four choices. All the time you need.<br />Build mental maths confidence, one little win at a time.</p><button type="button" className="sg-primary" onClick={() => start()}><Play size={17} fill="currentColor" /> Play level {formatGameLevel(progress.level)} <ArrowRight size={18} /></button><small className="mm-current-band">{band.name} · Get 4 of 5 right to reach the next level</small></div><div className="mm-number-garden" aria-hidden="true"><span className="mm-number-main">7<span>+</span>3<b>= 10</b></span><span className="mm-number-orbit">½</span><span className="mm-number-orbit">×</span><span className="mm-number-orbit">%</span><span className="mm-number-orbit">★</span></div></section>
      <div className="mm-stat-row"><div><InfinityIcon /><span><strong>No final level</strong><small>New rounds keep coming</small></span></div><div><Check /><span><strong>{stats.passed} levels passed</strong><small>{stats.practised} levels practised</small></span></div><div><Star /><span><strong>{stats.xp} XP earned</strong><small>Best result saved for each level</small></span></div></div>
      <section className="mm-starting-points" id="mm-starting-points"><div className="sg-section-title"><div><h2>Choose a Maths level</h2><p>Every starting point is open. Switching levels keeps your unfinished round saved.</p></div></div><div className="mm-start-grid">{startingPoints.map(point => <button type="button" key={point.level} onClick={() => start(point.level)}><span className="mm-start-symbol" aria-hidden="true">{point.symbol}</span><strong>{point.title}</strong><span>{point.detail}</span><small>{session?.level===point.level||progress.pausedSessions?.[point.level]?'Resume':'Start at'} level {point.level} <ArrowRight size={15}/></small></button>)}</div>
      <form className="mm-level-chooser" onSubmit={event=>{event.preventDefault();if(/^[1-9]\d{0,5}$/.test(customLevel.trim()))start(customLevel.trim());}}>
        <label htmlFor="mm-custom-level">Or enter a level (1–999999)</label>
        <div><input id="mm-custom-level" type="text" inputMode="numeric" autoComplete="off" placeholder="e.g. 17" maxLength={6} value={customLevel} onChange={event=>setCustomLevel(event.target.value.replace(/\D/g,''))} aria-describedby="mm-custom-level-help"/><button type="submit" className="sg-secondary" disabled={!/^[1-9]\d{0,5}$/.test(customLevel.trim())}>Open level <ArrowRight size={16}/></button></div>
        <p id="mm-custom-level-help">Any level is available. Previous attempts remain saved.</p>
      </form></section>
      <section className="mm-how"><h2>A happy little learning loop</h2><div><p><b>1</b><span><strong>Think & choose</strong>Pick from four answers. Hints are always welcome.</span></p><p><b>2</b><span><strong>Discover a shortcut</strong>See the right answer and a way to work it out.</span></p><p><b>3</b><span><strong>Keep your trail growing</strong>Four correct answers open the next level. Replays help you practise.</span></p></div><p className="sg-footnote">Later levels mix number skills while keeping calculations manageable. No calculators or countdowns needed.</p></section>
    </>}
  </div>;
}
