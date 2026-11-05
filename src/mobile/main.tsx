import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import '@fontsource/nunito/900.css';
import '@fontsource/fraunces/500.css';
import '@fontsource/fraunces/600.css';
import App from '../App';
import '../styles.css';
import '../wizpiko-redesign.css';
import '../refresh.css';
import '../reference-home.css';
import MobileChrome from './MobileChrome';
import MobileHome from './MobileHome';
import { prepareNativeApp } from './native';
import './mobile.css';

document.documentElement.classList.add('wi-app');
if(window.location.pathname==='/ios.html')window.history.replaceState(null,'','/'+window.location.search);
function MobileApp() {
  const [ready,setReady] = useState(false),[error,setError] = useState(''),[attempt,setAttempt] = useState(0),[epoch,setEpoch] = useState(0),[online,setOnline] = useState(navigator.onLine);
  useEffect(()=>{
    let cancelled=false;
    prepareNativeApp().then(()=>{if(!cancelled)setReady(true);}).catch(()=>{if(!cancelled)setError('Your secure learning space could not be opened. Please try again.');});
    return()=>{cancelled=true;};
  },[attempt]);
  useEffect(()=>{
    const refresh=()=>setEpoch(value=>value+1);
    const network=(event:Event)=>setOnline((event as CustomEvent<boolean>).detail);
    const browserOnline=()=>setOnline(navigator.onLine);
    window.addEventListener('wizpiko-session-changed',refresh);window.addEventListener('wizpiko-connectivity',network);window.addEventListener('online',browserOnline);window.addEventListener('offline',browserOnline);
    return()=>{window.removeEventListener('wizpiko-session-changed',refresh);window.removeEventListener('wizpiko-connectivity',network);window.removeEventListener('online',browserOnline);window.removeEventListener('offline',browserOnline);};
  },[]);
  if(!ready)return <main className="wi-startup"><img src="/wizpiko-icon.webp" alt="" width="112" height="112"/><h1>{error?'Let’s try again':'A little learning awaits'}</h1><p role={error?'alert':'status'}>{error||'Opening your learning space…'}</p>{error&&<button type="button" className="wi-primary" onClick={()=>{setError('');setAttempt(value=>value+1);}}>Try again</button>}</main>;
  return <>{!online&&<div className="wi-network-banner" role="status">You’re offline. Reconnect to sign in and save completed activities.</div>}<App key={epoch} renderChrome={props=><MobileChrome {...props}/>} renderHome={props=><MobileHome {...props}/>}/></>;
}
createRoot(document.getElementById('root')!).render(<MobileApp/>);
