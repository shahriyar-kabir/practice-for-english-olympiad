import { ArrowRight, Info } from 'lucide-react';
import './learning-stages.css';

export const learningStages = [
  { id: 'early-years', title: 'KG & Early Years', description: 'First discoveries through play', recommendedCategory: 'beginners' },
  { id: 'primary', title: 'Primary', description: 'Build foundations with fun activities', recommendedCategory: 'kids' },
  { id: 'middle-school', title: 'Middle School', description: 'Explore ideas and make connections', recommendedCategory: 'juniors' },
  { id: 'secondary', title: 'Secondary & Higher Secondary', description: 'Grow skills and take on new challenges', recommendedCategory: 'high-flyers' },
  { id: 'college-university', title: 'College & University', description: 'Discover new possibilities', recommendedCategory: 'seniors' },
  { id: 'lifelong-learners', title: 'Adults & Lifelong Learners', description: 'Stay curious. Keep learning.', recommendedCategory: null },
] as const;

export type LearningStageId = (typeof learningStages)[number]['id'];

type Props = {
  onChooseStage: (id: LearningStageId) => void;
  onPractice: () => void;
};

const iconSheet = `${import.meta.env.BASE_URL}learning-stage-icons.png`;
const iconPositions = ['0% 0%', '50% 0%', '100% 0%', '0% 100%', '50% 100%', '100% 100%'];

export function LearningStages({ onChooseStage, onPractice }: Props) {
  return <section className="wz-stage-section" aria-labelledby="learning-stages-heading">
    <div className="wz-stage-heading">
      <p className="wz-stage-eyebrow">For every curious mind</p>
      <h2 id="learning-stages-heading">Learning for every age</h2>
      <p className="wz-stage-subtitle">From first discoveries to lifelong interests, find something you enjoy. Start wherever you feel comfortable.</p>
    </div>
    <div className="wz-stage-grid">
      {learningStages.map((stage, index) => <button
        key={stage.id}
        type="button"
        className={`wz-stage-card wz-stage-card-${stage.id}`}
        onClick={() => onChooseStage(stage.id)}
        aria-labelledby={`learning-stage-${stage.id}`}
        aria-describedby={`learning-stage-description-${stage.id}`}
      >
        <span className="wz-stage-art" aria-hidden="true">
          <span className="wz-stage-sprite" style={{ backgroundImage: `url("${iconSheet}")`, backgroundPosition: iconPositions[index] }} />
        </span>
        <span className="wz-stage-copy">
          <strong id={`learning-stage-${stage.id}`}>{stage.title}</strong>
          <span id={`learning-stage-description-${stage.id}`}>{stage.description}</span>
        </span>
        <ArrowRight className="wz-stage-arrow" size={26} strokeWidth={2.3} aria-hidden="true" />
      </button>)}
    </div>
    <div className="wz-stage-footer">
      <p className="wz-stage-note"><Info size={26} strokeWidth={2} aria-hidden="true" /><span>New to a subject? You can start with the basics at any age.</span></p>
      <button className="wz-stage-explore" type="button" onClick={onPractice}>Explore learning <ArrowRight size={26} strokeWidth={2.5} aria-hidden="true" /></button>
    </div>
  </section>;
}
