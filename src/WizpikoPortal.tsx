import { ArrowRight, Atom, BookOpen, BrainCircuit, Calculator, ChartNoAxesColumnIncreasing, Check, Code2, Flame, FlaskConical, Gamepad2, Globe2, Lock, Star, Trophy } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { LearningStages } from './LearningStages';
import type { LearningStageId } from './LearningStages';
import type { JourneyProgress } from './journey';
import type { LearnerProfile } from './learnerData';
import { completedLessonResults, learningAchievements, learningSummary } from './learningMetrics';
import { lessonCatalog, levelLabels, skillLabels } from './academy/catalog';
import './dashboard.css';

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

type Props = {
  onPractice: () => void;
  onChooseStage: (id: LearningStageId) => void;
  onComingSoon: (subject: string) => void;
  signedIn: boolean;
  nickname?: string;
  avatar?: LearnerProfile['avatar'];
  learnerAge?: number | null;
  onProgress: () => void;
  onStreak: () => void;
  onAchievements: () => void;
  xp: number;
  streak: number;
  solvedTotal: number;
  completedTotal: number;
  journey?: JourneyProgress;
  preferences?: LearnerProfile['preferences'];
  onLesson?: (lessonId: string) => void;
  onClassic?: () => void;
  onGames?: () => void;
};

const skillEmoji = { sounds: '🔤', vocabulary: '🧩', grammar: '✍️', reading: '📖', listening: '🎧', writing: '📝' } as const;
const avatarEmoji = { girl: '👧', boy: '👦', robot: '🤖', panda: '🐼', cat: '🐱' } as const;

export function WizpikoPortal({ onPractice, onChooseStage, onComingSoon, signedIn, nickname, avatar, onProgress, onStreak, onAchievements, xp, streak, solvedTotal, completedTotal, journey, preferences, onLesson, onClassic, onGames }: Props) {
  const progress = journey || { records: {} };
  const summary = learningSummary(progress, new Date(), { solvedTotal, completedTotal });
  const results = completedLessonResults(progress);
  const level = preferences?.learning_level || 'beginner';
  const preferredSkills = preferences?.favorite_skills || [];
  const levelLessons = lessonCatalog.filter(lesson => lesson.level === level);
  const rankedLessons = [...levelLessons].sort((a, b) => Number(Boolean(results[a.id])) - Number(Boolean(results[b.id])) || Number(preferredSkills.includes(b.skill)) - Number(preferredSkills.includes(a.skill)));
  const lastLesson = lessonCatalog.find(lesson => lesson.id === progress.academy?.lastLessonId && !results[lesson.id]);
  const nextLesson = lastLesson || rankedLessons.find(lesson => !results[lesson.id]) || rankedLessons[0] || lessonCatalog[0];
  const recommended = rankedLessons.filter(lesson => lesson.id !== nextLesson?.id).slice(0, 3);
  const achievements = learningAchievements(progress, new Date(), { solvedTotal, completedTotal });
  const previewBadges = [...achievements].sort((a, b) => Number(b.earned) - Number(a.earned)).slice(0, 3);
  const earnedCount = achievements.filter(badge => badge.earned).length;
  const actualXP = journey ? summary.xp : xp;
  const actualStreak = journey ? summary.streak.current : streak;
  const completedLessons = lessonCatalog.filter(lesson => results[lesson.id]).length;
  function openLesson(id: string) { if (onLesson) onLesson(id); else onPractice(); }

  return <>
    <section className={`wz-home-hero ${signedIn ? 'wd-welcome' : ''}`} aria-labelledby="wiz-heading">
      <div className="wz-hero-copy">
        <span className="wz-eyebrow"><BookOpen size={17} /> {signedIn ? 'Your next discovery starts here' : 'Your world of curious minds'}</span>
        {signedIn ? <>
          <h1 id="wiz-heading">Welcome back, <span>{nickname || 'Learner'}!</span></h1>
          <p>Make a little time for something wonderful. Pick up a lesson, try a challenge, and keep growing at your own pace.</p>
          <button className="wz-hero-cta" type="button" onClick={() => nextLesson ? openLesson(nextLesson.id) : onPractice()}><Gamepad2 size={20} /> {lastLesson || summary.activitiesCompleted ? 'Continue learning' : 'Start learning'} <ArrowRight size={19} /></button>
          <button className={`wd-home-streak ${summary.streak.paused ? 'is-paused' : ''}`} type="button" onClick={onStreak}><Flame size={19} /><span><strong>{actualStreak} active-day streak</strong><small>{summary.streak.todayCompleted ? 'A discovery made today!' : summary.streak.paused ? 'Paused — your next activity can keep it going' : actualStreak ? 'A little practice keeps your spark going' : 'Complete an activity to start your spark'}</small></span><ArrowRight size={16} /></button>
        </> : <>
          <h1 id="wiz-heading">Big dreams begin with <span>little discoveries.</span></h1>
          <p>Welcome to Wizpiko! A cheerful place to think, play and shine. Explore exciting subjects, build skills through fun practice and grow with every small achievement.</p>
          <a href="#wiz-subjects" className="wz-hero-cta"><BookOpen size={20} /> Explore Subjects <ArrowRight size={19} /></a>
        </>}
      </div>
      <div className="wz-hero-picture">
        {signedIn && avatar && avatar !== 'robot' && <div className="wz-personal-avatar" aria-label="Your selected learner companion"><span>{avatarEmoji[avatar]}</span><small>Your avatar</small></div>}
        <img src={`${import.meta.env.BASE_URL}wizpiko-mascot.webp`} alt="Wizpiko, your cheerful robot learning companion" width="600" height="600" fetchPriority="high" />
      </div>
    </section>

    {signedIn && <div className="wd-home-dashboard">
      <div className="wd-home-metrics" aria-label="Your real learning progress">
        <button type="button" className="wd-home-stat wd-purple" onClick={onProgress}><span aria-hidden="true">🏆</span><div><strong>{actualXP}</strong><small>Total XP</small></div><ArrowRight size={17} /></button>
        <button type="button" className="wd-home-stat wd-blue" onClick={onProgress}><span aria-hidden="true">📖</span><div><strong>{summary.lessonsCompleted}</strong><small>Lessons completed</small></div><ArrowRight size={17} /></button>
        <button type="button" className="wd-home-stat wd-orange" onClick={onStreak}><span aria-hidden="true">🔥</span><div><strong>{actualStreak}</strong><small>Active-day streak</small></div><ArrowRight size={17} /></button>
        <button type="button" className="wd-home-stat wd-green" onClick={onAchievements}><span aria-hidden="true">⭐</span><div><strong>{earnedCount}</strong><small>Milestones earned</small></div><ArrowRight size={17} /></button>
      </div>
      <div className="wd-home-primary-grid">
        <section className="wd-card wd-next-lesson"><div className="wd-section-heading"><div><span className="wd-eyebrow">One little step today</span><h2>{lastLesson ? 'Continue your learning' : 'Your next discovery'}</h2></div><span aria-hidden="true">📚</span></div>{nextLesson && <div className="wd-next-content"><span className={`wd-lesson-art wd-skill-${nextLesson.skill}`} aria-hidden="true">{skillEmoji[nextLesson.skill]}</span><div><span className="wd-lesson-kicker">{levelLabels[nextLesson.level]} · {skillLabels[nextLesson.skill]}</span><h3>{nextLesson.title}</h3><p>{nextLesson.description}</p><small>{nextLesson.duration}{results[nextLesson.id] ? ` · Best score ${results[nextLesson.id].score}%` : ' · Ready when you are'}</small><button type="button" className="wd-primary" onClick={() => openLesson(nextLesson.id)}>{results[nextLesson.id] ? 'Revisit this lesson' : lastLesson ? 'Continue lesson' : 'Start this lesson'} <ArrowRight size={17} /></button></div></div>}</section>
        <section className="wd-card wd-home-progress"><div className="wd-section-heading"><div><span className="wd-eyebrow">Every discovery counts</span><h2>Your learning journey</h2></div><TrendingProgress /></div><div className="wd-home-progress-ring" style={{ '--wd-ring-progress': `${Math.min(100, completedLessons / lessonCatalog.length * 100)}%` } as CSSProperties}><div><strong>{completedLessons}<small> / {lessonCatalog.length}</small></strong><span>English lessons completed</span></div><span aria-hidden="true">⭐</span></div><p>{solvedTotal} original words discovered · {completedTotal} of 10 crosswords completed</p><button type="button" className="wd-text-button" onClick={onProgress}>See my progress <ArrowRight size={16} /></button></section>
      </div>
      <section className="wd-home-recommendations"><div className="wd-section-heading"><div><h2>Find your next spark</h2><p>Real English lessons at your chosen starting point. Every level stays open to you.</p></div><button type="button" className="wd-text-button" onClick={onPractice}>Explore English <ArrowRight size={16} /></button></div><div className="wd-lesson-grid">{recommended.map(lesson => <button key={lesson.id} type="button" className={`wd-lesson-card wd-skill-${lesson.skill}`} onClick={() => openLesson(lesson.id)}><span className="wd-lesson-card-art" aria-hidden="true">{skillEmoji[lesson.skill]}</span><span className="wd-lesson-kicker">{skillLabels[lesson.skill]} · {levelLabels[lesson.level]}</span><strong>{lesson.title}</strong><span>{lesson.description}</span><small>{lesson.duration}{results[lesson.id] && <><Check size={13} /> Completed</>}<ArrowRight size={17} /></small></button>)}</div></section>
      <div className="wd-home-secondary-grid"><section className="wd-card"><div className="wd-section-heading"><div><h2>A little play, a lot to discover</h2><p>Mix your lessons with an English game.</p></div><Gamepad2 size={27} /></div><div className="wd-game-links"><button type="button" onClick={onClassic || onPractice}><span aria-hidden="true">🧩</span><div><strong>Classic crosswords</strong><small>10 original puzzles · {completedTotal} completed</small></div><ArrowRight size={18} /></button><button type="button" onClick={onGames || onPractice}><span aria-hidden="true">🎯</span><div><strong>English practice games</strong><small>Choose a level, then try a crossword or quiz</small></div><ArrowRight size={18} /></button></div></section>
      <section className="wd-card"><div className="wd-section-heading"><div><h2>Little wins worth celebrating</h2><p>{earnedCount ? `${earnedCount} milestones earned so far.` : 'Your first badge is waiting for you.'}</p></div><button type="button" className="wd-text-button" onClick={onAchievements}>View all <ArrowRight size={16} /></button></div><div className="wd-home-badges">{previewBadges.map(badge => <div key={badge.id} className={badge.earned ? 'is-earned' : ''}><span aria-hidden="true">{badge.earned ? badge.icon : <Lock size={25} />}</span><strong>{badge.title}</strong><small>{badge.earned ? 'Earned!' : 'Keep exploring'}</small></div>)}</div></section></div>
      {preferences?.learning_tips !== false && <p className="wd-home-tip"><span aria-hidden="true">💡</span><span>Curiosity has no age limit. Start with the basics or try something new — choose what feels right for you.</span></p>}
    </div>}

    <div className="wz-features">
      <Feature title="Fun Practice" description="Interactive games and activities"><Gamepad2 /></Feature>
      <Feature title="Track Progress" description="See your growth and achievements"><ChartNoAxesColumnIncreasing /></Feature>
      <Feature title="Build Confidence" description="Learn at your own pace"><Star /></Feature>
    </div>
    <section className="wz-subjects" id="wiz-subjects">
      <div className="wz-heading-row"><div><h2>Explore Our Subjects</h2><p>Discover new ways to learn, practise and grow.</p></div></div>
      <div className="wz-subject-grid">
        {subjects.map(({ name, description, icon: Icon, color, live }) => <button type="button" className={`wz-subject-card wz-${color}`} key={name} onClick={() => live ? onPractice() : onComingSoon(name)}><Icon className="wz-subject-svg" size={39} strokeWidth={2.2} aria-hidden="true" /><strong>{name}</strong><span className="wz-subject-description">{description}</span><span className={`wz-subject-status ${live ? 'wz-play' : ''}`}>{live ? "Let's play!" : 'Coming soon'}</span></button>)}
      </div>
    </section>
    <LearningStages onChooseStage={onChooseStage} onPractice={onPractice} />
  </>;
}

function TrendingProgress() { return <span className="wd-progress-illustration" aria-hidden="true"><Trophy size={31} /></span>; }
