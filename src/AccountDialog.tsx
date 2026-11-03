import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, X, CalendarDays } from 'lucide-react';
import type { LearnerProfile } from './learnerData';

type Props = {
  onClose: () => void;
  configured: boolean;
  email?: string;
  profile?: LearnerProfile | null;
  recovery?: boolean;
  status: string;
  signUp: (email: string, password: string, name: string, birthDate: string) => Promise<string>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<string>;
  updatePassword: (password: string) => Promise<void>;
};

export function AccountDialog({ onClose, configured, email, profile, recovery, status, signUp, signIn, signOut, sendPasswordReset, updatePassword }: Props) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(recovery ? 'reset' : 'login');
  const [address, setAddress] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [permission, setPermission] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(status);
  useEffect(() => { if (recovery) setMode('reset'); }, [recovery]);
  useEffect(() => { if (status) setMessage(status); }, [status]);
  useEffect(() => {
    function onKey(event: KeyboardEvent) { if (event.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function changeMode(next: typeof mode) { setMode(next); setMessage(''); setPassword(''); setConfirm(''); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (mode === 'register') {
      if (password !== confirm) { setMessage('Passwords do not match.'); return; }
      if (!permission) { setMessage('Please acknowledge the account and privacy information.'); return; }
    }
    setPending(true); setMessage('Please wait…');
    try {
      if (mode === 'register') setMessage(await signUp(address, password, nickname, birthDate));
      else if (mode === 'forgot') setMessage(await sendPasswordReset(address));
      else if (mode === 'reset') { await updatePassword(password); changeMode('login'); setMessage('Your password was updated. You can now sign in.'); }
      else await signIn(address, password);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Request failed. Please try again.'); }
    finally { setPending(false); }
  }

  return <div className="wa-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="wa-panel wa-new-panel" role="dialog" aria-modal="true" aria-label="Wizpiko account">
      <button type="button" className="wa-close" aria-label="Close account dialog" onClick={onClose}><X size={22}/></button>
      <div className="wa-form-side">
        <img src="./wizpiko-logo.webp" className="wa-wordmark" alt="Wizpiko — Think. Play. Shine."/>
        <h2>{email && !recovery ? 'My Wizpiko Account' : mode === 'register' ? 'Create your account' : mode === 'forgot' ? 'Forgot your password?' : mode === 'reset' ? 'Choose a new password' : 'Welcome back!'}</h2>
        <p className="wa-description">{email && !recovery ? 'Your learning adventure is saved to your account.' : mode === 'register' ? 'A few details help us recommend age-appropriate learning.' : mode === 'forgot' ? 'We will email you a password-reset link.' : 'Sign in and pick up where you left off.'}</p>
        {email && !recovery ? <>
          <div className="wa-signed"><ShieldCheck size={22}/><div><strong>{profile?.display_name || email}</strong><small>{email}</small></div></div>
          <button type="button" className="wiz-btn-secondary wa-full" disabled={pending} onClick={()=>{void signOut().then(onClose);}}>Sign out <ArrowRight size={17}/></button>
        </> : configured ? <form className="wa-form" onSubmit={event=>{void submit(event);}}>
          {mode === 'register' && <>
            <label htmlFor="wa-nickname">Nickname or display name</label>
            <input id="wa-nickname" type="text" autoComplete="nickname" maxLength={40} minLength={2} required placeholder="Your learning name" value={nickname} onChange={event=>setNickname(event.target.value)}/>
            <label htmlFor="wa-birth">Date of birth</label>
            <div className="wa-date"><CalendarDays size={18}/><input id="wa-birth" type="date" required max={new Date().toISOString().slice(0,10)} value={birthDate} onChange={event=>setBirthDate(event.target.value)}/></div>
          </>}
          {mode !== 'reset' && <>
            <label htmlFor="wa-email">Email address</label>
            <input id="wa-email" type="email" autoComplete="email" required placeholder="you@example.com" value={address} onChange={event=>setAddress(event.target.value)}/>
          </>}
          {mode !== 'forgot' && <>
            <label htmlFor="wa-password">Password</label>
            <div className="wa-password-wrap"><input id="wa-password" type={showPassword?'text':'password'} autoComplete={mode==='login'?'current-password':'new-password'} minLength={mode==='login'?undefined:8} value={password} onChange={event=>setPassword(event.target.value)} required placeholder="At least 8 characters"/>
              <button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
          </>}
          {mode === 'register' && <>
            <label htmlFor="wa-confirm">Confirm password</label>
            <input id="wa-confirm" type="password" minLength={8} required autoComplete="new-password" value={confirm} onChange={event=>setConfirm(event.target.value)} placeholder="Repeat password"/>
            <label className="wa-consent"><input type="checkbox" checked={permission} onChange={event=>setPermission(event.target.checked)} required/><span>I have reviewed Wizpiko's privacy and account information.</span></label>
          </>}
          {mode === 'login' && <div className="wa-form-tools"><label><input type="checkbox" defaultChecked/> Remember me</label><button type="button" onClick={()=>changeMode('forgot')}>Forgot password?</button></div>}
          <button type="submit" disabled={pending} className="wiz-btn-primary wa-full"><LockKeyhole size={18}/>{pending?'Please wait…':mode==='register'?'Create Account':mode==='forgot'?'Send Reset Email':mode==='reset'?'Update Password':'Sign In'} <ArrowRight size={17}/></button>
          {mode === 'login' ? <p className="wa-helper">Don't have an account? <button type="button" onClick={()=>changeMode('register')}>Sign Up</button></p> :
           <p className="wa-helper">{mode === 'register'?'Already have an account? ':''}<button type="button" onClick={()=>changeMode('login')}>Back to Sign In</button></p>}
        </form> : <div className="wa-not-ready"><LockKeyhole/><strong>Accounts are not configured in this build.</strong><p>Configure the public Supabase URL and key in your deployment environment.</p></div>}
        {message && <p className="wa-status" role="status">{message}</p>}
        <p className="wa-privacy">Your learning progress is saved on this browser. Sign in to keep your progress with your account when cloud synchronization is available.</p>
      </div>
      <div className="wa-art-side" aria-hidden="true">
        <img src="./wizpiko-logo.webp" alt=""/>
        <strong>Think. Play. Shine.</strong>
        <p>Little discoveries, big possibilities!</p>
      </div>
    </section>
  </div>;
}
