import type { AcademyLevel, AcademySkill } from './learningTypes';

export type LearnerProfile = {
  display_name: string;
  birth_date: string | null;
  avatar: 'girl' | 'boy' | 'robot' | 'panda' | 'cat';
  preferences: {
    sound?: boolean;
    animation?: boolean;
    learning_tips?: boolean;
    learning_level?: AcademyLevel;
    reduced_motion?: boolean;
    favorite_skills?: AcademySkill[];
  };
};
export function ageFromBirthdate(date: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const birth = new Date(date + 'T00:00:00Z');
  if (Number.isNaN(birth.getTime()) || birth.toISOString().slice(0, 10) !== date) return null;
  const now = new Date();
  if (date > dayKey(now)) return null;
  let age = now.getFullYear() - birth.getUTCFullYear();
  if (now.getMonth() < birth.getUTCMonth() || (now.getMonth() === birth.getUTCMonth() && now.getDate() < birth.getUTCDate())) age--;
  return age >= 0 && age <= 120 ? age : null;
}
export function ageLabel(age: number | null): string {
  if (age === null) return 'Learning explorer';
  if (age <= 5) return 'Little explorer';
  if (age <= 8) return 'Young explorer';
  if (age <= 12) return 'Junior learner';
  if (age <= 15) return 'Trailblazer';
  return 'Senior learner';
}
export function dayKey(date = new Date()): string {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0');
}
const DAY_MS = 86_400_000;

function calendarDayNumber(day: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const date = new Date(day + 'T00:00:00Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== day) return null;
  return date.getTime() / DAY_MS;
}

/** Valid completed local-calendar days, deduplicated and excluding future days. */
export function validActivityDays(dates: readonly string[] = [], today = new Date()): string[] {
  const cutoff = calendarDayNumber(dayKey(today));
  if (cutoff === null) return [];
  return [...new Set((Array.isArray(dates) ? dates : []).filter(day => {
    if (typeof day !== 'string') return false;
    const value = calendarDayNumber(day);
    return value !== null && value <= cutoff;
  }))].sort();
}

export function recordActivity(dates: string[] = [], date = new Date()): string[] {
  if (!Number.isFinite(date.getTime())) return validActivityDays(dates);
  return validActivityDays([...dates, dayKey(date)], date);
}

/** A streak counts completed activity days; up to two fully missed days bridge it. */
export function learningStreak(dates: readonly string[] = [], today = new Date()) {
  const sorted = validActivityDays(dates, today);
  const todayNumber = calendarDayNumber(dayKey(today));
  let longest = 0, running = 0;
  let previous: number | null = null;
  for (const day of sorted) {
    const value = calendarDayNumber(day)!;
    running = previous !== null && value - previous <= 3 ? running + 1 : 1;
    longest = Math.max(longest, running);
    previous = value;
  }
  const gap = todayNumber !== null && previous !== null ? todayNumber - previous : null;
  const current = gap !== null && gap <= 3 ? running : 0;
  const missedDays = gap === null ? 0 : Math.max(0, gap - 1);
  let graceExpiresAt: string | null = null;
  if (sorted.length) {
    const [year, month, day] = sorted[sorted.length - 1].split('-').map(Number);
    // Local midnight, rather than a fixed millisecond duration, survives DST.
    graceExpiresAt = new Date(year, month - 1, day + 4).toISOString();
  }
  return {
    current,
    longest,
    total: sorted.length,
    todayCompleted: gap === 0,
    paused: current > 0 && gap !== null && gap >= 2,
    missedDays,
    graceRemainingDays: current > 0 ? Math.max(0, 2 - missedDays) : 0,
    graceExpiresAt,
  };
}
export function validateSignup(displayName: string, birthDate: string, email: string, password: string): string | null {
  if (displayName.trim().length < 2 || displayName.trim().length > 40) return 'Choose a nickname between 2 and 40 characters.';
  if (ageFromBirthdate(birthDate) === null) return 'Please enter a valid date of birth.';
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.';
  if (password.length < 8) return 'Use at least 8 password characters.';
  return null;
}
