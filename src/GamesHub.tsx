import { ArrowLeft, ArrowRight, Check, Gamepad2, Sparkles } from 'lucide-react';
import type { JourneyProgress } from './journey';
import { gameSubjects } from './gameSubjects';
import type { GameSubjectId } from './gameSubjects';
import { formatGameLevel, subjectGameStats } from './subjectGameProgress';
import './subject-games.css';

type Props = { journey: JourneyProgress; signedIn: boolean; onChoose: (id: GameSubjectId) => void; onHome: () => void };
export default function GamesHub({ journey, signedIn, onChoose, onHome }: Props) {
  const maths = subjectGameStats(journey.subjectGames?.maths);
  const englishCompleted = Object.values(journey.records || {}).reduce((sum, record) => sum + (record?.completed || 0), 0);
  return <div className="sg-page">
    <div className="sg-topline"><button type="button" onClick={onHome}><ArrowLeft size={17} /> Home</button><span><Gamepad2 size={17} /> Wizpiko Playroom</span></div>
    <header className="sg-heading"><span className="sg-kicker">A LITTLE THINKING. A LOT OF FUN.</span><h1>Pick a subject.<br /><span>Find your next little win.</span></h1><p>Play, explore and build confidence, one short round at a time.</p><div className="sg-pills"><span><Check size={15} /> No timers</span><span><Sparkles size={15} /> Learn at your pace</span></div></header>
    <div className="sg-subject-grid">{gameSubjects.map(subject => <section className={`sg-subject sg-${subject.id}`} key={subject.id} aria-labelledby={`game-${subject.id}`}>
      <div className="sg-subject-art" aria-hidden="true"><span>{subject.symbol}</span><i>✦</i><b>{subject.id === 'maths' ? '×' : '?'}</b><em>{subject.id === 'maths' ? '÷' : 'Z'}</em></div>
      <div className="sg-subject-copy"><span className="sg-kicker">{subject.title} games</span><h2 id={`game-${subject.id}`}>{subject.game}</h2><p>{subject.description}</p><div className="sg-subject-tags">{subject.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        {signedIn && <p className="sg-saved-progress">{subject.id === 'maths' ? maths.practised || journey.subjectGames?.maths?.session ? `Level ${formatGameLevel(maths.level)} · ${maths.passed} levels passed · ${maths.xp} XP` : 'Your number adventure starts here.' : englishCompleted ? `${englishCompleted} game levels completed` : 'Your word adventure starts here.'}</p>}
        <button type="button" className="sg-primary" onClick={() => onChoose(subject.id)}>Play {subject.title} <ArrowRight size={18} /></button>
      </div>
    </section>)}</div>
    {!signedIn && <p className="sg-footnote">Choose a game to sign in and save your progress.</p>}
    <p className="sg-footnote">More subjects will join the playroom as Wizpiko grows.</p>
  </div>;
}
