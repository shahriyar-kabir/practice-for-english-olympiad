import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Award, Bell, ChevronDown, Flame, HelpCircle, LogOut, Menu, Search, Settings2, TrendingUp, UserRound, X } from 'lucide-react';
import { ageFromBirthdate } from './learnerData';
import type { LearnerProfile } from './learnerData';
import type { LearnerPage } from './LearnerHub';
import type { InfoPageId } from './content/siteCopy';
import { levelLabels } from './academy/catalog';
import { LearnerAvatar } from './LearnerAvatar';
import { appHref } from './routes';

type Props = {
  signedIn: boolean; loading: boolean; profile: LearnerProfile | null; isHome: boolean; gamesActive?: boolean; streak: number; completedToday?: boolean; reserveSignedIn?: boolean;
  onHome:()=>void; onSubjects:()=>void; onGames:()=>void; onInfo:(page:InfoPageId)=>void;
  onContact:()=>void; onSignIn:()=>void; onHub:(page:LearnerPage)=>void; onSignOut:()=>void; onSearch:(query:string)=>void;
};
const menu = [
  {id:'profile',label:'My Profile',Icon:UserRound},{id:'progress',label:'My Progress',Icon:TrendingUp},
  {id:'achievements',label:'My Achievements',Icon:Award},{id:'certificates',label:'My Certificates',Icon:Award},{id:'streak',label:'My Learning Streak',Icon:Flame},
  {id:'preferences',label:'Learning Preferences',Icon:Settings2},{id:'help',label:'Help & Support',Icon:HelpCircle},
] as const;

export default function SiteHeader({signedIn,loading,profile,isHome,gamesActive=false,streak,completedToday=false,reserveSignedIn=false,onHome,onSubjects,onGames,onInfo,onContact,onSignIn,onHub,onSignOut,onSearch}:Props) {
  const [searchOpen,setSearchOpen]=useState(false);
  const [query,setQuery]=useState('');
  const [avatarOpen,setAvatarOpen]=useState(false);
  const [reminderOpen,setReminderOpen]=useState(false);
  const [mobileOpen,setMobileOpen]=useState(false);
  const accountTools=useRef<HTMLDivElement>(null);
  const avatarButton=useRef<HTMLButtonElement>(null);
  const reminderButton=useRef<HTMLButtonElement>(null);
  const searchInput=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    if(searchOpen) searchInput.current?.focus();
  },[searchOpen]);
  useEffect(()=>{
    if(!avatarOpen&&!reminderOpen)return;
    const outside=(event:MouseEvent)=>{if(accountTools.current&&!accountTools.current.contains(event.target as Node)){setAvatarOpen(false);setReminderOpen(false);}};
    const keys=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){
        const target=reminderOpen?reminderButton:avatarButton;
        setAvatarOpen(false);setReminderOpen(false);target.current?.focus();return;
      }
      if(!avatarOpen||!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
      const items=Array.from(accountTools.current?.querySelectorAll<HTMLButtonElement>('[role=menuitem]')||[]);
      if(!items.length)return;event.preventDefault();
      const current=items.indexOf(document.activeElement as HTMLButtonElement);
      const next=event.key==='Home'?0:event.key==='End'?items.length-1:event.key==='ArrowDown'?(current+1)%items.length:(current-1+items.length)%items.length;
      items[next]?.focus();
    };
    document.addEventListener('mousedown',outside);document.addEventListener('keydown',keys);
    return()=>{document.removeEventListener('mousedown',outside);document.removeEventListener('keydown',keys);};
  },[avatarOpen,reminderOpen]);
  function navigate(work:()=>void){setAvatarOpen(false);setReminderOpen(false);setMobileOpen(false);setSearchOpen(false);work();}
  const nickname=profile?.display_name||'Learner';
  const age=ageFromBirthdate(profile?.birth_date||'');
  return <header className={`site-header wz-site-header${signedIn||reserveSignedIn?' wz-signed-header':''}`}><div className="header-inner wz-header-inner">
    <button className="wz-header-logo" type="button" onClick={()=>navigate(onHome)} aria-label="Wizpiko home"><img src={import.meta.env.BASE_URL + 'wizpiko-wordmark.webp'} width="720" height="240" decoding="async" alt="Wizpiko — Think. Play. Shine."/></button>
    <button className="wz-mobile-menu" type="button" onClick={()=>setMobileOpen(!mobileOpen)} aria-label={mobileOpen?'Close navigation':'Open navigation'} aria-expanded={mobileOpen} aria-controls="wz-main-nav">{mobileOpen?<X size={23}/>:<Menu size={23}/>}</button>
    <nav id="wz-main-nav" className={`wz-header-nav${mobileOpen?' is-open':''}`} aria-label="Main navigation">
      <button className={isHome?'active':''} type="button" onClick={()=>navigate(onHome)}>Home</button>
      <button type="button" onClick={()=>navigate(onSubjects)}>Subjects <ChevronDown className="wz-subject-chevron" size={15} aria-hidden="true"/></button>
      <button className={gamesActive?'active':''} type="button" onClick={()=>navigate(onGames)}>Games</button>
      {(signedIn||loading)&&<button type="button" disabled={loading} className={loading?'wz-loading-nav':''} aria-hidden={loading||undefined} onClick={()=>navigate(()=>onHub('progress'))}>My Learning</button>}
      <a href={appHref('/about-us')} onClick={event=>{if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey){event.preventDefault();navigate(()=>onInfo('about'));}}}>About Us</a>
      <a href={appHref('/contact-us')} onClick={event=>{if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey){event.preventDefault();navigate(onContact);}}}>Contact Us</a>
    </nav>
    <div className="wz-header-right"><form role="search" className={`wz-search${searchOpen?' open':''}`} onSubmit={event=>{event.preventDefault();if(query.trim()){navigate(()=>onSearch(query.trim()));setQuery('');}}}>
      <button aria-label="Search" type={searchOpen?'submit':'button'} onClick={()=>{if(!searchOpen)setSearchOpen(true);}}><Search size={23}/></button>
      {(signedIn||reserveSignedIn||searchOpen)&&<input ref={searchInput} type="search" aria-label="Search Wizpiko" placeholder="Search..." maxLength={80} value={query} onFocus={()=>setSearchOpen(true)} onChange={event=>{setQuery(event.target.value);setSearchOpen(true);}} onKeyDown={event=>{if(event.key==='Escape'){setSearchOpen(false);searchInput.current?.blur();}}}/>}
    </form>
    {loading?<span className="wz-account-placeholder" aria-hidden="true"/>:signedIn?<div className="wz-account-tools" ref={accountTools}>
      <div className="wz-reminder-wrap"><button ref={reminderButton} className="wz-reminder-button" type="button" aria-label="Learning reminders" aria-expanded={reminderOpen} aria-controls="wz-learning-reminder" onClick={()=>{setAvatarOpen(false);setReminderOpen(!reminderOpen);}}><Bell size={26}/>{!completedToday&&<span className="wz-reminder-dot" aria-hidden="true"/>}</button>
        {reminderOpen&&<section id="wz-learning-reminder" className="wz-reminder-panel" role="dialog" aria-label="Your learning reminder"><strong>{completedToday?'A little win worth celebrating!':'Your next discovery is waiting'}</strong><p>{completedToday?'You have completed a learning activity today. Explore something new whenever you feel ready.':'One completed activity counts towards your learning streak. Choose something you enjoy and learn at your own pace.'}</p>{streak>0&&<small>{streak} active learning days in your streak.</small>}<button type="button" onClick={()=>navigate(()=>onHub('progress'))}>View my learning <ArrowRight size={16}/></button></section>}
      </div>
      <div className="wz-avatar-wrap"><button ref={avatarButton} className="wz-avatar-button" type="button" onClick={()=>{setReminderOpen(false);setAvatarOpen(!avatarOpen);}} aria-expanded={avatarOpen} aria-haspopup="menu" aria-controls="wz-account-menu"><LearnerAvatar avatar={profile?.avatar} className="wz-avatar-pic" decorative /><span>{nickname}</span><ChevronDown size={17}/></button>
        {avatarOpen&&<div id="wz-account-menu" className="wz-avatar-menu" role="menu" aria-label="Your learning account"><div className="wz-menu-person"><LearnerAvatar avatar={profile?.avatar} className="wz-avatar-pic" decorative /><div><strong>{nickname}</strong><small>{age===null?'Curious learner':`Age ${age} · Learner`}</small><span className="wz-menu-level">{levelLabels[profile?.preferences.learning_level||'beginner']}</span></div></div>
          {menu.map(({id,label,Icon})=><button key={id} role="menuitem" type="button" onClick={()=>navigate(()=>onHub(id))}><Icon size={19}/><span>{label}</span>{id==='streak'&&streak>0?<span className="wz-menu-flame">🔥 {streak}</span>:<ArrowRight size={15} className="wz-menu-arrow"/>}</button>)}
          <button role="menuitem" type="button" className="wz-menu-signout" onClick={()=>navigate(onSignOut)}><LogOut size={19}/>Sign Out</button>
        </div>}
      </div>
    </div>:<button className="wz-signin-button" type="button" disabled={loading} onClick={()=>navigate(onSignIn)}>{loading?'Checking…':'Sign In'}</button>}
    </div>
  </div></header>;
}
