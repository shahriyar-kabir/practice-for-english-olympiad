import { EnglishJourney } from './EnglishJourney';
import type { SubjectGameScreenProps } from './gameSubjects';

export default function EnglishGamesScreen(props: SubjectGameScreenProps) {
  return <EnglishJourney {...props} homeLabel="All games" />;
}
