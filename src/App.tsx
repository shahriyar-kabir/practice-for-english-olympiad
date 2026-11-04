import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { CSSProperties, DragEvent, ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Award, BookOpen, Check, CheckCheck, ChevronRight, CircleHelp, GripVertical, Leaf, Lightbulb, MousePointer2, RotateCcw, Sparkles, Star, Trophy, LockKeyhole, X } from 'lucide-react';
import { puzzles } from './data/puzzles';
import type { Entry } from './data/puzzles';
import { buildCells, cellAt, entryContains, initialProgress, readProgress, saveProgress, retiredClassicSummary } from './game';
import type { Progress } from './game';
import { readJourney, saveJourney } from './journey';
import type { JourneyProgress } from './journey';
import { useWizpikoAccount } from './cloudAccount';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import type { InfoPageId } from './content/siteCopy';
import type { AcademyLevel } from './learningTypes';
import { lessonCatalog } from './academy/catalog';
import { learningSummary, recordLearningCompletion } from './learningMetrics';
import { WizpikoPortal } from './WizpikoPortal';
import type { LearningStageId } from './LearningStages';
import type { CategoryId } from './englishContent';

import type { LearnerPage } from './LearnerHub';
import { ageFromBirthdate } from './learnerData';



const EnglishAcademy = lazy(() => import('./academy/EnglishAcademy'));
const EnglishJourney = lazy(() => import('./EnglishJourney').then(module => ({ default: module.EnglishJourney })));
const LearnerHub = lazy(() => import('./LearnerHub').then(module => ({ default: module.LearnerHub })));
const AccountDialog = lazy(() => import('./AccountDialog').then(module => ({ default: module.AccountDialog })));
const InfoPages = lazy(() => import('./InfoPages'));
const ContactPage = lazy(() => import('./ContactPage'));

type Destination = { kind: 'english'; level?: AcademyLevel; lessonId?: string } | { kind: 'games' } | { kind: 'classic' } | { kind: 'hub'; page: LearnerPage } | { kind: 'coming'; subject: string };
const publicPages: InfoPageId[] = ['help','account-guide','privacy','about','mission'];
const readPublicPage = () => new URLSearchParams(window.location.search).get('page');
const INTENT_KEY='wizpiko-return-to';
function readIntent():Destination|null {
 try {
  const value=JSON.parse(sessionStorage.getItem(INTENT_KEY)||'null');
  if(!value||typeof value!=='object')return null;
  if(value.kind==='classic'||value.kind==='games')return {kind:value.kind};
  if(value.kind==='hub'&&['profile','progress','achievements','streak','preferences','help'].includes(value.page))return {kind:'hub',page:value.page};
  if(value.kind==='coming'&&typeof value.subject==='string')return {kind:'coming',subject:value.subject.slice(0,80)};
  if(value.kind==='english')return {kind:'english',level:['starter','beginner','intermediate','advanced'].includes(value.level)?value.level:undefined,lessonId:typeof value.lessonId==='string'&&lessonCatalog.some(item=>item.id===value.lessonId)?value.lessonId:undefined};
 }catch{ /* A fresh sign-in can proceed without a stored destination. */ }
 return null;
}
function saveIntent(value:Destination|null){try{if(value)sessionStorage.setItem(INTENT_KEY,JSON.stringify(value));else sessionStorage.removeItem(INTENT_KEY);}catch{ /* Navigation still works within this visit. */ }}

function PageLoading({ session = false }: { session?: boolean }) { return <div className={`wz-page-loading${session ? ' wz-session-loading' : ''}`} role="status"><span aria-hidden="true">📖</span>Getting your learning space ready…</div>; }

type Notice = { text: string; kind: 'success' | 'try' | 'hint' };
type Dialog = 'help' | 'progress' | 'reset' | 'complete' | 'signout' | null;

function Modal({ children, title, onClose }: { children: ReactNode; title: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = ref.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return <dialog ref={ref} className="modal" onCancel={onClose} aria-label={title} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <button className="icon-button modal-close" aria-label="Close dialog" onClick={onClose}><X size={21} /></button>
    {children}
  </dialog>;
}

function playChime(complete = false) {
  try {
    const audio = new AudioContext();
    const notes = complete ? [523.25, 659.25, 783.99, 1046.5] : [659.25, 880];
    notes.forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      const start = audio.currentTime + index * 0.12;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.09, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.24);
      oscillator.start(start); oscillator.stop(start + 0.25);
    });
    window.setTimeout(() => { void audio.close(); }, 1200);
  } catch { /* Sound is optional when browser audio is unavailable. */ }
}

const totalWords = puzzles.reduce((sum, puzzle) => sum + puzzle.entries.length, 0);

export default function App() {
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [journey, setJourney] = useState<JourneyProgress>(readJourney);
  const [accountOpen, setAccountOpen] = useState(false);
  const [view, setView] = useState<'home'|'categories'|'games'|'classic'|'hub'|'coming'|'info'|'contact'>(() => readPublicPage()==='contact' ? 'contact' : publicPages.includes(readPublicPage() as InfoPageId) ? 'info' : 'home');
  const [infoPage,setInfoPage] = useState<InfoPageId>(() => publicPages.includes(readPublicPage() as InfoPageId) ? readPublicPage() as InfoPageId : 'about');
  const [startingCategory] = useState<CategoryId | null>(null);
  const [academyLevel,setAcademyLevel] = useState<AcademyLevel>('starter');
  const [academyLesson,setAcademyLesson] = useState<string | undefined>();
  const [hubPage,setHubPage]=useState<LearnerPage>('profile');
  const [comingSubject,setComingSubject]=useState('');
  const [pendingDestination,setPendingDestination]=useState<Destination | null>(readIntent);
  const account = useWizpikoAccount({ legacy: progress, journey }, restored => { setProgress(restored.legacy); setJourney(restored.journey); });

  function changeURL(page?:string) {
    const next=window.location.pathname+(page?'?page='+encodeURIComponent(page):'');
    if(window.location.pathname+window.location.search!==next)window.history.pushState(null,'',next);
  }
  function openInfo(page:InfoPageId) { setInfoPage(page);setView('info');setDialog(null);changeURL(page);window.scrollTo(0,0); }
  function openContact() { setView('contact');setDialog(null);changeURL('contact');window.scrollTo(0,0); }
  function goHome() {setView('home');setDialog(null);changeURL();window.scrollTo(0,0);}
  function goSubjects() {goHome();window.requestAnimationFrame(()=>document.getElementById('wiz-subjects')?.scrollIntoView({behavior:'smooth',block:'start'}));}
  function applyDestination(destination:Destination) {
    setDialog(null);changeURL();
    if(destination.kind==='english'){setAcademyLevel(destination.level||account.auth.profile?.preferences?.learning_level||'starter');setAcademyLesson(destination.lessonId);setView('categories');}
    else if(destination.kind==='hub'){setHubPage(destination.page);setView('hub');}
    else if(destination.kind==='coming'){setComingSubject(destination.subject);setView('coming');}
    else setView(destination.kind);
    window.scrollTo(0,0);
  }
  function requestDestination(destination:Destination) {
    if(account.auth.user)applyDestination(destination);
    else {saveIntent(destination);setPendingDestination(destination);if(!account.auth.loading)setAccountOpen(true);}
  }
  function goPractice(){requestDestination({kind:'english'});}
  function goPracticeGames(){requestDestination({kind:'games'});}
  function goClassic(){requestDestination({kind:'classic'});}
  function goHub(page:LearnerPage){requestDestination({kind:'hub',page});}
  function goComing(subject:string){requestDestination({kind:'coming',subject});}
  function goLesson(lessonId:string){const lesson=lessonCatalog.find(item=>item.id===lessonId);requestDestination({kind:'english',lessonId,level:lesson?.level});}
  function goLearningStage(id:LearningStageId) {
    const levels:Record<LearningStageId,AcademyLevel>={'early-years':'starter',primary:'beginner','middle-school':'intermediate',secondary:'intermediate','college-university':'advanced','lifelong-learners':'starter'};
    requestDestination({kind:'english',level:levels[id]});
  }
  function search(query:string) {
    if(/contact|suggestion/i.test(query))openContact();
    else if(/privacy|safety/i.test(query))openInfo('privacy');
    else if(/help|support/i.test(query))openInfo('help');
    else if(/crossword|quiz|mcq|game/i.test(query))goPracticeGames();
    else if(/english|word|read|spell|gramm|listen|writ|lesson/i.test(query))goPractice();
    else goComing(query.slice(0,80));
  }
  useEffect(()=>{
    if(account.auth.loading||!pendingDestination)return;
    if(account.auth.user){applyDestination(pendingDestination);saveIntent(null);setPendingDestination(null);setAccountOpen(false);}
    else setAccountOpen(true);
  },[account.auth.user?.id,account.auth.loading,pendingDestination]);
  useEffect(()=>{saveJourney(journey);},[journey]);
  useEffect(()=>{if(account.auth.recovery||account.auth.status==='Email confirmed. Sign in with your password.')setAccountOpen(true);},[account.auth.recovery,account.auth.status]);
  useEffect(()=>{
    const reduced=account.auth.profile?.preferences?.reduced_motion||account.auth.profile?.preferences?.animation===false;
    document.documentElement.classList.toggle('wz-reduced-motion',Boolean(reduced));
    return()=>document.documentElement.classList.remove('wz-reduced-motion');
  },[account.auth.profile?.preferences?.reduced_motion,account.auth.profile?.preferences?.animation]);
  useEffect(()=>{const navigate=()=>{const page=readPublicPage();if(page==='contact')setView('contact');else if(publicPages.includes(page as InfoPageId)){setInfoPage(page as InfoPageId);setView('info');}else setView('home');};window.addEventListener('popstate',navigate);return()=>window.removeEventListener('popstate',navigate);},[]);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = puzzles[puzzleIndex];
  const state = progress[puzzle.id] ?? initialProgress();
  const [selectedId, setSelectedId] = useState(() => puzzle.entries.find(entry => !state.solved.includes(entry.id))?.id ?? puzzle.entries[0].id);
  const selected = puzzle.entries.find(entry => entry.id === selectedId) ?? puzzle.entries[0];
  const [notice, setNotice] = useState<Notice | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const sound = account.auth.profile?.preferences?.sound ?? false;
  const [dragWord, setDragWord] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [shake, setShake] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cells = buildCells(puzzle, state);
  const completed = state.solved.length === puzzle.entries.length;
  const solvedTotal = puzzles.reduce((sum, item) => sum + (progress[item.id]?.solved.length ?? 0), 0);
  const archivedClassic = retiredClassicSummary(progress);
  const completedTotal = puzzles.filter(item => progress[item.id]?.solved.length === item.entries.length).length;
  const academyRecords = Object.values(journey.records);
  const learningStats = learningSummary(journey,new Date(),{solvedTotal,completedTotal,retiredSolvedTotal:archivedClassic.solvedWords,retiredCompletedTotal:archivedClassic.completedPuzzles});
  const academyXP = learningStats.xp;
  const unlockedLevels = academyRecords.reduce((sum, item) => sum + Math.max(0, item.unlocked - 1), 0);

  useEffect(() => { setStorageWarning(!saveProgress(progress)); }, [progress]);
  useEffect(() => () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); }, []);

  function announce(text: string, kind: Notice['kind']) {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice({ text, kind });
    noticeTimer.current = setTimeout(() => setNotice(null), 5500);
  }

  function choosePuzzle(index: number) {
    setPuzzleIndex(index);
    const next = puzzles[index];
    const nextEntry = next.entries.find(entry => !progress[next.id]?.solved.includes(entry.id)) ?? next.entries[0];
    setSelectedId(nextEntry.id);
    setNotice(null); setDragWord(null); setShake(null); setDialog(null);
  }

  function chooseEntry(entry: Entry) {
    setSelectedId(entry.id);
  }

  function placeWord(word: string, entry = selected) {
    if (state.solved.includes(entry.id)) {
      announce('You already found this word! Choose another clue.', 'hint'); return;
    }
    if (word !== entry.answer) {
      setShake(word);
      window.setTimeout(() => setShake(null), 500);
      announce(`Good try! Think about clue ${entry.number} ${entry.direction} and try another word.`, 'try');
      return;
    }
    const solved = [...state.solved, entry.id];
    setProgress(current => ({ ...current, [puzzle.id]: { ...state, solved } }));
    const finished = solved.length === puzzle.entries.length;
    if (sound) playChime(finished);
    announce(`${word.charAt(0) + word.slice(1).toLowerCase()} is right! A little word, a big win.`, 'success');
    if (finished) {setDialog('complete');const completedAt=new Date().toISOString();setJourney(previous=>recordLearningCompletion(previous,{id:`classic:${puzzle.id}:${completedAt}`,title:puzzle.title,kind:'classic',completedAt,xp:0,correct:puzzle.entries.length,total:puzzle.entries.length}));}
    else {
      const next = puzzle.entries.find(candidate => !solved.includes(candidate.id))!;
      chooseEntry(next);
    }
  }

  function dropWord(event: DragEvent, row?: number, col?: number) {
    event.preventDefault(); event.stopPropagation();
    const word = event.dataTransfer.getData('text/plain') || dragWord;
    setDragWord(null); setDragOver(false);
    if (!word || !puzzle.wordBank.includes(word)) return;
    let target = selected;
    if (row !== undefined && col !== undefined && !entryContains(selected, row, col)) {
      const options = (cells.get(`${row}-${col}`)?.entries ?? []).filter(entry => !state.solved.includes(entry.id));
      target = options.find(entry => entry.answer.length === word.length) ?? options[0] ?? selected;
      chooseEntry(target);
    }
    placeWord(word, target);
  }

  function giveHint() {
    const target = state.solved.includes(selected.id) ? puzzle.entries.find(entry => !state.solved.includes(entry.id)) : selected;
    if (!target) { announce('Every word is found. You did it!', 'success'); return; }
    chooseEntry(target);
    const unknown = Array.from(target.answer).findIndex((_, index) => {
      const { row, col } = cellAt(target, index);
      return !cells.get(`${row}-${col}`)?.letter;
    });
    if (unknown === -1) {
      announce(`All the letters are there! Find the matching ${target.answer.length}-letter tile in the word bank.`, 'hint'); return;
    }
    const hints = { ...state.hints, [target.id]: [...(state.hints[target.id] ?? []), unknown] };
    setProgress(current => ({ ...current, [puzzle.id]: { ...state, hints } }));
    announce(`A little clue: letter ${unknown + 1} is ${target.answer[unknown]}. You've got this!`, 'hint');
  }

  const lifetimeWords = solvedTotal + archivedClassic.solvedWords;
  const lifetimePuzzles = completedTotal + archivedClassic.completedPuzzles;
  const badges = [
    { name: 'First find', emoji: '🤖', unlocked: lifetimeWords > 0, detail: 'Find your very first word' },
    { name: 'Puzzle pal', emoji: '🧩', unlocked: lifetimePuzzles > 0, detail: 'Finish one whole puzzle' },
    { name: 'Word explorer', emoji: '🧭', unlocked: lifetimeWords >= 20, detail: 'Find 20 different words' },
    { name: 'Super explorer', emoji: '🌟', unlocked: lifetimePuzzles >= 3, detail: 'Finish 3 adventures' },
    { name: 'Word champion', emoji: '🏆', unlocked: lifetimePuzzles >= puzzles.length, detail: 'Complete ten word puzzles' },
    { name: 'Level explorer', emoji: '🚀', unlocked: unlockedLevels >= 1, detail: 'Unlock your first new level' },
    { name: 'Wizpiko wizard', emoji: '🧠', unlocked: academyXP >= 500, detail: 'Earn 500 XP through practice' },
  ];

  return <>
    <SiteHeader signedIn={!!account.auth.user} loading={account.auth.loading} profile={account.auth.profile} isHome={view==='home'} streak={learningStats.streak.current} onHome={goHome} onSubjects={goSubjects} onGames={goPracticeGames} onInfo={openInfo} onContact={openContact} onSignIn={()=>setAccountOpen(true)} onHub={goHub} onSignOut={()=>setDialog('signout')} onSearch={search}/>
    <main className="page-wrap">
      <Suspense fallback={<PageLoading/>}>
      {account.auth.loading&&view!=='info'&&view!=='contact'?<PageLoading session/>:view==='info'?<InfoPages page={infoPage} onNavigate={openInfo} onHome={goHome} onContact={openContact} onSignIn={()=>setAccountOpen(true)}/>:view==='contact'?<ContactPage onHome={goHome} onPrivacy={()=>openInfo('privacy')}/>:view!=='home'&&!account.auth.user?<section className="wz-login-gate"><LockKeyhole size={35}/><h1>Your learning space is waiting</h1><p>Sign in to open lessons, activities and your saved progress.</p><button className="wz-action-button" onClick={()=>setAccountOpen(true)}>Sign In</button><button className="wz-secondary-link" onClick={goHome}>Back to Home</button></section>:view==='home'?<WizpikoPortal onPractice={goPractice} onChooseStage={goLearningStage} onComingSoon={goComing} signedIn={!!account.auth.user} nickname={account.auth.profile?.display_name} avatar={account.auth.profile?.avatar} learnerAge={ageFromBirthdate(account.auth.profile?.birth_date||'')} onProgress={()=>goHub('progress')} onStreak={()=>goHub('streak')} onAchievements={()=>goHub('achievements')} xp={academyXP} streak={learningStats.streak.current} solvedTotal={solvedTotal} completedTotal={completedTotal} journey={journey} preferences={account.auth.profile?.preferences} onLesson={goLesson} onClassic={goClassic} onGames={goPracticeGames} archivedClassic={archivedClassic}/>:view==='hub'&&account.auth.user?<LearnerHub page={hubPage} profile={account.auth.profile} email={account.auth.user.email||''} journey={journey} solvedTotal={solvedTotal} completedTotal={completedTotal} totalWords={totalWords} onPage={goHub} onHome={goHome} onPractice={goPractice} onSignOut={()=>setDialog('signout')} onSaveProfile={account.updateProfile} onContact={openContact} onLesson={goLesson} onClassic={goClassic} archivedClassic={archivedClassic}/>:view==='coming'?<section className="wz-coming-page"><Sparkles size={42}/><h1>{comingSubject}</h1><p>Something wonderful is coming soon! For now, enjoy English Practice.</p><button className="wz-action-button" onClick={goPractice}>Explore English Practice <ArrowRight size={17}/></button><button className="wz-secondary-link" onClick={goHome}>Back home</button></section>:view==='categories'?<EnglishAcademy key={academyLesson||academyLevel} initialLevel={academyLevel} initialLessonId={academyLesson} journey={journey} onJourney={setJourney} onHome={goHome} onClassic={goClassic} onPracticeGames={goPracticeGames}/>:view==='games'?<EnglishJourney key={startingCategory??'all'} initialCategory={startingCategory} onHome={goPractice} onLegacy={goClassic} journey={journey} onJourney={setJourney}/>
:<><div className="wiz-back-line"><button onClick={goPractice}><ArrowLeft size={17}/> Back to English learning</button><span>English Practice • Wizpiko Word Puzzles</span></div><section className="wiz-classic-heading" aria-labelledby="page-heading"><div><span className="wiz-kicker">ENGLISH PRACTICE • NEW WORD DISCOVERIES</span><h1 id="page-heading">Word adventures with <span>Wizpiko!</span></h1><p>Choose a clue, tap a word, and earn your stars. Explore ten newly written Wizpiko puzzles at your own pace.</p></div><img src="./wizpiko-icon.webp" alt="" /></section>

      {(archivedClassic.solvedWords > 0 || archivedClassic.completedPuzzles > 0) && <p className="wz-history-note">Your earlier collection is saved: {archivedClassic.solvedWords} words discovered and {archivedClassic.completedPuzzles} puzzles completed. These new puzzles start fresh.</p>}
      <div className="workspace">
        <aside className="adventures" id="adventures" aria-label="Choose a crossword adventure">
          <div className="section-label">YOUR ADVENTURES <span>10</span></div>
          <div className="adventure-list">{puzzles.map((item, index) => {
            const isDone = progress[item.id]?.solved.length === item.entries.length;
            return <button key={item.id} className={`adventure ${index === puzzleIndex ? 'selected' : ''} ${isDone ? 'finished' : ''}`} onClick={() => choosePuzzle(index)} aria-current={index === puzzleIndex ? 'page' : undefined}>
              <span className="adventure-emoji" aria-hidden="true">{item.emoji}</span><span className="adventure-label"><small>PUZZLE {String(index + 1).padStart(2, '0')}</small><span>{item.title}</span></span>{isDone ? <Check size={17} className="adventure-check" /> : index === puzzleIndex ? <ChevronRight size={16} /> : null}
            </button>;
          })}</div>
          <div className="sidebar-note"><span className="note-flower">✺</span><p>Little by little,<br /><strong>you’re learning a lot.</strong></p><span className="note-dash" /></div>
          <button className="help-link" onClick={() => setDialog('help')}><CircleHelp size={17} /> How to play</button>
        </aside>

        <section className="puzzle-card" aria-label={`${puzzle.title} crossword`} key={puzzle.id}>
          <div className="puzzle-header"><div><div className="puzzle-kicker">CROSSWORD {String(puzzleIndex + 1).padStart(2, '0')} <span> / 10</span></div><h2><span aria-hidden="true">{puzzle.emoji}</span> {puzzle.title}</h2></div><span className="level-badge"><Star size={13} /> Beginner</span></div>
          <div className="puzzle-progress"><div className="progress-track" role="progressbar" aria-label="Words found" aria-valuenow={state.solved.length} aria-valuemin={0} aria-valuemax={puzzle.entries.length}><span style={{ width: `${state.solved.length / puzzle.entries.length * 100}%` }} /></div><span><strong>{state.solved.length}</strong> / {puzzle.entries.length} words</span><Star size={15} className={completed ? 'star-earned' : ''} /></div>
          <div className={`selected-clue ${completed ? 'all-found' : ''}`}>
            <span className="selected-clue-number">{completed ? <CheckCheck size={20} /> : selected.number}</span><div><span className="selected-clue-direction">{completed ? 'ADVENTURE COMPLETE' : `${selected.direction.toUpperCase()} ${selected.direction === 'across' ? '→' : '↓'}`}</span><p>{completed ? 'Every word found. Look at you grow!' : selected.clue}</p></div><span className="letter-count">{completed ? '★' : `${selected.answer.length} letters`}</span>
          </div>
          <div className={`board-stage ${dragOver ? 'drag-over' : ''}`} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; setDragOver(true); }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragOver(false); }} onDrop={event => dropWord(event)}>
            <span className="board-doodle doodle-one" aria-hidden="true">✦</span><span className="board-doodle doodle-two" aria-hidden="true">✧</span>
            <div className="crossword-grid" role="group" aria-label="Crossword grid" style={{ '--cols': puzzle.cols, '--rows': puzzle.rows } as CSSProperties}>
              {Array.from({ length: puzzle.rows * puzzle.cols }, (_, index) => {
                const row = Math.floor(index / puzzle.cols), col = index % puzzle.cols;
                const cell = cells.get(`${row}-${col}`);
                if (!cell) return <span className="empty-cell" aria-hidden="true" key={index} />;
                const active = entryContains(selected, row, col) && !completed;
                return <button key={index} className={`crossword-cell ${active ? 'cell-active' : ''} ${cell.solved ? 'cell-solved' : ''} ${cell.hinted && !cell.solved ? 'cell-hinted' : ''} ${dragWord && active ? 'cell-drop' : ''}`} data-row={row} data-col={col} data-entries={cell.entries.map(entry => entry.id).join(',')} aria-label={`Row ${row + 1}, column ${col + 1}${cell.number ? `, clue ${cell.number}` : ''}${cell.letter ? `, letter ${cell.letter}` : ', empty'}`} aria-pressed={active}
                  onClick={() => { const options = cell.entries.filter(entry => !state.solved.includes(entry.id)); const current = options.findIndex(entry => entry.id === selected.id); chooseEntry(options[(current + 1) % options.length] ?? cell.entries[0]); }}
                  onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; }} onDrop={event => dropWord(event, row, col)}>
                  {cell.number && <span className="cell-number">{cell.number}</span>}<span className="cell-letter">{cell.letter}</span>
                </button>;
              })}
            </div>
            <div className="board-instruction"><MousePointer2 size={13} /> {completed ? 'A whole puzzle of little victories!' : dragWord ? 'Drop your word onto the highlighted squares' : 'Choose a clue. Drag a word. Watch it fit!'} </div>
          </div>
          <section className="wiz-all-clues" aria-label="Across and down crossword clues">
            <div className="wiz-clue-heading"><h3>All puzzle clues</h3><p>Both directions are shown. Select any clue to highlight its word.</p></div>
            <div className="wiz-clue-columns">{(['across', 'down'] as const).map(direction => <div className="wiz-clue-set" key={direction}>
              <h4>{direction === 'across' ? '→ Across' : '↓ Down'}</h4>
              {puzzle.entries.filter(entry => entry.direction === direction).map(entry => <button key={entry.id}
                className={'wiz-all-clue ' + (selected.id === entry.id ? 'wiz-all-clue-active ' : '') + (state.solved.includes(entry.id) ? 'wiz-all-clue-solved' : '')}
                onClick={() => chooseEntry(entry)} aria-pressed={entry.id === selected.id}>
                <b>{entry.number}</b><span>{entry.clue}<small>{entry.answer.length} letters</small></span>
                {state.solved.includes(entry.id) && <Check size={15}/>}
              </button>)}
            </div>)}</div>
          </section>
          <div className="puzzle-footer"><button className="text-button" onClick={() => setDialog('reset')}><RotateCcw size={14} /> Start over</button><button className="hint-button" onClick={giveHint} disabled={completed}><Lightbulb size={16} /> A little hint</button></div>
        </section>

        <aside className="wiz-word-sidebar" aria-label="Word bank">          <div className="word-bank"><div className="word-bank-heading"><h3><span className="bank-icon"><GripVertical size={15} /></span> Your word bank</h3><span>{puzzle.wordBank.length - state.solved.length} to discover</span></div><p>Drag a word to the grid, or tap it to fill the selected clue.</p>{!completed && <div className="bank-active-clue"><strong>{selected.number} {selected.direction}:</strong> {selected.clue}</div>}<div className="word-tiles">
            {puzzle.wordBank.map(word => {
              const used = puzzle.entries.some(entry => entry.answer === word && state.solved.includes(entry.id));
              return <button key={word} draggable={!used} disabled={used} className={`word-tile ${used ? 'word-used' : ''} ${shake === word ? 'shake' : ''} ${dragWord === word ? 'is-dragging' : ''}`} onClick={() => placeWord(word)} onDragStart={event => { event.dataTransfer.setData('text/plain', word); event.dataTransfer.effectAllowed = 'copy'; setDragWord(word); }} onDragEnd={() => { setDragWord(null); setDragOver(false); }} aria-label={used ? `${word}, found` : `Place ${word}`}><span>{used ? <Check size={13} /> : <GripVertical size={12} />}</span>{word}</button>;
            })}
          </div></div>
<div className="wiz-word-tip"><Sparkles size={18}/> Choose a clue in the center and pick the matching word here.</div><div className="saved-note"><Check size={13}/> {storageWarning ? 'Progress saved for this visit' : 'Your progress is saved as you play'}</div></aside>
      </div>
      </>}
      </Suspense>
      <SiteFooter signedIn={!!account.auth.user} onHome={goHome} onSubjects={goSubjects} onProgress={()=>goHub('progress')} onInfo={openInfo} onContact={openContact}/>

    </main>

    {accountOpen && <Suspense fallback={<div className="wz-auth-loading" role="status">Opening Sign In…</div>}><AccountDialog onClose={() => {setAccountOpen(false);saveIntent(null);setPendingDestination(null);}} configured={account.auth.configured} email={account.auth.user?.email} profile={account.auth.profile} recovery={account.auth.recovery} status={account.auth.status} signUp={account.signUp} signIn={account.signIn} signOut={account.signOut} sendPasswordReset={account.sendPasswordReset} updatePassword={account.updatePassword} resendSignupConfirmation={account.resendSignupConfirmation}/></Suspense>}

    <div className={`notice ${notice ? 'notice-visible' : ''} ${notice?.kind ?? ''}`} role="status" aria-live="polite" aria-atomic="true">{notice && <>{notice.kind === 'success' ? <Sparkles size={20} /> : notice.kind === 'hint' ? <Lightbulb size={20} /> : <Leaf size={20} />}<span>{notice.text}</span><button aria-label="Dismiss message" onClick={() => setNotice(null)}><X size={16} /></button></>}</div>

    {dialog === 'signout'&&<Modal title="Sign out?" onClose={()=>setDialog(null)}><h2>See you soon! 🌟</h2><p className="modal-subtitle">Your saved progress will be waiting when you sign in again.</p><div className="modal-actions"><button className="secondary-button" onClick={()=>setDialog(null)}>Keep learning</button><button className="primary-button" onClick={()=>{void account.signOut().then(()=>{setDialog(null);goHome();});}}>Sign Out</button></div></Modal>}
    {dialog === 'help' && <Modal title="How to play" onClose={() => setDialog(null)}><img className="wiz-modal-robot" src="./wizpiko-icon.webp" alt="" /><div className="eyebrow">READY, SET, SHINE</div><h2>A little play goes a long way.</h2><p className="modal-subtitle">Your next word adventure is just three little steps away.</p><ol className="help-steps"><li><span>1</span><div><strong>Pick a clue</strong><p>Tap an Across or Down clue. Its squares will light up in the grid.</p></div></li><li><span>2</span><div><strong>Find your word</strong><p>Drag a word from the word bank onto the highlighted squares. On a phone, just tap the word!</p></div></li><li><span>3</span><div><strong>Watch it grow</strong><p>The right word turns green. If it doesn’t fit, try again. Need a nudge? Ask for a little hint.</p></div></li></ol><div className="grownup-note"><BookOpen size={20} /><p><strong>A note for grown-ups</strong>These ten Wizpiko word adventures use newly written clues and fresh layouts. Your learning progress stays connected to your signed-in account. Check the save status as you play. Puzzles and question sets let you take as long as you need.</p></div><button className="primary-button" onClick={() => setDialog(null)}>Let’s play <ArrowRight size={17} /></button></Modal>}

    {dialog === 'progress' && <Modal title="My progress" onClose={() => setDialog(null)}><img className="wiz-modal-robot" src="./wizpiko-icon.webp" alt="" /><div className="eyebrow">LOOK AT YOU SHINE</div><h2>Every little word counts.</h2><p className="modal-subtitle">An adventure is made of little victories. Here are yours.</p><div className="progress-stats"><div><strong>{solvedTotal}<small> / {totalWords}</small></strong><span>Words discovered</span></div><div><strong>{completedTotal}<small> / 10</small></strong><span>Word puzzles complete</span></div><div><strong>{academyXP}</strong><span>Learning XP</span></div><div><strong>{unlockedLevels}</strong><span>New levels unlocked</span></div></div><h3 className="badges-title"><Award size={18} /> Your little milestones</h3><div className="badge-list">{badges.map(badge => <div className={`badge ${badge.unlocked ? 'badge-unlocked' : ''}`} key={badge.name}><span>{badge.emoji}</span><div><strong>{badge.name}</strong><small>{badge.detail}</small></div>{badge.unlocked && <Check size={17} />}</div>)}</div><p className="privacy-note">{account.auth.user ? account.auth.status : "Sign in to open your saved learning progress."}</p><button className="primary-button" onClick={() => setDialog(null)}>Keep exploring <ArrowRight size={17} /></button></Modal>}

    {dialog === 'reset' && <Modal title="Start this puzzle over?" onClose={() => setDialog(null)}><span className="modal-emoji">🍃</span><h2>A fresh little start?</h2><p className="modal-subtitle">This clears the words and hints in <strong>{puzzle.title}</strong>. Your other adventures will stay just as they are.</p><div className="modal-actions"><button className="secondary-button" onClick={() => setDialog(null)}><ArrowLeft size={16} /> Keep playing</button><button className="primary-button" onClick={() => { setProgress(current => ({ ...current, [puzzle.id]: initialProgress() })); chooseEntry(puzzle.entries[0]); setDialog(null); setNotice(null); }}>Start fresh <RotateCcw size={15} /></button></div></Modal>}

    {dialog === 'complete' && <Modal title="Puzzle complete!" onClose={() => setDialog(null)}><div className="confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ '--i': index } as CSSProperties} />)}</div><img src="./wizpiko-icon.webp" alt="" className="wiz-celebration-robot"/><div className="eyebrow"><Trophy size={15} /> A BIG LITTLE VICTORY</div><h2>You’re a word wonder!</h2><p className="modal-subtitle">You found all {puzzle.entries.length} words in <strong>{puzzle.title}</strong>.<br />Give yourself a little happy dance!</p><div className="completion-stars" aria-label="Three stars earned">★ ★ ★</div><button className="primary-button" onClick={() => { if (puzzleIndex < puzzles.length - 1) choosePuzzle(puzzleIndex + 1); else setDialog('progress'); }}>{puzzleIndex < puzzles.length - 1 ? 'Next adventure' : 'See my discoveries'} <ArrowRight size={17} /></button><button className="text-button modal-back" onClick={() => setDialog(null)}>Admire my puzzle</button></Modal>}
  </>;
}
