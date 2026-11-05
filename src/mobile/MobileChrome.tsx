import { useEffect, useRef, useState } from 'react';
import { Award, BookOpen, ChevronRight, CircleHelp, Flame, Gamepad2, Home, LogOut, Mail, Settings2, ShieldCheck, TrendingUp, UserRound, X } from 'lucide-react';
import type { AppChromeProps } from '../App';
import { LearnerAvatar } from '../LearnerAvatar';
import DeleteAccount from './DeleteAccount';
import { learnerMenu } from '../LearnerHub';
import type { LearnerPage } from '../LearnerHub';

export default function MobileChrome(props: AppChromeProps) {
  const { signedIn, loading, profile, view, hubPage, onHome, onSubjects, onGames, onHub, onSignIn, onSignOut, onContact, onInfo } = props;
  const [open,setOpen] = useState(false),[deleting,setDeleting]=useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(()=>{if(open)dialog.current?.showModal();else dialog.current?.close();},[open]);
  const act = (action:()=>void) => { setOpen(false);action(); };
  const icons = { profile:UserRound, progress:TrendingUp, achievements:Award, certificates:Award, streak:Flame, preferences:Settings2, help:CircleHelp };
  const tabs = [
    { label:'Home',icon:Home,active:view==='home',action:onHome },
    { label:'Learn',icon:BookOpen,active:view==='categories',action:onSubjects },
    { label:'Play',icon:Gamepad2,active:view==='games'||view==='subject-games'||view==='classic',action:onGames },
    { label:'Progress',icon:TrendingUp,active:view==='hub'&&hubPage==='progress',action:()=>onHub('progress') },
    { label:signedIn?'You':'Sign in',icon:UserRound,active:view==='hub'&&hubPage!=='progress',action:signedIn?()=>onHub('profile'):onSignIn },
  ];
  return <>
    <header className="wi-header"><button type="button" className="wi-brand" onClick={onHome} aria-label="Wizpiko home"><img src="/wizpiko-wordmark.webp" alt="Wizpiko — Think. Play. Shine." width="144" height="52"/></button><div className="wi-header-actions"><button type="button" aria-label="Help and support" onClick={()=>onHub('help')}><CircleHelp size={22}/></button><button type="button" className="wi-account" aria-label={signedIn?'Open your account menu':'Open sign in'} onClick={()=>signedIn?setOpen(true):onSignIn()} disabled={loading}>{signedIn?<LearnerAvatar avatar={profile?.avatar}/>:<UserRound size={22}/>}</button></div></header>
    <nav className="wi-tabbar" aria-label="App navigation">{tabs.map(({label,icon:Icon,active,action})=><button type="button" key={label} aria-current={active?'page':undefined} className={active?'is-active':''} onClick={action}><span><Icon size={23} strokeWidth={active?2.4:1.8}/></span><strong>{label}</strong></button>)}</nav>
    <dialog ref={dialog} className="wi-account-sheet" aria-label="Your Wizpiko account" onCancel={()=>setOpen(false)} onClick={event=>{if(event.target===event.currentTarget)setOpen(false);}}><div className="wi-sheet-heading"><div><span className="wi-eyebrow">YOUR LEARNING SPACE</span><h2>{profile?.display_name||'Your account'}</h2></div><button type="button" aria-label="Close account menu" onClick={()=>setOpen(false)}><X size={22}/></button></div><div className="wi-sheet-menu">{learnerMenu.map(item=>{const Icon=icons[item.id as LearnerPage];return <button key={item.id} type="button" onClick={()=>act(()=>onHub(item.id))}><span><Icon size={21}/></span>{item.label}<ChevronRight size={17}/></button>;})}<button type="button" onClick={()=>act(onContact)}><span><Mail size={21}/></span>Contact Us<ChevronRight size={17}/></button><button type="button" onClick={()=>act(()=>onInfo('privacy'))}><span><ShieldCheck size={21}/></span>Privacy & Safety<ChevronRight size={17}/></button><button className="wi-signout" type="button" onClick={()=>act(()=>setDeleting(true))}><span><UserRound size={21}/></span>Delete account<ChevronRight size={17}/></button><button className="wi-signout" type="button" onClick={()=>act(onSignOut)}><span><LogOut size={21}/></span>Sign out<ChevronRight size={17}/></button></div><p className="wi-sheet-note">Wizpiko · Think. Play. Shine.<br/>Your progress follows your account.</p></dialog>
    {deleting&&<DeleteAccount onClose={()=>setDeleting(false)} onDeleted={props.onAccountDeleted}/>}
  </>;
}
