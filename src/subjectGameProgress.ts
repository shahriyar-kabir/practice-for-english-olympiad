/** Shared five-question game progress; subject IDs keep libraries independent. */
export type SubjectGameQuestion = {
  id: string; prompt: string; choices: string[]; answer: string;
  explanation: string; hint: string; topic: string;
};
export type SubjectGameSession = {
  id: string; level: string; questions: SubjectGameQuestion[];
  index: number; answers: Record<number, string>; hints: number[];
  startedAt: number; updatedAt: number;
};
export type SubjectGameProgress = {
  level: string; best: Record<string, number>; session?: SubjectGameSession;
  /** Paused, unfinished rounds by level. The active round remains in session. */
  pausedSessions?: Record<string, SubjectGameSession>; updatedAt: number;
};
export type SubjectGamesProgress = Record<string, SubjectGameProgress>;
export const SUBJECT_ROUND_SIZE = 5;
export const SUBJECT_PASS_CORRECT = 4;
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const stamp = (v: unknown) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 ? v : 0;
const text = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

/** Decimal strings avoid the precision limit of numeric level counters. */
export function gameLevel(value: unknown): string {
  const raw = typeof value === 'string' ? value.trim() : typeof value === 'number' && Number.isSafeInteger(value) ? String(value) : '';
  if (!/^\d+$/.test(raw)) return '1';
  return raw.replace(/^0+/, '') || '1';
}
export function compareGameLevels(a: string, b: string): number {
  const left = gameLevel(a), right = gameLevel(b);
  return left.length === right.length ? (left < right ? -1 : left > right ? 1 : 0) : left.length < right.length ? -1 : 1;
}
export function nextGameLevel(value: string): string {
  const digits = gameLevel(value).split('');
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] !== '9') { digits[i] = String(Number(digits[i]) + 1); return digits.join(''); }
    digits[i] = '0';
  }
  return '1' + digits.join('');
}
export const formatGameLevel = (level: string) => gameLevel(level).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
export const subjectRoundId = (subject: string, attempt: string) => `subject-game:${subject}:${attempt}`;

function readQuestion(value: unknown): SubjectGameQuestion | null {
  if (!object(value) || !text(value.id, 120) || !text(value.prompt, 2000) || !text(value.answer, 200) ||
      !text(value.explanation, 4000) || !text(value.hint, 2000) || !text(value.topic, 120) || !Array.isArray(value.choices) ||
      value.choices.length < 2 || value.choices.length > 6 || !value.choices.every(choice => text(choice, 200))) return null;
  const choices = value.choices as string[];
  if (new Set(choices).size !== choices.length || !choices.includes(value.answer)) return null;
  return { id: value.id, prompt: value.prompt, choices: [...choices], answer: value.answer,
    explanation: value.explanation, hint: value.hint, topic: value.topic };
}
function readSession(value: unknown): SubjectGameSession | undefined {
  if (!object(value) || !text(value.id, 120) || !Array.isArray(value.questions) || value.questions.length !== SUBJECT_ROUND_SIZE) return;
  const questions = value.questions.map(readQuestion);
  if (questions.some(question => !question) || new Set(questions.map(question => question!.id)).size !== SUBJECT_ROUND_SIZE) return;
  const validQuestions = questions as SubjectGameQuestion[];
  const answers: Record<number, string> = {};
  if (object(value.answers)) for (const [key, answer] of Object.entries(value.answers)) {
    const index = Number(key);
    if (/^[0-4]$/.test(key) && typeof answer === 'string' && validQuestions[index].choices.includes(answer)) answers[index] = answer;
  }
  const index = typeof value.index === 'number' && Number.isInteger(value.index) ? Math.max(0, Math.min(4, value.index)) : 0;
  const hints = Array.isArray(value.hints) ? [...new Set(value.hints.filter((i): i is number => Number.isInteger(i) && i >= 0 && i < SUBJECT_ROUND_SIZE))] : [];
  return { id: value.id, level: gameLevel(value.level), questions: validQuestions, answers, index, hints,
    startedAt: stamp(value.startedAt), updatedAt: stamp(value.updatedAt) };
}
export function readSubjectGame(value: unknown): SubjectGameProgress {
  if (!object(value)) return { level: '1', best: {}, updatedAt: 0 };
  const best: Record<string, number> = {};
  if (object(value.best)) for (const [level, score] of Object.entries(value.best)) {
    if (!/^\d+$/.test(level) || !/[1-9]/.test(level) || typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > SUBJECT_ROUND_SIZE) continue;
    const key = gameLevel(level);
    best[key] = Math.max(best[key] ?? 0, score);
  }
  const session=readSession(value.session);
  const pausedSessions: Record<string,SubjectGameSession>={};
  if(object(value.pausedSessions)) for(const [key,raw] of Object.entries(value.pausedSessions)){
    if(!/^[1-9]\d*$/.test(key))continue;
    const candidate=readSession(raw);
    if(!candidate||candidate.level!==key||candidate.id===session?.id)continue;
    pausedSessions[key]=candidate;
  }
  return { level: gameLevel(value.level), best, session, pausedSessions, updatedAt: stamp(value.updatedAt) };
}
export function subjectGameStats(value: unknown) {
  const progress = readSubjectGame(value), scores = Object.values(progress.best);
  const highest = Object.keys(progress.best).reduce((a, b) => compareGameLevels(a, b) >= 0 ? a : b, '1');
  return { level: progress.session?.level || progress.level, practised: scores.length,
    passed: scores.filter(score => score >= SUBJECT_PASS_CORRECT).length,
    xp: scores.reduce((sum, score) => sum + score * 2, 0), highest,
    correct: scores.reduce((sum, score) => sum + score, 0), total: scores.length * SUBJECT_ROUND_SIZE };
}
export function allSubjectGameStats(value: unknown) {
  const entries = object(value) ? Object.values(value).map(subjectGameStats) : [];
  return entries.reduce((sum, item) => ({ xp: sum.xp + item.xp, practised: sum.practised + item.practised, passed: sum.passed + item.passed }), { xp: 0, practised: 0, passed: 0 });
}
export function startSubjectRound(value: unknown, level: string, questions: SubjectGameQuestion[], now = Date.now(), id?: string): SubjectGameProgress {
  const progress = readSubjectGame(value), target = gameLevel(level);
  if(progress.session?.level===target)return progress;
  const attempt = id || globalThis.crypto?.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`;
  // Reopening a paused level restores its exact generated questions and checked answers.
  const resumed=progress.pausedSessions?.[target];
  const session=resumed||readSession({id:attempt,level:target,questions,answers:{},hints:[],index:0,startedAt:now,updatedAt:now});
  if(!session)throw new Error('This round could not be prepared. Please try again.');
  const pausedSessions={...progress.pausedSessions};
  if(progress.session)pausedSessions[progress.session.level]=progress.session;
  delete pausedSessions[target];
  // Exploring an earlier level must never reset the learner's highest unlocked level.
  const highest=compareGameLevels(progress.level,target)>=0?progress.level:target;
  return {...progress,level:highest,session,pausedSessions,updatedAt:now};
}
export function answerSubjectRound(value: SubjectGameProgress, choice: string, now = Date.now()): SubjectGameProgress {
  const session = value.session;
  if (!session || session.answers[session.index] !== undefined || !session.questions[session.index].choices.includes(choice)) return value;
  return { ...value, updatedAt: now, session: { ...session, answers: { ...session.answers, [session.index]: choice }, updatedAt: now } };
}
export function advanceSubjectRound(value: SubjectGameProgress, now = Date.now()): SubjectGameProgress {
  if (!value.session) return value;
  const missing = value.session.questions.map((_, i) => i).filter(i => value.session!.answers[i] === undefined);
  const index = missing.find(i => i > value.session!.index) ?? missing[0] ?? value.session.index;
  return { ...value, session: { ...value.session, index, updatedAt: now }, updatedAt: now };
}
export function finishSubjectRound(value: SubjectGameProgress, now = Date.now()) {
  const session = value.session;
  if (!session || session.questions.some((_, i) => session.answers[i] === undefined)) return null;
  const correct = session.questions.filter((q, i) => q.answer === session.answers[i]).length;
  const previous = value.best[session.level] ?? 0, best = Math.max(previous, correct);
  const result = { level: session.level, correct, total: SUBJECT_ROUND_SIZE,
    xp: (best - previous) * 2, passed: correct >= SUBJECT_PASS_CORRECT, attempt: session.id,
    questions: session.questions, answers: session.answers };
  const advanced=result.passed?nextGameLevel(session.level):session.level;
  const highest=compareGameLevels(value.level,advanced)>=0?value.level:advanced;
  const pausedSessions={...value.pausedSessions};
  delete pausedSessions[session.level];
  const progress: SubjectGameProgress = {level:highest,
    best:{...value.best,[session.level]:best},pausedSessions,updatedAt:now};
  return { progress, result };
}

/** Preserve separate subjects, best scores and untimed drafts across devices. */
export function mergeSubjectGames(local: unknown, cloud: unknown, completed: Set<string>): SubjectGamesProgress {
  const a = object(local) ? local : {}, b = object(cloud) ? cloud : {};
  const output: SubjectGamesProgress = {};
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (!/^[a-z][a-z0-9-]{0,39}$/.test(id) || ['constructor', 'prototype', '__proto__'].includes(id)) continue;
    const left = readSubjectGame(a[id]), right = readSubjectGame(b[id]);
    const primary = left.updatedAt >= right.updatedAt ? left : right;
    const best = { ...right.best };
    for (const [level, score] of Object.entries(left.best)) best[level] = Math.max(best[level] ?? 0, score);
    // Merge active and parked sessions, without resurrecting completed attempts.
    const candidates=[left.session,right.session,...Object.values(left.pausedSessions||{}),...Object.values(right.pausedSessions||{})]
      .filter((entry):entry is SubjectGameSession=>!!entry&&!completed.has(subjectRoundId(id,entry.id)))
      .sort((a,b)=>b.updatedAt-a.updatedAt||b.startedAt-a.startedAt);
    const byLevel=new Map<string,SubjectGameSession>();
    for(const draft of candidates){
      const current=byLevel.get(draft.level);
      if(!current){byLevel.set(draft.level,draft);continue;}
      if(current.id===draft.id&&JSON.stringify(current.questions)===JSON.stringify(draft.questions)){
        byLevel.set(draft.level,{...draft,...current,answers:{...draft.answers,...current.answers},hints:[...new Set([...draft.hints,...current.hints])]});
      }
      // Different attempts for the same level: newest wins. Different levels are preserved.
    }
    const preferred=[primary.session,(primary===left?right:left).session].find(candidate=>candidate&&byLevel.get(candidate.level)?.id===candidate.id);
    const session=preferred?byLevel.get(preferred.level):undefined;
    const pausedSessions:Record<string,SubjectGameSession>={};
    for(const [level,draft] of byLevel)if(draft.id!==session?.id)pausedSessions[level]=draft;
    const highest=compareGameLevels(left.level,right.level)>=0?left.level:right.level;
    output[id]={...primary,level:highest,best,session,pausedSessions};
  }
  return output;
}
