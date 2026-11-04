import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, X } from 'lucide-react';
import type { LearnerProfile } from './learnerData';
import { AccountActionError } from './supportApi';
import './auth-dialog.css';
import { appHref } from './routes';

type Mode = 'login' | 'register' | 'forgot' | 'reset' | 'confirmation' | 'reset-sent';
type Props = {
  onClose: () => void;
  configured: boolean;
  email?: string;
  profile?: LearnerProfile | null;
  recovery?: boolean;
  status: string;
  initialMode?: 'login' | 'register';
  signUp: (email: string, password: string, name: string, birthDate: string) => Promise<string>;
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<string>;
  updatePassword: (password: string) => Promise<void>;
  resendSignupConfirmation?: (email: string) => Promise<string>;
};

const CONFIRMATION = 'Check your email for a confirmation link. After confirming, sign in with your password.';

export function AccountDialog({ onClose, configured, email, profile, recovery, status, initialMode = 'login', signUp, signIn, signOut, sendPasswordReset, updatePassword, resendSignupConfirmation }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<Mode>(recovery ? 'reset' : initialMode);
  const [address, setAddress] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [permission, setPermission] = useState(false);
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(status);
  const [errorCode, setErrorCode] = useState('');
  const successScreen = mode === 'confirmation' || mode === 'reset-sent';

  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  useEffect(() => { if (recovery) setMode('reset'); }, [recovery]);
  useEffect(() => {
    const target = dialog.current?.querySelector<HTMLElement>(successScreen ? '[data-success-heading]' : 'input:not([type=checkbox])');
    target?.focus();
  }, [mode, successScreen]);

  function changeMode(next: Mode) { setMode(next); setMessage(''); setErrorCode(''); setPassword(''); setConfirm(''); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (mode === 'register' && password !== confirm) { setMessage('Passwords do not match. Please check both fields.'); setErrorCode('invalid_input'); return; }
    if (mode === 'register' && !permission) { setMessage('Please review the privacy and account information before continuing.'); setErrorCode('invalid_input'); return; }
    setPending(true); setMessage(''); setErrorCode('');
    try {
      if (mode === 'register') { await signUp(address, password, nickname, birthDate); setPassword(''); setConfirm(''); setMessage(CONFIRMATION); setMode('confirmation'); }
      else if (mode === 'forgot') { const text = await sendPasswordReset(address); setMessage(text); setMode('reset-sent'); }
      else if (mode === 'reset') { if (password !== confirm) throw new AccountActionError('invalid_input', 'Passwords do not match. Please check both fields.'); await updatePassword(password); changeMode('login'); setMessage('Your password has been updated. Sign in with your new password.'); }
      else await signIn(address, password, remember);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'We could not complete that request. Please try again.');
      setErrorCode(error instanceof AccountActionError ? error.code : 'request_failed');
    } finally { setPending(false); }
  }
  async function resend() {
    if (!resendSignupConfirmation || pending) return;
    setPending(true); setErrorCode('');
    try { setMessage(await resendSignupConfirmation(address)); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'We could not resend the email. Please try again.'); setErrorCode('request_failed'); }
    finally { setPending(false); }
  }
  const heading = successScreen ? (mode === 'confirmation' ? 'Check your email' : 'Reset your password') :
    email && !recovery ? 'My Wizpiko account' : mode === 'register' ? 'Create your account' : mode === 'forgot' ? 'Forgot your password?' : mode === 'reset' ? 'Choose a new password' : 'Welcome back!';

  return <dialog ref={dialog} className={`wa-dialog${successScreen ? ' wa-dialog-success' : ''}`} aria-labelledby="wa-dialog-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="wa-dialog-panel">
      <button type="button" className="wa-close" aria-label="Close account dialog" onClick={onClose}><X size={23}/></button>
      <div className="wa-form-side">
        <img src={import.meta.env.BASE_URL + 'wizpiko-wordmark.webp'} width="720" height="240" className="wa-wordmark" alt="Wizpiko — Think. Play. Shine."/>
        {successScreen ? <div className="wa-success-content">
          <span className="wa-success-icon" aria-hidden="true">{mode === 'confirmation' ? <Mail size={34}/> : <CheckCircle2 size={34}/>}</span>
          <h2 id="wa-dialog-title" tabIndex={-1} data-success-heading>{heading}</h2>
          <p className="wa-confirmation-copy">{mode === 'confirmation' ? CONFIRMATION : 'Check your email for a password-reset link. Open the link to choose a new password.'}</p>
          <span className="wa-confirmation-address">{address.trim()}</span>
          {message && message !== CONFIRMATION && <p className={`wa-status${errorCode ? ' wa-status-error' : ''}`} role={errorCode ? 'alert' : 'status'}>{message}</p>}
          <button type="button" className="wiz-btn-primary wa-full" onClick={() => changeMode('login')}>Back to Sign In <ArrowRight size={18}/></button>
          {mode === 'confirmation' && resendSignupConfirmation && <button type="button" className="wa-text-action" disabled={pending} onClick={() => { void resend(); }}>{pending ? 'Sending…' : 'Resend confirmation email'}</button>}
        </div> : <>
          <h2 id="wa-dialog-title">{heading}</h2>
          <p className="wa-description">{email && !recovery ? 'Your learning space is connected to your account.' : mode === 'register' ? 'Start wherever you feel comfortable. Every curious mind is welcome.' : mode === 'forgot' ? 'Enter your account email to request a password-reset link.' : mode === 'reset' ? 'Choose a strong password with at least 8 characters.' : 'Sign in to continue your lessons, games and discoveries.'}</p>
          {email && !recovery ? <>
            <div className="wa-signed"><CheckCircle2 size={22}/><div><strong>{profile?.display_name || email}</strong><small>{email}</small></div></div>
            <button type="button" className="wiz-btn-secondary wa-full" disabled={pending} onClick={() => { void signOut().then(onClose); }}>Sign out <ArrowRight size={17}/></button>
          </> : configured ? <form className="wa-form" onSubmit={event => { void submit(event); }}>
            {mode === 'register' && <>
              <label htmlFor="wa-nickname">Nickname or display name</label>
              <input id="wa-nickname" type="text" autoComplete="nickname" maxLength={40} minLength={2} required placeholder="Your learning name" value={nickname} onChange={event => setNickname(event.target.value)}/>
              <label htmlFor="wa-birth">Date of birth</label>
              <div className="wa-date"><CalendarDays size={18}/><input id="wa-birth" type="date" required max={new Date().toLocaleDateString('en-CA')} value={birthDate} onChange={event => setBirthDate(event.target.value)}/></div>
            </>}
            {mode !== 'reset' && <><label htmlFor="wa-email">Email address</label><input id="wa-email" type="email" autoComplete="email" required placeholder="you@example.com" value={address} onChange={event => setAddress(event.target.value)}/></>}
            {mode !== 'forgot' && <>
              <label htmlFor="wa-password">Password</label>
              <div className="wa-password-wrap"><input id="wa-password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'login' ? undefined : 8} value={password} onChange={event => setPassword(event.target.value)} required placeholder={mode === 'login' ? 'Your password' : 'At least 8 characters'}/><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
            </>}
            {(mode === 'register' || mode === 'reset') && <><label htmlFor="wa-confirm">Confirm password</label><input id="wa-confirm" type="password" minLength={8} required autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} placeholder="Repeat password"/></>}
            {mode === 'register' && <label className="wa-consent"><input type="checkbox" checked={permission} onChange={event => setPermission(event.target.checked)} required/><span>I have reviewed Wizpiko’s <a href={appHref('/privacy-safety')} target="_blank" rel="noopener noreferrer">Privacy & Safety</a> and <a href={appHref('/account-guide')} target="_blank" rel="noopener noreferrer">Account Guide</a>.</span></label>}
            {mode === 'login' && <div className="wa-form-tools"><label><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)}/> Remember me</label><button type="button" onClick={() => changeMode('forgot')}>Forgot password?</button></div>}
            {message && <p className={`wa-status${errorCode ? ' wa-status-error' : ''}`} role={errorCode ? 'alert' : 'status'}>{message}</p>}
            {errorCode === 'account_not_found' && <button type="button" className="wa-signup-action" onClick={() => changeMode('register')}>Create your Wizpiko account <ArrowRight size={17}/></button>}
            {errorCode === 'email_not_confirmed' && resendSignupConfirmation && <button type="button" className="wa-text-action" disabled={pending} onClick={() => { void resend(); }}>Resend confirmation email</button>}
            <button type="submit" disabled={pending} className="wiz-btn-primary wa-full"><LockKeyhole size={18}/>{pending ? 'Please wait…' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Email' : mode === 'reset' ? 'Update Password' : 'Sign In'} <ArrowRight size={17}/></button>
            {mode === 'login' ? <p className="wa-helper">Don’t have an account? <button type="button" onClick={() => changeMode('register')}>Sign Up</button></p> : <p className="wa-helper">{mode === 'register' ? 'Already have an account? ' : ''}<button type="button" onClick={() => changeMode('login')}>Back to Sign In</button></p>}
          </form> : <div className="wa-not-ready"><LockKeyhole/><strong>Sign-in is temporarily unavailable.</strong><p>Please try again a little later.</p></div>}
          <p className="wa-privacy">Sign in to keep your lessons, progress and achievements connected to your Wizpiko account.</p>
        </>}
      </div>
      {!successScreen && <div className="wa-art-side" aria-hidden="true"><img src={import.meta.env.BASE_URL + 'wizpiko-mascot.webp'} width="906" height="576" alt=""/><strong>Think. Play. Shine.</strong><p>A new discovery starts with you.</p></div>}
    </section>
  </dialog>;
}
