import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Cloud, Mail, ShieldCheck, X } from 'lucide-react';

type Props = {
  onClose: () => void;
  configured: boolean;
  email?: string;
  status: string;
  sendLink: (email: string) => Promise<void>;
  google: () => void;
  signOut: () => Promise<void>;
};
export function AccountDialog({ onClose, configured, email, status, sendLink, google, signOut }: Props) {
  const [address, setAddress] = useState('');
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(status);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) { setMessage('Please confirm you have permission to create or manage this account.'); return; }
    setPending(true);
    try { await sendLink(address.trim()); setMessage('A secure sign-in link has been sent if the address can receive mail. Check your inbox.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Sign-in could not be started.'); }
    finally { setPending(false); }
  }
  return <div className="wa-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="wa-heading" className="wa-panel">
      <button className="wa-close" aria-label="Close sign-in" onClick={onClose}><X size={22}/></button>
      <img src="/wizpiko-icon.webp" alt="" className="wa-robot" />
      <span className="wiz-kicker">LEARN TOGETHER, GROW ANYWHERE</span>
      <h2 id="wa-heading">{email ? 'My Wizpiko account' : 'Your adventure, saved!'}</h2>
      <p className="wa-description">Pick up your puzzles, levels and rewards from another device with a secure Wizpiko account.</p>
      {email ? <>
        <div className="wa-signed"><ShieldCheck size={21}/><div><strong>{email}</strong><small>Your learning progress is connected to your account.</small></div></div>
        <button className="wiz-btn-secondary wa-full" onClick={() => { void signOut().then(onClose); }}>Sign out <ArrowRight size={18}/></button>
      </> : configured ? <>
        <form onSubmit={event => { void submit(event); }} className="wa-form">
          <label htmlFor="wiz-email">Email address</label>
          <input id="wiz-email" type="email" required autoComplete="email" placeholder="parent@example.com" value={address} onChange={event => setAddress(event.target.value)}/>
          <label className="wa-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} required/><span>I am a parent/guardian or have the necessary permission for this learner's account.</span></label>
          <button type="submit" className="wiz-btn-primary wa-full" disabled={pending}><Mail size={18}/>{pending ? 'Sending…' : 'Email me a sign-in link'}</button>
        </form>
        <div className="wa-or">or</div>
        <button className="wiz-btn-secondary wa-full" onClick={() => { if (!consent) { setMessage('Please confirm permission above before continuing.'); return; } google(); }}>Continue with Google</button>
      </> : <div className="wa-not-ready"><Cloud size={24}/><strong>Account service setup is pending</strong><p>The site administrator needs to connect Supabase before sign-in can be activated. Guest practice remains available, with progress saved in this browser.</p></div>}
      <p className="wa-status" role="status">{message}</p>
      <p className="wa-privacy">Please avoid using a child's personal information without the required parent or guardian consent. We do not need students' addresses, birth dates or phone numbers for practice.</p>
    </section>
  </div>;
}
