import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Award, ChevronDown, Flame, HelpCircle, LogOut, Menu, Search, Settings2, TrendingUp, UserRound, X } from 'lucide-react';
import type { LearnerProfile } from './learnerData';
import type { LearnerPage } from './LearnerHub';
import type { InfoPageId } from './content/siteCopy';
import { LearnerAvatar } from './LearnerAvatar';
import { appHref } from './routes';

type Props = {
  signedIn: boolean; loading: boolean; profile: LearnerProfile | null; isHome: boolean; streak: number;
  onHome:()=>void; onSubjects:()=>void; onGames:()=>void; onInfo:(page:InfoPageId)=>void;
  onContact:()=>void; onSignIn:()=>void; onHub:(page:LearnerPage)=>void; onSignOut:()=>void; onSearch:(query:string)=>void;
};
const menu = [
  {id:'profile',label:'My Profile',Icon:UserRound},{id:'progress',label:'My Progress',Icon:TrendingUp},
  {id:'achievements',label:'My Achievements',Icon:Award},{id:'streak',label:'My Learning Streak',Icon:Flame},
  {id:'preferences',label:'Learning Preferences',Icon:Settings2},{id:'help',label:'Help & Support',Icon:HelpCircle},
] as const;


export default function SiteHeader({signedIn,loading,profile,isHome,streak,onHome,onSubjects,onGames,onInfo,onContact,onSignIn,onHub,onSignOut,onSearch}:Props) {
  const [searchOpen,setSearchOpen]=useState(false);
  const [query,setQuery]=useState('');
  const [avatarOpen,setAvatarOpen]=useState(false);
  const [mobileOpen,setMobileOpen]=useState(false);
  const avatarWrap=useRef<HTMLDivElement>(null);
  const avatarButton=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    if(!avatarOpen)return;
    const outside=(event:MouseEvent)=>{if(avatarWrap.current&&!avatarWrap.current.contains(event.target as Node))setAvatarOpen(false);};
    const keys=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){setAvatarOpen(false);avatarButton.current?.focus();return;}
      if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
      const items=Array.from(avatarWrap.current?.querySelectorAll<HTMLButtonElement>('[role=menuitem]')||[]);
      if(!items.length)return;event.preventDefault();
      const current=items.indexOf(document.activeElement as HTMLButtonElement);
      const next=event.key==='Home'?0:event.key==='End'?items.length-1:event.key==='ArrowDown'?(current+1)%items.length:(current-1+items.length)%items.length;
      items[next]?.focus();
    };
    document.addEventListener('mousedown',outside);document.addEventListener('keydown',keys);
    return()=>{document.removeEventListener('mousedown',outside);document.removeEventListener('keydown',keys);};
  },[avatarOpen]);
  function navigate(work:()=>void){setAvatarOpen(false);setMobileOpen(false);work();}
  const nickname=profile?.display_name||'Learner';
  return <header className="site-header wz-site-header"><div className="header-inner wz-header-inner">
    <button className="wz-header-logo" type="button" onClick={()=>navigate(onHome)} aria-label="Wizpiko home"><img src={import.meta.env.BASE_URL + 'wizpiko-wordmark.webp'} width="720" height="240" decoding="async" alt="Wizpiko — Think. Play. Shine."/></button>
    <button className="wz-mobile-menu" type="button" onClick={()=>setMobileOpen(!mobileOpen)} aria-label={mobileOpen?'Close navigation':'Open navigation'} aria-expanded={mobileOpen} aria-controls="wz-main-nav">{mobileOpen?<X size={23}/>:<Menu size={23}/>}</button>
    <nav id="wz-main-nav" className={`wz-header-nav${mobileOpen?' is-open':''}`} aria-label="Main navigation">
      <button className={isHome?'active':''} type="button" onClick={()=>navigate(onHome)}>Home</button>
      <button type="button" onClick={()=>navigate(onSubjects)}>Subjects</button>
      <button type="button" onClick={()=>navigate(onGames)}>Games</button>
      {(signedIn||loading)&&<button type="button" disabled={loading} className={loading?'wz-loading-nav':''} aria-hidden={loading||undefined} onClick={()=>navigate(()=>onHub('progress'))}>My Learning</button>}
      <a href={appHref('/about-us')} onClick={event=>{if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey){event.preventDefault();navigate(()=>onInfo('about'));}}}>About Us</a>
      <a href={appHref('/contact-us')} onClick={event=>{if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey){event.preventDefault();navigate(onContact);}}}>Contact Us</a>
    </nav>
    <div className="wz-header-right"><form role="search" className={`wz-search${searchOpen?' open':''}`} onSubmit={event=>{event.preventDefault();if(query.trim()){navigate(()=>onSearch(query.trim()));setSearchOpen(false);setQuery('');}}}>
      {searchOpen&&<input autoFocus type="search" aria-label="Search Wizpiko" placeholder="Search…" maxLength={80} value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==='Escape')setSearchOpen(false);}}/>}
      <button aria-label="Search" type={searchOpen?'submit':'button'} onClick={()=>{if(!searchOpen)setSearchOpen(true);}}><Search size={21}/></button>
    </form>
    {loading?<span className="wz-account-placeholder" aria-hidden="true"/>:signedIn?<div className="wz-avatar-wrap" ref={avatarWrap}><button ref={avatarButton} className="wz-avatar-button" type="button" onClick={()=>setAvatarOpen(!avatarOpen)} aria-expanded={avatarOpen} aria-haspopup="menu" aria-controls="wz-account-menu"><LearnerAvatar avatar={profile?.avatar} className="wz-avatar-pic" decorative /><span>{nickname}</span><ChevronDown size={16}/></button>
      {avatarOpen&&<div id="wz-account-menu" className="wz-avatar-menu" role="menu" aria-label="Your learning account"><div className="wz-menu-person"><LearnerAvatar avatar={profile?.avatar} className="wz-avatar-pic" decorative /><div><strong>{nickname}</strong><small>Your learning space</small></div></div>
        {menu.map(({id,label,Icon})=><button key={id} role="menuitem" type="button" onClick={()=>navigate(()=>onHub(id))}><Icon size={18}/><span>{label}</span>{id==='streak'&&streak>0?<span className="wz-menu-flame">🔥 {streak}</span>:<ArrowRight size={15} className="wz-menu-arrow"/>}</button>)}
        <button role="menuitem" type="button" className="wz-menu-signout" onClick={()=>navigate(onSignOut)}><LogOut size={18}/>Sign Out</button>
      </div>}
    </div>:<button className="wz-signin-button" type="button" disabled={loading} onClick={()=>navigate(onSignIn)}>{loading?'Checking…':'Sign In'}</button>}
    </div>
  </div></header>;
}
