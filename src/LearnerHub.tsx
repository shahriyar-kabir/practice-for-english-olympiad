import { lazy, Suspense, useEffect, useState } from 'react';
import type { JourneyProgress } from './journey';
import type { LearnerProfile } from './learnerData';
import { ageFromBirthdate, ageLabel, dayKey } from './learnerData';
import { learningAchievements, learningSummary } from './learningMetrics';
import { lessonCatalog, levelLabels, skillLabels } from './academy/catalog';
import type { CurriculumSubject } from '../supabase/functions/_shared/curriculum/programs.ts';
import type { AcademyLevel, AcademySkill } from './learningTypes';
import { supportFaqs } from './content/siteCopy';
import { Award, ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, Flame, HelpCircle, Lock, LogOut, Mail, Search, Settings2, Star, TrendingUp, UserRound } from 'lucide-react';
import './dashboard.css';
import { LearnerAvatar, learnerAvatars } from './LearnerAvatar';
import { formatGameLevel, subjectGameStats } from './subjectGameProgress';
import { subjectSkillResults } from './skillProgress';

export type LearnerPage = 'profile' | 'progress' | 'achievements' | 'streak' | 'preferences' | 'certificates' | 'help';
export const learnerMenu: { id: LearnerPage; label: string; icon: typeof UserRound }[] = [
  { id: 'profile', label: 'My Profile', icon: UserRound },
  { id: 'progress', label: 'My Progress', icon: TrendingUp },
  { id: 'achievements', label: 'My Achievements', icon: Award },
  { id: 'certificates', label: 'My Certificates', icon: Award },
  { id: 'streak', label: 'My Learning Streak', icon: Flame },
  { id: 'preferences', label: 'Learning Preferences', icon: Settings2 },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
];

type Props = {
  page: LearnerPage;
  profile: LearnerProfile | null;
  email: string;
  journey: JourneyProgress;
  solvedTotal: number;
  completedTotal: number;
  totalWords: number;
  onPage: (page: LearnerPage) => void;
  onHome: () => void;
  onPractice: () => void;
  onSignOut: () => void;
  onSaveProfile: (patch: Partial<Pick<LearnerProfile, 'display_name' | 'avatar' | 'preferences'>>) => Promise<void>;
  onContact?: () => void;
  onLesson?: (lessonId: string) => void;
  onClassic?: () => void;
  onMathsGames?: () => void;
  onCourse?: (subject:CurriculumSubject,level:AcademyLevel) => void;
  archivedClassic?: { solvedWords: number; completedPuzzles: number };
};


const CertificatesPage = lazy(()=>import('./certificates/CertificatesPage'));
const skills: AcademySkill[] = ['sounds', 'vocabulary', 'grammar', 'reading', 'listening', 'writing'];
const levels: AcademyLevel[] = ['starter', 'beginner', 'intermediate', 'advanced'];
const pageIntro: Record<LearnerPage, string> = {
  profile: 'A little about you and the way you like to learn.',
  certificates: 'Your achievements, ready to keep and share.',
  progress: 'Every lesson and every small discovery adds up.',
  achievements: 'Celebrate the milestones you have really earned.',
  streak: 'A little practice, a growing habit. Keep your spark alive.',
  preferences: 'Choose a starting point and make learning feel like you.',
  help: 'Find a helpful answer and get back to your next discovery.',
};

function Metric({ label, value, icon, color = 'blue' }: { label: string; value: string | number; icon: string; color?: string }) {
  return <div className={`wd-metric wd-${color}`}><span className="wd-metric-icon" aria-hidden="true">{icon}</span><div><strong>{value}</strong><span>{label}</span></div></div>;
}
function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
}

export function LearnerHub({ page, profile, email, journey, solvedTotal, completedTotal, totalWords, onPage, onHome, onPractice, onSignOut, onSaveProfile, onContact, onLesson, onClassic, onMathsGames, onCourse, archivedClassic }: Props) {
  const [name, setName] = useState(profile?.display_name || '');
  const [preferences, setPreferences] = useState<LearnerProfile['preferences']>(profile?.preferences || {});
  const [feedback, setFeedback] = useState('');
  const [pending, setPending] = useState(false);
  const [helpQuery, setHelpQuery] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  useEffect(() => { setName(profile?.display_name || ''); }, [profile?.display_name]);
  useEffect(() => { setPreferences(profile?.preferences || {}); }, [profile?.preferences]);
  useEffect(() => { setFeedback(''); }, [page]);
  const mathsGames = subjectGameStats(journey.subjectGames?.maths);
  const summary = learningSummary(journey, new Date(), { solvedTotal, completedTotal, retiredSolvedTotal: archivedClassic?.solvedWords, retiredCompletedTotal: archivedClassic?.completedPuzzles });
  const streak = summary.streak;
  const achievements = learningAchievements(journey, new Date(), { solvedTotal, completedTotal, retiredSolvedTotal: archivedClassic?.solvedWords, retiredCompletedTotal: archivedClassic?.completedPuzzles });
  const earned = achievements.filter(badge => badge.earned);
  const age = ageFromBirthdate(profile?.birth_date || '');
  const displayName = profile?.display_name || email.split('@')[0] || 'Learner';
  const title = learnerMenu.find(item => item.id === page)?.label || 'My Learning';
  const results = subjectSkillResults(journey,'english');
  const recentLessons = Object.entries(results).sort((a, b) => b[1].completedAt.localeCompare(a[1].completedAt)).slice(0, 4);
  const recentActivity = [...(journey.activityLog || [])].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, 5);
  const dates = new Set(summary.activityDates);
  const today = new Date();
  const todayKey = dayKey(today);
  const firstWeekday = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const atCurrentMonth = calendarMonth.getFullYear() === today.getFullYear() && calendarMonth.getMonth() === today.getMonth();
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (today.getDay() + 6) % 7);
  const weeklyDays = Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + offset);
    const key = dayKey(day);
    const completed = new Set((journey.activityLog || []).filter(event => Number.isFinite(Date.parse(event.completedAt)) && Date.parse(event.completedAt) <= today.getTime() && dayKey(new Date(event.completedAt)) === key).map(event => event.id)).size;
    return { key, label: day.toLocaleDateString(undefined, { weekday: 'short' }), completed };
  });
  const weeklyMax = Math.max(1, ...weeklyDays.map(day => day.completed));
  const lessonTotals = Object.values(results).reduce((sum, result) => ({ correct: sum.correct + result.correct, total: sum.total + result.total }), { correct: 0, total: 0 });
  const lessonAccuracy = lessonTotals.total ? `${Math.round(lessonTotals.correct / lessonTotals.total * 100)}%` : '—';
  const finishedWordsPercent = Math.min(100, Math.round(solvedTotal / Math.max(1, totalWords) * 100));
  const filteredFaqs = supportFaqs.filter(faq => `${faq.question} ${faq.answer.join(' ')}`.toLowerCase().includes(helpQuery.toLowerCase().trim()));
  const finish = async (work: () => Promise<void>) => {
    setPending(true); setFeedback('');
    try { await work(); setFeedback('Your changes are saved.'); }
    catch (error) { setFeedback(error instanceof Error ? error.message : 'Unable to save changes. Please try again.'); }
    finally { setPending(false); }
  };
  function updatePreference<K extends keyof LearnerProfile['preferences']>(key: K, value: LearnerProfile['preferences'][K]) {
    setPreferences(previous => ({ ...previous, [key]: value }));
  }

  return <section className="wd-shell" aria-label="Your learning account">
    <aside className="wd-sidebar">
      <button className="wd-back" onClick={onHome}><ArrowLeft size={17} /> Back to Home</button>
      <div className="wd-sidebar-person"><LearnerAvatar avatar={profile?.avatar} className="wd-avatar" decorative /><strong>{displayName}</strong><span>{ageLabel(age)}</span></div>
      <nav aria-label="Account navigation">{learnerMenu.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={page === id ? 'is-active' : ''} aria-current={page === id ? 'page' : undefined} onClick={() => onPage(id)}><Icon size={19} /><span>{label}</span>{page === id && <ChevronRight size={16} />}</button>)}</nav>
      <div className="wd-sidebar-tip"><img src={`${import.meta.env.BASE_URL}wizpiko-mascot.webp`} width="300" height="300" alt="" loading="lazy" /><strong>Little steps. Big possibilities.</strong><p>Your next discovery is waiting.</p><button type="button" onClick={onPractice}>Keep learning <ArrowRight size={15} /></button></div>
      <button className="wd-signout" onClick={onSignOut}><LogOut size={18} /> Sign Out</button>
    </aside>
    <div className="wd-main">
      <header className="wd-page-heading"><span className="wd-eyebrow"><BookOpen size={15} /> Your learning space</span><h1>{title}</h1><p>{pageIntro[page]}</p></header>

      {page === 'profile' && <>
        <div className="wd-profile-banner"><LearnerAvatar avatar={profile?.avatar} className="wd-avatar wd-avatar-xl" decorative /><div><span className="wd-eyebrow">Hello, curious mind!</span><h2>{displayName}</h2><p>{ageLabel(age)} · {levelLabels[preferences.learning_level || 'beginner']}</p></div><span className="wp-profile-private"><Lock size={14} /> Private learner profile</span></div>
        <div className="wd-split">
          <section className="wd-card"><div className="wd-card-heading"><UserRound size={21} /><h2>About you</h2></div><p className="wd-muted">Your display name appears in your learning space.</p>
            <form onSubmit={event => { event.preventDefault(); void finish(() => onSaveProfile({ display_name: name.trim() })); }}>
              <label className="wd-field" htmlFor="learner-name">Display name<input id="learner-name" autoComplete="nickname" minLength={2} maxLength={40} required value={name} onChange={event => setName(event.target.value)} /></label>
              <div className="wd-readonly"><span><Mail size={16} /> Account email</span><strong>{email}</strong></div>
              <div className="wd-readonly"><span>Date of birth</span><strong>{profile?.birth_date ? new Date(`${profile.birth_date}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not provided'}</strong><small>Contact support if this needs a correction.</small></div>
              <button className="wd-primary" type="submit" disabled={pending || name.trim().length < 2}>{pending ? 'Saving…' : 'Save profile'} <Check size={17} /></button>
            </form>
          </section>
          <div className="wp-profile-right"><section className="wd-card"><div className="wd-card-heading"><Star size={21} /><h2>Choose your avatar</h2></div><p className="wd-muted">Pick the avatar that feels like you. You can change it anytime.</p><div className="wd-avatar-grid">{learnerAvatars.map(avatar => <button key={avatar} type="button" disabled={pending} className={avatar === (profile?.avatar || 'robot') ? 'is-selected' : ''} onClick={() => { void finish(() => onSaveProfile({ avatar })); }} aria-pressed={avatar === (profile?.avatar || 'robot')} aria-label={`Choose ${avatar} avatar`}><LearnerAvatar avatar={avatar} className="wp-avatar-choice" decorative /><small>{avatar}</small>{avatar === (profile?.avatar || 'robot') && <Check size={14} />}</button>)}</div><div className="wd-soft-note">Your choice appears on your homepage, profile and account menu.</div></section><section className="wd-card"><h2>Quick snapshot</h2><div className="wp-snapshot"><Metric icon="🔥" value={streak.current} label="Active-day streak" color="orange" /><Metric icon="⭐" value={summary.xp} label="Learning XP" color="purple" /></div><p className="wd-soft-note">Every completed activity is another small discovery.</p></section></div>
        </div>
      </>}

      {page === 'certificates' && <Suspense fallback={<div className="wd-card" role="status">Opening your certificates…</div>}><CertificatesPage onStudy={onCourse || (()=>onPractice())}/></Suspense>}

      {page === 'progress' && <>
        <div className="wd-metrics"><Metric icon="📚" value={summary.activitiesCompleted} label="Activities completed" color="blue" /><Metric icon="🎯" value={lessonAccuracy} label="Lesson accuracy" color="green" /><Metric icon="🔥" value={streak.current} label="Active-day streak" color="orange" /><Metric icon="⭐" value={summary.xp} label="XP earned" color="purple" /></div>
        <section className="wd-card wp-learning-journey"><div className="wp-section-heading"><div><h2>Your learning journey</h2><p>Recorded activities this week</p></div><span className="wp-small-label">This week</span></div><div className="wp-weekly-chart" role="img" aria-label={weeklyDays.map(day => `${day.label}: ${day.completed} completed activities`).join(', ')}>{weeklyDays.map(day => <div key={day.key} className={day.key === todayKey ? 'is-today' : ''}><strong>{day.completed}</strong><span className="wp-chart-column"><span style={{ height: `${day.completed / weeklyMax * 100}%` }} /></span><small>{day.label}</small></div>)}</div><p className="wp-chart-note">{weeklyDays.some(day => day.completed) ? 'Each bar uses the activities saved for that day.' : 'Your first completed activity will appear here. Every small step counts!'}</p></section>
        <div className="wd-split"><section className="wd-card"><div className="wd-card-heading"><BookOpen size={21} /><h2>Your English skills</h2></div><p className="wd-muted">Scores come from lessons you have completed.</p><div className="wd-skill-progress">{skills.map(skill => {
          const completed = lessonCatalog.filter(lesson => lesson.skill === skill && results[lesson.id]);
          const score = completed.length ? Math.round(completed.reduce((sum, lesson) => sum + results[lesson.id].score, 0) / completed.length) : 0;
          return <div key={skill}><div><strong>{skillLabels[skill]}</strong><span>{completed.length ? `${score}% average` : 'Ready to explore'}</span></div><div className="wd-progress-track" role="progressbar" aria-label={`${skillLabels[skill]} average lesson score`} aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${score}%` }} /></div></div>;
        })}</div><button type="button" className="wd-text-button" onClick={onPractice}>Explore English <ArrowRight size={16} /></button></section>
        <section className="wd-card wd-classic-progress"><span className="wd-card-illustration" aria-hidden="true">🧩</span><h2>Your word puzzle progress</h2><p className="wd-muted">Keep exploring your word puzzles at your own pace.</p><strong className="wd-big-number">{solvedTotal}<small> / {totalWords} words</small></strong><div className="wd-progress-track" role="progressbar" aria-label="Wizpiko word puzzle words completed" aria-valuenow={solvedTotal} aria-valuemin={0} aria-valuemax={totalWords}><span style={{ width: `${finishedWordsPercent}%` }} /></div><p>{completedTotal} of 10 new puzzles completed</p>{archivedClassic && (archivedClassic.solvedWords > 0 || archivedClassic.completedPuzzles > 0) && <p className="wp-panel-note">Earlier collection: {archivedClassic.solvedWords} words / {archivedClassic.completedPuzzles} puzzles saved</p>}<button type="button" className="wd-primary" onClick={onClassic || onPractice}>Continue practice <ArrowRight size={17} /></button></section></div>
        {onMathsGames && <section className="wd-card"><div className="wp-section-heading"><div><h2>Your Maths games</h2><p>Mental Maths Trail · Level {formatGameLevel(mathsGames.level)}</p></div><span className="wp-status-pill">{mathsGames.xp} XP</span></div><p className="wd-muted">{mathsGames.passed} levels passed · {mathsGames.practised} levels practised. There is no final level — keep discovering at your own pace.</p>{journey.subjectGames?.maths?.session && <p className="wd-soft-note">Your unfinished five-question round is saved.</p>}<button type="button" className="wd-primary" onClick={onMathsGames}>Continue Maths games <ArrowRight size={17} /></button></section>}
        <section className="wd-card"><div className="wd-card-heading"><TrendingUp size={21} /><h2>Recent learning</h2></div>{recentActivity.length ? <div className="wd-activity-list">{recentActivity.map(event => <div key={event.id}><span className="wd-activity-icon" aria-hidden="true">{event.subject === 'maths' ? '🔢' : event.kind === 'lesson' ? '📖' : '🧩'}</span><div><strong>{event.title}</strong><small>{dateLabel(event.completedAt)}{event.total ? event.kind === 'classic' ? ` · ${event.total} words discovered` : event.correct !== undefined ? ` · ${event.correct}/${event.total} correct` : '' : ''}</small></div><span className="wd-complete-label"><Check size={14} /> Completed</span></div>)}</div> : recentLessons.length ? <div className="wd-activity-list">{recentLessons.map(([id, result]) => <div key={id}><span className="wd-activity-icon" aria-hidden="true">📖</span><div><strong>{lessonCatalog.find(lesson => lesson.id === id)?.title || 'English lesson'}</strong><small>{dateLabel(result.completedAt)} · {result.score}%</small></div>{onLesson && <button type="button" className="wd-text-button" onClick={() => onLesson(id)}>Revisit <ArrowRight size={15} /></button>}</div>)}</div> : <div className="wd-empty"><span aria-hidden="true">🌱</span><h3>Your story starts here</h3><p>Finish a lesson or a practice game and see your real progress grow.</p><button type="button" className="wd-primary" onClick={onPractice}>Start learning <ArrowRight size={17} /></button></div>}</section>
      </>}

      {page === 'achievements' && <>
        <div className="wd-achievement-banner"><div><span className="wd-eyebrow">Every little win matters</span><h2>{earned.length ? `${earned.length} milestones to be proud of` : 'Your first milestone is waiting'}</h2><p>Earn badges through completed learning. Once earned, they stay yours.</p></div><span aria-hidden="true">🏆</span></div>
        <section className="wd-card wp-badge-collection"><div className="wp-section-heading"><h2>Badges you have earned</h2><span className="wp-status-pill">{earned.length} earned</span></div>{earned.length ? <div className="wd-badge-grid">{earned.map(badge => <article key={badge.id} className="wd-badge is-earned"><span className="wd-badge-art" aria-hidden="true">{badge.icon}</span><h2>{badge.title}</h2><p>{badge.description}</p><span className="wd-badge-status"><Check size={14} /> Earned{badge.earnedAt ? ` · ${dateLabel(badge.earnedAt)}` : ''}</span></article>)}</div> : <div className="wp-earned-empty"><span aria-hidden="true">🌱</span><p>Complete a learning activity to begin your collection. Your first milestone is waiting!</p><button type="button" className="wd-primary" onClick={onPractice}>Start learning <ArrowRight size={16} /></button></div>}</section>
        <section className="wd-card wp-badge-collection"><div className="wp-section-heading"><h2>Your next discoveries</h2><span className="wp-status-pill wp-status-blue">Coming up</span></div><div className="wd-badge-grid">{achievements.filter(badge => !badge.earned).map(badge => <article key={badge.id} className="wd-badge is-locked"><span className="wd-badge-art" aria-hidden="true"><Lock size={27} /></span><h2>{badge.title}</h2><p>{badge.description}</p><span className="wd-badge-status">Keep exploring</span></article>)}</div>{earned.length === achievements.length && <p className="wd-muted">You have earned every current milestone. Keep exploring and building your skills!</p>}</section>
        <p className="wd-soft-note">Badges you earn stay in your collection, even when a streak ends.</p>
      </>}

      {page === 'streak' && <>
        <section className={`wd-streak-banner ${streak.paused ? 'is-paused' : ''}`}><div><span className="wd-eyebrow">Your learning rhythm</span><h2>{streak.current} <span>active-day streak</span></h2><p>{streak.todayCompleted ? 'You made time for a discovery today. Well done!' : streak.paused ? `Your streak is paused. Complete an activity to continue it${streak.graceRemainingDays ? ` within ${streak.graceRemainingDays} ${streak.graceRemainingDays === 1 ? 'day' : 'days'}` : ' today'}.` : streak.current ? 'A little learning today keeps your spark going.' : 'Complete an activity to start a fresh learning streak.'}</p><button type="button" className="wd-primary" onClick={onPractice}>{streak.todayCompleted ? 'Discover something else' : 'Keep my spark going'} <ArrowRight size={17} /></button></div><div className="wd-streak-flame" aria-hidden="true">🔥</div></section>
        <div className="wd-metrics wd-metrics-three"><Metric icon="🔥" value={streak.current} label="Current streak" color="orange" /><Metric icon="🏅" value={streak.longest} label="Best streak" color="purple" /><Metric icon="📅" value={streak.total} label="Active learning days" color="blue" /></div>
        <div className="wd-split"><section className="wd-card"><div className="wd-calendar-heading"><h2>{calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2><div><button type="button" aria-label="Previous month" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}><ChevronLeft size={20} /></button><button type="button" aria-label="Next month" disabled={atCurrentMonth} onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}><ChevronRight size={20} /></button></div></div><div className="wd-calendar" aria-label="Completed learning days">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span className="wd-calendar-weekday" key={day}>{day}</span>)}{Array.from({ length: firstWeekday }, (_, index) => <span key={`empty-${index}`} />)}{Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1, key = dayKey(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)), completed = key <= todayKey && dates.has(key);
          return <span key={key} className={`${completed ? 'is-completed' : ''} ${key === todayKey ? 'is-today' : ''} ${key > todayKey ? 'is-future' : ''}`} aria-label={`${key}${completed ? ', activity completed' : ''}${key === todayKey ? ', today' : ''}`}><span>{day}</span>{completed && <Check size={13} aria-hidden="true" />}</span>;
        })}</div><p className="wd-calendar-key"><span /> A learning activity was completed</p></section>
        <section className="wd-card"><h2>A habit with room to breathe</h2><p className="wd-muted">Only days with completed activities count. Opening Wizpiko or starting an unfinished lesson does not add a day.</p><div className="wd-grace-note"><span aria-hidden="true">🌿</span><div><strong>Two missed days of breathing room</strong><p>Your next completed activity can bridge up to two fully missed calendar days. Missed days never add to your streak.</p></div></div><h3>Your streak milestones</h3><div className="wd-streak-milestones">{[3, 7, 14, 30].map(days => <div key={days} className={streak.longest >= days ? 'is-earned' : ''}><span aria-hidden="true">{streak.longest >= days ? '🏅' : '🔒'}</span><strong>{days} active days</strong><small>{streak.longest >= days ? 'Earned' : 'One step at a time'}</small></div>)}</div><p className="wd-small-note">Your best streak and earned badges remain when a new streak starts.</p></section></div>
      </>}

      {page === 'preferences' && <form onSubmit={event => { event.preventDefault(); void finish(() => onSaveProfile({ preferences })); }}>
        <section className="wd-card"><div className="wd-card-heading"><BookOpen size={21} /><h2>Your learning starting point</h2></div><p className="wd-muted">Choose by confidence and interests. Every level is open at every age.</p><div className="wd-level-options">{levels.map(level => <label key={level} className={preferences.learning_level === level || !preferences.learning_level && level === 'beginner' ? 'is-selected' : ''}><input type="radio" name="learning-level" value={level} checked={(preferences.learning_level || 'beginner') === level} onChange={() => updatePreference('learning_level', level)} /><strong>{levelLabels[level]}</strong><span>{level === 'starter' ? 'First words and sounds' : level === 'beginner' ? 'Build a steady foundation' : level === 'intermediate' ? 'Connect and explore ideas' : 'Stretch your English skills'}</span></label>)}</div><h3>What would you like to explore?</h3><p className="wd-muted">Pick your favorite skills to shape your recommendations.</p><div className="wd-skill-choices">{skills.map(skill => <label key={skill} className={preferences.favorite_skills?.includes(skill) ? 'is-selected' : ''}><input type="checkbox" checked={preferences.favorite_skills?.includes(skill) || false} onChange={event => updatePreference('favorite_skills', event.target.checked ? [...(preferences.favorite_skills || []), skill] : (preferences.favorite_skills || []).filter(value => value !== skill))} /><span>{skillLabels[skill]}</span></label>)}</div></section>
        <section className="wd-card"><div className="wd-card-heading"><Settings2 size={21} /><h2>Make yourself comfortable</h2></div>{([
          ['sound', 'Learning sounds', 'Play optional sounds during practice.', false],
          ['animation', 'Playful animations', 'Add a little movement to your learning space.', true],
          ['learning_tips', 'Helpful learning tips', 'Show gentle hints and useful practice tips.', true],
          ['reduced_motion', 'Reduce motion', 'Keep movement and transitions to a minimum.', false],
        ] as const).map(([key, label, description, defaultValue]) => <label className="wd-toggle" key={key}><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={preferences[key] ?? defaultValue} onChange={event => updatePreference(key, event.target.checked)} /><span className="wd-toggle-track" aria-hidden="true" /></label>)}<div className="wd-form-footer"><span>Your preferences are saved to your account.</span><button type="submit" className="wd-primary" disabled={pending}>{pending ? 'Saving…' : 'Save preferences'} <Check size={17} /></button></div></section>
      </form>}

      {page === 'help' && <>
        <section className="wd-help-banner"><div><span className="wd-eyebrow">A little help along the way</span><h2>What can we help you discover?</h2><p>Search the answers below for learning, your account, and saved progress.</p></div><span aria-hidden="true">💡</span></section>
        <div className="wp-help-topics">{[
          ['🚀', 'Getting Started', 'Choose and begin an activity', 'activity'],
          ['👤', 'Accounts & Profiles', 'Sign in and manage your details', 'account'],
          ['📖', 'Learning Activities', 'Find your starting point', 'stage'],
          ['🏅', 'Progress & Streaks', 'Understand your saved learning', 'streak'],
          ['🔒', 'Sign-in Help', 'Confirmation and password recovery', 'password'],
          ['🛠️', 'Technical Support', 'Tell us about a website issue', 'contact'],
        ].map(([icon, label, description, query]) => <button type="button" key={label} onClick={() => { if (query === 'contact' && onContact) onContact(); else setHelpQuery(query); }}><span aria-hidden="true">{icon}</span><strong>{label}</strong><small>{description}</small><b>{query === 'contact' ? 'Contact us' : 'Find answers'} →</b></button>)}</div>
        <label className="wd-help-search"><Search size={21} /><input type="search" value={helpQuery} placeholder="Search help topics…" aria-label="Search help topics" onChange={event => setHelpQuery(event.target.value)} /></label>
        <section className="wd-card"><div className="wd-card-heading"><HelpCircle size={21} /><h2>Helpful answers</h2></div><div className="wd-faq-list">{filteredFaqs.map(faq => <details key={faq.id}><summary>{faq.question}<ChevronRight size={18} /></summary><div>{faq.answer.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{faq.link?.target === 'contact' && onContact && <button type="button" className="wd-text-button" onClick={onContact}>{faq.link.label} <ArrowRight size={15} /></button>}</div></details>)}{!filteredFaqs.length && <div className="wd-empty"><Search size={30} /><h3>No matching answers yet</h3><p>Try words such as “progress”, “password”, or “streak”.</p></div>}</div></section>
        {onContact && <section className="wd-contact-card"><span aria-hidden="true">✉️</span><div><h2>Still need a hand?</h2><p>Send the Wizpiko team a question about your learning or account.</p></div><button type="button" className="wd-primary" onClick={onContact}>Contact us <ArrowRight size={17} /></button></section>}
      </>}
      {feedback && <p className="wd-save-feedback" role="status">{feedback}</p>}
    </div>
  </section>;
}
