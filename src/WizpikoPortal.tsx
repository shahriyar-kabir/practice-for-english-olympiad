import { ArrowRight, Atom, BookOpen, BrainCircuit, Calculator, Code2, FlaskConical, Globe2, Gamepad2, ChartNoAxesColumnIncreasing, Star, Layers3, Sparkles, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';

const subjects = [
  { name: 'English Practice', description: 'Read, play, practise and build language skills.', icon: BookOpen, color: 'english', live: true },
  { name: 'Mathematics', description: 'Numbers, patterns and problem-solving adventures.', icon: Calculator, color: 'math', live: false },
  { name: 'Physics', description: 'Explore motion, energy and the way things work.', icon: Atom, color: 'physics', live: false },
  { name: 'Science', description: 'Discover the world through questions and curiosity.', icon: FlaskConical, color: 'science', live: false },
  { name: 'Chemistry', description: 'Discover elements, reactions and experiments.', icon: FlaskConical, color: 'chemistry', live: false },
  { name: 'Informatics', description: 'Build logical thinking and coding confidence.', icon: Code2, color: 'informatics', live: false },
  { name: 'Artificial Intelligence', description: 'Explore creative ideas and future technology.', icon: BrainCircuit, color: 'ai', live: false },
  { name: 'And More', description: 'More exciting subjects are on the way!', icon: Globe2, color: 'more', live: false },
] as const;

function Feature({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return <div className="wz-feature"><span className="wz-feature-icon">{children}</span><span><strong>{title}</strong><small>{description}</small></span></div>;
}

export function WizpikoPortal({ onPractice, onComingSoon, signedIn, nickname, onProgress, onStreak, streak, solvedTotal, completedTotal }: {
  onPractice: () => void;
  onComingSoon: (subject: string) => void;
  signedIn: boolean;
  nickname?: string;
  onProgress: () => void;
  onStreak: () => void;
  streak: number;
  solvedTotal: number;
  completedTotal: number;
}) {
  return <>
    <section className="wz-home-hero" aria-labelledby="wiz-heading">
      <div className="wz-hero-copy">
        <span className="wz-eyebrow"><Sparkles size={17}/> Your world of curious minds</span>
        {signedIn ? <>
          <h1 id="wiz-heading">Welcome back, <span>{nickname || 'Learner'}!</span></h1>
          <p>Ready to discover something new today? Keep learning, practise at your own pace and celebrate each little win.</p>
          <button className="wz-hero-cta" onClick={onPractice}><Gamepad2 size={20}/> Continue Learning <ArrowRight size={19}/></button>
          <button className="wz-streak-chip" onClick={onStreak} aria-label="View your learning streak"><span>🔥 {streak} day streak</span><span>{streak ? 'Keep your spark going!' : 'Complete a game to start your streak!'}</span></button>
        </> : <>
          <h1 id="wiz-heading">Big dreams begin with <span>little discoveries.</span></h1>
          <p>Welcome to Wizpiko! A cheerful place to think, play and shine. Explore exciting subjects, build skills through fun practice and grow with every small achievement.</p>
          <a href="#wiz-subjects" className="wz-hero-cta"><BookOpen size={20}/> Explore Subjects <ArrowRight size={19}/></a>
        </>}
      </div>
      <div className="wz-hero-picture">
        <img src="/wizpiko-logo.webp" alt="The original Wizpiko learning robot, featuring its blue W emblem and colorful logo" />
      </div>
    </section>
    <div className="wz-features">
      <Feature title="Fun Practice" description="Interactive games and activities"><Gamepad2/></Feature>
      <Feature title="Track Progress" description="See your growth and achievements"><ChartNoAxesColumnIncreasing/></Feature>
      <Feature title="Build Confidence" description="Learn at your own pace"><Star/></Feature>
    </div>
    <section className="wz-subjects" id="wiz-subjects">
      <div className="wz-heading-row"><div><h2>Explore Our Subjects</h2><p>Discover new ways to learn, practise and grow.</p></div></div>
      <div className="wz-subject-grid">
        {subjects.map(({name, description, icon: Icon, color, live}) => <button type="button" className={'wz-subject-card wz-'+color} key={name} onClick={() => live ? onPractice() : onComingSoon(name)}>
          <Icon className="wz-subject-svg" size={39} strokeWidth={2.2} aria-hidden="true"/>
          <strong>{name}</strong>
          <span className="wz-subject-description">{description}</span>
          <span className={'wz-subject-status '+(live ? 'wz-play' : '')}>{live ? "✨ Let's play!" : 'Coming soon'}</span>
        </button>)}
      </div>
    </section>
    {signedIn && <section className="wz-continue-grid" aria-label="My learning at a glance">
      <div className="wz-mini-panel"><h2>Continue Your Learning</h2><p>Pick up where you left off.</p><div className="wz-mini-inner"><BookOpen size={32}/><span><b>English Practice</b><small>{solvedTotal} words discovered · {completedTotal} crosswords finished</small></span><button onClick={onPractice}>Continue <ArrowRight size={15}/></button></div></div>
      <div className="wz-mini-panel"><h2>Your Progress</h2><p>Every small step matters.</p><div className="wz-mini-inner"><Trophy size={32}/><span><b>Keep shining!</b><small>Explore your progress and unlock more levels.</small></span><button onClick={onProgress}>View <ArrowRight size={15}/></button></div></div>
    </section>}
    <section className="wz-learning-stages">
      <div><span className="wz-stages-icon"><Layers3 size={33}/></span><h2>Learning for Every Stage</h2><p>From kindergarten to higher secondary, explore age-appropriate learning experiences.</p><button onClick={onPractice}>Explore Learning Levels <ArrowRight size={16}/></button></div>
      <div className="wz-stages-chart" aria-label="Learning stages: KG, Primary, Middle, Secondary, Higher Secondary">
        {['KG','Primary','Middle','Secondary','Higher Secondary'].map((name,i)=><span key={name} className={'wz-stage-'+i}>{name}</span>)}
      </div>
    </section>
  </>;
}