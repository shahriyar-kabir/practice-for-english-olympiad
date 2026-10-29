import { useState } from 'react';
import type { JourneyProgress } from './EnglishJourney';
import type { LearnerProfile } from './learnerData';
import { ageFromBirthdate, ageLabel, dayKey, learningStreak } from './learnerData';
import { Award, ArrowLeft, Flame, Gamepad2, HelpCircle, Lock, Settings2, Shield, Star, TrendingUp, UserRound, LogOut } from 'lucide-react';

export type LearnerPage = 'profile' | 'progress' | 'achievements' | 'streak' | 'preferences' | 'parent' | 'help';
export const learnerMenu: { id: LearnerPage; label: string; icon: typeof UserRound }[] = [
  { id: 'profile', label: 'My Profile', icon: UserRound },
  { id: 'progress', label: 'My Progress', icon: TrendingUp },
  { id: 'achievements', label: 'My Achievements', icon: Award },
  { id: 'streak', label: 'My Learning Streak', icon: Flame },
  { id: 'preferences', label: 'Learning Preferences', icon: Settings2 },
  { id: 'parent', label: 'Parental Settings', icon: Shield },
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
  onGuardianEmail: () => Promise<void>;
};
const avatarEmoji: Record<LearnerProfile['avatar'], string> = { girl:'👧', boy:'👦', robot:'🤖', panda:'🐼', cat:'🐱' };
function Metric({label, value, emoji}: {label:string;value:string | number;emoji:string}) {return <div className="wz-metric"><span>{emoji}</span><strong>{value}</strong><small>{label}</small></div>;}
export function LearnerHub({page, profile, email, journey, solvedTotal, completedTotal, totalWords, onPage, onHome, onPractice, onSignOut, onSaveProfile, onGuardianEmail}: Props) {
  const [name, setName] = useState(profile?.display_name || '');
  const [feedback, setFeedback] = useState('');
  const [pending, setPending] = useState(false);
  const dates = journey.activityDates || [];
  const streak = learningStreak(dates);
  const xp = Object.values(journey.records).reduce((a,b)=>a+b.xp,0);
  const best = Object.values(journey.records).reduce((a,b)=>Math.max(a,b.bestScore),0);
  const age = ageFromBirthdate(profile?.birth_date || '');
  const title = learnerMenu.find(x=>x.id===page)?.label || 'My Learning';
  const finish = async (work:()=>Promise<void>) => {setPending(true);setFeedback('');try{await work();setFeedback('Changes saved.');}catch(error){setFeedback(error instanceof Error?error.message:'Unable to save changes.');}finally{setPending(false);}};
  return <section className="wz-account-layout">
    <aside className="wz-account-sidebar">
      <button className="wz-sidebar-back" onClick={onHome}><ArrowLeft size={17}/> Back to Home</button>
      <div className="wz-sidebar-identity"><span className="wz-avatar-large">{avatarEmoji[profile?.avatar || 'robot']}</span><strong>{profile?.display_name || email.split('@')[0]}</strong><small>{ageLabel(age)}{age !== null ? ' · Age '+age : ''}</small></div>
      <nav aria-label="Account navigation">{learnerMenu.map(({id,label,icon:Icon})=><button key={id} className={page===id?'selected':''} onClick={()=>onPage(id)}><Icon size={17}/>{label}</button>)}</nav>
      <button className="wz-sidebar-signout" onClick={onSignOut}><LogOut size={17}/> Sign Out</button>
    </aside>
    <div className="wz-account-main">
      <div className="wz-account-heading"><span className="wz-eyebrow"><Star size={14}/> Keep shining</span><h1>{title}</h1><p>{page==='streak'?'Little steps every day make a big difference.':page==='progress'?'See how much you have learned and grown.':'Your learning space, made just for you.'}</p></div>
      {page==='profile' && <div className="wz-account-card">
        <h2>My learning profile</h2><div className="wz-profile-summary"><span className="wz-avatar-large">{avatarEmoji[profile?.avatar || 'robot']}</span><div><strong>{profile?.display_name || 'Learner'}</strong><small>{ageLabel(age)}{age!==null ? ' · '+age+' years' : ''}</small></div></div>
        <label className="wz-settings-field">Display name<input maxLength={40} minLength={2} value={name} onChange={e=>setName(e.target.value)}/></label>
        <div className="wz-settings-field">Date of birth <span>{profile?.birth_date || 'Not available'} (contact support to correct)</span></div>
        <div className="wz-settings-field">Account email <span>{email}</span></div>
        <h3>Choose an avatar</h3><div className="wz-avatar-choices">{(Object.keys(avatarEmoji) as LearnerProfile['avatar'][]).map(a=><button key={a} className={a===(profile?.avatar||'robot')?'selected':''} onClick={()=>{void finish(()=>onSaveProfile({avatar:a}));}} aria-pressed={a===(profile?.avatar||'robot')}><span>{avatarEmoji[a]}</span><small>{a}</small></button>)}</div>
        <button className="wz-action-button" disabled={pending||name.trim().length<2} onClick={()=>{void finish(()=>onSaveProfile({display_name:name.trim()}));}}>Save profile</button>
      </div>}
      {page==='progress' && <div className="wz-account-card"><h2>Your learning at a glance</h2>
        <div className="wz-metrics"><Metric emoji="📚" value={completedTotal} label="Crosswords finished"/><Metric emoji="✨" value={solvedTotal} label="Words discovered"/><Metric emoji="🏆" value={xp} label="Total XP"/><Metric emoji="🔥" value={streak.current} label="Day streak"/></div>
        <h3>English practice</h3><div className="wz-progress-bar"><span style={{width:Math.round(solvedTotal/Math.max(1,totalWords)*100)+'%'}}/></div><p>{solvedTotal} of {totalWords} original crossword words completed</p><p>Best English challenge score: {best}%</p><button className="wz-action-button" onClick={onPractice}><Gamepad2 size={18}/> Continue English Practice</button>
      </div>}
      {page==='achievements' && <div className="wz-account-card"><h2>Collect your stars!</h2><p>Your badges celebrate real completed activities and practice milestones.</p>
        <div className="wz-achievement-grid">{[
          ['⭐','First word',solvedTotal>0,'Discover your first crossword word'],
          ['📘','Crossword explorer',completedTotal>0,'Finish your first crossword'],
          ['🏆','Word champion',completedTotal>=10,'Complete all ten classic crosswords'],
          ['🔥','3-day spark',streak.longest>=3,'Practise on three consecutive days'],
          ['🥈','7-day spark',streak.longest>=7,'Practise seven days in a row'],
          ['💎','30-day champion',streak.longest>=30,'Practise thirty days in a row'],
          ['🚀','Level explorer',Object.values(journey.records).some(r=>r.unlocked>1),'Unlock a new challenge level'],
          ['🌟','500 XP',xp>=500,'Collect 500 points from practice'],
        ].map(([emoji,label,done,desc])=><div className={'wz-award '+(done?'unlocked':'locked')} key={String(label)}><span>{done?emoji:<Lock size={24}/>}</span><strong>{label}</strong><small>{desc}</small></div>)}</div>
      </div>}
      {page==='streak' && <div className="wz-account-card">
        <div className="wz-streak-title"><Flame size={38}/><div><strong>{streak.current} day{streak.current===1?'':'s'}</strong><small>Current learning streak</small></div></div>
        <p>{streak.todayCompleted?'You have already completed an activity today. Great work!':'Complete an English activity to keep your learning streak going.'}</p>
        <div className="wz-week-strip">{Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const key=dayKey(d);return <div key={key} className={dates.includes(key)?'completed':''}><span>{d.toLocaleDateString(undefined,{weekday:'short'})}</span><strong>{dates.includes(key)?'✓':d.getDate()}</strong></div>;})}</div>
        <div className="wz-metrics"><Metric emoji="🔥" value={streak.current} label="Current streak"/><Metric emoji="🏅" value={streak.longest} label="Longest streak"/><Metric emoji="📅" value={streak.total} label="Active days"/></div>
        <h3>Streak rewards</h3><div className="wz-milestones">{[3,7,14,30].map(n=><div key={n} className={streak.longest>=n?'earned':''}><span>{streak.longest>=n?'🏅':'🔒'}</span><strong>{n} days</strong><small>{streak.longest>=n?'Earned!':'Keep going'}</small></div>)}</div>
        <p className="wz-note">A streak counts when you finish a learning activity, not just when you sign in. Missing a day will never remove badges already earned.</p><button className="wz-action-button" onClick={onPractice}>Keep Learning</button>
      </div>}
      {page==='preferences' && <div className="wz-account-card"><h2>Make learning your own</h2><p>Your preferences personalize your experience. More subjects and languages will become available over time.</p>
        {([['sound','Learning sounds'],['animation','Playful animations'],['learning_tips','Helpful learning tips']] as const).map(([key,label])=><label className="wz-toggle" key={key}><span>{label}</span><input type="checkbox" checked={profile?.preferences?.[key]??true} onChange={e=>{void finish(()=>onSaveProfile({preferences:{...profile?.preferences,[key]:e.target.checked}}));}}/></label>)}
      </div>}
      {page==='parent' && <div className="wz-account-card"><h2>Parent & Guardian Settings</h2><div className="wz-guardian-row"><Shield size={28}/><div><strong>{profile?.guardian_email || 'No guardian email on file'}</strong><small>{profile?.consent_status==='verified'?'Guardian email approval recorded':profile?.consent_status==='pending'?'Awaiting guardian verification':'No guardian approval required by this initial age rule'}</small></div></div>
        {profile?.consent_status==='pending'&&<button disabled={pending} className="wz-action-button" onClick={()=>{void finish(onGuardianEmail);}}>Send guardian verification link</button>}
        <h3>Account & privacy</h3><p>For children under 10, a guardian must verify an email address and approve account creation before the learner can use their account. Additional legal consent and identity checks may be necessary before public registration.</p>
        <p className="wz-note">For corrections to birth date or to request account deletion, contact the Wizpiko support team. Sensitive profile fields cannot be edited from the learner dashboard.</p>
      </div>}
      {page==='help' && <div className="wz-account-card"><h2>How can we help?</h2><div className="wz-help-list"><details><summary>How do I start learning?</summary><p>Choose English Practice on the homepage, then select your learning level and Crossword or MCQ.</p></details><details><summary>How is my learning saved?</summary><p>Signed-in learning progress is stored in your Wizpiko account when cloud synchronization is available.</p></details><details><summary>How does my daily streak work?</summary><p>Complete at least one activity per day to build a streak. Signing in alone does not count.</p></details><details><summary>How does parent approval work?</summary><p>Children under ten must obtain guardian approval. Guardians receive a verification email when email delivery is configured.</p></details><details><summary>I forgot my password</summary><p>Sign out and choose Forgot Password from the Sign In dialog to request an email reset link.</p></details></div>
      </div>}
      {feedback&&<p className="wz-save-feedback" role="status">{feedback}</p>}
    </div>
  </section>;
}