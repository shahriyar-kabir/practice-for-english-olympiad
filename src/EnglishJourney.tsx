import QuestionSpeaker from './QuestionSpeaker';
import {playLearningSound} from './learningAudio';
import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Lightbulb, LockKeyhole, Star, Trophy } from 'lucide-react';
import { categories, makeCrossword, makeQuestions } from './englishContent';
import type { CategoryId, GeneratedCrossword } from './englishContent';
import { recordLearningCompletion } from './learningMetrics';
import { MCQ_SET_SIZE, startPractice, practiceGroup, mcqCompletion } from './practiceSession';
import './practice-refresh.css';

export { JOURNEY_STORAGE, emptyJourney, readJourney, saveJourney } from './journey';
export type { GameMode, LevelRecord, GameSession, JourneyProgress } from './journey';
import type { GameMode, LevelRecord, GameSession, JourneyProgress } from './journey';
const recordKey = (id: CategoryId, mode: GameMode) => id + ':' + mode;
const defaults = (): LevelRecord => ({ unlocked: 1, completed: 0, bestScore: 0, xp: 0 });
const pathArt: Record<CategoryId, string> = { beginners: '🌱', kids: '🧭', 'small-starts': '📖', juniors: '💬', 'high-flyers': '🔎', trailblazers: '🛠️', seniors: '✍️' };
type Props = {
  onHome: () => void;
  onLegacy: () => void;
  journey: JourneyProgress;
  onJourney: (value: JourneyProgress) => void;
  initialCategory?: CategoryId | null;
  homeLabel?: string;
};
export function EnglishJourney({ onHome, onLegacy, journey, onJourney, initialCategory = null, homeLabel = 'English learning' }: Props) {
  const [categoryId, setCategoryId] = useState<CategoryId | null>(initialCategory);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [finished, setFinished] = useState<{ score: number; passed: boolean; xp: number } | null>(null);
  const [selectedWord, setSelectedWord] = useState('');
  const [practiceNotice, setPracticeNotice] = useState('');
  const category = categories.find(c => c.id === categoryId);
  const key = categoryId && mode && level ? categoryId + ':' + mode + ':' + level : '';
  const active = journey.session?.key === key ? journey.session : undefined;
  const questions = useMemo(() => categoryId && mode === 'mcq' && level ? makeQuestions(categoryId, level, MCQ_SET_SIZE) : [], [categoryId, mode, level]);
  const crossword = useMemo(() => categoryId && mode === 'crossword' && level ? makeCrossword(categoryId, level) : null, [categoryId, mode, level]);
  const group = mode === 'mcq' && active ? practiceGroup(active) : null;
  const total = mode === 'mcq' ? group?.indices.length || MCQ_SET_SIZE : crossword?.entries.length || 0;
  const doneCount = mode === 'mcq' ? group?.answered || 0 : active?.solved.length || 0;
  const correctCount = mode === 'mcq' ? (group?.indices || []).filter(index => active?.answers[index] === questions[index]?.correct).length : active?.solved.length || 0;

  function updateSession(patch: Partial<GameSession>) {
    if (!active) return;
    onJourney({ ...journey, session: { ...active, ...patch } });
  }
  function start(selectedMode: GameMode, selectedLevel: number) {
    if (!categoryId) return;
    const max = journey.records[recordKey(categoryId, selectedMode)]?.unlocked || 1;
    if (selectedLevel > max) return;
    const sessionKey = categoryId + ':' + selectedMode + ':' + selectedLevel;
    const prepared = startPractice(journey, sessionKey, selectedMode);
    setPracticeNotice(prepared.archived ? 'Your earlier unfinished practice has been kept separately. Start a fresh set with the new Wizpiko activities.' : '');
    onJourney(prepared.journey);
    setFinished(null); setMode(selectedMode); setLevel(selectedLevel); setSelectedWord('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function finish() {
    if (!categoryId || !mode || !level || !active || finished) return;
    const mcq = mode === 'mcq' ? mcqCompletion(active, questions.map(question => question.correct)) : null;
    if (mode === 'mcq' ? !mcq : !crossword || active.solved.length !== crossword.entries.length) return;
    const possible = mcq?.total || crossword?.entries.length || 1;
    const scoredCorrect = mcq?.correctCount ?? correctCount;
    const score = mcq?.score ?? Math.round(scoredCorrect / possible * 100);
    const passed = score >= 70;
    const xp = mcq?.xp ?? scoredCorrect * 15;
    const previous = journey.records[recordKey(categoryId, mode)] || defaults();
    const record: LevelRecord = {
      unlocked: passed ? Math.max(previous.unlocked, level + 1) : previous.unlocked,
      completed: passed ? Math.max(previous.completed, level) : previous.completed,
      bestScore: Math.max(previous.bestScore, score),
      xp: previous.xp + xp,
    };
    const next: JourneyProgress = { ...journey, session: undefined, records: { ...journey.records, [recordKey(categoryId, mode)]: record } };
    onJourney(recordLearningCompletion(next, {
      id: mcq?.id || `game:${active.key}:${active.startedAt}`,
      title: `${category?.name || 'English'} ${mode === 'mcq' ? 'Five-question set' : 'Crossword Quest'}`,
      kind: mode,
      completedAt: new Date().toISOString(),
      xp, correct: scoredCorrect, total: possible,
    }));
    setFinished({ score, passed, xp });
  }

  function resetToCategories() {
    setMode(null); setLevel(null); setCategoryId(null); setFinished(null); window.scrollTo(0, 0);
  }
  function playAnother() {
    if (!categoryId || !mode || !level) return;
    const next = finished?.passed ? level + 1 : level;
    setFinished(null); start(mode, next);
  }
  function setAnswer(choice: string) {
    if (!active || active.answers[active.index] !== undefined) return;
    updateSession({ answers: { ...active.answers, [active.index]: choice } });
  }
  function nextQuestion() {
    if (!active) return;
    const missing = group?.indices.filter(index => active.answers[index] === undefined) || [];
    const next = missing.find(index => index > active.index) ?? missing[0] ?? active.index;
    updateSession({ index: next });
  }
  function isActiveWord(word: string): boolean { return !!active?.solved.includes(word); }
  function submitWord(word: string) {
    if (!active || !crossword) return;
    const entry = crossword.entries.find(e => e.id === selectedWord) || crossword.entries.find(e => !isActiveWord(e.word));
    if (!entry) return;
    if (entry.word !== word || isActiveWord(entry.word)) return;
    updateSession({ solved: [...active.solved, entry.word] });
    const next = crossword.entries.find(e => e.word !== word && !isActiveWord(e.word));
    setSelectedWord(next?.id || '');
  }
  if (!categoryId) return <section className="ej-page wp-playground">
    <div className="ej-topbar"><button onClick={onHome}><ArrowLeft size={17} /> {homeLabel}</button><span>Wizpiko Playroom · English</span></div>
    <header className="wp-welcome"><div><span className="wiz-kicker">A LITTLE PLAY. A LITTLE PROGRESS.</span><h1>Find your next <span>word discovery.</span></h1><p>Follow your curiosity through everyday English, tiny stories and useful conversations. Pick a path, then choose a word puzzle or a five-question set.</p><div className="wp-promises"><span>5 questions per set</span><span>Learn at your own pace</span><span>Every path is open</span></div></div><span className="wpg-welcome-art" aria-hidden="true">📚</span></header>
    <div className="wp-playroom-layout"><section className="wp-path-section"><h2>What sounds interesting today?</h2><p>Choose by your interests and confidence. You can change paths whenever you like.</p><div className="wp-path-grid">{categories.map(cat => {
      const rec = journey.records[recordKey(cat.id, 'mcq')] || defaults();
      return <button className="wp-path-card" type="button" key={cat.id} style={{ '--path-color': cat.color } as CSSProperties} onClick={() => { setCategoryId(cat.id); setMode(null); setLevel(null); window.scrollTo(0, 0); }}>
        <span className="wp-path-art" aria-hidden="true">{pathArt[cat.id]}</span><span className="wp-path-copy"><strong>{cat.name}</strong><span>{cat.description}</span><small>{rec.completed ? `${rec.completed} sets explored` : 'A fresh place to begin'}</small></span><ArrowRight size={20} aria-hidden="true" />
      </button>;
    })}</div></section><aside className="wp-playroom-aside"><section className="wp-how-card"><span aria-hidden="true">💡</span><h2>Two ways to discover</h2><h3>Choose & learn</h3><p>Five questions, clear feedback and a chance to try again. Finish a set whenever you are ready.</p><h3>Connect the words</h3><p>Read a clue, choose a word and watch the crossword take shape. Hints are there when you need them.</p></section><section className="wp-collection-card"><span aria-hidden="true">🧩</span><h2>A whole word adventure</h2><p>Explore ten newly written Wizpiko puzzles about making, helping and discovering.</p><button type="button" onClick={onLegacy}>Explore word puzzles <ArrowRight size={17} /></button></section></aside></div>
    <p className="wp-library-note">Activities draw from a growing Wizpiko collection. You may meet a familiar idea again—revisiting is part of learning.</p>
  </section>;

  if (!mode || !level) return <section className="ej-page wp-playground">
    <div className="ej-topbar"><button onClick={resetToCategories}><ArrowLeft size={17} /> Choose another path</button><span>English / {category?.name}</span></div>
    <div className="ej-level-hero" style={{ '--cat': category?.color || '#4d7dec' } as CSSProperties}>
      <span className="wiz-kicker">YOUR ENGLISH, YOUR PACE</span>
      <h1>{category?.name} <span>is ready to explore.</span></h1>
      <p>Choose a five-question set or build a crossword one clue at a time. Complete a set with at least 70% to open the next step.</p>
    </div>
    <div className="ej-mode-grid">{(['crossword', 'mcq'] as GameMode[]).map(game => {
      const rec = journey.records[recordKey(categoryId, game)] || defaults();
      return <div className="ej-mode-card" key={game}>
        <div className="ej-mode-icon">{game === 'crossword' ? '🧩' : '🧠'}</div>
        <h2>{game === 'crossword' ? 'Word puzzle' : 'Choose & learn'}</h2>
        <p>{game === 'crossword' ? 'Find intersecting words using clues and the word bank.' : 'Explore five questions at a time, with feedback and useful explanations.'}</p>
        <div className="ej-mode-stats"><span>{game === 'crossword' ? 'Untimed practice' : '5 questions per set'}</span><span><Trophy size={16} /> {rec.xp} XP</span></div>
        <p className="ej-unlocked">Level {rec.unlocked} unlocked · Best {rec.bestScore}%</p>
        <div className="ej-level-buttons">
          {Array.from({ length: Math.min(rec.unlocked + 1, 6) }, (_, i) => i + 1).map(lvl =>
            <button key={lvl} disabled={lvl > rec.unlocked} className={lvl === rec.unlocked ? 'ej-level-current' : ''} onClick={() => start(game, lvl)}>
              {lvl > rec.unlocked ? <LockKeyhole size={15} /> : <Star size={15} />} Level {lvl}
            </button>)}
        </div>
        <button className="wiz-btn-primary ej-start" onClick={() => start(game, rec.unlocked)}>Play level {rec.unlocked} <ArrowRight size={18}/></button>
        {categoryId === 'beginners' && game === 'crossword' && <button className="ej-classic" onClick={onLegacy}>Explore ten Wizpiko word puzzles <ChevronRight size={16}/></button>}
      </div>;
    })}</div>
    <p className="ej-smallprint">Your signed-in account keeps your practice, XP and unlocked levels connected across devices.</p>
  </section>;

  const current = questions[active?.index || 0];
  const complete = mode === 'crossword' ? !!crossword && active?.solved.length === crossword.entries.length : !!group?.complete;
  return <section className="ej-page">
    <div className="ej-topbar"><button onClick={() => { setMode(null); setLevel(null); setFinished(null); }}><ArrowLeft size={17} /> Back to {category?.name}</button><span>{category?.name} / {mode === 'mcq' ? 'Five-question set' : 'Word puzzle'} / Level {level}</span></div>
    {finished ? <div className="ej-result">
      <div className="ej-result-emoji">{finished.passed ? '🏆' : '🌟'}</div>
      <span className="wiz-kicker">{finished.passed ? 'LEVEL UNLOCKED!' : 'GREAT PRACTICE'}</span>
      <h1>{finished.passed ? 'You did it, champion!' : 'Keep shining!'}</h1>
      <p>You scored <strong>{finished.score}%</strong> and earned <strong>{finished.xp} XP</strong>. {finished.passed ? 'Your next level is now unlocked.' : 'Practise again and reach 70% to unlock the next level.'}</p>
      <div className="ej-result-actions"><button className="wiz-btn-primary" onClick={playAnother}>{finished.passed ? 'Next level' : 'Try this level again'} <ArrowRight size={17}/></button><button className="wiz-btn-secondary" onClick={() => { setMode(null); setLevel(null); setFinished(null); }}>Choose a game</button></div>
    </div> : <>
      <div className="ej-play-top"><div><span className="wiz-kicker">LEVEL {level} • {mode === 'mcq' ? 'FIVE-QUESTION SET' : 'WORD PUZZLE'}</span><h1>{mode === 'mcq' ? 'A little practice. A new discovery.' : 'Crack the word code!'}</h1></div><span className="ej-smallprint">Take your time</span></div>
      {practiceNotice && <p className="ej-smallprint" role="status">{practiceNotice}</p>}
      <div className="ej-game-track"><div style={{ width: (total ? doneCount / total * 100 : 0) + '%' }} /><span>{doneCount} / {total} {mode === 'mcq' ? 'questions' : 'words'}</span></div>
      {mode === 'mcq' && current && active && <div className="ej-mcq-panel">
        <span className="ej-question-number">QUESTION {active.index - (group?.start || 0) + 1} / {total}</span>
        <div className="wz-question-heading"><h2>{current.prompt}</h2><QuestionSpeaker text={current.prompt+' Choices: '+current.options.join('. ')}/></div>
        <div className="ej-answer-grid">{current.options.map((option, i) => {
          const answered = active.answers[active.index] !== undefined;
          const correct = option === current.correct;
          const chosen = active.answers[active.index] === option;
          return <button key={i} className={'ej-answer ' + (answered && correct ? 'ej-answer-right ' : '') + (answered && chosen && !correct ? 'ej-answer-wrong' : '')} disabled={answered} onClick={() => {playLearningSound(option===current.correct?'correct':'retry');setAnswer(option);}}>
            <span>{String.fromCharCode(65 + i)}</span>{option}{answered && correct && <Check size={17}/>}
          </button>;
        })}</div>
        {active.answers[active.index] !== undefined && <div className="ej-feedback">
          <strong>{active.answers[active.index] === current.correct ? '✨ Correct! Great job.' : '💡 Good effort! Here is the answer.'}</strong>
          <p>{current.explanation}</p>
          <button className="wiz-btn-primary" onClick={complete ? () => finish() : nextQuestion}>{complete ? 'Finish set' : 'Next question'} <ArrowRight size={17}/></button>
        </div>}
      </div>}
      {mode === 'crossword' && crossword && active && <GeneratedGame crossword={crossword} solved={active.solved} hints={active.hints} selected={selectedWord} setSelected={setSelectedWord} onWord={submitWord} onHints={hints => updateSession({ hints })} />}
      {complete && mode === 'crossword' && <div className="ej-feedback ej-ready"><strong>🎉 Every word solved!</strong><button className="wiz-btn-primary" onClick={() => finish()}>Complete level <Trophy size={17}/></button></div>}
      <p className="ej-smallprint">Your answers are saved as you practise. You can leave and return to continue.</p>
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
      <div className="ej-grid-panel"><div className="ej-selected-clue"><strong>{activeEntry.number} {activeEntry.direction}</strong> {activeEntry.clue} <QuestionSpeaker text={activeEntry.clue}/></div>
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
