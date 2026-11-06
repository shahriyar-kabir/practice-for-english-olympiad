import { INFO_ROUTES, appHref } from './routes';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { infoNavigation, infoPages, infoUiCopy, supportFaqs } from './content/siteCopy';
import type { CopyLink, InfoPageId } from './content/siteCopy';
import './info-pages.css';

export type { InfoPageId } from './content/siteCopy';

type Props = {
  page: InfoPageId;
  onNavigate?: (page:InfoPageId)=>void;
  onHome: () => void;
  onContact: () => void;
  onSignIn: () => void;
};

export default function InfoPages({ page, onNavigate, onHome, onContact, onSignIn }: Props) {
  const [activePage, setActivePage] = useState<InfoPageId>(page);
  const heading = useRef<HTMLHeadingElement>(null);
  const copy = infoPages[activePage];

  useEffect(() => { setActivePage(page); }, [page]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    heading.current?.focus({ preventScroll: true });
  }, [activePage]);

  function followLink(target: CopyLink['target']) {
    if (target === 'contact') onContact();
    else if (target === 'sign-in') onSignIn();
    else if (target === activePage) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      heading.current?.focus({ preventScroll: true });
    } else {setActivePage(target);onNavigate?.(target);}
  }

  function renderLink(link: CopyLink) {
    return <button key={`${link.target}-${link.label}`} className="wz-info-text-link" type="button" onClick={() => followLink(link.target)}>
      {link.label}<ArrowRight size={17} aria-hidden="true" />
    </button>;
  }

  return <section className="wz-info-page" aria-labelledby="wz-info-title">
    <button className="wz-info-back" type="button" onClick={onHome}><ArrowLeft size={18} aria-hidden="true" />{infoUiCopy.backHome}</button>
    <nav className="wz-info-navigation" aria-label={infoUiCopy.navigationLabel}>
      {infoNavigation.map(item => <a href={appHref(INFO_ROUTES[item.id])} key={item.id} aria-current={activePage === item.id ? 'page' : undefined} onClick={event=>{if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey){event.preventDefault();followLink(item.id);}}}>{item.label}</a>)}
    </nav>
    <header className="wz-info-hero">
      <p className="wz-info-eyebrow">{copy.eyebrow}</p>
      <h1 id="wz-info-title" ref={heading} tabIndex={-1}>{copy.title}</h1>
      <p className="wz-info-intro">{copy.intro}</p>
    </header>

    <div className="wz-info-sections">
      {copy.sections.map(section => <section className="wz-info-card" key={section.id} aria-labelledby={`wz-info-${activePage}-${section.id}`}>
        <h2 id={`wz-info-${activePage}-${section.id}`}>{section.title}</h2>
        {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        {section.bullets && <ul>{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
        {section.links && <div className="wz-info-links">{section.links.map(renderLink)}</div>}
      </section>)}

      {copy.showFaqs && <section className="wz-info-card wz-info-faqs" aria-labelledby="wz-info-faq-title">
        <h2 id="wz-info-faq-title">{infoUiCopy.faqTitle}</h2>
        <p>{infoUiCopy.faqIntro}</p>
        <div className="wz-info-faq-list">{supportFaqs.map(faq => <details key={faq.id}>
          <summary>{faq.question}<ChevronDown size={19} aria-hidden="true" /></summary>
          <div className="wz-info-faq-answer">{faq.answer.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{faq.link && <div className="wz-info-links">{renderLink(faq.link)}</div>}</div>
        </details>)}</div>
      </section>}

      <aside className="wz-info-help-card" aria-labelledby="wz-info-help-title">
        <div><h2 id="wz-info-help-title">{infoUiCopy.contactTitle}</h2><p>{infoUiCopy.contactDescription}</p></div>
        <button className="wz-info-primary" type="button" onClick={onContact}>{infoUiCopy.contactButton}<ArrowRight size={18} aria-hidden="true" /></button>
      </aside>
    </div>

    <div className="wz-info-actions">
      <button className="wz-info-primary" type="button" onClick={onHome}>{infoUiCopy.finishButton}</button>
      <button className="wz-info-secondary" type="button" onClick={onSignIn}>{infoUiCopy.signInButton}<ArrowRight size={17} aria-hidden="true" /></button>
    </div>
  </section>;
}
