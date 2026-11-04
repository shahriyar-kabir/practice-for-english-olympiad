import type { MouseEvent } from 'react';
import { Facebook } from 'lucide-react';
import { appHref } from './routes';
import type { InfoPageId } from './content/siteCopy';

type Props={signedIn:boolean;onHome:()=>void;onSubjects:()=>void;onProgress:()=>void;onInfo:(id:InfoPageId)=>void;onContact:()=>void};
export default function SiteFooter({signedIn,onHome,onSubjects,onProgress,onInfo,onContact}:Props){
 const follow=(event:MouseEvent<HTMLAnchorElement>,work:()=>void)=>{if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey){event.preventDefault();work();}};
 return <footer className="wiz-site-footer wz-footer"><div className="wz-footer-grid">
  <div className="wz-footer-identity"><img src={import.meta.env.BASE_URL + 'wizpiko-wordmark.webp'} width="720" height="240" loading="lazy" decoding="async" alt="Wizpiko — Think. Play. Shine."/><p>A cheerful place to explore, practise and grow with curiosity.</p></div>
  <div><strong>Platform</strong><a href={appHref(signedIn ? '/home' : '/')} onClick={event=>follow(event,onHome)}>Home</a><a href={appHref(signedIn ? '/home' : '/') + '#wiz-subjects'} onClick={event=>follow(event,onSubjects)}>Subjects</a>{signedIn&&<button type="button" onClick={onProgress}>My Progress</button>}</div>
  <div><strong>Support</strong><a href={appHref(''/help-centre'')} onClick={event=>follow(event,()=>onInfo('help'))}>Help Centre</a><a href={appHref(''/privacy-safety'')} onClick={event=>follow(event,()=>onInfo('privacy'))}>Privacy & Safety</a><a href={appHref(''/account-guide'')} onClick={event=>follow(event,()=>onInfo('account-guide'))}>Account Guide</a><a href={appHref(''/contact-us'')} onClick={event=>follow(event,onContact)}>Contact Us</a></div>
  <div><strong>Company</strong><a href={appHref(''/about-us'')} onClick={event=>follow(event,()=>onInfo('about'))}>About Us</a><a href={appHref(''/mission'')} onClick={event=>follow(event,()=>onInfo('mission'))}>Our Mission</a></div>
  <div><strong>Follow Us</strong><div className="wz-social-icons"><a href="https://www.facebook.com/wizpiko2026" target="_blank" rel="noopener noreferrer" aria-label="Wizpiko on Facebook"><Facebook size={23}/></a></div><small>© {new Date().getFullYear()} Wizpiko.</small></div>
 </div></footer>;
}
