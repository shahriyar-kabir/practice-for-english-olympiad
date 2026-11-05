import { Atom, BookOpen, BrainCircuit, Calculator, Code2, FlaskConical, Globe2 } from 'lucide-react';

/** One catalogue controls homepage cards, stage choices and subject information routes. */
export const subjects = [
  { id: 'english', name: 'English Practice', shortName: 'English', description: 'Read, play, practise and build language skills.', icon: BookOpen, color: 'english', status: 'available' },
  { id: 'maths', name: 'Mathematics', shortName: 'Maths', description: 'Numbers, patterns and problem-solving adventures.', icon: Calculator, color: 'math', status: 'available' },
  { id: 'physics', name: 'Physics', shortName: 'Physics', description: 'Explore motion, energy and the way things work.', icon: Atom, color: 'physics', status: 'planned' },
  { id: 'science', name: 'Science', shortName: 'Science', description: 'Discover the world through questions and curiosity.', icon: FlaskConical, color: 'science', status: 'planned' },
  { id: 'chemistry', name: 'Chemistry', shortName: 'Chemistry', description: 'Discover elements, reactions and everyday materials.', icon: FlaskConical, color: 'chemistry', status: 'planned' },
  { id: 'informatics', name: 'Informatics', shortName: 'Informatics', description: 'Build logical thinking and coding confidence.', icon: Code2, color: 'informatics', status: 'planned' },
  { id: 'ai', name: 'Artificial Intelligence', shortName: 'AI', description: 'Explore creative ideas and future technology.', icon: BrainCircuit, color: 'ai', status: 'planned' },
  { id: 'more', name: 'And More', shortName: 'More subjects', description: 'More ways to discover, create and understand.', icon: Globe2, color: 'more', status: 'planned' },
] as const;
export type SubjectId = typeof subjects[number]['id'];
export function findSubject(value: string) {
  const query = value.trim().toLowerCase();
  return subjects.find(subject => [subject.id, subject.name.toLowerCase(), subject.shortName.toLowerCase()].includes(query));
}
export function isSubjectId(value: string): value is SubjectId {
  return subjects.some(subject => subject.id === value);
}
export function subjectInfoPath(value: string) {
  const subject = findSubject(value);
  return subject ? '/subjects/' + subject.id : '/coming-soon?subject=' + encodeURIComponent(value.slice(0, 80));
}
