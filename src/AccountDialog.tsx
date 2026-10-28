import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Cloud, Mail, ShieldCheck, X } from 'lucide-react';

type Props = {
  onClose: () => void;
  configured: boolean;
  email?: string;
  status: string;
  sendLink: (email: string) => Promise<void>;
  verifyEmailCode: (email: string, code: string) => Promise<void>;
  google: () => void;
  signOut: () => Promise<void>;
};
export function AccountDialog({ onClose, configured, email, status, sendLink, verifyEmailCode, google, signOut }: Props) {
  const [address, setAddress] = useState('');
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(status);
  const [emailSent, setEmailSent] = useState(false);
  const [code, setCode] = useState('');
  useEffect(() => { setMessage(status); }, [status]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) { setMessage('Please confirm you have permission to create or manage this account.'); return; }
    setPending(true);
    try { await sendLink(address.trim()); setEmailSent(true); setMessage('Email sent. Use its one-time link, or enter the code if your email contains one.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Sign-in could not be started.'); }
    finally { setPending(false); }
  }
  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try { await verifyEmailCode(address.trim(), code.trim()); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'The sign-in code could not be verified.'); setPending(false); }
  }
  return <div className="wa-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="wa-heading" className="wa-panel">
      <button className="wa-close" aria-label="Close sign-in" onClick={onClose}><X size={22}/></button>
      <img src="/wizpiko-icon.webp" alt="" className="wa-robot" />
      <span className="wiz-kicker">LEARN TOGETHER, GROW ANYWHERE</span>
      <h2 id="wa-heading">{email ? 'My Wizpiko account' : 'Your adventure, saved!'}</h2>
      <p className="wa-description">Pick up your puzzles, levels and rewards from another device with a secure Wizpiko account.</p>
      {email ? <>
        <div className="wa-signed"><ShieldCheck size={21}/><div><strong>{email}</strong><small>Signed in. Check the cloud save status below.</small></div></div>
        <button className="wiz-btn-secondary wa-full" onClick={() => { void signOut().then(onClose); }}>Sign out <ArrowRight size={18}/></button>
      </> : configured ? <>
        <form onSubmit={event => { void submit(event); }} className="wa-form">
          <label htmlFor="wiz-email">Email address</label>
          <input id="wiz-email" type="email" required autoComplete="email" placeholder="parent@example.com" value={address} onChange={event => setAddress(event.target.value)}/>
          <label className="wa-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} required/><span>I am a parent/guardian or have the necessary permission for this learner's account.</span></label>
          <button type="submit" className="wiz-btn-primary wa-full" disabled={pending}><Mail size={18}/>{pending ? 'Sending…' : 'Email me a sign-in link'}</button>
        </form>
        {emailSent && <div className="wa-code-panel">
          <strong>Having trouble with the link?</strong>
          <p>You can enter a one-time code if the sign-in email includes one. Your project administrator can enable codes in the Supabase Magic Link email template.</p>
          <form onSubmit={event => { void submitCode(event); }} className="wa-form">
            <label htmlFor="wiz-code">One-time email code</label>
            <input id="wiz-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" minLength={6} maxLength={8} value={code} onChange={event => setCode(event.target.value.replace(/[^0-9]/g, ''))} placeholder="Code from your email" required />
            <button className="wiz-btn-primary wa-full" type="submit" disabled={pending || code.length < 6}>Verify email code</button>
          </form>
        </div>}
        <div className="wa-or">or</div>
        <button className="wiz-btn-secondary wa-full" onClick={() => { if (!consent) { setMessage('Please confirm permission above before continuing.'); return; } google(); }}>Continue with Google</button>
      </> : <div className="wa-not-ready"><Cloud size={24}/><strong>Account service setup is pending</strong><p>The site administrator needs to connect Supabase before sign-in can be activated. Guest practice remains available, with progress saved in this browser.</p></div>}
      <p className="wa-status" role="status">{message}</p>
      <p className="wa-privacy">Please avoid using a child's personal information without the required parent or guardian consent. We do not need students' addresses, birth dates or phone numbers for practice.</p>
    </section>
  </div>;
}
