import { ArrowRight, BookOpen, ChartNoAxesColumnIncreasing, Check, Flame, Gamepad2, Gift, Info, Lightbulb, Lock, Play, Star, Trophy } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { LearningStages } from './LearningStages';
import type { LearningStageId } from './LearningStages';
import { subjects } from './subjects';
import type { SubjectId } from './subjects';
import type { JourneyProgress } from './journey';
import type { LearnerProfile } from './learnerData';
import { learningAchievements, learningSummary } from './learningMetrics';
import { lessonCatalog, levelLabels, skillLabels } from './academy/catalog';
import './dashboard.css';
import { LearnerAvatar } from './LearnerAvatar';
import { subjectSkillResults } from './skillProgress';


function Feature({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return <div className="wz-feature"><span className="wz-feature-icon">{children}</span><span><strong>{title}</strong><small>{description}</small></span></div>;
}

type Props = {
  onPractice: () => void;
  onChooseSubject: (id: SubjectId, stage?: LearningStageId) => void;
  onExploreSubjects: () => void;
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
  archivedClassic?: { solvedWords: number; completedPuzzles: number };
};

const skillEmoji = { sounds: '🔤', vocabulary: '🧩', grammar: '✍️', reading: '📖', listening: '🎧', writing: '📝' } as const;


export function WizpikoPortal({ onPractice, onChooseSubject, onExploreSubjects, signedIn, nickname, avatar, onProgress, onStreak, onAchievements, xp, streak, solvedTotal, completedTotal, journey, preferences, onLesson, onClassic, onGames, archivedClassic }: Props) {
  const progress = journey || { records: {} };
  const summary = learningSummary(progress, new Date(), { solvedTotal, completedTotal, retiredSolvedTotal: archivedClassic?.solvedWords, retiredCompletedTotal: archivedClassic?.completedPuzzles });
  const results = subjectSkillResults(progress, 'english');
  const level = preferences?.learning_level || 'beginner';
  const preferredSkills = preferences?.favorite_skills || [];
  const levelLessons = lessonCatalog.filter(lesson => lesson.level === level);
  const rankedLessons = [...levelLessons].sort((a, b) => Number(Boolean(results[a.id])) - Number(Boolean(results[b.id])) || Number(preferredSkills.includes(b.skill)) - Number(preferredSkills.includes(a.skill)));
  const lastLesson = lessonCatalog.find(lesson => lesson.id === progress.academy?.lastLessonId && !results[lesson.id]);
  const nextLesson = lastLesson || rankedLessons.find(lesson => !results[lesson.id]) || rankedLessons[0] || lessonCatalog[0];
  const recommended = rankedLessons.filter(lesson => lesson.id !== nextLesson?.id).slice(0, 3);
  const achievements = learningAchievements(progress, new Date(), { solvedTotal, completedTotal, retiredSolvedTotal: archivedClassic?.solvedWords, retiredCompletedTotal: archivedClassic?.completedPuzzles });
  const previewBadges = [...achievements].sort((a, b) => Number(b.earned) - Number(a.earned)).slice(0, 3);
  const actualXP = journey ? summary.xp : xp;
  const actualStreak = journey ? summary.streak.current : streak;
  const completedLessons = lessonCatalog.filter(lesson => results[lesson.id]).length;
  function openLesson(id: string) { if (onLesson) onLesson(id); else onPractice(); }

  const subjectCards = <section className="wz-subjects wp-subjects" id="wiz-subjects">
    <div className="wp-section-heading"><div><h2>Explore Our Subjects</h2><p>Choose a subject and make your next discovery.</p></div><button type="button" onClick={onGames || onExploreSubjects}>Browse games <ArrowRight size={17} /></button></div>
    <div className="wz-subject-grid">{subjects.map(({ id, name, description, icon: Icon, color, status }) => <button type="button" className={`wz-subject-card wz-${color}`} key={id} onClick={() => onChooseSubject(id)} aria-label={`${name}: ${status === 'planned' ? 'Learn about this subject' : 'Open lessons'}`}><Icon className="wz-subject-svg" size={37} strokeWidth={2} aria-hidden="true" /><strong>{name}</strong><span className="wz-subject-description">{description}</span><span className={`wz-subject-status ${status !== 'planned' ? 'wz-play' : ''}`}>{status === 'available' ? <><Check size={13} /> Available</> : <><Info size={13} /> Learn more</>}</span></button>)}</div>
  </section>;

  return <div className={`wp-portal${signedIn ? ' wp-signed-in' : ''}`}>
    {signedIn ? <>
      <section className="wp-welcome-hero" aria-labelledby="wiz-heading">
        <div className="wp-welcome-copy"><h1 id="wiz-heading">Welcome back,<span className="wp-hero-name" style={{ '--name-fit': `${Math.min(156, 620 / (Array.from(nickname || 'Learner').length * .57))}px`, '--name-fit-mobile': `${Math.max(25, Math.min(68, 330 / (Array.from(nickname || 'Learner').length * .6)))}px` } as CSSProperties}>{nickname || 'Learner'}<span className="wp-hero-exclamation">!<svg className="wp-name-rays" viewBox="0 0 40 60" aria-hidden="true"><path d="m8 15 8-10M14 30l17-4M11 44l13 8"/></svg></span></span></h1><p>Ready to learn something new today?</p><button type="button" className="wp-blue-button" onClick={() => nextLesson ? openLesson(nextLesson.id) : onPractice()}><span className="wp-play-control" aria-hidden="true"><Play size={17} fill="currentColor"/></span>Continue Learning<ArrowRight size={22}/></button></div>
        <div className={`wp-welcome-art${!avatar || avatar === 'robot' ? ' wp-robot-selected' : ''}`}><span className="wp-hero-idea" aria-hidden="true"><Lightbulb/></span><LearnerAvatar avatar={avatar} className="wp-hero-person" /><LearnerAvatar avatar={avatar && avatar !== 'robot' ? 'robot' : 'girl'} className="wp-hero-robot" decorative /></div>
      </section>
      <nav className="wp-benefit-strip" aria-label="Your learning shortcuts"><button onClick={onPractice} type="button"><span className="wp-shortcut-icon wp-pink"><Trophy size={34} aria-hidden="true"/></span><span><strong>Keep Practising</strong><small>Small steps make big progress!</small></span></button><button onClick={onProgress} type="button"><span className="wp-shortcut-icon wp-mint"><ChartNoAxesColumnIncreasing size={35} aria-hidden="true"/></span><span><strong>Your Progress</strong><small>See how much you've learned.</small></span></button><button onClick={onAchievements} type="button"><span className="wp-shortcut-icon wp-yellow"><Star size={37} aria-hidden="true"/></span><span><strong>Earn Achievements</strong><small>Collect badges and celebrate!</small></span></button><button onClick={onGames || onPractice} type="button"><span className="wp-shortcut-icon wp-lilac"><Gift size={35} aria-hidden="true"/></span><span><strong>Join the Fun</strong><small>Fun activities and learning rewards!</small></span></button></nav>
      <div className="wp-home-content">
      {subjectCards}
      <div className="wp-home-panels">
        <section className="wp-home-panel wp-continue-panel"><div className="wp-section-heading"><div><h2>Continue Your Learning</h2><p>Pick up where you left off.</p></div></div>{nextLesson && <div className="wp-resume-lesson"><span className={`wp-lesson-illustration wd-skill-${nextLesson.skill}`} aria-hidden="true">{skillEmoji[nextLesson.skill]}</span><div><span className="wp-small-label">English Practice</span><h3>{nextLesson.title}</h3><small>{levelLabels[nextLesson.level]} · {skillLabels[nextLesson.skill]}</small><div className="wp-inline-progress"><progress aria-label="English lessons completed" max={lessonCatalog.length} value={completedLessons} /><span>{Math.round(completedLessons / lessonCatalog.length * 100)}%</span></div><button type="button" className="wp-blue-button" onClick={() => openLesson(nextLesson.id)}>{lastLesson ? 'Continue' : 'Open lesson'}<ArrowRight size={16} /></button></div></div>}{archivedClassic && (archivedClassic.solvedWords > 0 || archivedClassic.completedPuzzles > 0) && <p className="wp-panel-note">Earlier collection: {archivedClassic.solvedWords} words / {archivedClassic.completedPuzzles} puzzles saved</p>}<div className="wp-game-links"><button type="button" onClick={onClassic || onPractice}><span>🧩</span><div><strong>Wizpiko word puzzles</strong><small>{completedTotal} of 10 new puzzles completed</small></div><ArrowRight size={16} /></button><button type="button" onClick={onGames || onPractice}><span>🎯</span><div><strong>English & Maths games</strong><small>Five questions. No rush.</small></div><ArrowRight size={16} /></button></div></section>
        <section className="wp-home-panel"><div className="wp-section-heading"><div><h2>Recommended for You</h2><p>Explore your chosen level and interests.</p></div><button type="button" onClick={onPractice}>See all <ArrowRight size={14} /></button></div><div className="wp-recommendation-grid">{recommended.map(lesson => <button key={lesson.id} className={`wp-recommendation wd-skill-${lesson.skill}`} type="button" onClick={() => openLesson(lesson.id)}><span className="wp-recommendation-art" aria-hidden="true">{skillEmoji[lesson.skill]}</span><strong>{lesson.title}</strong><span>{skillLabels[lesson.skill]}</span><small>{results[lesson.id] ? <><Check size={12} /> Completed</> : levelLabels[lesson.level]}<ArrowRight size={14} /></small></button>)}</div><p className="wp-panel-note">Every level is open to you, at every age.</p></section>
        <section className="wp-home-panel"><div className="wp-section-heading"><div><h2>Your Achievements</h2><p>{actualXP} XP earned. Little wins worth celebrating.</p></div><button type="button" onClick={onAchievements}>View all <ArrowRight size={14} /></button></div><div className="wp-achievement-preview">{previewBadges.map(badge => <button type="button" onClick={onAchievements} className={badge.earned ? 'is-earned' : ''} key={badge.id}><span className="wp-badge-medallion">{badge.earned ? badge.icon : <Lock size={23} />}</span><strong>{badge.title}</strong><small>{badge.earned ? 'Earned!' : 'Keep exploring'}</small></button>)}</div><button className={`wp-streak-note${summary.streak.paused ? ' is-paused' : ''}`} onClick={onStreak} type="button"><Flame size={24} /><span><strong>{actualStreak} active-day streak</strong><small>{summary.streak.paused ? 'Paused through your grace period.' : 'Two missed days of breathing room.'}</small></span><ArrowRight size={16} /></button></section>
      </div>
      {preferences?.learning_tips !== false && <p className="wp-learning-tip">💡 Curiosity has no age limit. Choose what feels right for you and keep growing at your own pace.</p>}
      </div>
    </> : <>
      <section className="wz-home-hero" aria-labelledby="wiz-heading"><div className="wz-hero-copy"><span className="wz-eyebrow"><BookOpen size={17} /> Your world of curious minds</span><h1 id="wiz-heading">Big dreams begin with <span>little discoveries.</span></h1><p>Welcome to Wizpiko! A cheerful place to think, play and shine. Explore exciting subjects, build skills through fun practice and grow with every small achievement.</p><a href="#wiz-subjects" className="wz-hero-cta"><BookOpen size={20} /> Explore Subjects <ArrowRight size={19} /></a></div><div className="wz-hero-picture"><img src={`${import.meta.env.BASE_URL}wizpiko-mascot.webp`} alt="Wizpiko, your cheerful robot learning companion" width="600" height="600" fetchPriority="high" /></div></section>
      <div className="wz-features"><Feature title="Fun Practice" description="Interactive games and activities"><Gamepad2 /></Feature><Feature title="Track Progress" description="See your growth and achievements"><ChartNoAxesColumnIncreasing /></Feature><Feature title="Build Confidence" description="Learn at your own pace"><Star /></Feature></div>
      {subjectCards}
    </>}
    {signedIn ? <div className="wp-home-content wp-stages-wrap"><LearningStages onChooseSubject={onChooseSubject} onExploreSubjects={onExploreSubjects} /></div> : <LearningStages onChooseSubject={onChooseSubject} onExploreSubjects={onExploreSubjects} />}
  </div>;
}
