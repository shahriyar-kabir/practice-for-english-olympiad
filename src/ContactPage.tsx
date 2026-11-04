import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, Mail } from 'lucide-react';
import { contactCopy } from './content/siteCopy';
import { submitContact } from './supportApi';
import './info-pages.css';

type Props = { onHome: () => void; onPrivacy: () => void };
type ContactFields = { name: string; email: string; suggestion: string; website: string };
type FieldName = 'name' | 'email' | 'suggestion';
const emptyFields = (): ContactFields => ({ name: '', email: '', suggestion: '', website: '' });

export default function ContactPage({ onHome, onPrivacy }: Props) {
  const [fields, setFields] = useState<ContactFields>(emptyFields);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const failureRef = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    titleRef.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => { if (submitted) successRef.current?.focus(); }, [submitted]);
  useEffect(() => { if (failure) failureRef.current?.focus(); }, [failure]);

  function update(name: keyof ContactFields, value: string) {
    setFields(previous => ({ ...previous, [name]: value }));
    if (name !== 'website') setErrors(previous => ({ ...previous, [name]: undefined }));
    setFailure('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const name = fields.name.trim();
    const email = fields.email.trim();
    const suggestion = fields.suggestion.trim();
    const invalid: Partial<Record<FieldName, string>> = {};
    if (name.length < 1 || name.length > 100) invalid.name = contactCopy.nameError;
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) invalid.email = contactCopy.emailError;
    if (suggestion.length < 10 || suggestion.length > 5000) invalid.suggestion = contactCopy.suggestionError;
    setErrors(invalid);
    setFailure('');
    if (Object.keys(invalid).length) {
      if (invalid.name) nameRef.current?.focus();
      else if (invalid.email) emailRef.current?.focus();
      else suggestionRef.current?.focus();
      return;
    }
    setPending(true);
    try {
      await submitContact({ name, email, suggestion, website: fields.website });
      setSubmitted(true);
    } catch (error) {
      setFailure(error instanceof Error && error.message ? error.message : contactCopy.failure);
    } finally {
      setPending(false);
    }
  }

  function anotherMessage() {
    setSubmitted(false);
    setFields(emptyFields());
    setErrors({});
    setFailure('');
    window.requestAnimationFrame(() => nameRef.current?.focus());
  }

  const invalidForm = Object.values(errors).some(Boolean);

  return <section className="wz-info-page wz-contact-page" aria-labelledby="wz-contact-title">
    <button className="wz-info-back" type="button" onClick={onHome}><ArrowLeft size={18} aria-hidden="true" />{contactCopy.backHome}</button>
    <header className="wz-info-hero">
      <p className="wz-info-eyebrow">{contactCopy.eyebrow}</p>
      <h1 id="wz-contact-title" ref={titleRef} tabIndex={-1}>{contactCopy.title}</h1>
      <p className="wz-info-intro">{contactCopy.intro}</p>
    </header>
    <div className="wz-contact-layout">
      {submitted ? <div className="wz-info-card wz-contact-success" role="status">
        <CheckCircle2 size={45} aria-hidden="true" />
        <h2 tabIndex={-1} ref={successRef}>{contactCopy.successTitle}</h2>
        <p>{contactCopy.successDescription}</p>
        <div className="wz-contact-success-actions"><button type="button" className="wz-info-primary" onClick={anotherMessage}>{contactCopy.anotherMessage}</button><button type="button" className="wz-info-secondary" onClick={onHome}>{contactCopy.backHome}</button></div>
      </div> : <form className="wz-info-card wz-contact-form" onSubmit={event => { void submit(event); }} noValidate aria-busy={pending} aria-labelledby="wz-contact-form-title">
        <h2 id="wz-contact-form-title">{contactCopy.formTitle}</h2>
        {invalidForm && <p className="wz-contact-summary" role="alert">{contactCopy.validationSummary}</p>}
        <fieldset disabled={pending}>
          <div className="wz-contact-field">
            <label htmlFor="wz-contact-name">{contactCopy.nameLabel}</label>
            <p id="wz-contact-name-hint" className="wz-contact-hint">{contactCopy.nameHint}</p>
            <input ref={nameRef} id="wz-contact-name" name="name" autoComplete="name" type="text" maxLength={100} required value={fields.name} onChange={event => update('name', event.target.value)} placeholder={contactCopy.namePlaceholder} aria-invalid={!!errors.name} aria-describedby={`wz-contact-name-hint${errors.name ? ' wz-contact-name-error' : ''}`} />
            {errors.name && <p id="wz-contact-name-error" className="wz-contact-field-error">{errors.name}</p>}
          </div>
          <div className="wz-contact-field">
            <label htmlFor="wz-contact-email">{contactCopy.emailLabel}</label>
            <p id="wz-contact-email-hint" className="wz-contact-hint">{contactCopy.emailHint}</p>
            <input ref={emailRef} id="wz-contact-email" name="email" autoComplete="email" type="email" inputMode="email" maxLength={254} required value={fields.email} onChange={event => update('email', event.target.value)} placeholder={contactCopy.emailPlaceholder} aria-invalid={!!errors.email} aria-describedby={`wz-contact-email-hint${errors.email ? ' wz-contact-email-error' : ''}`} />
            {errors.email && <p id="wz-contact-email-error" className="wz-contact-field-error">{errors.email}</p>}
          </div>
          <div className="wz-contact-field">
            <label htmlFor="wz-contact-suggestion">{contactCopy.suggestionLabel}</label>
            <p id="wz-contact-suggestion-hint" className="wz-contact-hint">{contactCopy.suggestionHint}</p>
            <textarea ref={suggestionRef} id="wz-contact-suggestion" name="suggestion" rows={7} minLength={10} maxLength={5000} required value={fields.suggestion} onChange={event => update('suggestion', event.target.value)} placeholder={contactCopy.suggestionPlaceholder} aria-invalid={!!errors.suggestion} aria-describedby={`wz-contact-suggestion-hint${errors.suggestion ? ' wz-contact-suggestion-error' : ''}`} />
            {errors.suggestion && <p id="wz-contact-suggestion-error" className="wz-contact-field-error">{errors.suggestion}</p>}
          </div>
          <div className="wz-contact-honeypot" aria-hidden="true"><label htmlFor="wz-contact-website">{contactCopy.honeypotLabel}</label><input id="wz-contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={fields.website} onChange={event => update('website', event.target.value)} /></div>
          <p className="wz-contact-privacy">{contactCopy.privacyNote}</p>
          <button type="button" className="wz-info-text-link" onClick={onPrivacy}>{contactCopy.privacyButton}<ArrowRight size={17} aria-hidden="true" /></button>
          <div className="wz-contact-submit"><button className="wz-info-primary" type="submit" disabled={pending}>{pending ? <><LoaderCircle className="wz-contact-loading" size={19} aria-hidden="true" />{contactCopy.submitting}</> : <>{contactCopy.submitButton}<ArrowRight size={18} aria-hidden="true" /></>}</button></div>
        </fieldset>
        {failure && <p ref={failureRef} tabIndex={-1} className="wz-contact-summary" role="alert">{failure}</p>}
      </form>}
      <aside className="wz-contact-aside">
        <div className="wz-info-card"><Mail size={26} aria-hidden="true" /><h2>{contactCopy.supportTitle}</h2><p>{contactCopy.supportDescription}</p></div>
        <div className="wz-info-card"><h2>{contactCopy.expectationsTitle}</h2><p>{contactCopy.expectationsDescription}</p><p>{contactCopy.accountHint}</p></div>
      </aside>
    </div>
    <div className="wz-info-actions"><button className="wz-info-secondary" type="button" onClick={onHome}><ArrowLeft size={17} aria-hidden="true" />{contactCopy.backHome}</button></div>
  </section>;
}
