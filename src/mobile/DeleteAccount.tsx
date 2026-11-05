import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { learningRequestSession } from '../cloudAccount';

export default function DeleteAccount({onClose,onDeleted}:{onClose:()=>void;onDeleted:()=>Promise<void>}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[pending,setPending]=useState(false),[error,setError]=useState('');
  useEffect(()=>{dialog.current?.showModal();return()=>dialog.current?.close();},[]);
  async function remove(event:React.FormEvent){
    event.preventDefault();if(pending||confirmation!=='DELETE'||!password)return;
    setPending(true);setError('');
    try{
      const session=await learningRequestSession();
      const response=await fetch((import.meta.env.VITE_SUPABASE_URL||'').replace(/\/$/,'')+'/functions/v1/app-account',{method:'POST',headers:{apikey:import.meta.env.VITE_SUPABASE_ANON_KEY||'',Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({action:'delete-account',confirmation,password}),signal:AbortSignal.timeout(25_000)});
      const body=await response.json().catch(()=>({}));
      if(!response.ok||body.deleted!==true)throw new Error(body.error||'Your account could not be deleted. Please try again.');
      await onDeleted();onClose();
    }catch(cause){setError(cause instanceof Error?cause.message:'Your account could not be deleted. Please try again.');}finally{setPending(false);}
  }
  return <dialog ref={dialog} className="wi-delete-dialog" aria-labelledby="wi-delete-heading" onCancel={event=>{if(pending)event.preventDefault();else onClose();}}><button type="button" className="wi-delete-close" disabled={pending} onClick={onClose} aria-label="Close account deletion"><X size={22}/></button><span className="wi-delete-icon"><AlertTriangle size={29}/></span><h2 id="wi-delete-heading">Delete your account?</h2><p>This permanently removes your account, saved learning progress, profile and certificates. Shared certificate links will stop working.</p><p>Copies you or others have already downloaded remain on those devices.</p><form onSubmit={event=>{void remove(event);}}><label htmlFor="wi-delete-password">Confirm your password</label><input id="wi-delete-password" type="password" autoComplete="current-password" value={password} maxLength={256} required disabled={pending} onChange={event=>setPassword(event.target.value)}/><label htmlFor="wi-delete-confirmation">Type DELETE to confirm</label><input id="wi-delete-confirmation" autoCapitalize="characters" autoComplete="off" value={confirmation} maxLength={6} required disabled={pending} onChange={event=>setConfirmation(event.target.value)}/>{error&&<p role="alert" className="wi-delete-error">{error}</p>}<div><button type="button" disabled={pending} onClick={onClose}>Keep my account</button><button type="submit" disabled={pending||confirmation!=='DELETE'||!password}>{pending?'Deleting account…':'Delete permanently'}</button></div></form></dialog>;
}
