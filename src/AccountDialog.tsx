import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, X } from 'lucide-react';

type Props = {
  onClose: () => void;
  configured: boolean;
  email?: string;
  status: string;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export function AccountDialog({ onClose, configured, email, status, signUp, signIn, signOut }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [permission, setPermission] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(status);

  useEffect(() => { setMessage(status); }, [status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (mode === 'register') {
      if (!permission) { setMessage('An adult or guardian must create or supervise a test account.'); return; }
      if (password.length < 8) { setMessage('Please use at least 8 password characters.'); return; }
      if (confirm !== password) { setMessage('The two passwords do not match.'); return; }
    }
    setPending(true);
    setMessage(mode === 'register' ? 'Creating your account…' : 'Signing in…');
    try {
      if (mode === 'register') await signUp(address, password);
      else await signIn(address, password);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Account request failed. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return <div className="wa-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="wa-panel" role="dialog" aria-modal="true" aria-labelledby="wa-heading">
      <button className="wa-close" aria-label="Close account window" onClick={onClose}><X size={22}/></button>
      <img src="/wizpiko-icon.webp" className="wa-robot" alt="Wizpiko robot" />
      <span className="wiz-kicker">LEARN TOGETHER, GROW ANYWHERE</span>
      <h2 id="wa-heading">{email ? 'My Wizpiko account' : mode === 'register' ? 'Create your Wizpiko account' : 'Welcome back!'}</h2>
      <p className="wa-description">{email ? 'Your learning adventures belong to this account.' : 'Save your levels, crosswords and rewards so you can continue learning on another device.'}</p>

      {email ? <>
        <div className="wa-signed"><ShieldCheck size={21}/><div><strong>{email}</strong><small>Signed in. See the synchronization status below.</small></div></div>
        <button className="wiz-btn-secondary wa-full" onClick={() => { void signOut().then(onClose); }}>Sign out <ArrowRight size={17}/></button>
      </> : configured ? <>
        <div className="wa-mode-switch" role="group" aria-label="Account action">
          <button type="button" className={mode === 'login' ? 'wa-mode-active' : ''} onClick={() => { setMode('login'); setMessage(''); }}>Sign in</button>
          <button type="button" className={mode === 'register' ? 'wa-mode-active' : ''} onClick={() => { setMode('register'); setMessage(''); }}>Sign up</button>
        </div>
        <form className="wa-form" onSubmit={event => { void submit(event); }}>
          <label htmlFor="wiz-email">Email address</label>
          <input id="wiz-email" type="email" autoComplete="email" value={address} required placeholder="parent@example.com" onChange={event => setAddress(event.target.value)} />
          <label htmlFor="wiz-password">Password</label>
          <div className="wa-password-wrap">
            <input id="wiz-password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={password} required minLength={mode === 'register' ? 8 : undefined} placeholder="Your password" onChange={event => setPassword(event.target.value)} />
            <button type="button" onClick={() => setShowPassword(x => !x)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button>
          </div>
          {mode === 'register' && <>
            <label htmlFor="wiz-confirm">Confirm password</label>
            <input id="wiz-confirm" type="password" value={confirm} required minLength={8} autoComplete="new-password" placeholder="Repeat password" onChange={event => setConfirm(event.target.value)} />
            <label className="wa-consent"><input type="checkbox" checked={permission} required onChange={event => setPermission(event.target.checked)}/><span>I am an adult registering for testing, or a parent/guardian supervising this learner.</span></label>
          </>}
          <button className="wiz-btn-primary wa-full" disabled={pending} type="submit"><LockKeyhole size={18}/>{pending ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'} <ArrowRight size={17}/></button>
        </form>
        {mode === 'login' && <p className="wa-helper">New to Wizpiko? <button onClick={() => { setMode('register'); setMessage(''); }}>Create an account</button></p>}
        {mode === 'register' && <p className="wa-helper">Already registered? <button onClick={() => { setMode('login'); setMessage(''); }}>Sign in instead</button></p>}
      </> : <div className="wa-not-ready"><LockKeyhole size={24}/><strong>Account setup is not connected to this build.</strong><p>Set the Supabase public URL and key in your hosting environment and redeploy.</p></div>}
      {message && <p className="wa-status" role="status">{message}</p>}
      <p className="wa-privacy">Email verification is disabled only for controlled testing. Do not use this account system for public child registrations until age-appropriate privacy, parental consent, recovery and account-security safeguards are in place.</p>
    </section>
  </div>;
}
