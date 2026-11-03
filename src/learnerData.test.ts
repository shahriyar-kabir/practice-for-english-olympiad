import { describe, expect, it } from 'vitest';
import { ageFromBirthdate, dayKey, learningStreak, recordActivity, validateSignup } from './learnerData';

describe('Wizpiko learner safeguards and activity streaks', () => {
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
    expect(validateSignup('A', '2018-02-10', 'guardian@example.com', '12345678')).toContain('nickname');
    expect(validateSignup('Explorer', '2018-02-30', 'guardian@example.com', '12345678')).toContain('date of birth');
    expect(validateSignup('Explorer', '2018-02-10', 'invalid', '12345678')).toContain('email');
    expect(validateSignup('Explorer', '2018-02-10', 'user@example.com', 'short')).toContain('password');
    expect(validateSignup('Explorer', '2018-02-10', 'user@example.com', 'securepass99')).toBeNull();
  });
  it('records only one activity day for repeated completions', () => {
    const day = new Date(2026, 9, 30, 12);
    expect(recordActivity(recordActivity([],day),day)).toEqual(['2026-10-30']);
  });
  it('counts consecutive days including yesterday, and preserves longest streak', () => {
    const today = new Date(2026, 9, 30, 12);
    const dates = ['2026-10-24','2026-10-25','2026-10-26','2026-10-28','2026-10-29'];
    const summary = learningStreak(dates,today);
    expect(summary.current).toBe(2);
    expect(summary.longest).toBe(3);
    expect(summary.total).toBe(5);
    expect(summary.todayCompleted).toBe(false);
    expect(dayKey(today)).toBe('2026-10-30');
  });
});