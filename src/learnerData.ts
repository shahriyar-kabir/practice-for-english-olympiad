export type LearnerProfile = {
  display_name: string;
  birth_date: string;
  avatar: 'girl' | 'boy' | 'robot' | 'panda' | 'cat';
  guardian_email: string | null;
  consent_status: 'active' | 'pending' | 'verified';
  preferences: { sound?: boolean; animation?: boolean; learning_tips?: boolean };
};
export function ageFromBirthdate(date: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const birth = new Date(date + 'T12:00:00');
  if (Number.isNaN(birth.getTime()) || birth.toISOString().slice(0, 10) !== date) return null;
  const now = new Date();
  if (birth.getTime() > now.getTime()) return null;
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
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
export function recordActivity(dates: string[] = [], date = new Date()): string[] {
  return [...new Set([...dates, dayKey(date)])].sort().slice(-370);
}
export function learningStreak(dates: string[] = [], today = new Date()) {
  const unique = new Set(dates);
  let current = 0;
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  if (!unique.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (unique.has(dayKey(cursor)) && current < 370) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }
  let longest = 0, running = 0;
  const sorted = [...unique].sort();
  let previous: number | undefined;
  for (const day of sorted) {
    const timestamp = new Date(day + 'T12:00:00').getTime();
    if (!Number.isFinite(timestamp)) continue;
    running = previous !== undefined && Math.round((timestamp - previous) / 86400000) === 1 ? running + 1 : 1;
    longest = Math.max(longest, running);
    previous = timestamp;
  }
  return { current, longest, total: unique.size, todayCompleted: unique.has(dayKey(today)) };
}
export function validateSignup(displayName: string, birthDate: string, email: string, password: string): string | null {
  if (displayName.trim().length < 2 || displayName.trim().length > 40) return 'Choose a nickname between 2 and 40 characters.';
  if (ageFromBirthdate(birthDate) === null) return 'Please enter a valid date of birth.';
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.';
  if (password.length < 8) return 'Use at least 8 password characters.';
  return null;
}