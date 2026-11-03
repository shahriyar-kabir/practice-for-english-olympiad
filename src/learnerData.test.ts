import { afterEach, describe, expect, it, vi } from 'vitest';
import { ageFromBirthdate, dayKey, learningStreak, recordActivity, validateSignup } from './learnerData';

afterEach(() => { vi.unstubAllEnvs(); });

describe('Wizpiko learner profile validation', () => {
  it('rejects invalid and future DOB values', () => {
    expect(ageFromBirthdate('2025-02-30')).toBeNull();
    expect(ageFromBirthdate('not-a-date')).toBeNull();
    expect(ageFromBirthdate('2999-01-01')).toBeNull();
  });
  it('accepts a valid learner birth date and calculates age', () => {
    const year = new Date().getFullYear() - 5;
    expect(ageFromBirthdate(year + '-01-01')).toBeGreaterThanOrEqual(4);
    expect(ageFromBirthdate(year + '-01-01')).toBeLessThanOrEqual(6);
  });
  it('checks learner signup fields', () => {
    expect(validateSignup('A', '2018-02-10', 'user@example.com', '12345678')).toContain('nickname');
    expect(validateSignup('Explorer', '2018-02-30', 'user@example.com', '12345678')).toContain('date of birth');
    expect(validateSignup('Explorer', '2018-02-10', 'invalid', '12345678')).toContain('email');
    expect(validateSignup('Explorer', '2018-02-10', 'user@example.com', 'short')).toContain('password');
    expect(validateSignup('Explorer', '2018-02-10', 'user@example.com', 'securepass99')).toBeNull();
  });
});

describe('Completed-activity streaks with two missed calendar days of grace', () => {
  it('deduplicates completed days and excludes invalid and future dates', () => {
    const today = new Date(2026, 9, 30, 12);
    expect(recordActivity(recordActivity([], today), today)).toEqual(['2026-10-30']);
    expect(learningStreak(['2026-02-30', 'garbage', '2026-10-29', '2026-10-29', '2026-10-31'], today)).toMatchObject({ current: 1, longest: 1, total: 1, todayCompleted: false });
  });
  it('counts activity days only while bridging one or two missed days', () => {
    const summary = learningStreak(['2026-10-24', '2026-10-25', '2026-10-28', '2026-10-29'], new Date(2026, 9, 30, 12));
    expect(summary).toMatchObject({ current: 4, longest: 4, total: 4, todayCompleted: false, paused: false, missedDays: 0, graceRemainingDays: 2 });
  });
  it.each([
    [0, 2, false, 0, 2],
    [1, 2, false, 0, 2],
    [2, 2, true, 1, 1],
    [3, 2, true, 2, 0],
    [4, 0, false, 3, 0],
  ])('at last-activity gap %i: current %i, paused %s, missed %i, grace %i', (gap, current, paused, missedDays, graceRemainingDays) => {
    const today = new Date(2026, 10, 1 + Number(gap), 12);
    expect(learningStreak(['2026-10-31', '2026-11-01'], today)).toMatchObject({ current, paused, missedDays, graceRemainingDays, longest: 2 });
  });
  it('starts a new streak after three fully missed days, preserving historical longest', () => {
    expect(learningStreak(['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-26'], new Date(2026, 9, 26, 12))).toMatchObject({ current: 1, longest: 3, total: 4, todayCompleted: true });
  });
  it('bridges week, month and year boundaries using calendar days', () => {
    expect(learningStreak(['2026-12-30', '2027-01-02', '2027-01-03'], new Date(2027, 0, 3, 12))).toMatchObject({ current: 3, longest: 3 });
    expect(learningStreak(['2026-01-30', '2026-02-02'], new Date(2026, 1, 2, 12))).toMatchObject({ current: 2, longest: 2 });
  });
  it('handles spring and autumn DST without treating clock shifts as extra days', () => {
    vi.stubEnv('TZ', 'America/New_York');
    const spring = learningStreak(['2026-03-07', '2026-03-10'], new Date(2026, 2, 10, 12));
    expect(spring.current).toBe(2);
    expect(spring.graceExpiresAt).toBe(new Date(2026, 2, 14, 0).toISOString());
    const autumn = learningStreak(['2026-10-31', '2026-11-03'], new Date(2026, 10, 3, 12));
    expect(autumn.current).toBe(2);
    expect(autumn.graceExpiresAt).toBe(new Date(2026, 10, 7, 0).toISOString());
  });
  it('has an honest empty state', () => {
    const today = new Date(2026, 9, 30, 12);
    expect(learningStreak([], today)).toEqual({ current: 0, longest: 0, total: 0, todayCompleted: false, paused: false, missedDays: 0, graceRemainingDays: 0, graceExpiresAt: null });
    expect(dayKey(today)).toBe('2026-10-30');
  });
});
