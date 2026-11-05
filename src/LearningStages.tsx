import { useState } from 'react';
import { ArrowRight, BookOpen, Check, Compass, GraduationCap, Info, Lightbulb, Sprout, Star } from 'lucide-react';
import { subjects } from './subjects';
import type { SubjectId } from './subjects';
import { learningStages } from './learningStagesContent';
import type { LearningStageId } from './learningStagesContent';
import './learning-stages.css';

export { learningStages } from './learningStagesContent';
export type { LearningStageId } from './learningStagesContent';
type Props = { onChooseSubject: (id: SubjectId, stage: LearningStageId) => void; onExploreSubjects: () => void };
const stageIcons = [Sprout, BookOpen, Compass, Lightbulb, GraduationCap, Star];

export function LearningStages({ onChooseSubject, onExploreSubjects }: Props) {
  const [selected, setSelected] = useState<LearningStageId>('primary');
  const stage = learningStages.find(item => item.id === selected)!;
  const ready = subjects.filter(subject => subject.status !== 'planned');
  return <section className="wz-stage-section" aria-labelledby="learning-stages-heading">
    <div className="wz-stage-heading"><p className="wz-stage-eyebrow">A starting point for every curious mind</p><h2 id="learning-stages-heading">Learning for every age</h2><p className="wz-stage-subtitle">Choose a stage, then follow your interests across subjects. Your age is never a limit.</p></div>
    <div className="wz-stage-layout">
      <div className="wz-stage-grid" role="group" aria-label="Choose a learning stage">{learningStages.map((item, index) => {
        const Icon = stageIcons[index];
        return <button key={item.id} type="button" className={`wz-stage-card wz-stage-card-${item.id}`} aria-pressed={selected === item.id} aria-controls="stage-subject-choices" onClick={() => setSelected(item.id)}><span className="wz-stage-art"><Icon size={23} aria-hidden="true" /></span><span className="wz-stage-copy"><strong>{item.title}</strong><span>{item.description}</span></span>{selected === item.id && <Check className="wz-stage-check" size={17} aria-hidden="true" />}</button>;
      })}</div>
      <section className="wz-stage-subjects" id="stage-subject-choices" aria-labelledby="stage-choice-heading"><div aria-live="polite"><span className="wz-stage-selection">{stage.title}</span><h3 id="stage-choice-heading">What would you like to explore?</h3><p>{stage.introduction}</p></div><div className="wz-stage-ready">{ready.map(subject => {
        const Icon = subject.icon;
        return <button type="button" key={subject.id} onClick={() => onChooseSubject(subject.id, stage.id)}><span className={`wz-stage-subject-icon wz-stage-${subject.id}`}><Icon size={23} aria-hidden="true" /></span><span><strong>{subject.shortName}</strong><small>{'20 questions per skill'}</small></span><ArrowRight size={17} aria-hidden="true" /></button>;
      })}</div><button className="wz-stage-explore" type="button" onClick={onExploreSubjects}>Explore all subjects <ArrowRight size={17} aria-hidden="true" /></button><p className="wz-stage-coming">Discover previews of science, technology and more in our subject collection.</p></section>
    </div>
    <p className="wz-stage-note"><Info size={18} aria-hidden="true" /><span>New to a subject? Start with the basics at any age. More activities will be added as each subject grows.</span></p>
  </section>;
}
