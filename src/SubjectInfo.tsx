import { ArrowLeft, ArrowRight, Info, Lightbulb, Sparkles } from 'lucide-react';
import { findSubject } from './subjects';
import type { SubjectId } from './subjects';
import { subjectCopy } from './content/subjectCopy';
import './subject-info.css';

type Props = { subject: string; onSubjects: () => void; onHome: () => void; onContact: () => void; onOpen: (id: SubjectId) => void };
export default function SubjectInfo({ subject: value, onSubjects, onHome, onContact, onOpen }: Props) {
  const subject = findSubject(value), copy = subject ? subjectCopy[subject.id] : null;
  const Icon = subject?.icon || Sparkles;
  const planned = !subject || subject.status === 'planned';
  return <article className={`si-page si-${subject?.color || 'more'}`}>
    <button className="si-back" type="button" onClick={onSubjects}><ArrowLeft size={17} /> All subjects</button>
    <header className="si-hero"><div><span className="si-kicker">{planned ? 'SUBJECT PREVIEW · IN DEVELOPMENT' : 'EXPLORE A SUBJECT'}</span><h1>{subject?.name || value || 'More subjects'}</h1><h2>{copy?.heading || 'A new interest. A new place to begin.'}</h2><p>{copy?.introduction || 'Our subject library is growing. You can explore the subjects on the homepage or suggest a topic you would like us to add.'}</p></div><span className="si-hero-icon" aria-hidden="true"><Icon size={76} strokeWidth={1.5} /></span></header>
    {copy && <><section className="si-topics" aria-labelledby="subject-topics"><h2 id="subject-topics">What this subject explores</h2><div>{copy.topics.map(([title, text], index) => <section key={title}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></section>)}</div></section><aside className="si-curiosity"><Lightbulb size={24} /><div><h2>A little idea to take with you</h2><p>{copy.takeaway}</p></div></aside></>}
    <section className="si-status"><Info size={23} /><div><h2>{planned ? 'What is coming to Wizpiko?' : 'What you can explore today'}</h2><p>{copy?.activities || 'This topic is not available as a learning activity yet. New subjects will appear here when they are published.'}</p><div className="si-actions">{subject && !planned && <button className="si-primary" type="button" onClick={() => onOpen(subject.id)}>{`Explore ${subject.shortName}`} <ArrowRight size={17} /></button>}<button className={planned ? 'si-primary' : 'si-secondary'} type="button" onClick={onSubjects}>Explore all subjects <ArrowRight size={17} /></button><button className="si-secondary" type="button" onClick={onContact}>Suggest a topic</button></div></div></section>
    <button type="button" className="si-home" onClick={onHome}>Back to home</button>
  </article>;
}
