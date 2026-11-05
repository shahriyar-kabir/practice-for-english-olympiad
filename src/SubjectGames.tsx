import { lazy, Suspense } from 'react';
import { gameSubjects } from './gameSubjects';
import type { GameSubjectId, SubjectGameScreenProps } from './gameSubjects';

const screens = Object.fromEntries(gameSubjects.map(subject => [subject.id, lazy(subject.load)]));
export default function SubjectGames({ subject, ...props }: SubjectGameScreenProps & { subject: GameSubjectId }) {
  const Screen = screens[subject];
  return <Suspense fallback={<div className="wz-page-loading" role="status">Preparing your game…</div>}><Screen {...props} /></Suspense>;
}
