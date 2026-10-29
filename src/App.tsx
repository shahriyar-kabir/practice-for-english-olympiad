import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, DragEvent, ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Award, BookOpen, Check, CheckCheck, ChevronRight, CircleHelp, GripVertical, Leaf, Lightbulb, MousePointer2, RotateCcw, Sparkles, Star, Trophy, X } from 'lucide-react';
import { puzzles } from './data/puzzles';
import type { Entry } from './data/puzzles';
import { buildCells, cellAt, entryContains, initialProgress, readProgress, saveProgress } from './game';
import type { Progress } from './game';
import { EnglishJourney, readJourney, saveJourney } from './EnglishJourney';
import type { JourneyProgress } from './EnglishJourney';
import { useWizpikoAccount } from './cloudAccount';
import { AccountDialog } from './AccountDialog';
import { WizpikoPortal } from './WizpikoPortal';
import { LearnerHub, learnerMenu } from './LearnerHub';
import type { LearnerPage } from './LearnerHub';
import { ageFromBirthdate, ageLabel, learningStreak, recordActivity } from './learnerData';
import { ChevronDown, Search, Instagram, Facebook, LogOut, ShieldCheck } from 'lucide-react';

type Notice = { text: string; kind: 'success' | 'try' | 'hint' };
type Dialog = 'help' | 'progress' | 'reset' | 'complete' | 'about' | 'privacy' | 'signout' | null;

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
  const [view, setView] = useState<'home'|'categories'|'classic'|'hub'|'coming'>('home');
  const [hubPage,setHubPage]=useState<LearnerPage>('profile');
  const [comingSubject,setComingSubject]=useState('');
  const [avatarOpen,setAvatarOpen]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const [searchTerm,setSearchTerm]=useState('');
  const avatarRef=useRef<HTMLDivElement>(null);
  function goHub(page:LearnerPage){setAvatarOpen(false);setHubPage(page);setView('hub');setDialog(null);window.scrollTo(0,0);}
  function goComing(name:string){setComingSubject(name);setView('coming');window.scrollTo(0,0);}
  useEffect(()=>{const cb=(e:MouseEvent)=>{if(avatarRef.current&&!avatarRef.current.contains(e.target as Node))setAvatarOpen(false);};document.addEventListener('mousedown',cb);return()=>document.removeEventListener('mousedown',cb);},[]);
  function doSearch(){if(!searchTerm.trim())return;if(/english|crossword|quiz|mcq|word/i.test(searchTerm))goPractice();else goComing(searchTerm.trim());setSearchOpen(false);}
  function goPractice() { setView('categories'); setDialog(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function goHome() { setView('home'); setDialog(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function goClassic() { setView('classic'); setDialog(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  const account = useWizpikoAccount({ legacy: progress, journey }, restored => { setProgress(restored.legacy); setJourney(restored.journey); });
  useEffect(() => { saveJourney(journey); }, [journey]);
  useEffect(() => { if(account.auth.recovery)setAccountOpen(true); }, [account.auth.recovery]);
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
  const completedTotal = puzzles.filter(item => progress[item.id]?.solved.length === item.entries.length).length;
  const academyRecords = Object.values(journey.records);
  const academyXP = academyRecords.reduce((sum, item) => sum + item.xp, 0);
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
    if (finished) {setDialog('complete');setJourney(previous=>({...previous,activityDates:recordActivity(previous.activityDates)}));}
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

  const badges = [
    { name: 'First find', emoji: '🤖', unlocked: solvedTotal > 0, detail: 'Find your very first word' },
    { name: 'Puzzle pal', emoji: '🧩', unlocked: completedTotal > 0, detail: 'Finish one whole puzzle' },
    { name: 'Word explorer', emoji: '🧭', unlocked: solvedTotal >= 20, detail: 'Find 20 different words' },
    { name: 'Super explorer', emoji: '🌟', unlocked: completedTotal >= 3, detail: 'Finish 3 adventures' },
    { name: 'Word champion', emoji: '🏆', unlocked: completedTotal === puzzles.length, detail: 'Finish all 10 original crosswords' },
    { name: 'Level explorer', emoji: '🚀', unlocked: unlockedLevels >= 1, detail: 'Unlock your first new level' },
    { name: 'Wizpiko wizard', emoji: '🧠', unlocked: academyXP >= 500, detail: 'Earn 500 XP through practice' },
  ];

  return <>
    <header className="site-header wz-site-header"><div className="header-inner wz-header-inner">
      <button className="wz-header-logo" onClick={goHome} aria-label="Wizpiko home"><img src="/wizpiko-logo.webp" alt="Wizpiko — Think. Play. Shine."/></button>
      <nav className="wz-header-nav" aria-label="Main navigation"><button className={view==='home'?'active':''} onClick={goHome}>Home</button><button onClick={()=>setDialog('about')}>About Us</button>{account.auth.user&&account.auth.profile?.consent_status!=='pending'&&<button className={view==='hub'?'active':''} onClick={()=>goHub('progress')}>My Learning</button>}</nav>
      <div className="wz-header-right"><form className={'wz-search '+(searchOpen?'open':'')} onSubmit={e=>{e.preventDefault();doSearch();}}>{searchOpen&&<input autoFocus aria-label="Search subjects" placeholder="Search subjects…" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>}<button aria-label="Search" type={searchOpen?'submit':'button'} onClick={()=>{if(!searchOpen)setSearchOpen(true);}}><Search size={20}/></button></form>
      {account.auth.user?<div className="wz-avatar-wrap" ref={avatarRef}><button className="wz-avatar-button" onClick={()=>setAvatarOpen(!avatarOpen)} aria-expanded={avatarOpen} aria-haspopup="menu"><span className="wz-avatar-pic">{({girl:'👧',boy:'👦',robot:'🤖',panda:'🐼',cat:'🐱'} as const)[account.auth.profile?.avatar||'robot']}</span><span>{account.auth.profile?.display_name||'Learner'}</span><ChevronDown size={15}/></button>
        {avatarOpen&&<div className="wz-avatar-menu" role="menu"><div className="wz-menu-person"><span className="wz-avatar-pic">{({girl:'👧',boy:'👦',robot:'🤖',panda:'🐼',cat:'🐱'} as const)[account.auth.profile?.avatar||'robot']}</span><div><strong>{account.auth.profile?.display_name||'Learner'}</strong><small>{ageLabel(ageFromBirthdate(account.auth.profile?.birth_date||''))}</small></div></div>{learnerMenu.map(({id,label,icon:Icon})=><button key={id} role="menuitem" onClick={()=>goHub(id)}><Icon size={17}/>{label}{id==='streak'&&<span className="wz-menu-flame">🔥 {learningStreak(journey.activityDates).current}</span>}</button>)}<button role="menuitem" className="wz-menu-signout" onClick={()=>{setAvatarOpen(false);setDialog('signout');}}><LogOut size={17}/> Sign Out</button></div>}
      </div>:<button className="wz-signin-button" onClick={()=>setAccountOpen(true)}>Sign In</button>}</div></div></header>
    <main className="page-wrap">
      {account.auth.profile?.consent_status==='pending'?<section className="wz-pending-gate"><ShieldCheck size={35}/><h1>Guardian approval needed</h1><p>This learner account is pending guardian approval. Request a verification email in My Account.</p><button className="wz-action-button" onClick={()=>setAccountOpen(true)}>My Account</button></section>:view==='home'?<WizpikoPortal onPractice={goPractice} onComingSoon={goComing} signedIn={!!account.auth.user} nickname={account.auth.profile?.display_name} onProgress={()=>goHub('progress')} onStreak={()=>goHub('streak')} streak={learningStreak(journey.activityDates).current} solvedTotal={solvedTotal} completedTotal={completedTotal}/>:view==='hub'&&account.auth.user?<LearnerHub page={hubPage} profile={account.auth.profile} email={account.auth.user.email||''} journey={journey} solvedTotal={solvedTotal} completedTotal={completedTotal} totalWords={totalWords} onPage={goHub} onHome={goHome} onPractice={goPractice} onSignOut={()=>setDialog('signout')} onSaveProfile={account.updateProfile} onGuardianEmail={account.sendGuardianVerification}/>:view==='coming'?<section className="wz-coming-page"><Sparkles size={42}/><h1>{comingSubject}</h1><p>Something wonderful is coming soon! For now, enjoy English Practice.</p><button className="wz-action-button" onClick={goPractice}>Explore English Practice <ArrowRight size={17}/></button><button className="wz-secondary-link" onClick={goHome}>Back home</button></section>:view==='categories'?<EnglishJourney onHome={goHome} onLegacy={goClassic} journey={journey} onJourney={setJourney}/>:<><div className="wiz-back-line"><button onClick={goPractice}><ArrowLeft size={17}/> Back to English categories</button><span>English Practice • Original Beginner Crosswords</span></div><section className="wiz-classic-heading" aria-labelledby="page-heading"><div><span className="wiz-kicker">ENGLISH PRACTICE • ORIGINAL BEGINNER PUZZLES</span><h1 id="page-heading">Word adventures with <span>Wizpiko!</span></h1><p>Choose a clue, tap a word, and earn your stars. All original puzzles remain available.</p></div><img src="/wizpiko-icon.webp" alt="" /></section>
      
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
      <footer className="wiz-site-footer wz-footer"><div className="wz-footer-grid"><div className="wz-footer-identity"><img src="/wizpiko-logo.webp" alt="Wizpiko — Think. Play. Shine."/><p>A cheerful place to explore, practise and grow with curiosity.</p></div><div><strong>Platform</strong><button onClick={goHome}>Home</button><button onClick={()=>{goHome();window.setTimeout(()=>document.getElementById('wiz-subjects')?.scrollIntoView({behavior:'smooth'}),20);}}>Subjects</button>{account.auth.user&&<button onClick={()=>goHub('progress')}>My Progress</button>}</div><div><strong>Support</strong><button onClick={()=>account.auth.user?goHub('help'):setDialog('privacy')}>Help Center</button><button onClick={()=>setDialog('privacy')}>Privacy & Safety</button><button onClick={()=>account.auth.user?goHub('parent'):setDialog('privacy')}>Parent Guide</button></div><div><strong>Company</strong><button onClick={()=>setDialog('about')}>About Us</button><button onClick={()=>setDialog('about')}>Our Mission</button></div><div><strong>Follow Us</strong><span className="wz-social-icons"><span title="Official Facebook link pending"><Facebook size={23}/></span><span title="Official Instagram link pending"><Instagram size={23}/></span></span><small>© {new Date().getFullYear()} Wizpiko.</small></div></div></footer>
    </main>

    {accountOpen && <AccountDialog onClose={() => setAccountOpen(false)} configured={account.auth.configured} email={account.auth.user?.email} profile={account.auth.profile} recovery={account.auth.recovery} status={account.auth.status} signUp={account.signUp} signIn={account.signIn} signOut={account.signOut} sendPasswordReset={account.sendPasswordReset} updatePassword={account.updatePassword} sendGuardianVerification={account.sendGuardianVerification} />}

    <div className={`notice ${notice ? 'notice-visible' : ''} ${notice?.kind ?? ''}`} role="status" aria-live="polite" aria-atomic="true">{notice && <>{notice.kind === 'success' ? <Sparkles size={20} /> : notice.kind === 'hint' ? <Lightbulb size={20} /> : <Leaf size={20} />}<span>{notice.text}</span><button aria-label="Dismiss message" onClick={() => setNotice(null)}><X size={16} /></button></>}</div>

    {dialog === 'signout'&&<Modal title="Sign out?" onClose={()=>setDialog(null)}><h2>See you soon! 🌟</h2><p className="modal-subtitle">Your saved progress will be waiting when you sign in again.</p><div className="modal-actions"><button className="secondary-button" onClick={()=>setDialog(null)}>Keep learning</button><button className="primary-button" onClick={()=>{void account.signOut().then(()=>{setDialog(null);goHome();});}}>Sign Out</button></div></Modal>}
    {dialog === 'help' && <Modal title="How to play" onClose={() => setDialog(null)}><img className="wiz-modal-robot" src="/wizpiko-icon.webp" alt="" /><div className="eyebrow">READY, SET, SHINE</div><h2>A little play goes a long way.</h2><p className="modal-subtitle">Your next word adventure is just three little steps away.</p><ol className="help-steps"><li><span>1</span><div><strong>Pick a clue</strong><p>Tap an Across or Down clue. Its squares will light up in the grid.</p></div></li><li><span>2</span><div><strong>Find your word</strong><p>Drag a word from the word bank onto the highlighted squares. On a phone, just tap the word!</p></div></li><li><span>3</span><div><strong>Watch it grow</strong><p>The right word turns green. If it doesn’t fit, try again. Need a nudge? Ask for a little hint.</p></div></li></ol><div className="grownup-note"><BookOpen size={20} /><p><strong>A note for grown-ups</strong>All 10 puzzles come from the supplied Beginner English Olympiad activity book. Your progress saves locally as you play and can sync across devices after you sign in. Timed challenges are available in the English categories.</p></div><button className="primary-button" onClick={() => setDialog(null)}>Let’s play <ArrowRight size={17} /></button></Modal>}

    {dialog === 'progress' && <Modal title="My progress" onClose={() => setDialog(null)}><img className="wiz-modal-robot" src="/wizpiko-icon.webp" alt="" /><div className="eyebrow">LOOK AT YOU SHINE</div><h2>Every little word counts.</h2><p className="modal-subtitle">An adventure is made of little victories. Here are yours.</p><div className="progress-stats"><div><strong>{solvedTotal}<small> / {totalWords}</small></strong><span>Original words discovered</span></div><div><strong>{completedTotal}<small> / 10</small></strong><span>Original puzzles complete</span></div><div><strong>{academyXP}</strong><span>English challenge XP</span></div><div><strong>{unlockedLevels}</strong><span>New levels unlocked</span></div></div><h3 className="badges-title"><Award size={18} /> Your little milestones</h3><div className="badge-list">{badges.map(badge => <div className={`badge ${badge.unlocked ? 'badge-unlocked' : ''}`} key={badge.name}><span>{badge.emoji}</span><div><strong>{badge.name}</strong><small>{badge.detail}</small></div>{badge.unlocked && <Check size={17} />}</div>)}</div><p className="privacy-note">{account.auth.user ? account.auth.status : "Guest progress saves in this browser. Sign in to sync progress across devices."}</p><button className="primary-button" onClick={() => setDialog(null)}>Keep exploring <ArrowRight size={17} /></button></Modal>}

    {dialog === 'about' && <Modal title="About Wizpiko" onClose={() => setDialog(null)}><img className="wiz-modal-robot" src="/wizpiko-icon.webp" alt=""/><h2>Learning should feel like an adventure.</h2><p className="modal-subtitle">Wizpiko is growing into a welcoming learning platform for curious learners of different ages. English practice is available today; additional subjects are in development.</p><button className="primary-button" onClick={() => setDialog(null)}>Continue exploring</button></Modal>}
    {dialog === 'privacy' && <Modal title="Privacy and safety" onClose={() => setDialog(null)}><h2>Privacy & safety</h2><p className="modal-subtitle">Wizpiko lets visitors practise as guests using local browser storage. Registered users can sync their progress securely with Supabase. Registration is currently for controlled adult testing; email ownership is not verified during this test phase.</p><p className="modal-subtitle">This is a brief privacy overview, not a complete privacy policy. Before public registration, Wizpiko needs proper age-specific consent, verified contact ownership, account recovery, deletion procedures, and published privacy and terms documents.</p><button className="primary-button" onClick={() => setDialog(null)}>Got it</button></Modal>}
    {dialog === 'reset' && <Modal title="Start this puzzle over?" onClose={() => setDialog(null)}><span className="modal-emoji">🍃</span><h2>A fresh little start?</h2><p className="modal-subtitle">This clears the words and hints in <strong>{puzzle.title}</strong>. Your other adventures will stay just as they are.</p><div className="modal-actions"><button className="secondary-button" onClick={() => setDialog(null)}><ArrowLeft size={16} /> Keep playing</button><button className="primary-button" onClick={() => { setProgress(current => ({ ...current, [puzzle.id]: initialProgress() })); chooseEntry(puzzle.entries[0]); setDialog(null); setNotice(null); }}>Start fresh <RotateCcw size={15} /></button></div></Modal>}

    {dialog === 'complete' && <Modal title="Puzzle complete!" onClose={() => setDialog(null)}><div className="confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ '--i': index } as CSSProperties} />)}</div><img src="/wizpiko-icon.webp" alt="" className="wiz-celebration-robot"/><div className="eyebrow"><Trophy size={15} /> A BIG LITTLE VICTORY</div><h2>You’re a word wonder!</h2><p className="modal-subtitle">You found all {puzzle.entries.length} words in <strong>{puzzle.title}</strong>.<br />Give yourself a little happy dance!</p><div className="completion-stars" aria-label="Three stars earned">★ ★ ★</div><button className="primary-button" onClick={() => { if (puzzleIndex < puzzles.length - 1) choosePuzzle(puzzleIndex + 1); else setDialog('progress'); }}>{puzzleIndex < puzzles.length - 1 ? 'Next adventure' : 'See my discoveries'} <ArrowRight size={17} /></button><button className="text-button modal-back" onClick={() => setDialog(null)}>Admire my puzzle</button></Modal>}
  </>;
}
