import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock3, Lightbulb, LockKeyhole, Star, Trophy } from 'lucide-react';
import { categories, makeCrossword, makeQuestions } from './englishContent';
import type { CategoryId, GeneratedCrossword } from './englishContent';
import { recordActivity } from './learnerData';

export type GameMode = 'crossword' | 'mcq';
export type LevelRecord = { unlocked: number; completed: number; bestScore: number; xp: number };
export type GameSession = {
  key: string; endsAt: number; index: number;
  answers: Record<number, string>; solved: string[];
  hints: Record<string, number[]>; startedAt: number;
};
export type JourneyProgress = { records: Record<string, LevelRecord>; session?: GameSession; activityDates?: string[] };
export const JOURNEY_STORAGE = 'wizpiko-english-journey-v1';
export const emptyJourney = (): JourneyProgress => ({ records: {} });
export function readJourney(): JourneyProgress {
  try {
    const raw = JSON.parse(localStorage.getItem(JOURNEY_STORAGE) || '{}') as JourneyProgress;
    if (!raw || typeof raw !== 'object' || !raw.records || typeof raw.records !== 'object') return emptyJourney();
    return raw;
  } catch { return emptyJourney(); }
}
export function saveJourney(value: JourneyProgress): boolean {
  try { localStorage.setItem(JOURNEY_STORAGE, JSON.stringify(value)); return true; }
  catch { return false; }
}
export function formatTime(seconds: number): string {
  return Math.floor(Math.max(0, seconds) / 60).toString().padStart(2, '0') + ':' + Math.max(0, seconds % 60).toString().padStart(2, '0');
}
const recordKey = (id: CategoryId, mode: GameMode) => id + ':' + mode;
const defaults = (): LevelRecord => ({ unlocked: 1, completed: 0, bestScore: 0, xp: 0 });
type Props = {
  onHome: () => void;
  onLegacy: () => void;
  journey: JourneyProgress;
  onJourney: (value: JourneyProgress) => void;
};
export function EnglishJourney({ onHome, onLegacy, journey, onJourney }: Props) {
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [finished, setFinished] = useState<{ score: number; passed: boolean; xp: number; timedOut: boolean } | null>(null);
  const [now, setNow] = useState(Date.now());
  const [selectedWord, setSelectedWord] = useState('');
  const category = categories.find(c => c.id === categoryId);
  const key = categoryId && mode && level ? categoryId + ':' + mode + ':' + level : '';
  const active = journey.session?.key === key ? journey.session : undefined;
  const questions = useMemo(() => categoryId && mode === 'mcq' && level ? makeQuestions(categoryId, level) : [], [categoryId, mode, level]);
  const crossword = useMemo(() => categoryId && mode === 'crossword' && level ? makeCrossword(categoryId, level) : null, [categoryId, mode, level]);
  const total = mode === 'mcq' ? questions.length : crossword?.entries.length || 0;
  const doneCount = mode === 'mcq' ? Object.keys(active?.answers || {}).length : active?.solved.length || 0;
  const secondsLeft = active ? Math.max(0, Math.ceil((active.endsAt - now) / 1000)) : 0;
  const correctCount = mode === 'mcq' ? questions.filter((q, i) => active?.answers[i] === q.correct).length : active?.solved.length || 0;

  useEffect(() => {
    if (!active || finished) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active?.key, active?.endsAt, finished]);

  function updateSession(patch: Partial<GameSession>) {
    if (!active) return;
    onJourney({ ...journey, session: { ...active, ...patch } });
  }
  function start(selectedMode: GameMode, selectedLevel: number) {
    if (!categoryId) return;
    const max = journey.records[recordKey(categoryId, selectedMode)]?.unlocked || 1;
    if (selectedLevel > max) return;
    const sessionKey = categoryId + ':' + selectedMode + ':' + selectedLevel;
    if (!journey.session || journey.session.key !== sessionKey || journey.session.endsAt <= Date.now()) {
      const duration = selectedMode === 'mcq' ? (category?.minutes || 40) * 60 : 5 * 60;
      onJourney({ ...journey, session: { key: sessionKey, endsAt: Date.now() + duration * 1000, startedAt: Date.now(), index: 0, answers: {}, solved: [], hints: {} } });
    }
    setFinished(null); setMode(selectedMode); setLevel(selectedLevel); setSelectedWord('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function finish(timedOut: boolean) {
    if (!categoryId || !mode || !level || !active || finished) return;
    const possible = mode === 'mcq' ? questions.length : crossword?.entries.length || 1;
    const score = Math.round(correctCount / possible * 100);
    const passed = score >= 70 && !timedOut;
    const xp = Math.round(correctCount * (mode === 'mcq' ? 2 : 15) * (timedOut ? .5 : 1));
    const previous = journey.records[recordKey(categoryId, mode)] || defaults();
    const record: LevelRecord = {
      unlocked: passed ? Math.max(previous.unlocked, level + 1) : previous.unlocked,
      completed: passed ? Math.max(previous.completed, level) : previous.completed,
      bestScore: Math.max(previous.bestScore, score),
      xp: previous.xp + xp,
    };
    onJourney({ ...journey, activityDates: doneCount > 0 ? recordActivity(journey.activityDates) : journey.activityDates, session: undefined, records: { ...journey.records, [recordKey(categoryId, mode)]: record } });
    setFinished({ score, passed, xp, timedOut });
  }
  useEffect(() => {
    if (!active || finished || secondsLeft > 0) return;
    const timer = window.setTimeout(() => finish(true), 0);
    return () => window.clearTimeout(timer);
    // Only transition once when a session expires. The latest state is used in finish.
  }, [active?.endsAt, secondsLeft, finished]);

  function resetToCategories() {
    setMode(null); setLevel(null); setCategoryId(null); setFinished(null); window.scrollTo(0, 0);
  }
  function playAnother() {
    if (!categoryId || !mode || !level) return;
    const next = finished?.passed ? level + 1 : level;
    setFinished(null); start(mode, next);
  }
  function setAnswer(choice: string) {
    if (!active || active.answers[active.index] !== undefined || !secondsLeft) return;
    updateSession({ answers: { ...active.answers, [active.index]: choice } });
  }
  function nextQuestion() {
    if (!active) return;
    const next = active.index + 1;
    updateSession({ index: Math.min(next, questions.length - 1) });
  }
  function isActiveWord(word: string): boolean { return !!active?.solved.includes(word); }
  function submitWord(word: string) {
    if (!active || !crossword || !secondsLeft) return;
    const entry = crossword.entries.find(e => e.id === selectedWord) || crossword.entries.find(e => !isActiveWord(e.word));
    if (!entry) return;
    if (entry.word !== word || isActiveWord(entry.word)) return;
    updateSession({ solved: [...active.solved, entry.word] });
    const next = crossword.entries.find(e => e.word !== word && !isActiveWord(e.word));
    setSelectedWord(next?.id || '');
  }
  if (!categoryId) return <section className="ej-page">
    <div className="ej-topbar"><button onClick={onHome}><ArrowLeft size={17} /> All subjects</button><span>English Practice</span></div>
    <div className="ej-intro"><span className="wiz-kicker">CHOOSE YOUR ADVENTURE</span><h1>Every age. Every stage. <span>A new challenge!</span></h1><p>Pick your category, solve crosswords, master 50-question MCQ challenges, earn XP and unlock more levels. Practice at your own pace.</p></div>
    <div className="ej-category-grid">{categories.map((cat, i) => {
      const rec = journey.records[recordKey(cat.id, 'mcq')] || defaults();
      return <button className="ej-category" key={cat.id} style={{ '--cat': cat.color } as CSSProperties} onClick={() => { setCategoryId(cat.id); setMode(null); setLevel(null); window.scrollTo(0, 0); }}>
        <span className="ej-category-ordinal">{i + 1}</span><span className="ej-category-range">CAT {i + 1} · {cat.range}</span>
        <strong>{cat.name}</strong><span className="ej-category-divider" />
        <span className="ej-category-meta"><span>CROSSWORD</span><span>5 minutes per level</span></span>
        <span className="ej-category-meta"><span>MCQS</span><span>50 questions · {cat.minutes} minutes</span></span>
        <span className="ej-category-level">MCQ level {rec.unlocked} unlocked</span>
        <span className="ej-category-action">Explore challenges <ArrowRight size={17} /></span>
      </button>;
    })}</div>
    <p className="ej-smallprint">Levels are algorithmically varied from reviewed question banks. Advanced levels may revisit concepts; they are not guaranteed to be entirely new questions.</p>
  </section>;

  if (!mode || !level) return <section className="ej-page">
    <div className="ej-topbar"><button onClick={resetToCategories}><ArrowLeft size={17} /> Change category</button><span>English / {category?.name}</span></div>
    <div className="ej-level-hero" style={{ '--cat': category?.color || '#4d7dec' } as CSSProperties}>
      <span className="wiz-kicker">{category?.range.toUpperCase()}</span>
      <h1>{category?.name} <span>Adventure Hub</span></h1>
      <p>Choose a game mode to practise vocabulary and comprehension. Complete a level with at least 70% to unlock the next adventure.</p>
    </div>
    <div className="ej-mode-grid">{(['crossword', 'mcq'] as GameMode[]).map(game => {
      const rec = journey.records[recordKey(categoryId, game)] || defaults();
      return <div className="ej-mode-card" key={game}>
        <div className="ej-mode-icon">{game === 'crossword' ? '🧩' : '🧠'}</div>
        <h2>{game === 'crossword' ? 'Crossword Quest' : 'MCQ Challenge'}</h2>
        <p>{game === 'crossword' ? 'Find intersecting words using clues and the word bank.' : 'Answer 50 questions, get instant feedback and learn from explanations.'}</p>
        <div className="ej-mode-stats"><span><Clock3 size={16} /> {game === 'crossword' ? 5 : category?.minutes} min</span><span><Trophy size={16} /> {rec.xp} XP</span></div>
        <p className="ej-unlocked">Level {rec.unlocked} unlocked · Best {rec.bestScore}%</p>
        <div className="ej-level-buttons">
          {Array.from({ length: Math.min(rec.unlocked + 1, 6) }, (_, i) => i + 1).map(lvl =>
            <button key={lvl} disabled={lvl > rec.unlocked} className={lvl === rec.unlocked ? 'ej-level-current' : ''} onClick={() => start(game, lvl)}>
              {lvl > rec.unlocked ? <LockKeyhole size={15} /> : <Star size={15} />} Level {lvl}
            </button>)}
        </div>
        <button className="wiz-btn-primary ej-start" onClick={() => start(game, rec.unlocked)}>Play level {rec.unlocked} <ArrowRight size={18}/></button>
        {categoryId === 'beginners' && game === 'crossword' && <button className="ej-classic" onClick={onLegacy}>Play the original 10 Beginner crosswords <ChevronRight size={16}/></button>}
      </div>;
    })}</div>
    <p className="ej-smallprint">Play as a guest or sign up to save your English games, XP and unlocked levels to your account across devices.</p>
  </section>;

  const current = questions[active?.index || 0];
  const complete = mode === 'crossword' ? !!crossword && active?.solved.length === crossword.entries.length : questions.length > 0 && active?.index === questions.length - 1 && active.answers[active.index] !== undefined;
  return <section className="ej-page">
    <div className="ej-topbar"><button onClick={() => { setMode(null); setLevel(null); setFinished(null); }}><ArrowLeft size={17} /> Back to {category?.name}</button><span>{category?.name} / {mode === 'mcq' ? 'MCQ Challenge' : 'Crossword Quest'} / Level {level}</span></div>
    {finished ? <div className="ej-result">
      <div className="ej-result-emoji">{finished.passed ? '🏆' : '🌟'}</div>
      <span className="wiz-kicker">{finished.timedOut ? 'TIME IS UP' : finished.passed ? 'LEVEL UNLOCKED!' : 'GREAT PRACTICE'}</span>
      <h1>{finished.passed ? 'You did it, champion!' : 'Keep shining!'}</h1>
      <p>You scored <strong>{finished.score}%</strong> and earned <strong>{finished.xp} XP</strong>. {finished.passed ? 'Your next level is now unlocked.' : 'Reach 70% before the timer ends to unlock the next level.'}</p>
      <div className="ej-result-actions"><button className="wiz-btn-primary" onClick={playAnother}>{finished.passed ? 'Next level' : 'Try this level again'} <ArrowRight size={17}/></button><button className="wiz-btn-secondary" onClick={() => { setMode(null); setLevel(null); setFinished(null); }}>Choose a game</button></div>
    </div> : <>
      <div className="ej-play-top"><div><span className="wiz-kicker">LEVEL {level} • {mode === 'mcq' ? '50-QUESTION CHALLENGE' : 'CROSSWORD CHALLENGE'}</span><h1>{mode === 'mcq' ? 'Think fast. Learn lots.' : 'Crack the word code!'}</h1></div><div className={'ej-timer ' + (secondsLeft < 60 ? 'ej-timer-low' : '')}><Clock3 size={20}/><strong>{formatTime(secondsLeft)}</strong><span>remaining</span></div></div>
      <div className="ej-game-track"><div style={{ width: (total ? doneCount / total * 100 : 0) + '%' }} /><span>{doneCount} / {total} {mode === 'mcq' ? 'questions' : 'words'}</span></div>
      {mode === 'mcq' && current && active && <div className="ej-mcq-panel">
        <span className="ej-question-number">QUESTION {active.index + 1} / {questions.length}</span>
        <h2>{current.prompt}</h2>
        <div className="ej-answer-grid">{current.options.map((option, i) => {
          const answered = active.answers[active.index] !== undefined;
          const correct = option === current.correct;
          const chosen = active.answers[active.index] === option;
          return <button key={i} className={'ej-answer ' + (answered && correct ? 'ej-answer-right ' : '') + (answered && chosen && !correct ? 'ej-answer-wrong' : '')} disabled={answered} onClick={() => setAnswer(option)}>
            <span>{String.fromCharCode(65 + i)}</span>{option}{answered && correct && <Check size={17}/>}
          </button>;
        })}</div>
        {active.answers[active.index] !== undefined && <div className="ej-feedback">
          <strong>{active.answers[active.index] === current.correct ? '✨ Correct! Great job.' : '💡 Good effort! Here is the answer.'}</strong>
          <p>{current.explanation}</p>
          <button className="wiz-btn-primary" onClick={complete ? () => finish(false) : nextQuestion}>{complete ? 'Finish challenge' : 'Next question'} <ArrowRight size={17}/></button>
        </div>}
      </div>}
      {mode === 'crossword' && crossword && active && <GeneratedGame crossword={crossword} solved={active.solved} hints={active.hints} selected={selectedWord} setSelected={setSelectedWord} onWord={submitWord} onHints={hints => updateSession({ hints })} />}
      {complete && mode === 'crossword' && <div className="ej-feedback ej-ready"><strong>🎉 Every word solved!</strong><button className="wiz-btn-primary" onClick={() => finish(false)}>Complete level <Trophy size={17}/></button></div>}
      <p className="ej-smallprint">Your place in the challenge is automatically saved. Your session timer continues if you leave this screen.</p>
    </>}
  </section>;
}

function GeneratedGame({ crossword, solved, hints, selected, setSelected, onWord, onHints }: {
  crossword: GeneratedCrossword; solved: string[]; hints: Record<string, number[]>; selected: string;
  setSelected: (id: string) => void; onWord: (word: string) => void;
  onHints: (value: Record<string, number[]>) => void;
}) {
  const activeEntry = crossword.entries.find(e => e.id === selected) || crossword.entries.find(e => !solved.includes(e.word)) || crossword.entries[0];
  const cells = new Map<string, { value: string; number?: number; entryIds: string[]; known: boolean }>();
  for (const entry of crossword.entries) entry.word.split('').forEach((letter, i) => {
    const row = entry.row + (entry.direction === 'down' ? i : 0);
    const col = entry.col + (entry.direction === 'across' ? i : 0);
    const id = row + ':' + col;
    const existing = cells.get(id) || { value: '', entryIds: [], known: false };
    const number = i === 0 ? (existing.number === undefined ? entry.number : Math.min(existing.number, entry.number)) : existing.number;
    const known = existing.known || solved.includes(entry.word) || (hints[entry.id] || []).includes(i);
    cells.set(id, { value: known ? letter : existing.value, entryIds: [...existing.entryIds, entry.id], known, number });
  });
  function hint() {
    const entry = activeEntry;
    const revealed = hints[entry.id] || [];
    const next = entry.word.split('').findIndex((_, i) => !revealed.includes(i) && !solved.includes(entry.word));
    if (next !== -1) onHints({ ...hints, [entry.id]: [...revealed, next] });
  }
  const renderClues = (direction: 'across' | 'down') => <div className="ej-clue-set">
    <h3>{direction === 'across' ? '→ Across' : '↓ Down'}</h3>
    {crossword.entries.filter(e => e.direction === direction).map(e =>
      <button key={e.id} className={'ej-clue ' + (activeEntry.id === e.id ? 'ej-clue-active ' : '') + (solved.includes(e.word) ? 'ej-clue-done' : '')} onClick={() => setSelected(e.id)}>
        <b>{e.number}</b><span>{e.clue} <small>{e.word.length} letters</small></span>{solved.includes(e.word) && <Check size={16}/>}
      </button>)}
  </div>;
  return <div className="ej-cross-layout">
    <div className="ej-cross-main">
      <div className="ej-grid-panel"><div className="ej-selected-clue"><strong>{activeEntry.number} {activeEntry.direction}</strong> {activeEntry.clue}</div>
        <div className="ej-crossword-scroll"><div className="ej-generated-grid" style={{ '--cols': crossword.cols, '--rows': crossword.rows } as CSSProperties}>
          {Array.from({ length: crossword.rows * crossword.cols }, (_, index) => {
            const row = Math.floor(index / crossword.cols), col = index % crossword.cols;
            const cell = cells.get(row + ':' + col);
            if (!cell) return <span className="ej-empty-cell" key={index} />;
            const isActive = cell.entryIds.includes(activeEntry.id);
            return <button type="button" key={index} className={'ej-grid-cell ' + (isActive ? 'ej-grid-active' : '') + (cell.known ? ' ej-grid-known' : '')} onClick={() => setSelected(cell.entryIds.find(id => id !== activeEntry.id) || cell.entryIds[0])} aria-label={'Grid row ' + (row + 1) + ' column ' + (col + 1) + (cell.value ? ' letter ' + cell.value : '')}>
              {cell.number !== undefined && <sup>{cell.number}</sup>}{cell.value}
            </button>;
          })}
        </div></div>
      </div>
      <div className="ej-all-clues">{renderClues('across')}{renderClues('down')}</div>
    </div>
    <aside className="ej-word-bank">
      <span className="wiz-kicker">YOUR WORD BANK</span><h2>Find the right fit! 🧩</h2>
      <p>Choose a clue, then tap its matching word. Completed words stay checked.</p>
      <div className="ej-bank-words">{crossword.bank.map(word => <button key={word} disabled={solved.includes(word)} className={solved.includes(word) ? 'ej-bank-used' : ''} onClick={() => onWord(word)}>{solved.includes(word) ? '✓ ' : ''}{word}</button>)}</div>
      <button className="ej-hint" onClick={hint}><Lightbulb size={18}/> Show a letter</button>
    </aside>
  </div>;
}
