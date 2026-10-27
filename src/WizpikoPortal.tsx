import { ArrowRight, Atom, BookOpen, Brain, Calculator, Code2, FlaskConical, Languages, Rocket, Sparkles, Star, Trophy } from 'lucide-react';

const subjects = [
  { name: 'English', label: 'Words, stories & crosswords', icon: Languages, color: 'violet', live: true },
  { name: 'Mathematics', label: 'Numbers, logic & patterns', icon: Calculator, color: 'blue', live: false },
  { name: 'Science', label: 'Ask, discover & explore', icon: Atom, color: 'mint', live: false },
  { name: 'Physics', label: 'Motion, energy & more', icon: Rocket, color: 'orange', live: false },
  { name: 'Chemistry', label: 'Elements & experiments', icon: FlaskConical, color: 'pink', live: false },
  { name: 'Informatics', label: 'Coding & clever algorithms', icon: Code2, color: 'cyan', live: false },
  { name: 'Artificial Intelligence', label: 'Explore the future', icon: Brain, color: 'lavender', live: false },
  { name: 'More Olympiads', label: 'New adventures ahead', icon: Trophy, color: 'yellow', live: false },
] as const;

export function WizpikoPortal({ onPractice, solvedTotal, completedTotal }: {
  onPractice: () => void;
  solvedTotal: number;
  completedTotal: number;
}) {
  return <>
    <section className="wiz-hero" aria-labelledby="wiz-heading">
      <div className="wiz-hero-copy">
        <span className="wiz-hero-pill"><Sparkles size={16} /> Your world of curious minds</span>
        <h1 id="wiz-heading">Big dreams begin with <span>little discoveries.</span></h1>
        <p>Welcome to Wizpiko! A cheerful place to think, play and shine. Build confidence with fun challenges and grow towards your Olympiad goals, one discovery at a time.</p>
        <div className="wiz-hero-actions">
          <button className="wiz-btn-primary" onClick={onPractice}>Start English practice <ArrowRight size={19} /></button>
          <a className="wiz-btn-secondary" href="#wiz-subjects">Explore subjects <ArrowRight size={17} /></a>
        </div>
        <div className="wiz-hero-chips" aria-label="Learning features">
          <span><Star size={15} fill="currentColor" /> Beginner-friendly</span>
          <span><BookOpen size={15} /> 10 crosswords ready</span>
          <span><Trophy size={15} /> Learn at your pace</span>
        </div>
      </div>
      <div className="wiz-hero-visual">
        <div className="wiz-visual-orb orb-one" />
        <div className="wiz-visual-orb orb-two" />
        <img src="/wizpiko-logo.webp" alt="Wizpiko's friendly learning robot and colorful logo" className="wiz-hero-logo" />
        <div className="wiz-float-card wiz-float-top">✦ A new idea!</div>
        <div className="wiz-float-card wiz-float-bottom">⭐ You can do it!</div>
      </div>
    </section>

    <section className="wiz-showcase" aria-label="Wizpiko at a glance">
      <div><span className="wiz-showcase-icon">🧩</span><strong>10</strong><span>Playable English crosswords</span></div>
      <div><span className="wiz-showcase-icon">🏅</span><strong>{completedTotal}</strong><span>Adventures completed here</span></div>
      <div><span className="wiz-showcase-icon">✨</span><strong>{solvedTotal}</strong><span>Words found in this browser</span></div>
    </section>

    <section className="wiz-subjects" id="wiz-subjects" aria-labelledby="wiz-subject-heading">
      <div className="wiz-section-header">
        <div><span className="wiz-kicker">A UNIVERSE OF POSSIBILITIES</span><h2 id="wiz-subject-heading">Find your next <em>spark.</em></h2><p>Start with English today. More subject adventures are being prepared.</p></div>
        <span className="wiz-heading-sticker">Think • Play • Shine</span>
      </div>
      <div className="wiz-subject-grid">
        {subjects.map(({ name, label, icon: Icon, color, live }) => (
          <div className={`wiz-subject-card wiz-${color} ${live ? 'wiz-subject-active' : 'wiz-subject-soon'}`} key={name}>
            <div className="wiz-subject-top"><span className="wiz-subject-icon"><Icon size={24} strokeWidth={2.2} /></span><span className={`wiz-state ${live ? 'wiz-live' : ''}`}>{live ? 'Play now' : 'Coming soon'}</span></div>
            <h3>{name}</h3><p>{label}</p>
            {live ? <button className="wiz-subject-link" onClick={onPractice}>Explore English <ArrowRight size={16} /></button> : <span className="wiz-subject-link wiz-muted-link" aria-label={`${name} coming soon`}>More to discover <Sparkles size={15} /></span>}
          </div>
        ))}
      </div>
    </section>

    <section id="wiz-english" className="wiz-practice-intro">
      <div><span className="wiz-kicker">READY TO PLAY?</span><h2>English Olympiad <span>practice zone</span></h2><p>Choose an adventure, read a clue and fit the right word into the crossword. All 10 beginner puzzles are playable below.</p></div>
      <div className="wiz-practice-label"><span>🎯</span><strong>Beginner level</strong><small>English • Crosswords</small></div>
    </section>
  </>;
}
